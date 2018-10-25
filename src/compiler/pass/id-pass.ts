import * as debug from 'debug';
import {CompilerPass} from "../compiler";
import * as path from "path";
import * as url from "url";

const logger = debug('compiler:pass:id');

export interface IdPassOptions {
	prefix?: string,
	override?: boolean,
}

export const idPass: CompilerPass<IdPassOptions> = (name, schema, refs, options) => {

	options = {
		override: false,
		...options,
	};

	if (schema['$id'] && !options.override) {
		logger('[%s] $id already set', name);
		return schema;
	}

	let id: string = name;

	// create prefixed name if required
	if (options.prefix) {
		logger('[%s] Using prefix: %s', name, options.prefix);
		id = url.resolve(options.prefix, id);
	}

	logger('[%s] setting $id: %s', name, id);
	schema['$id'] = id;

	return schema;
};
