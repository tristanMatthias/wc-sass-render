#!/usr/bin/env node
const yargs = require('yargs');
const path = require('path');
const gaze = require('gaze');
const glob = require('glob');
const sassRender = require('../index.js').sassRender;

(async() => {
    const o = yargs
        .command('$0 <input>', 'Compile Sass to a template')
        .option('output', {
            alias: 'o',
            type: 'string',
            describe: 'Output file path',
        })
        .option('template', {
            alias: 't',
            type: 'string',
            describe: 'Template file to use, must use `<% content %>` as delimiter'
        })
        .option('watch', {
            alias: 'w',
            type: 'boolean',
            describe: 'Watch the file system for changes and render automatically'
        })
        .option('help', {
            alias: 'h',
            type: 'boolean',
            describe: 'Print this message.',
        })
        .option('include', {
            alias: 'i',
            type: 'string',
            describe: 'Include directory for @imports (EG: node_modules)',
            default: path.resolve(process.cwd(), 'node_modules')
        })
        .option('suffix', {
            type: 'string',
            describe: 'Suffix for the rendered file',
            default: '-css.js'
        })
        .option('quiet', {
            alias: 'q',
            type: 'boolean',
            describe: 'No logs'
        })
        .argv;

    function render(fp) {
        if (!o.quiet) console.log(`Rendering ${fp}...`);


        if (!o.template) o.template = path.resolve(__dirname, '../template.js');
        else o.template = path.resolve(process.cwd(), o.template);


        sassRender(fp, o.template, o.output, o.include, o.suffix).catch((err) => {
            console.error(err);
            process.exit(-1);
        }).then(() => {
            if (!o.quiet) console.log(`Complete!`);
        })
    }

    glob(o.input, (err, files) => {
        files.forEach(render);
    });

    if (o.watch) {
        if (!o.quiet) console.log(`Watching ${o.input} for changes...`);

        gaze(o.input, (err, watcher) => {
            if (err) console.error(err);
            // On file changed
            watcher.on('changed', render);
            // On file added
            watcher.on('added', render);
        });
    }
})();
