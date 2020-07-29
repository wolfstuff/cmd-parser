'use strict';

const test = require('ava');

const makeParser = require('../src/index');

// #makeParser
test('#makeParser: should return a Function', (t) => {
    t.true(typeof makeParser({}) === 'function', 'Did not return a function!');
});

// #makeParser.messageHandler
test('#makeParser.messageHandler: should ignore messages that aren\'t commands', async (t) => {
    const parser = makeParser({});

    const result = await parser({ content: 'Hello, world!' });
    t.true(result === undefined, 'Did not ignore message!');
});

test('#makeParser.messageHandler: should report commands that aren\'t recognized', async (t) => {
    const parser = makeParser({});

    const result = await parser({
        content: '!cmd',
        author: {
            id: 'id'
        },
        channel: {
            send: (str) => str
        }
    });

    t.true(result === '<@id>, I don\'t recognize the command `!cmd`.', 'Did not ignore command!');
});

test('#makeParser.messageHandler: should remove messages if required', async (t) => {
    const commands = {
        cmd: (message) => {}
    };

    const options = {
        removeCommandMessages: true
    };

    const parser = makeParser(commands, options);

    let callCount = 0;

    await parser({
        content: '!cmd',
        author: {
            id: 'id'
        },
        channel: {
            send: (str) => str
        },
        delete: () => callCount++
    });

    t.true(callCount === 1, 'Did not remove command message!');
});

test('#makeParser.messageHandler: should not remove messages if required', async (t) => {
    const commands = {
        cmd: (message) => {}
    };

    const options = {
        removeCommandMessages: false
    };

    const parser = makeParser(commands, options);

    let callCount = 0;

    await parser({
        content: '!cmd',
        author: {
            id: 'id'
        },
        channel: {
            send: (str) => str
        },
        delete: () => callCount++
    });

    t.true(callCount === 0, 'Removed command message!');
});

test('#makeParser.messageHandler: should report errors during command execution', async (t) => {
    const commands = {
        cmd: (message) => {
            throw new Error('Fake error!');
        }
    };

    const options = {
        removeCommandMessages: false
    };

    const parser = makeParser(commands, options);

    const result = await parser({
        content: '!cmd',
        author: {
            id: 'id'
        },
        channel: {
            send: (str) => str
        }
    });

    t.true(result === '<@id>, `!cmd` resulted in `Fake error!`.', 'Did not report errors!');
});
