'use strict';

const path = require('path');

const promise = require('bluebird');

const repoDir = path.join(process.cwd(), 'repos');

const repos = require(repoDir);

const options = {

  // Use a custom promise library, instead of the default ES6 Promise:
  promiseLib: promise,
  
  // Runs on every task/transaction
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
