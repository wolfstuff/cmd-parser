'use strict';

/**
 * The Regular Expression used to separate arguments from a given string of text.
 *
 * @type {RegExp}
 * @private
 */
const args_expr = /(?<single>[^\s"]+)|"(?<multi>[^"]*)"/gu;

/**
 * Returns a function used to parse commands via regular expression. Arguments are returned in
 * positional order; named arguments are not currently supported.
 *
 * @param   {string} prefix - The single-character prefix used to determine commands.
 * @returns {Function}      - A command parsing function.
 * @public
 * @example
 *     const parse = parser('#'); // parses commands that begin with `#`
 */
module.exports = function parser(prefix) {
    /**
     * The Regular Expression used to match and split a command and its arguments, if any.
     *
     * @type {RegExp}
     * @private
     */
    const cmd_expr = new RegExp(`(?:^${ prefix })(?<command>[\\w]+)(?: +?)?(?<args>.+$)?`, 'gu');

    /**
     * An object returned as a result of successfully parsing a string as a command.
     *
     * @typedef  {object} CommandObject
     * @property {string}         command - The command parsed.
     * @property {Array.<string>} args    - Any arguments provided.
     */

    /**
     * Parses a given string {str} as a command. If the string is not a command, returns the string;
     * otherwise, returns an object representing the command and any arguments passed to it.
     *
     * @param   {string}           str - The string to parse.
     * @returns {string|CommandObject} - The string, or a CommandObject.
     * @public
     * @example
     *     const parse  = parser('!');
     *     const result1 = parse('!do the thing');
     *     const result2 = parse('!hey "double quotes" are pretty neat');
     *     const result3 = parse('!empty');
     *     const result4 = parse('Hello, world!'); // 'Hello, world!'
     *     result1.command; // 'do'
     *     result1.args; // [ 'the', 'thing' ]
     *     result2.command; // 'hey'
     *     result2.args; // [ 'double quotes', 'are', 'pretty', 'neat' ]
     *     result3.command; // 'empty'
     *     result3.args; // []
     */
    return function parse(str) {
        if (!str.startsWith(prefix)) {
            return str;
        }

        const matched = Object.assign(Object.create(null), cmd_expr.exec(str).groups);
        const command = matched.command;
        const args    = (matched.args !== undefined)
            ? matched.args.match(args_expr).map((arg) => {
                return arg.replace(/"/gu, '')
                    .trim();
            })
            : [];

        return { command, args };
    };
};
