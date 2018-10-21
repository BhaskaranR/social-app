

export class User {
    _id: string;
    createdDate: Date;
    updatedAt: Date;
    smId: string;
    strategy: string;
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    country: string;
    gender: string;
    dob: Date;
    mail: string;
    confirmMail: boolean;
    password: string;
    loginType: string;
    verified: boolean;
    isActive: boolean;
    following: string[];
    friends: string[];
    images: { normal: string; small: string };
}