export interface IChatAttributes {
    id?:number;
    channel?: string;
    event?: number | any;
    message?: string;
    sender?: string;
    receiver?: string;
    timestamp?: Date;
    is_read?: boolean;
  }
