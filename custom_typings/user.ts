import * as MongoDb from 'mongodb'
import {InsertOneWriteOpResult} from "mongodb";
import {UpdateWriteOpResult} from "mongodb";
import {FindAndModifyWriteOpResultObject} from "mongodb";
import {ObjectID} from "mongodb";

export interface IEntity {
    _id: ObjectID;
    createdDate: Date;
    updatedAt: Date;
}

export class User implements IUser{
    _id: ObjectID;
    createdDate: Date;
    updatedAt: Date;
    smId: string;
    strategy: string;
    firstName:string;
    lastName:string;
    city:string;
    state:string;
    country:string;
    gender:string;
    dob:Date;
    mail: string;
    password:string;
    loginType:string;
    verified: boolean;
    isActive: boolean;
    following: ObjectID[];
    friends: ObjectID[];
}

export interface IUser extends IEntity {
    smId: string;
    strategy: string;
    firstName:string;
    lastName:string;
    city:string;
    state:string;
    country:string;
    gender:string;
    dob:Date;
    mail: string;
    password:string;
    loginType:string;
    verified: boolean;
    isActive: boolean;
    following: ObjectID[];
    friends: ObjectID[];
}

export interface IDevice extends  IEntity{
    type: string,
    version: string,
    deviceModel: string,
    pushToken: string,
    manufacturer: string,
    user_id: string
}

export interface IRepository<T extends IEntity> {
    findUserByMail(mail: string) : Promise<T>;
    findUserBySMId(id: string) : Promise<T>;
    createUser(user: T) : Promise<InsertOneWriteOpResult>;
    findUserById(userId: string): Promise<T>;
    genericById(userId : string, collectionId: string ) : Promise<T>;
    findUsersById(userIdArr : string[]): Promise<T[]>;
    updateUserWithTempPassword(email: string, hash: string) : Promise<FindAndModifyWriteOpResultObject>;
    updateFollow(userId : string, toFollow: string, unFollow?: boolean): Promise<T>;
    addImageToUser(userId: string, images: string[]) : Promise<T>;
    getFollowersByUserId(userId: string) : Promise<T[]>;
    getFollowingByUserId(userId: string) : Promise<string[]>;
    getFollowersCountByUserId(id: string) : Promise<number>;
    changePassword(userId: string, password: string): Promise<UpdateWriteOpResult>;
    useTempPw(userId: ObjectID, password: string): Promise<any>;
    deleteTempPw(userId: ObjectID): Promise<any>;
}

export interface IUserRepository extends IRepository<IUser> {

}

export interface IDeviceRepository<T extends IEntity>{
    activateDevice(deviceId : string, userId: string) : void;
    deactivateDevice(deviceId, callback: Function): void
    upsertDevice(device: IDevice): void;
    getPushTokenFromUser(userIds: string[]): Promise<T[]>;
}
