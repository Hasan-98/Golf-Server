export interface INotificationAttributes {
    id?: number;
    userId?: number;
    eventId?: number;
    teacherId?: number;
    postId?: number;
    message?: string;
    isRead?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    organizerId?: number
    reservationId?: number
  }