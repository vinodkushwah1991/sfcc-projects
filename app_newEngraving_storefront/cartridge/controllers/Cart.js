'use strict';

/**
 * @namespace Cart
 */

var server = require('server');
server.extend(module.superModule);

server.replace('AddProduct', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var Transaction = require('dw/system/Transaction');
    var CartModel = require('*/cartridge/models/cart');
    var ProductLineItemsModel = require('*/cartridge/models/productLineItems');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var previousBonusDiscountLineItems = currentBasket.getBonusDiscountLineItems();
    var productId = req.form.pid;
    var engraving = req.form.engravingMsg;
    var childProducts = Object.hasOwnProperty.call(req.form, 'childProducts')
        ? JSON.parse(req.form.childProducts)
        : [];
    var options = req.form.options ? JSON.parse(req.form.options) : [];
    var quantity;
    var result;
    var pidsObj;

    if (currentBasket) {
        Transaction.wrap(function () {
            if (!req.form.pidsObj) {
                quantity = parseInt(req.form.quantity, 10);
                result = cartHelper.addProductToCart(
                    currentBasket,
                    productId,
                    quantity,
                    childProducts,
                    options
                );
            } else {
                // product set
                pidsObj = JSON.parse(req.form.pidsObj);
                result = {
                    error: false,
                    message: Resource.msg('text.alert.addedtobasket', 'product', null)
                };

                pidsObj.forEach(function (PIDObj) {
                    quantity = parseInt(PIDObj.qty, 10);
                    var pidOptions = PIDObj.options ? JSON.parse(PIDObj.options) : {};
                    var PIDObjResult = cartHelper.addProductToCart(
                        currentBasket,
                        PIDObj.pid,
                        quantity,
                        childProducts,
                        pidOptions,
                    );
                    if (PIDObjResult.error) {
                        result.error = PIDObjResult.error;
                        result.message = PIDObjResult.message;
                    }
                });
            }
            if (!result.error) {
                cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
                basketCalculationHelpers.calculateTotals(currentBasket);
            }
        });
    }

    var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems);
    var cartModel = new CartModel(currentBasket);

    var urlObject = {
        url: URLUtils.url('Cart-ChooseBonusProducts').toString(),
        configureProductstUrl: URLUtils.url('Product-ShowBonusProducts').toString(),
        addToCartUrl: URLUtils.url('Cart-AddBonusProducts').toString()
    };

    var newBonusDiscountLineItem =
        cartHelper.getNewBonusDiscountLineItem(
            currentBasket,
            previousBonusDiscountLineItems,
            urlObject,
            result.uuid
        );
    if (newBonusDiscountLineItem) {
        var allLineItems = currentBasket.allProductLineItems;
        var collections = require('*/cartridge/scripts/util/collections');
        collections.forEach(allLineItems, function (pli) {
            if (pli.UUID === result.uuid) {
                Transaction.wrap(function () {
                    pli.custom.bonusProductLineItemUUID = 'bonus'; // eslint-disable-line no-param-reassign
                    pli.custom.preOrderUUID = pli.UUID; // eslint-disable-line no-param-reassign
                });
            }
        });
    }

    var reportingURL = cartHelper.getReportingUrlAddToCart(currentBasket, result.error);

    res.json({
        reportingURL: reportingURL,
        quantityTotal: quantityTotal,
        message: result.message,
        cart: cartModel,
        newBonusDiscountLineItem: newBonusDiscountLineItem || {},
        error: result.error,
        pliUUID: result.uuid,
        minicartCountOfItems: Resource.msgf('minicart.count', 'common', null, quantityTotal)
    });

    next();
});

