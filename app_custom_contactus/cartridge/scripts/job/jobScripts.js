function productNoWine() {
    var Logger = require('dw/system/Logger');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Transaction = require('dw/system/Transaction');
    Transaction.wrap(function () {
        var aashu = ProductMgr.queryAllSiteProducts()
        while (aashu.hasNext()) {
            var newItem = aashu.next();
            newItem.custom.isWineOrNot = false;
        }
    })
}
module.exports = {
    productNoWine: productNoWine
};