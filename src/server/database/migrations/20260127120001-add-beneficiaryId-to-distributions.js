"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Distributions", "beneficiaryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "beneficiaryName",
    });

    await queryInterface.addIndex("Distributions", ["beneficiaryId"], {
      name: "distributions_beneficiary_id_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Distributions", "distributions_beneficiary_id_index");
    await queryInterface.removeColumn("Distributions", "beneficiaryId");
  },
};
