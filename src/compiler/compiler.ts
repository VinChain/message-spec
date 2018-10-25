import * as debug from "debug"
import * as fs from 'fs'
import * as glob from 'glob'
import {resolve} from "./resolver";
import * as path from "path";
import * as url from "url";
import * as util from "util";
import * as pass from "./pass"
import {Schema} from "inspector";

const logger = debug('compiler');


export type SchemaData = object;
export type SchemaMap = Map<string, SchemaData>

export interface CompilerOptions {
	prefix?: string;
}

export type CompilerPass<O = undefined> = (name: string, schema: SchemaData, references: SchemaMap, options: O) => SchemaData;

export function processor(patterns: string[], output?: string, options?: CompilerOptions) {
	const fileSpec = patterns
		.map((pattern) => {
			// detect base
			const baseParts = [];
			for (const part of path.parse(pattern).dir.split(path.sep)) {
				if (part.indexOf('*') >= 0) {
					break;
				} else {
					baseParts.push(part);
				}
			}
			const base = path.join(...baseParts);
			const files = glob.sync(pattern);
			return files.reduce((acc, filepath) => {
				acc[path.relative(base, filepath)] = filepath;
				return acc;
			}, {})

		})
		.reduce((acc, spec) => ({...acc, ...spec}), {});

	// load all files as reference map
	const map: SchemaMap = Object.entries(fileSpec).reduce((acc, [ref, filepath]) => {
		logger('Loading file %o referenced as %o', filepath, ref);

		try {
			const content = fs.readFileSync(filepath as string).toString();
			const schema: SchemaData = JSON.parse(content);
			acc.set(ref, schema);
		} catch (e) {
			console.error(util.format('Error in file %s: [%s] %s', filepath, e.name, e.message));
			return;
		}
		return acc;
	}, new Map());

	// compile schemas
	const compiled = compile(map, options);

	// save all schemas
	if (output) {
		compiled.forEach((schema, ref) => {
			const ouputPath = path.join(output, ref);
			logger('Saving file %o referenced as %o', ouputPath, ref);
			recursiveCreateDir(path.dirname(ouputPath));
			fs.writeFileSync(path.join(output, ref), JSON.stringify(schema, null, 2));
		});
	}

}

function recursiveCreateDir(dir) {
	if (fs.existsSync(dir)) {
		return;
	}
	const parent = path.dirname(dir);
	if (parent) {
		recursiveCreateDir(parent);
	}
	fs.mkdirSync(dir);
}



function compile(map: SchemaMap, options?: CompilerOptions): SchemaMap {

	// create passes to run
	const passes: Map<CompilerPass<any>, any | undefined> = new Map();

	passes.set(pass.idPass, { prefix: options ? options.prefix : undefined});
	passes.set(pass.schemaPass, undefined);
	//passes.set(pass.referencePass, undefined);
	passes.set(pass.sortPass, undefined);

	// launch compiler passes
	for (const [pass, options] of passes) {
		for (const [ref, schema] of map) {
			try {
				map.set(ref, pass(ref, schema, map, options));	
			} catch (e) {
				console.error(util.format('Error during compile pass: [%s] %s', e.name, e.message));
				process.exit(1);
			}
		}
	}

	return map;
}