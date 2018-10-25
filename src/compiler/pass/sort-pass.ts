import * as debug from 'debug';
import {CompilerPass} from "../compiler";

const logger = debug('compiler:pass:sort');

export const sortPass: CompilerPass<{}> = (name, schema, refs, options?) => {
	logger('[%s] sorting keys', name);
	return sort(schema);
};

function sort<T>(data: T): T {

	if (Array.isArray(data)) {
		return data.map((i) => sort(i)) as any;
	} else if (typeof data === 'object') {
		// sorting routines
		return Object.getOwnPropertyNames(data).sort().reduce((acc, prop) => {
			acc[prop] = data[prop];
			return acc;
		}, {}) as any;
	} else {
		return data;
	}
}

