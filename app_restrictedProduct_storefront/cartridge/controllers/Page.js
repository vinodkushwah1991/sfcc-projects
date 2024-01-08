'use strict';

/**
 * @namespace Page
 */

var server = require('server');
server.extend(module.superModule);
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.replace(
    'IncludeHeaderMenu', function (req, res, next) {
        var lessThan18Years = customer.isMemberOfCustomerGroup('lessThan18Years');
        res.render('/components/header/menuTemp', {
            lessThan18Years: lessThan18Years
        });
        next();
    }
);

server.get(
    'IncludeHeaderMenuWine', 
    server.middleware.include,
    cache.applyDefaultCache, function (req, res, next) {
        var catalogMgr = require('dw/catalog/CatalogMgr');
        var Categories = require('*/cartridge/models/categories');
        var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();

        var topLevelCategories = siteRootCategory.hasOnlineSubCategories() ?
            siteRootCategory.getOnlineSubCategories() : null;

        res.render('/components/header/menu', new Categories(topLevelCategories));
        next();
    }
);

server.get(
    'IncludeHeaderMenuNonWine', 
    server.middleware.include,
    cache.applyDefaultCache, function (req, res, next) {
        var catalogMgr = require('dw/catalog/CatalogMgr');
        var Categories = require('*/cartridge/models/categories');
        var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();

        var topLevelCategories = siteRootCategory.hasOnlineSubCategories() ?
            siteRootCategory.getOnlineSubCategories() : null;

        res.render('/components/header/menu', new Categories(topLevelCategories));
        next();
    }
);
module.exports = server.exports();