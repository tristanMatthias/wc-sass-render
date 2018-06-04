/**
@license
Copyright 2018 Google Inc. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const fs = require('fs');
const path = require('path');
const util = require('util');

const sass = require('node-sass');

const renderSass = util.promisify(sass.render);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const delim = /<%\s*content\s*%>/;

function resolveNpmPath(packagePath) {
  /** @type {Array<string>} */
  const parts = packagePath.split('/');
  let packageName;
  if (parts[0][0] === '@') {
    packageName = `${parts.shift()}/${parts.shift()}`;
  } else {
    packageName = parts.shift();
  }
  const pathToPackageJSON = require.resolve(`${packageName}/package.json`);
  const pathToPackage = path.dirname(pathToPackageJSON);
  return path.join(pathToPackage, ...parts);
}

async function sassToCss(sassFile, include) {
  const result = await renderSass({
    file: sassFile,
    includePaths: [include],
    outputStyle: 'compressed',
  });
  return result.css.toString();
}

async function sassRender(sourceFile, templateFile, outputFile, include, suffix) {
  const template = await readFile(templateFile, 'utf-8');
  const match = delim.exec(template);
  if (!match) {
    throw new Error(`Template file ${templateFile} did not contain template delimiters`);
  }
  const replacement = await sassToCss(sourceFile, include);
  const newContent = template.replace(delim, replacement);
  if (!outputFile) {
    outputFile = `${sourceFile.split('.').slice(0, -1).join('.')}${suffix}`;
  }

  return writeFile(outputFile, newContent, 'utf-8');
}

exports.sassRender = sassRender;
