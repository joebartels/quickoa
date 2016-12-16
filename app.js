'use strict';

const Koa       = require('koa');
const cors      = require('kcors');
const bluebird  = require('bluebird');
const responseT = require('koa-response-time');

const { db } = require('./db/repos');

const {
  PORT
} = process.env;

// https://github.com/tj/co/pull/256
bluebird.config({
  warnings: false
});

class App extends Koa {
  constructor(options = {}) {
    let {
      koaOptions
    } = options;

    let app = super();

    app.use(responseT());
    app.use(cors({
      origin(ctx) {
        return `${ctx.headers['origin']}`;
      },
      credentials: true,
    }));

    db.connect()
    .then(con => {
      con.done();
    })
    .catch(err => {
      console.log('Unable to establish DB connection');
      console.log(err);
    });

    let port = PORT || 6789;
    app.listen(port);

    console.log(`listening on localhost:${port}`)

    return app;
  }

  addRoutes(routes = {}) {
    for (let name in routes) {
      if (typeof routes[name].routes !== 'function') {
        throw new Error('each route must export a routes() function.');
      }
      this.use(routes[name].routes());
    }    
  }
}

module.exports = App;
