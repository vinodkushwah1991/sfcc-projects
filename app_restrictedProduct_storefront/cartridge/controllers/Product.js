'use strict';

/**
 * @namespace Product
 */

var server = require('server');
server.extend(module.superModule);

  /**
  * Product-Show : This endpoint is called to show the details of the selected product
  * @name Base/Product-Show
  * @function
  * @memberof Product
  * @param {middleware} - cache.applyPromotionSensitiveCache
  * @param {middleware} - consentTracking.consent
  * @param {querystringparameter} - pid - Product ID
  * @param {category} - non-sensitive
  * @param {renders} - isml
  * @param {serverfunction} - get
  */
server.append('Show', function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var URLUtils = require('dw/web/URLUtils');
    var Site = require('dw/system/Site');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
    var proId = showProductPageHelperResult.product.id;
    var productDetails = ProductMgr.getProduct(proId)
    var authenticated = customer.isAuthenticated();
    var lessThan18Years = customer.isMemberOfCustomerGroup("lessThan18Years");
    var isActiveWine = Site.getCurrent().getCustomPreferenceValue('IsWineActive');
    if(isActiveWine){
        if(!authenticated || lessThan18Years){
            if(productDetails.custom.isWineVinod){
                res.redirect(URLUtils.url("NotEligible-Show"));
            }
        }
    }
    res.render('product/productDetails');
    next();
});
module.exports = server.exports();