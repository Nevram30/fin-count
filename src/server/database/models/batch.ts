import {
  Model,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./db";
import User from "./user";

export type BatchCreationAttributes = InferCreationAttributes<
  Batch,
  {
    omit: "id" | "createdAt" | "updatedAt";
  }
>;

class Batch extends Model<InferAttributes<Batch>, BatchCreationAttributes> {
  declare readonly id: CreationOptional<number>;

  declare name: string;
  declare description: string | null;
  declare userId: number;
  declare totalCount: number;
  declare isActive: boolean;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // association methods
  declare getUser: () => Promise<User | null>;
}

Batch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    description: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    totalCount: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: "Batches",
  }
);

export default Batch;
