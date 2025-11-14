"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Distributions", "batchId", {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: "Batches",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add index for better query performance
    await queryInterface.addIndex("Distributions", ["batchId"], {
      name: "distributions_batch_id_index",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "Distributions",
      "distributions_batch_id_index"
    );
    await queryInterface.removeColumn("Distributions", "batchId");
  },
};
