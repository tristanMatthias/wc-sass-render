#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const recursive = require('recursive-readdir');
const path = require('path');
const sassRender = require('../index.js').sassRender;

(async() => {
    const options = [
        {
            name: 'source',
            alias: 's',
            type: String,
            description: 'Template file to render sass into.',
            defaultOption: true,
        },
        {
            name: 'directory',
            alias: 'd',
            type: String,
            description: 'Directory to search for sass files to render sass into.',
        },
        {
            name: 'output',
            alias: 'o',
            type: String,
            description: 'Output file path',
        },
        {
            name: 'template',
            alias: 't',
            type: String,
            description: 'Template file to use, must use `<% content %>` as delimiter',
            defaultValue: path.resolve(__dirname, '../template.js')
        },
        {
            name: 'help',
            alias: 'h',
            type: Boolean,
            description: 'Print this message.',
        },
        {
            name: 'include',
            alias: 'i',
            type: String,
            description: 'Include directory for @imports (EG: node_modules)'
        },
        {
            name: 'suffix',
            alias: 'S',
            type: String,
            description: 'Suffix for the rendered file',
            defaultValue: '-css.js'
        },

    ];

    const {
        source,
        directory,
        output,
        template,
        help,
        include,
        suffix
    } = commandLineArgs(options);


    function printUsage() {
        const sections = [{
                header: 'sass-render',
                content: 'Render sass into an element\'s lit template',
            },
            {
                header: 'Options',
                optionList: options,
            },
        ];
        console.log(commandLineUsage(sections));
    }

    function error(err) {
        console.error(err);
        printUsage();
        process.exit(-1);
    }

    if (help) {
        printUsage();
        process.exit(0);
    }

    if (source && directory) error('Please provide either the source or the directory, not both!');

    if (source) {
        sassRender(source, template, output, include, suffix).catch((err) => {
            console.error(err);
            process.exit(-1);
        });
    } else {
        const files = await recursive(directory, [(f, stat) => {
            if (!stat.isFile()) return false;
            return f.split('.').pop() != 'scss';
        }], (err, files) => {
            files.forEach(f => {
                sassRender(f, template, output, include, suffix).catch((err) => {
                    console.error(err);
                    process.exit(-1);
                });
            })
        })

    }
})()
