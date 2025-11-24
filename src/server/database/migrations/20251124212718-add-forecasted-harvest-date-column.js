"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column exists before adding
    const tableDescription = await queryInterface.describeTable(
      "Distributions"
    );

    if (!tableDescription.forecastedHarvestDate) {
      await queryInterface.addColumn("Distributions", "forecastedHarvestDate", {
        type: Sequelize.DATE,
        allowNull: true,
        comment:
          "Expected harvest date based on species (Bangus: 3 months, Tilapia: 4 months)",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if column exists before removing
    const tableDescription = await queryInterface.describeTable(
      "Distributions"
    );

    if (tableDescription.forecastedHarvestDate) {
      await queryInterface.removeColumn(
        "Distributions",
        "forecastedHarvestDate"
      );
    }
  },
};
