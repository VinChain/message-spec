import * as debug from 'debug';
import {CompilerPass} from "../compiler";
import * as util from "util";
import * as path from "path";
import * as url from "url";

const logger = debug('compiler:pass:reference');

export const referencePass: CompilerPass = (name, schema, refs, options) => {
	return walker(schema, (ref, xpath) => {
		if (ref.startsWith('.')) {
			logger('[%s%s] processing relative reference %s from %s', name, xpath, ref, name);

			const hash = url.parse(ref).hash;

			const cleaned = url.parse(ref);
			cleaned.hash = undefined;

			const referenceId = url.resolve(name, url.format(cleaned));

			if (!refs.has(referenceId)) {
				throw new Error(util.format('Unable to find reference %s: %s for resolve of %s in %s', referenceId, ref, name));
			} else if (!refs.get(referenceId)['$id']) {
				throw new Error(util.format('Target reference %s has no $id to relative mapping', referenceId));
			}

			const id = refs.get(referenceId)['$id'];
			const newRef = url.parse(id);
			newRef.hash = hash;
			ref = url.format(newRef);
			logger('[%s%s] new reference: %s', name, xpath, ref);
		}

		return ref;
	});
};

type walkerCallback = (originalRef: string, xpath: string) => string

function walker<T>(data: T, callback: walkerCallback, xpath = '#'): T {
	if (Array.isArray(data)) {
		return data.map((i, idx) => walker(i, callback, util.format("%s[%s]", xpath, idx))) as any;
	} else if (typeof data === 'object') {
		return Object.getOwnPropertyNames(data).reduce((acc, prop) => {
			const refXpath = util.format('%s/%s', xpath, prop);
			let value = data[prop];
			switch (prop) {
				case '$ref':
					value = callback(data[prop], refXpath);
					break;
				default:
					value = walker(value, callback, refXpath);
					break;
			}
			acc[prop] = value;
			return acc;
		}, {}) as any;
	} else {
		return data;
	}
}
