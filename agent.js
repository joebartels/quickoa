const Bluebird = require('bluebird');
const Serializer = require('./serializer');
const Validator = require('./validator');
/**
  An Agent is used to communicate with the database from the API.
  An Agent is responsible for creating/updating and reading records from the db.

  It employs a repo (w/ SQL queries), a serializer and validator to do its job.

  For addings data into a database, a typical flow is:
  ```js
  let row;
  let data = Agent.normalize(rawData);
  let errors = Agent.validate(data);

  if (errors.length === 0) {
    row = Agent.db('addComment', data);
  }

  if (row.error) {
    ctx.body.error = row.error;
  }
  ```

  `row` will be either be a serialized response from the `addComment` query.
  or an object containing an `error` hash: `{ error }`.
  

  @class Agent
  @param {Object} options { serializer, validator }
*/
class Agent {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new TypeError('Must pass an options Object ' +
                          '`{ serializer, validator, repo, ... }` ' +
                          'when invoking Agent as constructor.');
    }

    let {
      serializer,
      validator,
      repo
    } = options;

    if (!(serializer instanceof Serializer)) {
      throw new Error('`{ serializer }` must be instanceof quickoa/serializer.');
    }

    if (!(validator instanceof Validator)) {
      throw new Error('`{ validator }` must be instanceof quickoa/validator.');
    }

    if (!repo || (repo && typeof repo !== 'object')) {
      throw new Error('`{ repo }` must be provided.');
    }

    this.serializer = serializer
    this.validator = validator;
    this.repo = repo;
  }

  /**
    Passes { data } into the repo's query, found using `queryName`.
    The results are serialized and returned.

    @method db
    @param {String} queryName The SQL query to execute
    @param {Object} data The data required to make the specific SQL query.
  */
  query(query, data) {
    return this.raw(...arguments)
    .then(results => this.serialize(results));
  }

  upsert(query, data) {
    // normalize, validate, deserialize... ? --- check order!
  }

  /**
    `raw` simply reaches into the Agent's `repo` and invokes `repo[queryName]`
    -- returning the raw results.

    @method raw
    @param {String} queryName The SQL query to execute
    @param {Object} data The data required to make the specific SQL query.
  */
  raw(queryName, data) {
    let { repo } = this;
    let query = repo[queryName];

    if (typeof query !== 'function') {
      return Bluebird.reject(new Error(`No query found for ${queryName}.`));
    }

    return query(data);
  }

  serialize() {
    return this.serializer.serialize(...arguments);
  }

  normalize() {
    return this.serializer.normalize(...arguments);
  }

  deserialize() {
    return this.serializer.deserialize(...arguments);
  }

  validate() {
    return this.validator.validate(...arguments);
  }
}

module.exports = Agent;
