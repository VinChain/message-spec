import * as debug from 'debug';
import {CompilerPass} from "../compiler";

const logger = debug('compiler:pass:schema');

export interface SchemaPassOptions {
	override?: true,
	schema?: string,
}

export const schemaPass: CompilerPass<SchemaPassOptions> = (name, schema, refs, options) => {

	options = {
		schema: "http://json-schema.org/draft-06/schema",
		...options
	};

	if (schema['$schema'] && !options.override) {
		logger('[%s] $schema already set', name);
		return schema;
	}

	logger('[%s] setting $schema: %s', name, options.schema);
	schema['$schema'] = options.schema;

	return schema;
};
