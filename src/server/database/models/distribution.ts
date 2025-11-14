import {
  Model,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./db";
import User from "./user";

export type DistributionCreationAttributes = InferCreationAttributes<
  Distribution,
  {
    omit: "id" | "createdAt" | "updatedAt";
  }
>;

class Distribution extends Model<
  InferAttributes<Distribution>,
  DistributionCreationAttributes
> {
  declare readonly id: CreationOptional<number>;

  declare dateDistributed: Date;
  declare beneficiaryName: string;
  declare area: string | null;
  declare barangay: string | null;
  declare municipality: string;
  declare province: string;
  declare fingerlings: number;
  declare species: "Tilapia" | "Bangus";
  declare survivalRate: number;
  declare avgWeight: number;
  declare harvestKilo: number;
  declare userId: number;
  declare batchId: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // association methods
  declare getUser: () => Promise<User | null>;
}

Distribution.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    dateDistributed: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    beneficiaryName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    area: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    barangay: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    municipality: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    province: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    fingerlings: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    species: {
      allowNull: false,
      type: DataTypes.ENUM("Tilapia", "Bangus"),
    },
    survivalRate: {
      allowNull: false,
      type: DataTypes.DECIMAL(5, 4),
      comment: "Survival rate as decimal (e.g., 0.78 for 78%)",
    },
    avgWeight: {
      allowNull: false,
      type: DataTypes.DECIMAL(10, 2),
      comment: "Average weight in kilograms",
    },
    harvestKilo: {
      allowNull: false,
      type: DataTypes.DECIMAL(10, 2),
      comment: "Total harvest in kilograms",
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
    batchId: {
      allowNull: true,
      type: DataTypes.STRING,
      references: {
        model: "Batches",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
    modelName: "Distributions",
    indexes: [
      {
        name: "distributions_user_id_index",
        fields: ["userId"],
      },
      {
        name: "distributions_species_index",
        fields: ["species"],
      },
      {
        name: "distributions_date_distributed_index",
        fields: ["dateDistributed"],
      },
      {
        name: "distributions_municipality_index",
        fields: ["municipality"],
      },
      {
        name: "distributions_province_index",
        fields: ["province"],
      },
    ],
  }
);

export default Distribution;
