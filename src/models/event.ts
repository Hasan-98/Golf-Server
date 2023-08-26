import { DataTypes, Model, Sequelize } from 'sequelize';
import { IEventAttributes } from '../interfaces/event.interface';
export default (sequelize: Sequelize) => {
  class Event extends Model<IEventAttributes> implements IEventAttributes {
    id!: number;
    eventType!: string;
    eventName?: string;
    imageUrl?: string;
    eventDetails?: string;
    eventVideoUrl?: string;
    location?: string;
    startTime?: string;
    startDate?: string;
    endTime?: string;
    endDate?: string;
    totalParticipants?: number;
    participationFee?: number;
    feeDetail?: string;
    isCredit?: boolean;
    isDebit?: boolean;
    cancelDate?: string;
    cancelTime?: string;
    cancelDetail?: string;
    includeYou?: boolean;
    publishEvent?: boolean;
    hideParticipant?: boolean;
    needApproval?: boolean;
    needFullName?: boolean;
    needTelephone?: boolean;
    needEmail?: boolean;
    needExtraKey1?: boolean;
    needExtraKey2?: boolean;
    needExtraKey3?: boolean;


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
      type: DataTypes.STRING,
      allowNull: false,
      field: 'image_url',
    },
    eventDetails: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_details',
    },
    eventVideoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_video_url',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'location',
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'start_time',
    },
    startDate: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'end_date',
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'end_time',
    },
    totalParticipants: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'total_participants',
    },
    participationFee: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'participation_fee',
    },
    feeDetail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'fee_detail',
    },
    isCredit: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_type',
    },
    isDebit: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'is_debit',
    },
    cancelDate: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'cancel_date',
    },    
    cancelTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'cancel_time',
    },
    cancelDetail: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'cancel_detail',
    },

    includeYou: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'include_you',
    },
    publishEvent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'publish_event',
    },
    hideParticipant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'hide_participant',
    },
    needApproval: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'need_approval',
    },
    needFullName: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'need_full_name',
    },    
    needTelephone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'need_telephone',
    },
    needEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'need_email',
    },
    needExtraKey1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'need_extra_key_1',
    },    
    needExtraKey2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'need_extra_key_2',
    },
    needExtraKey3: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'need_extra_key_3',
    },
    extraKeyValue1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'extra_key_value_1',
    },    
    extraKeyValue2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'extra_key_value_2',
    },
    extraKeyValue3: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'extra_key_value_3',
    },
    
  }, {
    sequelize,
    modelName: 'Event',
  });

  return Event;
};
