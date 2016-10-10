'use strict';

const glob  = require('glob');
const Mocha = require('mocha');

const arg = process.argv[2];
const grep = process.argv[3];
const root = 'tests';

const mochaOptions = {
  retport: 'spec'
};

if (grep) {
  mochaOptions.grep = grep;
}

const mocha = new Mocha(mochaOptions);

function addFiles(mocha, files) {
  console.log(`testing file paths: ${files}`);

  glob.sync(files).forEach(mocha.addFile.bind(mocha));
}

if (arg === 'all') {
  addFiles(mocha, `${root}/**/*-test.js`);
  addFiles(mocha, `${root}/**/*-slow.js`);
} else if (arg) {
  addFiles(mocha, arg);
} else {
  addFiles(mocha, `${root}/**/*-test.js`);
}

mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});

// TODO:CLEANUP
// be smart about testing directories via CLI arg. e.g., 
// npm test tests/transforms
// => glob.sync(tests/transforms/**/**-test.js)
// 
//    Check if directory, and apply the wildcard glob
//      or
//    Apply wildcard glob when no file extension exists
