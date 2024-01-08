'use strict';

/**
 * @namespace NotEligible
 */
var server = require('server');
server.get('Show', function (req, res, next) {
    res.render('/search/noEligible');
    return next();
});
module.exports = server.exports();