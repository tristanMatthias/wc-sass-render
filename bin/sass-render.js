#!/usr/bin/env node
const yargs = require('yargs');
const path = require('path');
const gaze = require('gaze');
const glob = require('glob');
const Renderer = require('../SassRenderer.js');

(async() => {
    const o = yargs
        .command('$0 [input..]', 'Compile Sass to a template')
        .option('output', {
            alias: 'o',
            type: 'string',
            describe: 'Output file path'
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
            describe: 'Include directory for @imports (EG: node_modules)'
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

    let include = o.include;
    if (include) include = include
        .split(',')
        .map(i => path.resolve(process.cwd(), i));

    const converter = new Renderer({
        template: o.template,
        include,
        suffix: o.suffix
    });


    function render(fp) {
        if (path.basename(fp).startsWith('_')) return false;
        if (!o.quiet) console.log(`Rendering ${fp}...`);

        converter.render(fp, o.output).catch((err) => {
            console.error(err);
            process.exit(-1);
        }).then(() => {
            if (!o.quiet) console.log(`Complete!`);
        });
    }

    o.input.forEach(i => {
        glob(i, (err, files) => {
            files.forEach(render);
        });
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
