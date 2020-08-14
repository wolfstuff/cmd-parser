'use strict';

const test = require('ava');

const parser = require('../src/parser');

// #parser
test('#parser: should return a Function', (t) => {
    t.true(typeof parser() === 'function', 'Did not return a function!');
});

// #parser.parse
test('#parser.parse should return the command string if the prefix doesn\'t match', (t) => {
    let parse = parser('!');
    t.true(parse('Hello, world!') === 'Hello, world!', 'Did not return the command string!');

    parse = parser('!!');
    t.true(parse('!Hello, world!') === '!Hello, world!', 'Did not return the command string!');
});

test('#parser.parse should parse the command string if the prefix matches', (t) => {
    const parse = parser('!');
    const parsed = parse('!cmd arg1 arg2');

    verifyCommandParsedCorrectly(t, parsed);
});

test('#parser.parse should parse the command string if the prefix is longer than one character', (t) => {
    const parse = parser('!!');
    const parsed = parse('!!cmd arg1 arg2');

    verifyCommandParsedCorrectly(t, parsed);
});

function verifyCommandParsedCorrectly(t, parsedCommand) {
    t.true(Object.prototype.hasOwnProperty.call(parsedCommand, 'command'), 'Did not parse the command!');
    t.true(parsedCommand.command === 'cmd', 'Did not parse the command correctly!');
    t.true(Object.prototype.hasOwnProperty.call(parsedCommand, 'args'), 'Did not parse the arguments!');
    t.deepEqual(parsedCommand.args, [ 'arg1', 'arg2' ], 'Did not parse the arguments correctly!');
}

test('#parser.parse should handle arguments in double-quotes as singular arguments', (t) => {
    const parse = parser('!');
    const parsed = parse('!cmd arg1 arg2 "arg3 & arg4"');

    t.true(Object.prototype.hasOwnProperty.call(parsed, 'command'), 'Did not parse the command!');
    t.true(parsed.command === 'cmd', 'Did not parse the command correctly!');
    t.true(Object.prototype.hasOwnProperty.call(parsed, 'args'), 'Did not parse the arguments!');
    t.deepEqual(parsed.args, [ 'arg1', 'arg2', 'arg3 & arg4' ], 'Did not parse the arguments correctly!');
});

test('#parser.parse should substitute an empty Array if no arguments were provided', (t) => {
    const parse = parser('!');
    const parsed = parse('!cmd');

    t.true(Object.prototype.hasOwnProperty.call(parsed, 'command'), 'Did not parse the command!');
    t.true(parsed.command === 'cmd', 'Did not parse the command correctly!');
    t.true(Object.prototype.hasOwnProperty.call(parsed, 'args'), 'Did not parse the arguments!');
    t.deepEqual(parsed.args, [ ], 'Did not parse the arguments correctly!');
});
