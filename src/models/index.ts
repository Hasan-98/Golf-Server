'use strict';

import User from './user';
import Comment from './comment';
import Event from './event';
const env = "development";
const config = require(__dirname + '/../config/config.js')[env];
import { Sequelize } from "sequelize";
import like from './like';
import userEvent from './userEvent';
import teacher from './teacher';
import shifts from './shifts';
import schedules from './schedules';
import favorite from './favorite';
import post from './post';
import team from './team';
import teamMember from './teamMember';
import notification from './notification';
import scoreCard from './scoreCard';
import Gigs from './gigs';
import TeacherRating from './teacherRating';
import Reservation from './reservation';
import Category from './category';
import UserCategory from './userCategory';
import Subscription from './subscription';
import Ceremony from './ceremony';
import Chat from './chat';
import CommunityMembers from './communityMembers';
import CourseEvent from './courseEvent';
const sequelize: Sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
sequelize.sync();

(async () => {
  try {
    await sequelize.sync();
    console.log('Connection has been established successfully.');
  } catch (error: any) {
    console.error('Unable to connect to the database:', error);
  }
})();

const models = {
  User: User(sequelize),
  Comment: Comment(sequelize),
  Event: Event(sequelize),
  Like: like(sequelize),
  UserEvent: userEvent(sequelize),
  Teacher: teacher(sequelize),
  Shifts: shifts(sequelize),
  Schedules: schedules(sequelize),
  Favorite: favorite(sequelize),
  Post: post(sequelize),
  Team: team(sequelize),
  TeamMember: teamMember(sequelize),
  Notification: notification(sequelize),
  ScoreCard: scoreCard(sequelize),
  Gigs: Gigs(sequelize),
  TeacherRating: TeacherRating(sequelize),
  Reservation: Reservation(sequelize),
  Category: Category(sequelize),
  UserCategory: UserCategory(sequelize),
  Subscription: Subscription(sequelize),
  Ceremony: Ceremony(sequelize),
  Chat: Chat(sequelize),
  CommunityMembers: CommunityMembers(sequelize),
  CourseEvent: CourseEvent(sequelize),
};


Object.values(models).forEach((model: any) => {
  if (typeof (model as any).associate === 'function') {
    (model as any).associate(models);
  }
});

export { models };

