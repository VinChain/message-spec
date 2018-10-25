"use strict";
const program = require("commander");
const compiler_1 = require("./compiler");
function cli(name, args) {
    program.version('1.0.1', '-v, --version');
    program.description('Schema compiler');
    program
        .command(name)
        .arguments('input...')
        .option('-o, --output <dir>', 'Output directory for compiled files')
        .option('-p, --prefix <prefix>', 'Schema prefix to resolve over ids')
        .description('Compiles schema references and id\'s')
        .action((inputs, opts) => compiler_1.processor(inputs, {
        prefix: opts.prefix,
        output: opts.output,
    }));
    program.parse(args);
}
module.exports = cli;
