"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Distributions", "forecastedHarvestDate", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Expected harvest date",
    });

    await queryInterface.addColumn("Distributions", "actualHarvestDate", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Actual harvest date",
    });

    await queryInterface.addColumn("Distributions", "forecastedHarvestKilos", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: "Forecasted harvest in kilograms",
    });

    await queryInterface.addColumn("Distributions", "actualHarvestKilos", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: "Actual harvest in kilograms",
    });

    await queryInterface.addColumn("Distributions", "remarks", {
      type: Sequelize.ENUM(
        "Harvested",
        "Not Harvested",
        "Damaged",
        "Lost",
        "Disaster",
        "Other"
      ),
      allowNull: true,
      comment: "Harvest status remarks",
    });

    await queryInterface.addColumn("Distributions", "customRemarks", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Custom remarks when remarks is "Other"',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Distributions", "forecastedHarvestDate");
    await queryInterface.removeColumn("Distributions", "actualHarvestDate");
    await queryInterface.removeColumn(
      "Distributions",
      "forecastedHarvestKilos"
    );
    await queryInterface.removeColumn("Distributions", "actualHarvestKilos");
    await queryInterface.removeColumn("Distributions", "remarks");
    await queryInterface.removeColumn("Distributions", "customRemarks");
  },
};
