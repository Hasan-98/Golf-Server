export interface IEventAttributes {
    id?: number;
    eventType?: string;
    eventName?: string;
    imageUrl?: JSON;
    video?: string;
    eventDetails?: string;
    eventVideoUrl?: string;
    categories?: string;
    place?: string;
    placeCoordinates?: { lat: string; lng: string };
    capacity?:number;
    selfIncluded?: boolean;
    eventStartDate?: string;
    eventStartTime?: string;
    eventEndDate?: string;
    eventEndTime?: string;
    recruitmentStartDate?: string;
    recruitmentStartTime?: string;
    eventDeadlineDate?: string;
    eventDeadlineTime?: string;
    matchType?: string;
    paymentType?: string;
    bankName?: string;
    branchName?: string;
    branchNumber?: number;
    accountHolderName?: string;
    accountNumber?: number;
    paypalId?: string;
    teamSize?: number;
    participationFee?: number;
    isEventPublished?: boolean;
    hideParticipantName?: boolean;
    isRequiresApproval?: boolean;
    scoringType?: string;
    selectedHoles?: JSON; 
    shotsPerHoles?: JSON;
    driverContest?: number;
    nearPinContest?: number;
    isFavorite?: boolean;
    userEventId?: number;
}