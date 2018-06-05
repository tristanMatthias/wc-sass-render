# Web Component SASS Render
Compile Sass files to a [lit-html](https://github.com/Polymer/lit-html) style template to be imported by JS like [lit-element](https://github.com/Polymer/lit-element) .


## Motivation
> This project was written by inspired by [Google's Material Web Component Sass Render](https://github.com/material-components/material-components-web-components/tree/master/packages/sass-render).
> I expanded this out to be non Material specific, and include libraries and recursive directory parsing.
This project exists to make your SASS modular, and importable by any style of Web Components you want to use.



## Installation
`yarn global add wc-sass-render`
This will install `sass-render` as a global CLI tool.


## Usage
**Single usage**
Use `-s` for a single file
```
sass-render -s styles.scss -t template.js -o button-styles-css.js -i ./node_modules
```

**Directory usage**
Use `-d` for a directory
```
sass-render -d ./ -t template.js -i ./node_modules
```
Files will be outputted as `[name]-css.js`. EG: If file is `button.scss`, outputted file will be `button-css.js`.


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
import {html} from '@polymer/lit-element';
export const style = html`<style><% content %></style>`;
```

This can be overridden with the `-t` option to your own file. EG:
```js
module.exports.CSS = '<% content %>';
```


## Contributions
All pull requests and contributions are most welcome. Let's make the internet better!

## Moving forward / TODO
- [ ] Watch command
- [ ] Add tests

## Issues
If you find a bug, please file an issue on the issue tracker on GitHub.

## Credits
The concept of `wc-sass-render` was originally created by Google.
This project is built and maintained by [Tristan Matthias](https://github.com/tristanMatthias).
