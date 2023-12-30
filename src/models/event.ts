import { DataTypes, Model, Sequelize } from 'sequelize';
import { IEventAttributes } from '../interfaces/event.interface';
export default (sequelize: Sequelize) => {
  class Event extends Model<IEventAttributes> implements IEventAttributes {
    id?: number;
    eventType?: string;
    eventName?: string;
    imageUrl?: JSON;
    video?: string
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

    static associate(models: any) {
      Event.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
      Event.hasMany(models.Comment, { foreignKey: 'eventId', as: 'comments' });
      Event.belongsToMany(models.User, { through: 'UserEvent', as: 'participants' });
      Event.hasMany(models.Like, { foreignKey: 'eventId', as: 'likes' });
    }
  }

  Event.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_type',
    },
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_name',
    },
    imageUrl: {
      type: DataTypes.JSON,
      field: 'image_url',
    },
    // video: {
    //   type: DataTypes.STRING,
    //   field: 'video',
    // },
    eventDetails: {
      type: DataTypes.STRING,
      field: 'event_details',
    },
    eventVideoUrl: {
      type: DataTypes.STRING,
      field: 'event_video_url',
    },
    categories: {
      type: DataTypes.STRING,
      field: 'categories'
    },
    place: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'place',
    },
    placeCoordinates: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'place_coordinates',
    },
    capacity: {
      type: DataTypes.INTEGER,
      field: 'capacity',
    },
    selfIncluded: {
      type: DataTypes.BOOLEAN,
      field: 'self_included',
    },
    eventStartDate: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_start_date',
    },
    eventStartTime : {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_start_time',
    },
    eventEndDate : {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_end_date',
    },
    eventEndTime : {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_end_time',
    },
    recruitmentStartDate: {
      type: DataTypes.STRING,
      field: 'recruitment_start_date',
    },
    recruitmentStartTime: {
      type: DataTypes.STRING,
      field: 'recruitment_start_time',
    },
    eventDeadlineDate: {
      type: DataTypes.STRING,
      field: 'event_deadline_date',
    },
    eventDeadlineTime: {
      type: DataTypes.STRING,
      field: 'event_deadline_time',
    },
    matchType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'match_type',
    },
    paymentType: {
      type: DataTypes.STRING,
      field: 'payment_type',
    },
    bankName: {
      type: DataTypes.STRING,
      field: 'bank_name',
    },
    branchName: {
      type: DataTypes.STRING,
      field: 'branch_name',
    },
    accountHolderName: {
      type: DataTypes.STRING,
      field: 'account_holder_name',
    },
    accountNumber: {
      type: DataTypes.INTEGER,
      field: 'account_number'
    },
    paypalId: {
      type: DataTypes.STRING,
      field: 'paypal_id',
    },
    teamSize: {
      type: DataTypes.INTEGER,
      field: 'team_size'
    },
    participationFee: {
      type: DataTypes.INTEGER,
      field: 'participation_fee'
    },
    isEventPublished: {
      type: DataTypes.BOOLEAN,
      field: 'is_event_published',
    },
    hideParticipantName: {
      type: DataTypes.BOOLEAN,
      field: 'hide_participant_name',
    },
    isRequiresApproval: {
      type: DataTypes.BOOLEAN,
      field: 'is_requires_approval',
    },
    scoringType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'scoring_type',
    },
    selectedHoles: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'selected_holes',
    },
    shotsPerHoles: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'shots_per_holes',
    },
    driverContest: {
      type: DataTypes.INTEGER,
      field: 'driver_contest',
    },
    nearPinContest: {
      type: DataTypes.INTEGER,
      field: 'near_pin_contest',
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_favorite',
    },
  }, {
    sequelize,
    modelName: 'Event',
  });

  return Event;
};
