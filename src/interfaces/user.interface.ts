export interface IUserAttributes {
    id?: number,
    role?: string,
    nickName: string,
    email: string,
    password : string,
    token : string,
    imageUrl?: string,
    address?: string;
    idApproved?: string;
    identificationImage?: string;
    memberHandicap?: number;
    memberFullName?: string;
    memberTelPhone?: number;
    memberEmailAddress?: string;
  }