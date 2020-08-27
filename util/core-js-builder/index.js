import builder from 'core-js-builder';
import fs from 'fs';
/* {
  "modules": ["es"],        // modules / namespaces, by default - all `core-js` modules
  "blacklist": [], // blacklist of modules / namespaces, by default - empty list
  "targets": "chrome 63",                               // optional browserslist query
  "filename": "src/main/webapp/js/my-core-js-bundle.js",              // optional target filename, if it"s missed a file will not be created
} */
const option = JSON.parse(fs.readFileSync('util/core-js-builder/builder-option.json').toString());

console.log(option);

builder(option)
  .then(code => {                                  // code of result polyfill
    const buildInfo = {
      include_modules: option.modules,
      targets: option.targets
    };
    const currentTime = new Date().toLocaleString();
    const buildInfoLineArr = [
      `builder option ${currentTime}`,
      ...JSON.stringify(buildInfo, null, 2).split('\n')
    ];
    const buildInfoStr = [
      '/**',
      ...buildInfoLineArr.map(line => ' * ' + line),
      ' */'
    ].join('\r\n');

    fs.writeFileSync(option.filename, buildInfoStr + '\r\n' + code);
  }).catch(error => {
    // ...
  });