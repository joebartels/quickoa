'use strict';

const Router = require('koa-router');

class Route extends Router {
  constructor(options = {})   {
    super(options);
  }

  /**
    Adds a route to the router instance. Benefit to using this method is that
    middleware param can be an array, or multiple params.

    e.g. these are equivalent 

    `addRoute(api, 'get', '/users', [authorize, session, users])`
    `addRoute(api, 'get', '/users', authorize, session, users)`
    `addRoute(api, 'get', '/users', cookie, [lookup, update, respond])`
    @method addRoute
  */
  addRoute(method, path, ...middleware) {    
    this[method].apply(this, [path].concat(...middleware));
  }

}

module.exports = Route;
