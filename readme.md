#### Why
I use this as a bootstrap for quickly getting an API running with PostgreSQL and easier development.

It basically opens a connection pool to PostgreSQL (using pg-promise).

Has some helper methods for building routes and mixing/matching middleware.


To get started, create an **index.js** file, install pm2 globally, and add a "start" script to your package.json
```
"scripts": {
  "start": "pm2-dev run ecosystem.json"
}
```

```
const Table = require('quickoa/table');

const INSERT = 
`INSERT INTO animals(
  species, extinct, size, lifespan
)
VALUES(
  $[species], $[extinct], $[size], $[lifespan]
)
RETURNING id, species, extinct, size, lifespan`;

const animals = new table({

  // Use singular name
  name: 'animal',

  // Default values are provided in a columns hash.
  // Do not have to provide a key/value if there is no default
  columns: {
    species: 'mamal',
  },

  // All columns that are required must be included here.
  // Used by `table.createRecord();`
  attributes: [
    'species',
    'extinct',
    'size',
    'lifespan'
  ],

  // Add your CRUD methods...
  // `this.client()` returns a PostgreSQL client
  insert(values, task) {
    if (task) {
      return task.one(INSERT, values);
    }

    return this.client()
      .then(db => db.connect())
      .then(con => con.one(INSERT, values));
  }
})
```

##### install pm2 globally:

```bash
npm install pm2@next -g
```

create ecosystem.json file in root:
```
{
  "apps" : [{
    "name"        : "api name here",
    "script"      : "index.js",
    "args"        : [],
    "watch"       : true,
    "ignore_watch" : ["node_modules", "logs", ".git"],
    "node_args"   : [],
    "log_file": "logs/debug.log",
    "err_file": "logs/error.log",
    "out_file": "logs/out.log",
    "env": {
      "NODE_ENV": "development",
      "POSTGRESQL_HOST": "localhost",
      "POSTGRESQL_PORT": 5432,
      "POSTRGRSQL_DB": "my-db-name",
      "POSTGRESQL_USER": "my-db-user",
      "POSTGRESQL_PASS": "my-pass",
      "JSON_TOKEN_SECRET": "some-seret",
      "DOMAIN": "my-website.com",
      "PORT": 80,
      "AUTH_COOKIE": "token",
      "DEBUG": "*"
    },
    "env_production" : {
       "NODE_ENV": "production"
    },
    "env_staging" : {
       "NODE_ENV" : "staging",
       "TEST"     : true
    }
  }]
}
```

##### Serializers
```
// serializers/book.js

const Serializer = require('quickoa/serializer');
const model = require('../models/book');
const rootKey = 'book';

module.exports = new Serializer({ rootKey, model });
```
