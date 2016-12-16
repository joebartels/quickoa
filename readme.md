#### Why
I use this as a bootstrap for quickly getting an API running with PostgreSQL and easier development.

It basically opens a connection pool to PostgreSQL, using pg-promise module.

Has some helper methods for building routes, controllers, and "agents", plus mixing/matching middleware.

To get started, create an **index.js** file, install pm2 globally, and add a "start" script to your package.json
```json
// package.json
"scripts": {
  "start": "pm2-dev run ecosystem.json"
}
```

```json
// ecosystem.json
{
  "apps" : [{
    "name"        : "anchor api",
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
      "POSTGRESQL_DB": "your-pg-db-name",
      "POSTGRESQL_USER": "pg-user-name",
      "POSTGRESQL_PASS": "pg-pass-word",
      "PORT": 6789,
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

```js
// index.js
const Quickoa = require('quickoa/app');
const routes  = require('./routes');

const app = new Quickoa();

app.addRoutes(routes);

```

```js
// routes/index.js
const Route = require('quickoa/route');
const {
  findComments,
  addComment
} = require('../controllers/api/comments');

const api = new Route({
  prefix: '/api'
});

/**
  Gathers comments for a post with post_id

  GET /api/posts/:post_id/comments
*/
api.addRoute('get', '/posts/:post_id/comments', findComments);

/**
  Adds a comment to post with post_id
  
  POST /api/posts/:post_id/comments
*/
api.addRoute('post', '/posts/:post_id/comments', addComment);

module.exports.api = api;
```

```js
// controllers/api/comments.js
const co = require('co');

const CommentAgent = require('../../agents/comment');
const authenticate = require('../../middlewares/authenticate');

module.exports.findComments = [
  authenticate,
  co.wrap(findCommentsByPost)
];

module.exports.addComment = [
  authenticate,
  co.wrap(addCommentToPost)
];

function findCommentsById *() {
  
}

```

```js
// agents/comments.js
const Agent       = require('quickoa/agent');
const validator   = require('../validators/comment')
const serializer  = require('../serializers/comment');

const { 
  db: {
    postComments
  }
} = require('quickoa/db/repos');

module.exports = new Agent({
  serializer,
  validator,
  repo: postComments
});
```

```
// serializers/comment.js
const Serializer  = require('quickoa/serializer');
const model       = require('../models/comment');

const rootKey = 'comment';

module.exports = new Serializer({ rootKey, model });

```
