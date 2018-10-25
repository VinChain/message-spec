import * as program from "commander";
import {processor} from "./compiler";

function cli(args: string[]) {
	program.version('1.0.1', '-v, --version');
	program.description('Schema compiler');

	program
		.command('compile')
		.arguments('<input...>')
		.option('-o, --output <dir>', 'Output directory for compiled files')
		.option('-p, --prefix <prefix>', 'Schema prefix to resolve over ids')

		.description('Compiles schema references and id\'s')
		.action((inputs: string[], opts?) => processor(inputs, opts.output, {
			prefix: opts.prefix,
		}));

	program.parse(args);
}

export = cli;