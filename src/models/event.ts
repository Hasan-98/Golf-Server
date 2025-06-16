import { DataTypes, Model, Sequelize } from "sequelize";
import { IEventAttributes } from "../interfaces/event.interface";
export default (sequelize: Sequelize) => {
  class Event extends Model<IEventAttributes> implements IEventAttributes {
    id?: number;
    eventType?: string;
    eventName?: string;
    imageUrl?: JSON;
    video?: string;
    eventDetails?: string;
    eventVideoUrl?: string;
    categories?: string;
    place?: string;
    address?: string;
    placeCoordinates?: { lat: string; lng: string };
    capacity?: number;
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
    isPublic?: boolean | undefined;
    branchNumber?: number;
    accountHolderName?: string;
    cancellationFee?: string | undefined;
    accountNumber?: number;
    paypalId?: string;
    teamSize?: number;
    participationFee?: number;
    isEventPublished?: boolean;
    hideParticipantName?: boolean;
    isRequiresApproval?: boolean;
    fullNameCheckBox?: string;
    emailCheckBox?: string;
    telephoneCheckBox?: string;
    handicapCheckBox?: string;
    scoringType?: string;
    selectedHoles?: JSON;
    shotsPerHoles?: JSON;
    driverContest?: number;
    nearPinContest?: number;
    isFavorite?: boolean;
    creatorId?: any;
    user_event_id?: number;
    static associate(models: any) {
      Event.belongsTo(models.User, {
        foreignKey: "creatorId",
        as: "creator",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Event.hasMany(models.Comment, {
        foreignKey: "eventId",
        as: "comments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Event.belongsToMany(models.User, {
        through: "UserEvent",
        as: "participants",
      });
      Event.hasMany(models.Like, {
        foreignKey: "eventId",
        as: "likes",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Event.hasMany(models.Team, {
        foreignKey: "eventId",
        as: "teams",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Event.hasMany(models.ScoreCard, {
        foreignKey: "eventId",
        as: "eventScoreCard",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Event.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_type",
      },
      eventName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_name",
      },
      imageUrl: {
        type: DataTypes.JSON,
        field: "image_url",
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "address",
      },
      // video: {
      //   type: DataTypes.STRING,
      //   field: 'video',
      // },
      eventDetails: {
        type: DataTypes.STRING,
        field: "event_details",
      },
      eventVideoUrl: {
        type: DataTypes.STRING,
        field: "event_video_url",
      },
      categories: {
        type: DataTypes.STRING,
        field: "categories",
      },
      cancellationFee: {
        type: DataTypes.STRING,
        field: "cancellation_fee",
      },
      place: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "place",
      },
      placeCoordinates: {
        type: DataTypes.JSON,
        allowNull: false,
        field: "place_coordinates",
      },
      capacity: {
        type: DataTypes.INTEGER,
        field: "capacity",
      },
      selfIncluded: {
        type: DataTypes.BOOLEAN,
        field: "self_included",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        field: "is_public",
      },
      fullNameCheckBox: {
        type: DataTypes.STRING,
        field: "full_name_check_box",
      },
      emailCheckBox: {
        type: DataTypes.STRING,
        field: "email_check_box",
      },
      telephoneCheckBox: {
        type: DataTypes.STRING,
        field: "telephone_check_box",
      },
      handicapCheckBox: {
        type: DataTypes.STRING,
        field: "handicap_check_box",
      },
      eventStartDate: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_start_date",
      },
      eventStartTime: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_start_time",
      },
      eventEndDate: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_end_date",
      },
      eventEndTime: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_end_time",
      },
      recruitmentStartDate: {
        type: DataTypes.STRING,
        field: "recruitment_start_date",
      },
      recruitmentStartTime: {
        type: DataTypes.STRING,
        field: "recruitment_start_time",
      },
      eventDeadlineDate: {
        type: DataTypes.STRING,
        field: "event_deadline_date",
      },
      eventDeadlineTime: {
        type: DataTypes.STRING,
        field: "event_deadline_time",
      },
      matchType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "match_type",
      },
      paymentType: {
        type: DataTypes.STRING,
        field: "payment_type",
      },
      bankName: {
        type: DataTypes.STRING,
        field: "bank_name",
      },
      branchName: {
        type: DataTypes.STRING,
        field: "branch_name",
      },
      accountHolderName: {
        type: DataTypes.STRING,
        field: "account_holder_name",
      },
      accountNumber: {
        type: DataTypes.INTEGER,
        field: "account_number",
      },
      paypalId: {
        type: DataTypes.STRING,
        field: "paypal_id",
      },
      teamSize: {
        type: DataTypes.INTEGER,
        field: "team_size",
      },
      participationFee: {
        type: DataTypes.INTEGER,
        field: "participation_fee",
      },
      isEventPublished: {
        type: DataTypes.BOOLEAN,
        field: "is_event_published",
      },
      hideParticipantName: {
        type: DataTypes.BOOLEAN,
        field: "hide_participant_name",
      },
      isRequiresApproval: {
        type: DataTypes.BOOLEAN,
        field: "is_requires_approval",
      },
      scoringType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "scoring_type",
      },
      selectedHoles: {
        type: DataTypes.JSON,
        allowNull: false,
        field: "selected_holes",
      },
      shotsPerHoles: {
        type: DataTypes.JSON,
        allowNull: false,
        field: "shots_per_holes",
      },
      driverContest: {
        type: DataTypes.INTEGER,
        field: "driver_contest",
      },
      nearPinContest: {
        type: DataTypes.INTEGER,
        field: "near_pin_contest",
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "is_favorite",
      },
      userEventId: {
        type: DataTypes.INTEGER,
        field: "user_event_id",
      },
      // creatorId: {
      //   type: DataTypes.INTEGER,
      //   field: "creator_id",
      // }
    },
    {
      sequelize,
      modelName: "Event",
    }
  );

  return Event;
};
