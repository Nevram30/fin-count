// models/index.ts
import { sequelize } from "./db";
import User from "./user";
import StaffProfile from "./staff.profile";
import AdminProfile from "./admin.profile";
import Batch from "./batch";
import Session from "./session";
import Distribution from "./distribution";

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

User.hasMany(Batch, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "batches",
});

User.hasMany(Distribution, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "distributions",
});

Batch.hasMany(Session, {
  sourceKey: "id",
  foreignKey: "batchId",
  as: "sessions",
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

Batch.belongsTo(User, {
  targetKey: "id",
  foreignKey: "userId",
  as: "user",
});

Distribution.belongsTo(User, {
  targetKey: "id",
  foreignKey: "userId",
  as: "user",
});

Session.belongsTo(Batch, {
  targetKey: "id",
  foreignKey: "batchId",
  as: "batch",
});

// Export all models
const models = {
  sequelize,
  User,
  StaffProfile,
  AdminProfile,
  Batch,
  Session,
  Distribution,
};

export default models;
