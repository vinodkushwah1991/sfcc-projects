'use strict';

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Logger = require('dw/system/Logger');
var HookMgr = require('dw/system/HookMgr');

/**
 * Job for sending Emails for respective query section
 * @function
 */
function sendResponsesMails() {
  var contactUsResponsesObj;
  try {
    contactUsResponsesObj = null;
    Transaction.wrap(function () {
      contactUsResponsesObj = CustomObjectMgr.getAllCustomObjects('saveUserResponse');
      while (contactUsResponsesObj.hasNext()) {
        var newItem = contactUsResponsesObj.next();
        var status = HookMgr.callHook('custom.hook.sendMail', 'sendEmail', newItem.custom)
        if (status === true) {
          try {
            Transaction.wrap(function () {
              CustomObjectMgr.remove(newItem);
            });
          }
          catch (error) {
            Logger.debug(error);
          }
        }
      }
    });
    }
  catch (error) {
    Logger.error(error)
  }
}

module.exports = {
  sendResponsesMails: sendResponsesMails
};
