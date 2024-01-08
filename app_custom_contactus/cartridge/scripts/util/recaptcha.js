'use strict';

function verify(token) {
  var result = {
        success: false
  };
  if (token){
    var Site = require('dw/system/Site');
    var Service = require("../../services/recaptchaService");
    var SiteSecretRecapcha = Site.getCurrent().getPreferences().getCustom()['recaptchaSecreteKey'];
    var MiniScoreRecaptcha = Site.getCurrent().getPreferences().getCustom()['MIniScoreRecaptcha'];

        var callServiceResult = Service.recaptchaService(SiteSecretRecapcha, token);
        var responseObj = callServiceResult.getObject();
        if (responseObj) {
            result = responseObj;
            if (MiniScoreRecaptcha < responseObj.score) {
                result.success = true;
            }
            else
            {
                result.success = false;
            }
        }

        // HTTP Error 503 - Service Unavailable
        if (callServiceResult.error == 503 || callServiceResult.error== 404 && empty(responseObj)) {
            result.success = false;
        }
    }

    return result;
}

module.exports = {
    verify: verify
};