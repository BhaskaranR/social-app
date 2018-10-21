export interface PhotoDetails {
    xlarge: string;
    large: string;
    normal: string;
    small: string;
}

export interface Business {
    _id?: string;
    title: string;
    businessId?: string;
    categoryId: string;
    subcategoryId?: string;
    phonenumber?: string;
    address: string;
    city?: {title : string, place_id: string};
    zipcode: string;
    images?: PhotoDetails;
    geotag: {type: string, coordinates: number[]};
    story?: string;
    createdAt?: string | Date;
    modifiedAt?: string | Date;
    userId: string;
    referredBy: string;
}