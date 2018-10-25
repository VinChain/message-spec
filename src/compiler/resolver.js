"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const util = require("util");
const url = require("url");
/**
 * Resolves references in files
 *
 * @param data
 * @param uri
 */
function resolve(data, uri) {
    const logger = debug('resolver:' + uri);
    // implicitly set $id to each schema file
    if (typeof data === 'object' && !data['$id']) {
        logger("$id property set: %s", uri);
        data['$id'] = uri;
    }
    data = resolveWalker(data, (path, type, xpath) => {
        const resolvedPath = resolveUri(path, uri);
        logger("#/%s -> %s -> %s", xpath, path, resolvedPath);
        return resolvedPath;
    });
    return data;
}
exports.resolve = resolve;
function resolveWalker(data, callback, xpath) {
    if (Array.isArray(data)) {
        return data.map((item, idx) => resolveWalker(item, callback, util.format("%s[%s]", xpath, idx)));
    }
    else if (typeof data === 'object') {
        return Object.getOwnPropertyNames(data).sort().reduce((acc, prop) => {
            let value = data[prop];
            const propXpath = [xpath, prop].filter((i) => !!i).join('.');
            switch (prop.toLowerCase()) {
                case '$schema':
                case '$ref':
                    value = callback(value, prop.toLowerCase(), propXpath);
                    break;
                default:
                    value = resolveWalker(value, callback, propXpath);
                    break;
            }
            acc[prop] = value;
            return acc;
        }, {});
    }
    else {
        return data;
    }
}
function resolveUri(uri, origin) {
    const logger = debug('resolver:uri:' + origin);
    if (!uri)
        return uri;
    const parsed = url.parse(uri);
    if (!parsed.path) {
        // skip local references
        return uri;
    }
    uri = url.resolve(origin, uri);
    return uri;
}
