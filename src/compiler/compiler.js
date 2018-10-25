"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const fs = require("fs");
const glob = require("glob");
const resolver_1 = require("./resolver");
const path = require("path");
const logger = debug('app');
function processor(patterns, opts) {
    const fileSpec = patterns
        .map((pattern) => {
        // detect base
        const baseParts = [];
        for (const part of path.parse(pattern).dir.split(path.sep)) {
            if (part.indexOf('*') >= 0) {
                break;
            }
            else {
                baseParts.push(part);
            }
        }
        const base = path.join(...baseParts);
        const files = glob.sync(pattern);
        return files.reduce((acc, filepath) => {
            acc[path.relative(base, filepath)] = filepath;
            return acc;
        }, {});
    })
        .reduce((acc, spec) => (Object.assign({}, acc, spec)), {});
    // process every file with ref
    for (const [ref, filepath] of Object.entries(fileSpec)) {
        logger('Processing file %s as ID=%s', filepath, ref);
        const content = fs.readFileSync(filepath);
        const schema = JSON.parse(content.toString());
        const compiled = compile(schema, ref, opts.prefix);
        if (opts.output) {
            const ouputPath = path.join(opts.output, ref);
            if (!fs.existsSync(path.dirname(ouputPath))) {
                fs.mkdirSync(path.dirname(ouputPath));
            }
            fs.writeFileSync(path.join(opts.output, ref), JSON.stringify(compiled, null, 2));
        }
    }
}
exports.processor = processor;
function compile(data, uri, prefix) {
    logger('Compiling %s with prefix=%s', uri, prefix);
    if (prefix) {
        uri = path.join(prefix, uri);
    }
    logger('Using $id=%s', uri);
    return resolver_1.resolve(data, uri);
}
