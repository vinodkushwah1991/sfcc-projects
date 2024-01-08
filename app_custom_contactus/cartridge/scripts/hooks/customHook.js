
'use strict';


function test(name) {
    var Logger = require('dw/system/Logger');
    Logger.debug('This is Hook generated text by  ' + name);
    // return ('This is Hook generated text by  ' + name);
}

function calculateSum(a, b) {
    return a + b;
}



module.exports = {
    test: test,
    calculateSum: calculateSum
}