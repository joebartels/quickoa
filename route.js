'use strict';

const Router      = require('koa-router');
const bodyparser  = require('koa-bodyparser');

class Route extends Router {
  constructor(options = {})   {
    super(options);
  }

  /**
    Adds a route to the router instance. Benefit to using this method is that
    middleware param can be an array, or multiple params.

    Also adds `bodyparser` middleware to PUT, POST, and PATCH requests

    e.g. these are equivalent 

    `addRoute(api, 'get', '/users', [authorize, session, users])`
    `addRoute(api, 'get', '/users', authorize, session, users)`
    `addRoute(api, 'get', '/users', cookie, [lookup, update, respond])`
    @method addRoute
  */
  addRoute(method, path, ...middleware) {
    if (method === 'post' || method === 'put' || method === 'patch') {
      middleware.unshift(bodyparser());
    }

    this[method].apply(this, [path].concat(...middleware));
  }

}

module.exports = Route;
