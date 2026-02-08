import {
  Model,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./db";

export type BeneficiaryCreationAttributes = InferCreationAttributes<
  Beneficiary,
  {
    omit: "id" | "createdAt" | "updatedAt";
  }
>;

class Beneficiary extends Model<
  InferAttributes<Beneficiary>,
  BeneficiaryCreationAttributes
> {
  declare readonly id: CreationOptional<number>;

  declare beneficiaryType: "Individual" | "Organization";
  declare firstname: string | null;
  declare lastname: string | null;
  declare organizationName: string | null;
  declare contactNumber: string | null;

  declare province: string;
  declare municipality: string;
  declare barangay: string | null;
  declare street: string;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}

Beneficiary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    beneficiaryType: {
      type: DataTypes.ENUM("Individual", "Organization"),
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organizationName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    municipality: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    barangay: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    street: {
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
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Beneficiaries",
    paranoid: true,
    deletedAt: "deletedAt",
    indexes: [
      {
        name: "beneficiaries_type_index",
        fields: ["beneficiaryType"],
      },
      {
        name: "beneficiaries_location_index",
        fields: ["province", "municipality"],
      },
      {
        name: "beneficiaries_name_index",
        fields: ["lastname", "firstname", "organizationName"],
      },
    ],
  }
);

export default Beneficiary;
