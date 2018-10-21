import * as MongoDb from 'mongodb';
import Configurations from "../configs/configurations";
import { IEntity, IDeviceRepository } from "./interfaces";
const util = require('karmasoc-util');
const log = util.logger;

class DeviceRepository<T extends IEntity> implements IDeviceRepository<IEntity> {

    private collectionPromise: Promise<MongoDb.Collection>;

    get getCollectionName(): string {
        return "device";
    }

    constructor() {
        this.collectionPromise = this.getCollection(Configurations.Repository.connectionString);

    }

    private getCollection(url: string): Promise<MongoDb.Collection> {
        console.log("connect url" + url);
        return MongoDb.MongoClient.connect(url).then((db: MongoDb.Db) => {
            return db.collection(this.getCollectionName);
        });
    }

    public activateDevice(subscription, userId) {
        return this.collectionPromise.then((collection: MongoDb.Collection) => {
            return collection
                .updateOne(
                {
                    _id: userId.toString()
                },
                {
                    $set: {
                        subscription: subscription,
                        active: true
                    }
                },
                err => {
                    if (err) {
                        log.error(err, 'Error updating device to active', { userid: userId, deviceId: subscription });
                    }
                })
        });
    }


    public deactivateDevice(userId, device, callback) {
        return this.collectionPromise.then((collection: MongoDb.Collection) => {
            return collection.updateOne(
                {
                    _id: userId
                },
                {
                    '$pull':  {devices: {endpoint: device.endpoint}}
                }, err => {
                    if (err) {
                        return callback(err);
                    } else {
                        return callback(null, { data: { ok: true } });
                    }
                })
        });
    }

    public upsertDevice = (device) => {
        device._id = device.user_id;
        delete device.user_id;
        return this.collectionPromise.then((collection: MongoDb.Collection) => {
            return collection.updateOne(
                {
                    _id: device._id
                },
                {
                    '$addToSet': {
                        devices: device
                    }
                }, { upsert: true })
        });
    }

    public getPushTokenFromUser(userIds: string[]): Promise<T[]> {
        return this.collectionPromise.then(collection => {
            return collection
                .find({ _id: { $in: userIds } })
                .toArray();
        });
    }

}


export default DeviceRepository;