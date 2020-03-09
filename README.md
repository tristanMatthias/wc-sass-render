# Web Component SASS Render

[![npm](https://img.shields.io/npm/v/wc-sass-render.svg)](http://npmjs.com/package/wc-sass-render)
[![Travis](https://img.shields.io/travis/tristanMatthias/wc-sass-render.svg)](https://travis-ci.org/tristanMatthias/wc-sass-render)
[![Codecov](https://img.shields.io/codecov/c/github/codecov/example-python.svg)](https://codecov.io/gh/tristanMatthias/wc-sass-render)

Compile Sass files to a [lit-html](https://github.com/Polymer/lit-html) style template to be imported by JS like [lit-element](https://github.com/Polymer/lit-element) .


## Motivation
> This project was written by inspired by [Google's Material Web Component Sass Render](https://github.com/material-components/material-components-web-components/tree/master/packages/sass-render).
> I expanded this out to be non Material specific, and include libraries and recursive directory parsing.

This project exists to make your SASS modular, and importable by any style of Web Components you want to use.



## Installation
`yarn global add wc-sass-render`
This will install `sass-render` as a global CLI tool.


## Usage & options
For a list of complete options, run `sass-render --help`

**Simple usage**
Renders a `./src/components/button-css.js` file
```
sass-render ./src/components/button.scss
```

**Compile directory**
Renders all scss files in recursively in directory with a custom template
```
sass-render ./src/**/*.scss -t css-template.js
```

**Compile multiple files or directories**
Renders all scss files in recursively in directory with a custom template
```
sass-render ./src/**/*.scss ./lib/component.scss -t css-template.js
```

**Watching**
Use `-w` to watch for changes
```
sass-render ./src/**/*.scss -w
```
Files will be outputted as `[name]-css.js`. EG: If file is `button.scss`, outputted file will be `button-css.js`.

**Custom template**
Use `-t` to specify the file you'd like to use as a template. `sass-render` will replace `<% content %>` in the file.
```
sass-render ./src/components/button-css.js -t css-template.js
```

**Expanded CSS**
Use `-e` to enable expanded rendering of output CSS. Render SASS outputs CSS as 'compressed' by default, which may cause parsing errors for some projects.
```
sass-render ./src/components/button-css.js -t -e css-template.js
```

**Custom suffix**
Files will be outputted as `[name]-css.js`. EG: If file is `button.scss`, outputted file will be `button-css.js`. This can be changed with the `--suffix` option.

**NOTE**: if you use a `-` (dash) in your suffix name, eg: `--suffix '-css.js'`, then quotation marks are needed around the suffix (to tell bash it's not another flag)

**Import custom libraries**
By default, wc-sass-render will include the `node_modules` relative to the current directory. Passing the `-i` allows you to include custom directories. You can include multiple directories by comma separating them.

```
sass-render ./src/**/*.scss -i '../sass-lib/'
sass-render ./src/**/*.scss -i '../sass-lib/, ../another-lib'
```


## Importing
Once your SASS files are converted into js/ts files, you can use them inside a library like `lit-element`:

```js
import {html, LitElement} from '@polymer/lit-element';
import CSS from './button-css.js';

export default class Button extends LitElement {
    _render() {
        return html`
            ${CSS}
            <button><slot>Submit</slot></button>
        `;
    }
}
window.customElements.define('my-button', Button);
```


## Custom template
By default, the template is:
```js
import {html} from 'lit-element';
export default html`<style><% content %></style>`;
```

This can be overridden with the `-t` option to your own file. EG:
```js
module.exports.CSS = '<% content %>';
```


## Contributions
All pull requests and contributions are most welcome. Let's make the internet better!


## Moving forward / TODO
- [x] Watch command
- [x] Add tests


## Issues
If you find a bug, please file an issue on the issue tracker on GitHub.


## Credits
The concept of `wc-sass-render` was originally created by Google.
This project is built and maintained by [Tristan Matthias](https://github.com/tristanMatthias).
