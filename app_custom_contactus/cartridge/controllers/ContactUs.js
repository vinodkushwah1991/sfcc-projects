'use-strict'
/**
 * @namespace ContactUs
 */

var server = require('server');

var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var UUIDUtils = require('dw/util/UUIDUtils');
var ArrayList = require('dw/util/ArrayList');
var Resource = require('dw/web/Resource');
const recaptchaHelper = require('*/cartridge/scripts/helpers/recaptchaHelper');
/**
 * ContactUs-setLocale : This endpoint is called to load contact us landing page in specific locale
 * @name Base/ContactQuery-ChangeLocale
 * @function
 * @memberof ContactUs
 * @param {middleware} server.middleware.https
 * @param {server}  get
 */



server.get('setLocale', server.middleware.https,(req, res, next)=> {
  const constants = require('*/cartridge/scripts/constants/constants');
  let locales = {
    IN: constants.DEFAULT,
    FR: constants.FR_FR,
    GB: constants.EN_GB
    };
    request.setLocale(locales[req.geolocation.countryCode]);
    res.redirect(URLUtils.url("ContactUs-Show").toString())
    next();
});

/**
 * ContactQuery-Show : This endpoint is called to load contact Query show page
 * @name Base/ContactQuery-Show
 * @function
 * @memberof ContactUs
 * @param {middleware} - server.middleware.https
 * @param {serverfunction} - get
 */
server.get('Show',csrfProtection.generateToken,(req, res, next)=> {
    const actionUrl = URLUtils.url("ContactUs-SaveCustomerResponses").toString();
    var Site = require('dw/system/Site');
    let serviceEmailsObj = null;
    let servicesEmailsSubjects = new ArrayList();
    // Transaction.wrap(function () {
    //     serviceEmailsObj = CustomObjectMgr.getAllCustomObjects("Subjects");
    //     while (serviceEmailsObj.hasNext()) {
    //         var newItem = serviceEmailsObj.next();
    //         servicesEmailsSubjects.add({ key: newItem.custom.Subjects, value: newItem.custom.	subjectName});
    //     }
    // });
    var subjectEmail = Site.getCurrent().getCustomPreferenceValue("Subject");   
    var Data = JSON.parse(subjectEmail);
    Data.forEach(element => {
        var id = element.id;
        var name = element.Sname;
        servicesEmailsSubjects.add({ key: id, value: name});
    });
    session.forms.contactUs.toMail.setOptions(servicesEmailsSubjects.iterator());
    let contactForm = server.forms.getForm('contactUs');
    contactForm.clear();
    res.render('contactUSForm', { contactForm: contactForm, actionUrl: actionUrl });
    // res.json({a:subjectEmail})
    next();
});

/**
 * ContactUs-SaveCustomerResponses : Save response of Contact Us form
 * @name custom/ContactUs-SaveCustomerResponses
 * @function
 */
server.post('SaveCustomerResponses',csrfProtection.validateAjaxRequest,server.middleware.https,
 (req, res, next)=> {
    let contactUSForm = server.forms.getForm('contactUs');
    var Site = require('dw/system/Site');
    let contactUSFormObj = contactUSForm.toObject();
    let returnData = { success: false };

    const token = req.form.captchatoken;
    var recaptchaResult = recaptchaHelper.verifyRecaptcha(token);
    if(!recaptchaResult.success){
        returnData.error = Resource.msg('label.feedback.robot','contactus',null);
    }
    else{
        let subjectId = contactUSFormObj.toMail.toString();
        let contactUsResponsesObj = null;
        let servicesEmailsSubjects = new ArrayList();
        var subjectEmails = Site.getCurrent().getCustomPreferenceValue("Subject");   
        var Data = JSON.parse(subjectEmails);
        var SubjectData ={}
        Data.forEach(element => {
           if(element.id == subjectId)
           {
            SubjectData.Sname = element.Sname;
            SubjectData.Semail = element.Semail
           }
        });
        Transaction.wrap(function () {
            // let serviceEmails = CustomObjectMgr.getCustomObject('Subjects', subjectId);
            // let serviceEmailsData = !empty(serviceEmails) ? serviceEmails.custom : null; 
            let serviceEmailsData = !empty(Data) ? Data : null; 
            try {
                let uuid = UUIDUtils.createUUID();
                contactUsResponsesObj = CustomObjectMgr.createCustomObject('saveUserResponse', uuid);
                contactUsResponsesObj.custom.customerEmail = !empty(contactUSFormObj) ? contactUSFormObj.email : '';
                contactUsResponsesObj.custom.queryText = !empty(contactUSFormObj) ? contactUSFormObj.message : '';
                contactUsResponsesObj.custom.subject = !empty(serviceEmailsData) ? SubjectData.Sname : '';
                contactUsResponsesObj.custom.mailSubject = !empty(serviceEmailsData) ? SubjectData.Semail : '';
                returnData.success = true;
                returnData.message = Resource.msg('label.feedback.response','contactus',null);
            }
            catch (error) {
                returnData.error = error;
            }
        });

    }

    res.json(returnData);
    next();
});

module.exports = server.exports();