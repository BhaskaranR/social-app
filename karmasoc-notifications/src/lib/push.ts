'use strict';
import FCM from 'fcm-push';
const log = require('karmasoc-util').logger;
const config = require('config');
const gcm = require('node-gcm');

// Setting Web Push credentials
const webPush = require('web-push')
webPush.setVapidDetails(
    'mailto:r.bhaskarann@gmail.com',
    "BEMHvDSNah5TnwfBzY5kZc8l4ax7fmLaoHg9lP8eDJ7wdJldEFoRg3TC46-oiyUKg3R9gms-zNY5BbNsotPC2VE",
    "MRHkVYTz1kHPGjrxfI_W-715_TJhPUnZFWSgmj-78AI"
)

//var fcm = new FCM(config.get("firebase.fcmServerKey"));
const senderID = new gcm.Sender(process.env['ANDROID_PUSH_KEY']);

const apn = require('apn');
const apnOptions = {
    cert: '/home/post/post-new/karmasfvoc-notifications/cert.pem',
    key: '/home/post/post-new/karmasoc-notifications/key.pem'
};


const apnConnection = new apn.Connection(apnOptions);
export const sendPush = (receiver, messageData) => {
    log.info('going to send notification to', receiver, 'push type:', messageData.entity);

    if (!receiver) {
        return log.warn('error no user found for sending push notification');
    }

    if (!Array.isArray(receiver)) {
        receiver = [receiver];
    }

    /*let androidReceiver = [];
    let iosReceiver = [];
    let webReceiver = [];


    receiver.forEach(receiver => {
        if (receiver.type.toLowerCase() === 'ios') {
            iosReceiver.push(receiver);
        } else if (receiver.type.toLowerCase() === 'android') {
            androidReceiver.push(receiver);
        } else if (receiver.type.toLowerCase() === 'web') {
            webReceiver.push(receiver);
        }
    });

    if (androidReceiver.length) {
        let pushTokens = androidReceiver.map(device => device.pushToken);

        let message = new gcm.Message();

        message.addData('title', 'Karmasoc');
        message.addData('icon', 'drawable-hdpi-icon');

        // add custom keys
        for (let key in messageData) {
            if (messageData.hasOwnProperty(key)) {
                message.addData(key, messageData[key]);
            }
        }

        log.info('sending push to', pushTokens.length, 'android devices');
        log.info('sending push to', pushTokens);
        senderID.send(message, pushTokens, 4, err => {
            if (err) {
                log.error(err, 'error sending push: ');
            }
        });
    }
    if (iosReceiver.length) {
        let devices = iosReceiver.map(device => new apn.Device(device.pushToken));
        let message = new apn.Notification();

        message.setAlertTitle('Karmasoc');
        message.setAlertText(messageData.message);
        message.payload = {};
        message.payload[messageData.entity] = messageData.entity_id;

        message.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        message.sound = 'default';

        log.info('sending push to', devices.length, 'ios devices');
        devices.forEach(device => {
            apnConnection.pushNotification(message, device);
        });
    }*/

    // if (webReceiver.length) {
        log.info('sending push to', receiver.length, 'web devices');
        receiver.forEach(device => {
            delete device._id;
            sendNotification(device, messageData);
        });
        //webpush todo
   // }
};

const sendNotification = (pushSubscription, payload) => {
    if (pushSubscription) {
        webPush.sendNotification(pushSubscription, payload)
            .then(function(response) {
                console.log("Push sent");
                console.log(payload);
                console.log(response)
            })
            .catch(function(error) {
                console.log(error);
            })
    }
}
