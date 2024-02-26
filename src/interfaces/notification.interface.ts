export interface INotificationAttributes {
    id?: number;
    userId?: number;
    teacherId?: number;
    message?: string;
    isRead?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }