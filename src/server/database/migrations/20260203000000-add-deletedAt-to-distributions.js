"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable("Distributions");

    if (!tableDescription.deletedAt) {
      await queryInterface.addColumn("Distributions", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    try {
      await queryInterface.addIndex("Distributions", ["deletedAt"], {
        name: "distributions_deleted_at_index",
      });
    } catch (error) {
      console.log("⚠ distributions_deleted_at_index already exists");
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeIndex("Distributions", "distributions_deleted_at_index");
    } catch (error) {
      console.log("⚠ distributions_deleted_at_index not found");
    }

    const tableDescription = await queryInterface.describeTable("Distributions");
    if (tableDescription.deletedAt) {
      await queryInterface.removeColumn("Distributions", "deletedAt");
    }
  },
};

