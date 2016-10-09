'use strict';

const path = require('path');

const promise = require('bluebird');

const repoDir = path.join(process.cwd(), 'repos');

const repos = require(repoDir);

/**
  Connects to postgres, using environment variables:
  ```
  POSTGRESQL_HOST,
  POSTGRESQL_PORT,
  POSTGRESQL_DB,
  POSTGRESQL_USER,
  POSTGRESQL_PASS
  ```

  Looks for a __repos/index.js__ file in the working directory.
  __repos/index.js__ should export an object of PG Queries (aka repos). 
  E.g.,
  ```js
  {
    userTrips: require('./user-trips'),
    userPlaces: require('./user-places')
  }
  ```
  
  A repo should export a single function that accepts (rep, pgp)


  @file db/pg.js
*/

const options = {

  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise,
  
  // Runs on every task/transaction
  // `obj.any`, `obj.one`, `obj.task`, etc.
  extend(obj) {
    console.log('extend RUNNING RUNNING RUNNING');
    console.log(repos);

    //TODO: is this too slow?
    for (let key in repos) {
      obj[key] = repos[key](obj);
    }
  }
};

// Initialize pg-promise:
const pgp = require('pg-promise')(options);

const {
  POSTGRESQL_HOST,
  POSTGRESQL_PORT,
  POSTGRESQL_DB,
  POSTGRESQL_USER,
  POSTGRESQL_PASS
} = process.env;

const pgConOptions = {
  host: POSTGRESQL_HOST,
  port: POSTGRESQL_PORT,
  user: POSTGRESQL_USER,
  database: POSTGRESQL_DB,
  password: POSTGRESQL_PASS
};

// Load the diagnostics / monitoring:
const diag = require('./pg-diagnostics');
diag.init(options);

// database instance:
const db = pgp(pgConOptions);

// pgp.pg.defaults.poolSize = 20;

module.exports = {

    // Library instance is often necessary to access all the useful
    // types and namespaces available within the library's root:
    pgp,

    // Database instance. Only one instance per database is needed
    // within any application.
    db
  };
