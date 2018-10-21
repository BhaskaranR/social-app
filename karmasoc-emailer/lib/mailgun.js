'use strict';
let config = require("config");
const mailgun = require('mailgun-js')({ apiKey: config.get('mailGunApiKey'), domain: config.get('mailGunDomain') });
const KARMASOC_TEAM = 'Karmasoc Team <team@' + config.get('mailGunDomain') + '>';


const log = require('karmasoc-util').logger;

const fns = {};

fns.sendMailToMailgun = (user, mail, subject) => {
    return new Promise((resolve, reject) => {

        let data = {
            from: KARMASOC_TEAM,
            to: user.mail,
            subject: subject,
            html: mail
        };

        // send mail
        mailgun.messages().send(data, err => {
            if (err) {
                log.error('Error while sending mail to ', user, ' Because of ', err);
                reject(err);
            }
            resolve();
        });
    });
};

module.exports = fns;