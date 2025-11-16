"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Distributions", "forecastedHarvestKilos", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: "Forecasted harvest in kilograms",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "Distributions",
      "forecastedHarvestKilos"
    );
  },
};
