import { DataTypes, Model, Sequelize } from "sequelize";
import { IUserAttributes } from "../interfaces/user.interface";
export default (sequelize: Sequelize) => {
  class User extends Model<IUserAttributes> implements IUserAttributes {
    static find(arg0: { id: { $in: any; }; }, arg1: { id: number; nickname: number; }) {
      throw new Error('Method not implemented.');
    }
    id!: number;
    nickName!: string;
    role?: string | undefined;
    email!: string;
    password!: string;
    token!: string;
    imageUrl?: string;
    // ...

    static associate(models: any) {
      User.hasMany(models.Event, {
        foreignKey: "creatorId",
        as: "createdEvents",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.belongsToMany(models.Event, {
        through: "UserEvent",
        as: "participatedEvents",
      });
      User.hasMany(models.Comment, {
        foreignKey: "userId",
        as: "comments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.Like, {
        foreignKey: "userId",
        as: "likes",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasOne(models.Teacher, {
        foreignKey: "userId",
        as: "teacher",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.TeacherRating, {
        foreignKey: "userId",
        as: "userRatings",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.Shifts, {
        as: "bookedShifts",
        foreignKey: "bookedBy",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.belongsToMany(models.Teacher, {
        through: models.Favorite,
        as: "favoriteTeachers",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.Post, {
        foreignKey: "userId",
        as: "posts",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.TeamMember, {
        foreignKey: "userId",
        as: "users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.ScoreCard, {
        foreignKey: "userId",
        as: "userScoreCard",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.Reservation, {
        foreignKey: "userId",
        as: "userReservations",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.Category, {
        foreignKey: "userId",
        as: "adminDetails",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.belongsToMany(models.Category, {
        through: 'UserCategory',
        as: 'userDetails',
        foreignKey: 'userId'
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role: DataTypes.STRING,
      nickName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      token: DataTypes.STRING,
      imageUrl: {
        type: DataTypes.STRING,
        field: "image_url",
      },
      memberHandicap: {
        type: DataTypes.INTEGER,
        field: "member_handicap",
      },
      memberFullName: {
        type: DataTypes.STRING,
        field: "member_full_name",
      },
      memberTelPhone: {
        type: DataTypes.INTEGER,
        field: "member_tel_phone",
      },
      memberEmailAddress: {
        type: DataTypes.STRING,
        field: "member_email_address",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
