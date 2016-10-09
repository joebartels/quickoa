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


/**
  Exports an object of SQL Queries.
  Uses naming conventions based on the filepath.

  e.g., with these files in the main working directory:

  __sql/user-places/add.sql__
  __sql/user-trips/find-my-trips.sql__

  the exported object looks like:
  ```js
  {
    userPlaces: { add },
    userTrips: { findMyTrips }
  }
  ```

  @object
*/
module.exports = queries;
