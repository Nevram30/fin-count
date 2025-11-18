"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the area column from Distributions table
    await queryInterface.removeColumn("Distributions", "area");
  },

  async down(queryInterface, Sequelize) {
    // Add the area column back if we need to rollback
    await queryInterface.addColumn("Distributions", "area", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
