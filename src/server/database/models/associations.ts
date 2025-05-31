// models/index.ts
import { sequelize } from "./db";
import User from "./user";
import StaffProfile from "./staff.profile";
import AdminProfile from "./admin.profile";

// Define associations AFTER all models are imported
User.hasMany(StaffProfile, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "staffsProfile",
});

User.hasMany(AdminProfile, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "adminsProfile",
});

// Define inverse associations (belongsTo)
StaffProfile.belongsTo(User, {
  targetKey: "id",
  foreignKey: "userId",
  as: "user",
});

AdminProfile.belongsTo(User, {
  targetKey: "id",
  foreignKey: "userId",
  as: "user",
});

// Export all models
const models = {
  sequelize,
  User,
  StaffProfile,
  AdminProfile,
};

export default models;
