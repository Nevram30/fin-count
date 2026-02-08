"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Beneficiaries");

    if (!tableDescription.deletedAt) {
      await queryInterface.addColumn("Beneficiaries", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    try {
      await queryInterface.addIndex("Beneficiaries", ["deletedAt"], {
        name: "beneficiaries_deleted_at_index",
      });
    } catch (error) {
      console.log("⚠ beneficiaries_deleted_at_index already exists");
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeIndex(
        "Beneficiaries",
        "beneficiaries_deleted_at_index"
      );
    } catch (error) {
      console.log("⚠ beneficiaries_deleted_at_index not found");
    }

    const tableDescription = await queryInterface.describeTable("Beneficiaries");
    if (tableDescription.deletedAt) {
      await queryInterface.removeColumn("Beneficiaries", "deletedAt");
    }
  },
};

