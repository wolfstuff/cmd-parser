'use strict';

const parser = require('./parser');

/**
 * A Discord message object.
 *
 * @typedef {object} Message
 * @property {string}   content
 * @property {Function} delete
 */

/**
 * A Function that executes a particular command.
 *
 * @typedef {Function} CommandFunction
 * @param   {Message} message - The Discord message that triggered the command.
 * @param   {...*}    args    - Any other arguments.
 */

/**
 * A key-value map of commands to use by Discord bot clients. Each key must be a string,
 * representing the name of the command, and each value must be a Function that executes
 * each command.
 *
 * @typedef {object.<string, CommandFunction>} CommandsObject
 */

/**
 * Default options used to determine the behavior of the command parser.
 *
 * @type {object}
 * @property {string}   commandPrefix         - The single-character prefix used to recognize commands.
 * @property {Function} fnError               - A function called when command execution fails.
 * @property {Function} fnRemoveMessage       - A function optionally called to remove a command message.
 * @property {Function} fnUnrecognized        - A function called when an unrecognized command is parsed.
 * @property {boolean}  removeCommandMessages - If `true`, calls `fnRemoveMessage` for each command message.
 * @private
 */
const defaultOpts = {
    commandPrefix:         '!',
    fnError:               errorHandler,
    fnRemoveMessage:       removeMessage,
    fnUnrecognized:        unrecognizedHandler,
    removeCommandMessages: true
};

/**
 * Creates and initializes a command parser for a Discord bot that will respond to a certain
 * set of {commands}. Commands are recognized based on an optional prefix, which defaults to
 * `!`. By default, when a Discord user sends a bot command, the bot will automatically remove
 * the message that triggered the command; this behavior can be changed if an optional flag
 * is set to `false` instead of its default `true` value.
 *
 * @param   {CommandsObject} commands - Commands to use by the bot client.
 * @param   {object}         opts     - The prefix used by all commands; the `!` in `!command`.
 * @returns {Function}                - A handler function that parses messages for commands.
 * @public
 * @example
 *     const client = new Client(); // Discord example
 *     client.on('message', makeParser(commands, { prefix: '#' }));
 *     client.login('YOUR_DISCORD_BOT_TOKEN_HERE');
 */
module.exports = function makeParser(commands, opts) {
    const options = Object.assign(Object.create(null), defaultOpts, opts);
    const parse   = parser(options.commandPrefix);

    /**
     * Processes messages, parsing their contents for commands and arguments and dispatching
     * to the appropriate command function.
     *
     * @param   {Message} message - The message that triggered the command.
     * @returns {Promise}         - When the message has been parsed and the command has been executed.
     * @public
     * @example
     *     const client = new Client(); // Discord example
     *     const messageHandler = makeParser(commands, { prefix: '#' });
     *     client.on('message', messageHandler);
     *     client.login('YOUR_DISCORD_BOT_TOKEN_HERE');
     */
    return async function messageHandler(message) {
        const parsed = parse(message.content);

        if (!parsed.command) {
            // This message is not a command; so ignore the input:
            return;
        }

        if (!Object.prototype.hasOwnProperty.call(commands, parsed.command)) {
            return options.fnUnrecognized(message);
        }

        try {
            if (options.removeCommandMessages) {
                await options.fnRemoveMessage(message);
            }

            return commands[parsed.command].call(null, message, ...parsed.args);
        } catch (e) {
            return options.fnError(message, e);
        }
    };
};

/**
 * An error handling function called whenever command execution triggers an error.
 *
 * @param   {Message} message - The Discord message with the command that triggered an error.
 * @param   {Error}   error   - The error that was triggered.
 * @returns {Promise}         - When the funcion is finished reporting an error.
 * @private
 * @example
 *     errorHandler(message, new Error('This message broke something!'));
 */
function errorHandler(message, error) {
    const { id }               = message.author;
    const { channel, content } = message;

    return channel.send(`<@${ id }>, \`${ content }\` resulted in \`${ error.message }\`.`);
}

/**
 * Removes a given {message} from chat history.
 *
 * @param   {Message} message - The message to be removed.
 * @returns {Promise}         - When the message has been removed.
 * @private
 * @example
 *     removeMessage(message);
 */
function removeMessage(message) {
    return message.delete();
}

/**
 * A function called whenever the parser encounters an unrecognized command.
 *
 * @param   {Message} message - The message that triggered the command.
 * @returns {Promise}         - When the funcion is finished reporting an unrecognized command.
 * @private
 * @example
 *     unrecognizedHandler(message);
 */
function unrecognizedHandler(message) {
    const { id }               = message.author;
    const { channel, content } = message;

    return channel.send(`<@${ id }>, I don't recognize the command \`${ content }\`.`);
}
