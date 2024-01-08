'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var ShippingLocation = require('dw/order/ShippingLocation');
var TaxMgr = require('dw/order/TaxMgr');
var Logger = require('dw/system/Logger');

var base = module.superModule;

function calculateTaxes(basket) {
    var taxes = [];

    var shipments = basket.getShipments();
    var customerNo = basket.customerNo;
    var loyaltyPoints = session.custom.loyaltyBonus;

    if (loyaltyPoints >= 0 && loyaltyPoints <= 100) {
        var newLogger = Logger.getLogger('gold', 'Gold');
        newLogger.error('Customer no - ' + customerNo + ' is charged with tax rate = 20%');
    }
    else if (loyaltyPoints <= 300 && loyaltyPoints > 100 ) {
        var newLogger = Logger.getLogger('diamond', 'Diamond');
        newLogger.error('Customer no - ' + customerNo + ' is charged with tax rate = 15%');

    }
    else if (loyaltyPoints > 300) {
        var newLogger = Logger.getLogger('platinum', 'Platinum');
        newLogger.error('Customer no - ' + customerNo + ' is charged with tax rate = 10%');

    }

    collections.forEach(shipments, function (shipment) {
        var taxJurisdictionId = null;

        if (shipment.shippingAddress) {
            var location = new ShippingLocation(shipment.shippingAddress);
            taxJurisdictionId = TaxMgr.getTaxJurisdictionID(location);
        }

        if (!taxJurisdictionId) {
            taxJurisdictionId = TaxMgr.defaultTaxJurisdictionID;
        }

        // if we have no tax jurisdiction, we cannot calculate tax
        if (!taxJurisdictionId) {
            return;
        }

        var lineItems = shipment.getAllLineItems();

        collections.forEach(lineItems, function (lineItem) {
            var taxClassId = lineItem.taxClassID;

            Logger.debug('1. Line Item {0} with Tax Class {1} and Tax Rate {2}', lineItem.lineItemText, lineItem.taxClassID, lineItem.taxRate);

            // do not touch line items with fix tax rate
            if (taxClassId === TaxMgr.customRateTaxClassID) {
                return;
            }

            // line item does not define a valid tax class; let's fall back to default tax class
            if (!taxClassId) {
                taxClassId = TaxMgr.defaultTaxClassID;
            }

            // if we have no tax class, we cannot calculate tax
            if (!taxClassId) {
                Logger.error('Line Item {0} has invalid Tax Class {1}', lineItem.lineItemText, lineItem.taxClassID);
                return;
            }

            // get the tax rate
            var taxRate = TaxMgr.getTaxRate(taxClassId, taxJurisdictionId);
            // w/o a valid tax rate, we cannot calculate tax for the line item
            if (!taxRate && taxRate !== 0) {
                return;
            }

            // calculate the tax of the line item
            taxes.push({ uuid: lineItem.UUID, value: taxRate, amount: false });
            Logger.debug('2. Line Item {0} with Tax Class {1} and Tax Rate {2}', lineItem.lineItemText, lineItem.taxClassID, lineItem.taxRate);
        });
    });

    return { taxes: taxes, custom: {} };
}

base.calculateTaxes = calculateTaxes;

module.exports = base;