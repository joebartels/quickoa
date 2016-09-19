'use strict';

const path = require('path');

const {
  QueryFile,
  utils: {
    enumSql
  }
} = require('pg-promise');

const dir = path.join(process.cwd(), 'sql');

const options = {
  minify: true,
  params: {
    // schema: 'public' // replaces ${schema~} with "public"    
  }
};

const queries = enumSql(dir, { recursive: true }, file => {
    return new QueryFile(file, options);
});

// console.log(queries);

module.exports = queries;
