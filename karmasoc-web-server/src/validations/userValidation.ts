'use strict';

import * as Joi from 'joi';

let mongoIdField = Joi.string().optional();
let mongoIdFieldRequired = mongoIdField.required();

export const login = Joi.object().keys({
    mail: Joi.string().email().min(3).max(60).required()
        .description('Mail address'),
    password: Joi.string().regex(/[a-zA-Z0-9@#$%_&!"§\/\(\)=\?\^]{3,30}/).required()
});

export const fbLogin = Joi.object().keys({
    token: Joi.string().required()
});

export const googleLogin = Joi.object().keys({
    emails: Joi.array().min(1).description('Mail address'),
    name: Joi.object({givenName : Joi.string() , familyName : Joi.string()}).description('User name'),
    id: Joi.string().alphanum().required().description('Google user ID')
 });

export const register = Joi.object().keys({
    mail: Joi.string().email().min(3).max(60).required()
        .description('Mail address'),
    password: Joi.string().regex(/[a-zA-Z0-9@#$%_&!"§\/\(\)=\?\^]{3,30}/).required()
        .description('User set password'),
    firstName: Joi.string().required().description('User first name'),
    lastName: Joi.string().required().description('User last name')
});

export const confirmEmail = Joi.object().keys({
   token : Joi.string().required()
});

export const updatePwd = Joi.object().keys({
    old_password: Joi.string().regex(/[a-zA-Z0-9@#$%_&!"§\/\(\)=\?\^]{3,30}/).required().description('enter old password'),
    new_password: Joi.string().regex(/[a-zA-Z0-9@#$%_&!"§\/\(\)=\?\^]{3,30}/).required().description('enter new password')
});

export const follow = Joi.object().keys({
    follow_id: mongoIdFieldRequired
});

export const userId = Joi.object().keys({
    userId: mongoIdFieldRequired
});


export const userMail = Joi.object().keys({
    mail: Joi.string().email().min(3).max(60).required()
        .description('Mail address')
});

export const count = Joi.object().keys({
    count: Joi.string().valid(['locations', 'followers', 'locations,followers', 'followers,locations'])
});

export const settings = Joi.object().keys({
    settings: Joi.object().required()
});


export const personalContact  = Joi.object({
    website: Joi.string().optional().allow(null),
    phonenumber: Joi.string().optional().allow(null),
    address: Joi.string().optional().allow(null),
    visibility: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
});

export const personalInfo = Joi.object({
    gender: Joi.string().optional().allow(null),
    birthday: Joi.string().optional().allow(null),
    occupation: Joi.string().optional().allow(null),
    visibility: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
});

export const educationHistorySchema =  Joi.object({
    schoolName: Joi.string().required(),
    major: Joi.string().optional().allow(null),
    year: Joi.number().optional().allow(null),
    endyear: Joi.number().optional().allow(null),
    description: Joi.string().optional(),
});


export const userCustomUrls = Joi.object().keys({
    customUrls: Joi.array().allow(null).items(Joi.string()).max(3),
    visibility: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
});


export const userPlacesHistory = Joi.object().keys({
    places: Joi.array().allow(null).items(Joi.string()).max(10),
    visibility: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
});


export const userEducationHistory = Joi.object().keys({
    educationHistory: Joi.array().items(educationHistorySchema),
    visibility: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),    
});


export const userWorkHistory = Joi.object().keys({
    workHistory: Joi.array().allow(null).items(Joi.string()).max(10),
    visibility: Joi.string().allow(null).valid('public', 'private', 'friends').optional(),
});

export const userStory = Joi.object().keys({
    story: Joi.string().optional().allow(null),
    tagline: Joi.string().optional().allow(null)
});