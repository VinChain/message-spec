import * as debug from 'debug';
import * as util from 'util';
import * as url from "url";


/**
 * Resolves references in files
 *
 * @param data
 * @param uri
 */
export function resolve(data: any, uri: string): any {
	const logger = debug('resolver:' + uri);

	// implicitly set $id to each schema file
	if (typeof data === 'object' && !data['$id']) {
		logger("$id property set: %s", uri);
		data['$id'] = uri;
	}

	if (typeof data === 'object' && !data['$schema']) {
		const schema = "http://json-schema.org/draft-06/schema#";
		logger("$schema property set: %s", schema);
		data['$schema'] = schema;
	}

	data = resolveWalker(data, (path, type, xpath) => {
		const resolvedPath = resolveUri(path, uri);
		logger("#/%s -> %s -> %s", xpath, path, resolvedPath);
		return resolvedPath;
	});

	return data;
}

type resolveWalkerCallback = (path: string, type: '$schema' | '$ref' | string, xpath: string) => string;

function resolveWalker(data: any, callback: resolveWalkerCallback, xpath?: string): any {

	if (Array.isArray(data)) {
		return data.map((item, idx) => resolveWalker(item, callback, util.format("%s[%s]", xpath, idx)));
	} else if (typeof data === 'object') {
		return Object.getOwnPropertyNames(data).sort().reduce((acc, prop) => {
			let value = data[prop];
			// const propXpath = [xpath, prop].filter((i) => !!i).join('.');
			// switch (prop.toLowerCase()) {
			// 	// case '$schema':
			// 	// case '$ref':
			// 	// 	value = callback(value as string, prop.toLowerCase(), propXpath);
			// 	// 	break;
			// 	default:
			// 		value = resolveWalker(value, callback, propXpath);
			// 		break;
			// }
			acc[prop] = value;
			return acc;
		}, {});
	} else {
		return data;
	}
}

function resolveUri(uri: string, origin?: string): string {
	const logger = debug('resolver:uri:' + origin);

	if (!uri) return uri;

	const parsed = url.parse(uri);
	if (!parsed.path) {
		// skip local references
		return uri;
	}

	uri = url.resolve(origin, uri);

	return uri;
}
