'use strict';

const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcrypt');
const Bluebird  = require('bluebird');

const {
  getProperties
} = require('./basic');

const DOMAIN        = process.env['DOMAIN'];
const SECRET        = process.env['JSON_TOKEN_SECRET'];
const ENTITY_COOKIE = process.env['AUTH_COOKIE'] || '_';
const SALT_ROUNDS   = 10;
const DELETED       = 'deleted';

/**
  Resolves to a password hash of type String.
  An error will reject - so be sure to use with `.catch`

  @method genHash
  @param {String} pass
  @return {Promise}
*/
module.exports.genHash = function(pass) {
  return new Bluebird(function(resolve, reject) {
    bcrypt.hash(pass, SALT_ROUNDS, function(err, hash) {
      if (err) {
        return reject(err);
      }
      return resolve(hash);
    });
  });
};

/**
  If password comparison matches, resolves, else rejects.
  An error will reject - so be sure to use with `.catch`

  @method comparePass
  @param {String} pass
  @param {String} hash
  @return {Promise}
*/
module.exports.comparePass = function(pass, hash) {
  return new Bluebird(function(resolve, reject) {
    bcrypt.compare(pass, hash, function(err, res) {
        if (err) {
          return reject(err);
        }
        return res ? resolve() : reject();
    });  
  });
};

module.exports.parseJwt = function(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch(e) {
    console.log('JWT verify error');
    console.log(e);
    return null;
  }
};

module.exports.signJwt = function(payload) {
  return jwt.sign(payload, SECRET);
};

module.exports.extractEntity = function(data) {
  if (typeof data !== 'object') { return; }

  return getProperties(data, 'user_id', 'id');
};

/**
  Returns the cookie value for the entity. Handles expired cookies.

  @method getToken
  @param {Object} ctx
*/
module.exports.getToken = function(ctx) {
  let value = ctx.cookies.get(ENTITY_COOKIE);

  return value === DELETED ? null : value;
};

module.exports.setToken = function(ctx, token) {
  let domain = cookieDomain();
  let expires = dateFromNow(2);
  let httpOnly = true;

  let options = { domain, expires, httpOnly };

  ctx.cookies.set(ENTITY_COOKIE, token, options);
};

module.exports.expireToken = function(ctx) {
  let domain = cookieDomain();
  let expires = dateFromNow(-2);
  let httpOnly = true;

  let options = { domain, expires, httpOnly };
  
  ctx.cookies.set(ENTITY_COOKIE, DELETED, options);
};

function dateFromNow(years = 0) {
  let date = new Date();
  date.setFullYear(date.getFullYear() + years);

  return date;
}

/**
  Adds a preceeding "." to canonical domains.
  
  By spec, the leading dot, "." should be ignored but for 
  historical cross browser reasons everyone adds it?
  https://tools.ietf.org/html/rfc6265#section-4.1.2.3 

  @method cookieDomain
  @return {String} domain to use for cookie
*/
function cookieDomain() {
  let pieces = DOMAIN.split('.');

  return pieces.length > 2 ? DOMAIN : `.${DOMAIN}`;
}
