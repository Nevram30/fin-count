import { CreationOptional, DataTypes, Model } from "sequelize";
import { sequelize } from "./db";

class AdminProfile extends Model {
  declare id: CreationOptional<number>;

  declare userId: number;
  declare firstName: string;
  declare lastName: string;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

AdminProfile.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: "Users",
        key: "id",
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: "Admins_Profiles",
  }
);

export default AdminProfile;
