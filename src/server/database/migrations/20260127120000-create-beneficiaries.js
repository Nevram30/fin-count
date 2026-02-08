"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Beneficiaries", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      beneficiaryType: {
        type: Sequelize.ENUM("Individual", "Organization"),
        allowNull: false,
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      organizationName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      province: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      municipality: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      barangay: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      street: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("Beneficiaries", ["beneficiaryType"], {
      name: "beneficiaries_type_index",
    });

    await queryInterface.addIndex("Beneficiaries", ["province", "municipality"], {
      name: "beneficiaries_location_index",
    });

    await queryInterface.addIndex(
      "Beneficiaries",
      ["lastname", "firstname", "organizationName"],
      {
        name: "beneficiaries_name_index",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Beneficiaries");
  },
};
