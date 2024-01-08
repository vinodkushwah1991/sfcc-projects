'use strict';

/**
 * @namespace Search
 */

var server = require('server');
server.extend(module.superModule);
/**
 * Search-Show : This endpoint is called when a shopper type a query string in the search box
 * @name app_restrictedProduct_storefront/Search-Show
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyShortPromotionSensitiveCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - q - query string a shopper is searching for
 * @param {querystringparameter} - search-button
 * @param {querystringparameter} - lang - default is en_US
 * @param {querystringparameter} - cgid - Category ID
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.append('Show', function (req, res, next) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var URLUtils = require('dw/web/URLUtils');
    var result = searchHelper.search(req, res);
    var authenticated = customer.isAuthenticated();
    var lessThan18Years = customer.isMemberOfCustomerGroup('lessThan18Years');
    var productList = result.productSearch.productIds;
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Site = require('dw/system/Site');
    var isActiveWine = Site.getCurrent().getCustomPreferenceValue('IsWineActive');
    var ProductIsWine;
    if (isActiveWine) {
        if (lessThan18Years || authenticated == false) {
            productList.forEach(pro => {
            var proId = pro.productID;
               ProductIsWine = ProductMgr.getProduct(pro.productID);
                if (ProductIsWine.custom.isWineVinod) {
                    res.redirect(URLUtils.url("NotEligible-Show"));
                }
            });
        }
    }
    res.render('search/searchResults');
    return next();
});
module.exports = server.exports();