/**
 * Cart-GetProduct : The Cart-GetProduct endpoint handles showing the product details in a modal/quickview for editing a product in basket on cart page
 * @name Base/Cart-GetProduct
 * @function
 * @memberof Cart
 * @param {querystringparameter} - uuid - UUID of the product line item (to edit)
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.replace('GetProduct', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var collections = require('*/cartridge/scripts/util/collections');
    var ProductFactory = require('*/cartridge/scripts/factories/product');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var requestUuid = req.querystring.uuid;

    var requestPLI = collections.find(BasketMgr.getCurrentBasket().allProductLineItems, function (item) {
        return item.UUID === requestUuid;
    });
    var vEngraving = requestPLI.custom.vEngraving;
    var requestQuantity = requestPLI.quantityValue.toString();

    // If the product has options
    var optionProductLineItems = requestPLI.getOptionProductLineItems();
    var selectedOptions = null;
    var selectedOptionValueId = null;
    if (optionProductLineItems && optionProductLineItems.length) {
        var optionProductLineItem = optionProductLineItems.iterator().next();
        selectedOptionValueId = optionProductLineItem.optionValueID;
        selectedOptions = [{ optionId: optionProductLineItem.optionID, selectedValueId: optionProductLineItem.optionValueID, productId: requestPLI.productID }];
    }

    var pliProduct = {
        pid: requestPLI.productID,
        quantity: requestQuantity,
        options: selectedOptions
    };

    var context = {
        vEngraving:vEngraving,
        product: ProductFactory.get(pliProduct),
        selectedQuantity: requestQuantity,
        selectedOptionValueId: selectedOptionValueId,
        uuid: requestUuid,
        updateCartUrl: URLUtils.url('Cart-EditProductLineItem'),
        closeButtonText: Resource.msg('link.editProduct.close', 'cart', null),
        enterDialogMessage: Resource.msg('msg.enter.edit.product', 'cart', null),
        template: 'product/quickView.isml'
    };

    res.setViewData(context);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();

        res.json({
            renderedTemplate: renderTemplateHelper.getRenderedHtml(viewData, viewData.template)
        });
    });
    next();
});
/**
 * Cart-EditProductLineItem : The Cart-EditProductLineItem endpoint edits a product line item in the basket on cart page
 * @name Base/Cart-EditProductLineItem
 * @function
 * @memberof Cart
 * @param {httpparameter} - uuid - UUID of product line item being edited
 * @param {httpparameter} - pid - Product ID
 * @param {httpparameter} - quantity - Quantity
 * @param {httpparameter} - selectedOptionValueId - ID of selected option
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace('EditProductLineItem', function (req, res, next) {
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var arrayHelper = require('*/cartridge/scripts/util/array');
    var BasketMgr = require('dw/order/BasketMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var Transaction = require('dw/system/Transaction');
    var CartModel = require('*/cartridge/models/cart');
    var collections = require('*/cartridge/scripts/util/collections');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });
        return next();
    }

    var uuid = req.form.uuid;
    var productId = req.form.pid;
    var selectedOptionValueId = req.form.selectedOptionValueId;
    var updateQuantity = parseInt(req.form.quantity, 10);
    var updatedEngravingMsg = req.form.editengraving;
    var productLineItems = currentBasket.allProductLineItems;
    var requestLineItem = collections.find(productLineItems, function (item) {
        return item.UUID === uuid;
    });

    var uuidToBeDeleted = null;
    var pliToBeDeleted;
    var newPidAlreadyExist = collections.find(productLineItems, function (item) {
        if (item.productID === productId && item.UUID !== uuid && item.custom.vEngraving=== updatedEngravingMsg) {
            uuidToBeDeleted = item.UUID;
            pliToBeDeleted = item;
            updateQuantity += parseInt(item.quantity, 10);
            return true;
        }
        return false;
    });

    var availableToSell = 0;
    var totalQtyRequested = 0;
    var qtyAlreadyInCart = 0;
    var minOrderQuantity = 0;
    var canBeUpdated = false;
    var perpetual = false;
    var bundleItems;

    if (requestLineItem) {
        if (requestLineItem.product.bundle) {
            bundleItems = requestLineItem.bundledProductLineItems;
            canBeUpdated = collections.every(bundleItems, function (item) {
                var quantityToUpdate = updateQuantity *
                    requestLineItem.product.getBundledProductQuantity(item.product).value;
                qtyAlreadyInCart = cartHelper.getQtyAlreadyInCart(
                    item.productID,
                    productLineItems,
                    item.UUID
                );
                totalQtyRequested = quantityToUpdate + qtyAlreadyInCart;
                availableToSell = item.product.availabilityModel.inventoryRecord.ATS.value;
                perpetual = item.product.availabilityModel.inventoryRecord.perpetual;
                minOrderQuantity = item.product.minOrderQuantity.value;
                return (totalQtyRequested <= availableToSell || perpetual) &&
                    (quantityToUpdate >= minOrderQuantity);
            });
        } else {
            availableToSell = requestLineItem.product.availabilityModel.inventoryRecord.ATS.value;
            perpetual = requestLineItem.product.availabilityModel.inventoryRecord.perpetual;
            qtyAlreadyInCart = cartHelper.getQtyAlreadyInCart(
                productId,
                productLineItems,
                requestLineItem.UUID
            );
            totalQtyRequested = updateQuantity + qtyAlreadyInCart;
            minOrderQuantity = requestLineItem.product.minOrderQuantity.value;
            canBeUpdated = (totalQtyRequested <= availableToSell || perpetual) &&
                (updateQuantity >= minOrderQuantity);
        }
    }

    var error = false;
    if (canBeUpdated) {
        var product = ProductMgr.getProduct(productId);
        try {
            Transaction.wrap(function () {
                if (newPidAlreadyExist) {
                    var shipmentToRemove = pliToBeDeleted.shipment;
                    currentBasket.removeProductLineItem(pliToBeDeleted);
                    if (shipmentToRemove.productLineItems.empty && !shipmentToRemove.default) {
                        currentBasket.removeShipment(shipmentToRemove);
                    }
                }

                if (!requestLineItem.product.bundle) {
                    requestLineItem.replaceProduct(product);
                }

                // If the product has options
                var optionModel = product.getOptionModel();
                if (optionModel && optionModel.options && optionModel.options.length) {
                    var productOption = optionModel.options.iterator().next();
                    var productOptionValue = optionModel.getOptionValue(productOption, selectedOptionValueId);
                    var optionProductLineItems = requestLineItem.getOptionProductLineItems();
                    var optionProductLineItem = optionProductLineItems.iterator().next();
                    optionProductLineItem.updateOptionValue(productOptionValue);
                }
                var newrequestLineItem = requestLineItem;
                requestLineItem.custom.vEngraving = updatedEngravingMsg;
                requestLineItem.setQuantityValue(updateQuantity);
                basketCalculationHelpers.calculateTotals(currentBasket);
            });
        } catch (e) {
            error = true;
        }
    }

    if (!error && requestLineItem && canBeUpdated) {
        var cartModel = new CartModel(currentBasket);

        var responseObject = {
            cartModel: cartModel,
            newProductId: productId
        };

        if (uuidToBeDeleted) {
            responseObject.uuidToBeDeleted = uuidToBeDeleted;
        }

        var cartItem = arrayHelper.find(cartModel.items, function (item) {
            return item.UUID === uuid;
        });

        var productCardContext = { lineItem: cartItem, actionUrls: cartModel.actionUrls };
        var productCardTemplate = 'cart/productCard/cartProductCardServer.isml';

        responseObject.renderedTemplate = renderTemplateHelper.getRenderedHtml(
            productCardContext,
            productCardTemplate
        );

        res.json(responseObject);
    } else {
        res.setStatusCode(500);
        res.json({
            errorMessage: Resource.msg('error.cannot.update.product', 'cart', null)
        });
    }

    return next();
});
module.exports = server.exports();
