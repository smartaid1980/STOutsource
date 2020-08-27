import compat from 'core-js-compat';
import fs from 'fs';

const option = JSON.parse(fs.readFileSync('util/core-js-builder/builder-option.json').toString());
const compatOption = {
  // browserslist query or object of minimum environment versions to support
  targets: option.targets,
  // optional filter - string-prefix, regexp or list of modules
  filter: new RegExp(`^(${option.modules.join('|').replace(/\./, '\\.')})\\.`),
  // used `core-js` version, by default - the latest
  version: '3.6'
}
console.log(compatOption);
const {
  list,                  // array of required modules
  targets,               // object with targets for each module
} = compat(compatOption);

console.log(targets, list);