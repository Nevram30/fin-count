import {
  Model,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./db";
import StaffProfile from "./staff.profile";
import AdminProfile from "./admin.profile";

const roles = ["admin", "staff"] as const;

export enum Role {
  admin = "admin",
  staff = "staff",
}

export type UserCreationAttributes = InferCreationAttributes<
  User,
  {
    omit: "id" | "createdAt" | "updatedAt";
  }
>;

class User extends Model<InferAttributes<User>, UserCreationAttributes> {
  declare readonly id: CreationOptional<number>;

  declare email: string;
  declare password: string;
  declare userType: Role;
  // declare isEmailVerified: boolean;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // association methods
  declare getStaffProfile: () => Promise<StaffProfile | null>;
  declare getAdminProfile: () => Promise<AdminProfile | null>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    userType: {
      allowNull: false,
      type: DataTypes.ENUM(...roles),
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Users",
  }
);

export default User;
