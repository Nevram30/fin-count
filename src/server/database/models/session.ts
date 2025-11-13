import {
  Model,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./db";
import Batch from "./batch";

export type SessionCreationAttributes = InferCreationAttributes<
  Session,
  {
    omit: "createdAt" | "updatedAt";
  }
>;

class Session extends Model<
  InferAttributes<Session>,
  SessionCreationAttributes
> {
  declare readonly id: string;

  declare batchId: string;
  declare species: string;
  declare location: string;
  declare notes: string;
  declare counts: Record<string, number>;
  declare timestamp: Date;
  declare imageUrl: string;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // association methods
  declare getBatch: () => Promise<Batch | null>;
}

Session.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    batchId: {
      allowNull: false,
      type: DataTypes.STRING,
      references: {
        model: "Batches",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    species: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    location: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    notes: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    counts: {
      allowNull: false,
      type: DataTypes.JSON,
      defaultValue: {},
    },
    timestamp: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    imageUrl: {
      allowNull: false,
      type: DataTypes.STRING,
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
    modelName: "Sessions",
  }
);

export default Session;
