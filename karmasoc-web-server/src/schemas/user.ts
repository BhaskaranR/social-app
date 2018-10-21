/* tslint:disable */
export default `

type Query {
    me: User!
    getUser(userId: String!): User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
    logout(): LogoutResponse
    forgetPassword(): GenericResponse
    confirmEmail(): GenericResponse
    changePwd(): GenericResponse
    follow(userId: String): GenericResponse
    unfollow(userId: String): GenericResponse
    updatePersonalInfo(personalInfo: PersonalInfo!): GenericResponse
    updatePersonalContact(personalContact: PersonalContact!): GenericResponse
    updateUserCustomUrl(customUrls: [CustomUrls]!): GenericResponse
    updateUserPlacesHistory(placesHistory: PlacesHistory!): GenericResponse
    updateEducationHistory(educationHistory: EducationHistory!): GenericResponse
    updateWorkHistory(workHistory: WorkHistory!): GenericResponse
    updateUserStory(userStory: Story!): GenericResponse
  }

  type GenericResponse {
      ok: Boolean!
      errors: [Error]
  }


  type LogoutResponse {
      ok: Boolean!
      errors: [Error]
  }

type RegisterResponse {
    ok: Boolean!
    user: User
    errors: [Error!]
  }

  type LoginResponse {
    ok: Boolean!
    token: String
    refreshToken: String
    errors: [Error!]
  }

type PhotoDetails {
    xlarge: String
    large: String
    normal: String
    small: String
    key: String
    ext: String
}

type UserGroup {
    _id: String
    icon: String
    name: String
}

type Email {
    email: String
    emailtype: String
}

type Phone {
    phoneNumber: String
    phoneType: String
}

type Address {
    address: String
}

type PersonalContact {
    website: [Email]
    phonenumber: [Phone]
    address: [Address]
    visibility: String
}

type PersonalInfo {
    gender: String
    birthday: String
    occupation: String
    visibility: String
}

type CustomUrls {
    customUrls: [String]
    visibility: String
}

type Places {
    currentPlace: String
    livedPlaces: [String]
}

type PlacesHistory {
    placesHistory: [Places]
    visibility: String
}

type WorkHistory {
    workHistory: [String]
    visibility: String
}


type Story {
    story: String
    tagline: String
}

type EducationHistory {
    schoolName: String
    major: String
    year: Int
    endyear: Int
    description: String
}

extend type EducationHistory {
    eductionHistory: [EducationHistory]
    visibility: String
}


type User {
    _id: String
    username: String
    fbId: String
    googlePlusId: String
    firstName: String
    lastName: String
    mail: String
    requesting_device_id: String
    strategy: String
    avatarId: String
    images: PhotoDetails
    userPersonalContact: PersonalContact
    personalContact: PersonalContact
    personalInfo: PersonalInfo
    userCustomUrls: CustomUrls
    placesHistory: PlacesHistory
    workHistory: WorkHistory
    educationHistory: [EducationHistory]
    userStory: Story
    backgroundImage: PhotoDetails
    profileSet: Boolean
    followers: [User]
    following: [User]
    followersCount: Int
    followingCount: Int
    postsCount: Int
    createdAt: String
    modifiedAt: String
    followingBusiness: [String]
    mybusinesses: [String]
}
`;