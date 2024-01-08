'use strict'

var Logger = require("dw/system/Logger");
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

module.exports.recaptchaService = (googleRecaptchaSecretKey, token) => {
    var recaptchaService = LocalServiceRegistry.createService("Recaptchaservice", {
        createRequest: function (service) {
            service.setRequestMethod('POST');

            service.addParam("secret", googleRecaptchaSecretKey);
            service.addParam("response", token);
        },
        filterLogMessage: function (msg) {
            return msg;
        },
        parseResponse: function (service, listOutput) {
            return JSON.parse(listOutput.text);
        }
    });

    try {
        var callServiceResult = recaptchaService.call();
        if (!callServiceResult.isOk()) {
            Logger.getLogger("reCaptcha", "reCaptcha").error("Failed to make request! getErrorMessage={0}", callServiceResult.getErrorMessage());
            return null;
        }
        return callServiceResult;
    } catch (e) {
        Logger.getLogger("reCaptcha", "reCaptcha").error("Failed to make request! e={0}", e.toString());
        return null;
    }
};
