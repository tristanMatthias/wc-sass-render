const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const Renderer = require('../SassRenderer');


var {expect} = chai;
var should = chai.should();
chai.use(chaiAsPromised);


const readFile = promisify(fs.readFile);
const deleteFile = promisify(fs.unlink);
const stat = promisify(fs.stat);


const DEFAULT_OPTIONS = require('../SassRenderer').DEFAULT_OPTIONS;

const INPUT_FILE_DEFAULT = path.resolve(__dirname, './test.scss');
const INPUT_FILE_TEMPLATE = path.resolve(__dirname, '../test-templates/otherTemplate.js');
const INPUT_FILE_DELIM = path.resolve(__dirname, '../test-templates/otherDelim.js');
const INPUT_FILE_ESCAPE = path.resolve(__dirname, './test-escape-char.scss');

const OUTPUT_FILE_DEFAULT = path.resolve(__dirname, './test-css.js');
const OUTPUT_FILE_CUSTOM = path.resolve(__dirname, './test-styles.ts');
const OUTPUT_FILE_ESCAPE = path.resolve(__dirname, './test-escape-char.js');

const OUTPUT_EXPECTED_DEFAULT = `import {html} from 'lit-element';
export default html\`<style>a{color:red}
</style>\`;\n`;

const OUTPUT_EXPECTED_ESCAPE = `import {html} from 'lit-element';
export default html\`<style>.char-render{content:"\\\\f2e6"}
</style>\`;\n`;

const OUTPUT_EXPECTED_CUSTOM = `export default \`<style>a{color:red}
</style>\`;\n`;

const OUTPUT_EXPECTED_LIB = `export default \`<style>a{background:blue}
</style>\`;\n`;

const OUTPUT_EXPECTED_MULTI_LIB = `export default \`<style>a{background:blue}a{font-weight:bold}
</style>\`;\n`;


const deleteRenders = () => {
    [OUTPUT_FILE_DEFAULT, OUTPUT_FILE_CUSTOM, OUTPUT_FILE_ESCAPE].forEach(f => {
        try {
            if (fs.statSync(f).isFile()) fs.unlinkSync(f);
        } catch (e) {}
    });
};

describe('SassRenderer', function() {
    describe('Setup class', () => {
        it('should create a SassRenderer class', function() {
            const r = new Renderer();
            r.should.be.instanceof(Renderer)
        })

        it('should have the right methods', function() {
            const r = new Renderer();
            r.css.should.be.a('function');
            r.render.should.be.a('function');
        })

        it('should have default options', function() {
            const r = new Renderer();
            Object.keys(DEFAULT_OPTIONS).forEach(o => {
                r[o].should.equal(DEFAULT_OPTIONS[o]);
            });
        });

        it('should allow for and set custom options', function() {
            const customOptions = {
                delim: /{{css}}/,
                include: ['./any'],
                template: '/customTemplate.js',
                suffix: '-styles.js',
                expandedOutput: true
            }
            const r = new Renderer(customOptions);
            r.delim.should.equal(customOptions.delim);
            r.include.should.equal(customOptions.include);
            r.template.should.equal(customOptions.template);
            r.suffix.should.equal(customOptions.suffix);
            r.expandedOutput.should.equal(customOptions.expandedOutput);
        });
    });


    describe('Rendering', () => {
        afterEach(deleteRenders);
        after(deleteRenders);

        it('should compile sass to a string with css(src)', async function() {
            const r = new Renderer();
            const css = await r.css(path.resolve(__dirname, 'test.scss'));
            css.should.equal('a{color:red}\n');
        });

        it('should create a new file with render(src)', async() => {
            const r = new Renderer();
            await r.render(INPUT_FILE_DEFAULT);
            ((await stat(OUTPUT_FILE_DEFAULT)).isFile()).should.equal(true);
        });

        it('should render SASS into a new file with render(src)', async () => {
            const r = new Renderer();
            await r.render(INPUT_FILE_DEFAULT);
            const cssModule = (await readFile(OUTPUT_FILE_DEFAULT)).toString();
            cssModule.should.equal(OUTPUT_EXPECTED_DEFAULT);
        });
        
        it('should render SASS into a custom file with render(src, output)', async () => {
            const r = new Renderer();
            await r.render(INPUT_FILE_DEFAULT, OUTPUT_FILE_CUSTOM);
            ((await stat(OUTPUT_FILE_CUSTOM)).isFile()).should.equal(true);
        });
        
        it('should replace CSS single escape characters with double escapes', async () => {
            const r = new Renderer();
            await r.render(INPUT_FILE_ESCAPE, OUTPUT_FILE_ESCAPE);
            const cssModule = (await readFile(OUTPUT_FILE_ESCAPE)).toString();
            cssModule.should.equal(OUTPUT_EXPECTED_ESCAPE);
        });
    });

    describe('Configuration', () => {
        afterEach(deleteRenders);
        after(deleteRenders);

        it('renders with a custom template', async function() {
            const r = new Renderer({
                template: INPUT_FILE_TEMPLATE
            });
            await r.render(INPUT_FILE_DEFAULT);
            const cssModule = (await readFile(OUTPUT_FILE_DEFAULT)).toString();
            cssModule.should.equal(OUTPUT_EXPECTED_CUSTOM);
        });

        it('renders with a custom delimiter', async function() {
            const r = new Renderer({
                template: INPUT_FILE_DELIM,
                delim: new RegExp("{{styles}}")
            });
            await r.render(INPUT_FILE_DEFAULT);
            const cssModule = (await readFile(OUTPUT_FILE_DEFAULT)).toString();
            cssModule.should.equal(OUTPUT_EXPECTED_CUSTOM);
        });

        it('throws error if no match found', async function() {
            const r = new Renderer({
                template: INPUT_FILE_DELIM
            });
            const promise = r.render(INPUT_FILE_DEFAULT);
            return promise.should.be.rejectedWith(/Template file .* did not contain template delimiters/);
        });

        it('renders with a custom suffix', async function() {
            const r = new Renderer({
                suffix: '-styles.ts'
            });
            await r.render(INPUT_FILE_DEFAULT);
            const cssModule = (await readFile(OUTPUT_FILE_CUSTOM)).toString();
            cssModule.should.equal(OUTPUT_EXPECTED_DEFAULT);
        });

        it('renders with a custom SASS lib includes', async function() {
            const r = new Renderer({
                template: INPUT_FILE_TEMPLATE,
                include: [path.resolve(__dirname, '../test-templates')]
            });
            await r.render(path.resolve(__dirname, 'test-with-include.scss'), OUTPUT_FILE_DEFAULT);
            const cssModule = (await readFile(OUTPUT_FILE_DEFAULT)).toString();
            cssModule.should.equal(OUTPUT_EXPECTED_LIB);
        });

        it('renders with multiple custom SASS lib includes', async function() {
            const r = new Renderer({
                template: INPUT_FILE_TEMPLATE,
                include: [
                    path.resolve(__dirname, '../test-templates'),
                    path.resolve(__dirname, '../test-templates/nested-include')
                ]
            });
            await r.render(path.resolve(__dirname, 'test-with-multi-include.scss'), OUTPUT_FILE_DEFAULT);
            const cssModule = (await readFile(OUTPUT_FILE_DEFAULT)).toString();
            cssModule.should.equal(OUTPUT_EXPECTED_MULTI_LIB);
        });
    });
});
