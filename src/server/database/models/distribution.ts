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
  declare barangay: string | null;
  declare municipality: string;
  declare province: string;
  declare fingerlings: number;
  declare species: "Tilapia" | "Bangus";
  declare userId: number;
  declare batchId: string | null;
  declare actualHarvestDate: Date | null;
  declare forecastedHarvestKilos: number | null;
  declare actualHarvestKilos: number | null;
  declare remarks:
    | "Harvested"
    | "Not Harvested"
    | "Damaged"
    | "Lost"
    | "Disaster"
    | "Other"
    | null;
  declare customRemarks: string | null;

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
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    batchId: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    actualHarvestDate: {
      allowNull: true,
      type: DataTypes.DATE,
      comment: "Actual harvest date",
    },
    forecastedHarvestKilos: {
      allowNull: true,
      type: DataTypes.DECIMAL(10, 2),
      comment: "Forecasted harvest in kilograms",
    },
    actualHarvestKilos: {
      allowNull: true,
      type: DataTypes.DECIMAL(10, 2),
      comment: "Actual harvest in kilograms",
    },
    remarks: {
      allowNull: true,
      type: DataTypes.ENUM(
        "Harvested",
        "Not Harvested",
        "Damaged",
        "Lost",
        "Disaster",
        "Other"
      ),
      comment: "Harvest status remarks",
    },
    customRemarks: {
      allowNull: true,
      type: DataTypes.TEXT,
      comment: 'Custom remarks when remarks is "Other"',
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
