import { sequelize, Sequelize } from "./db";
import StaffProfile from "./staff.profile";
import User from "./user";

/* -- 
 dre ma export tanan ang mga models para dali ra tawagon....
-- */

export default {
  // diri ma export tanan ang models..
  sequelize,
  Sequelize,
  User,
  StaffProfile,
};
