# Wec Component SASS Render
Compile Sass files to a `lit-html` style template to be imported by `lit-element`.


## Motivation
This project was written by inspired by [Google's Material Web Component Sass Render](https://github.com/material-components/material-components-web-components/tree/master/packages/sass-render).
I expanded this out to be non Material specific, and include libaries and recursive directory parsing.


## Installation
`yarn global add sass-render`


## Usage
**Single usage**
```
sass-render -s styles.scss -t template.js -o button-styles-css.js -i ./node_modules
```

**Directory usage**
```
sass-render -d ./ -t template.js -i ./node_modules
```
Files will be outputed as `[name]-css.js`. EG: If file is `button.scss`, outputed file will be `button-css.js`.


## Template
By default, the template is:
```js
import {html} from '@polymer/lit-element';
export const style = html`<style><% content %></style>`;
```

This can be overriden with the `-t` option.
