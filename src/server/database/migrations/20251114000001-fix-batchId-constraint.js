"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the batchId column exists
    const tableDescription = await queryInterface.describeTable(
      "Distributions"
    );

    if (tableDescription.batchId) {
      // Drop the foreign key constraint if it exists
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE Distributions 
          DROP FOREIGN KEY Distributions_ibfk_2;
        `);
        console.log("✓ Dropped foreign key constraint");
      } catch (error) {
        console.log("⚠ Foreign key constraint not found or already dropped");
      }

      // Drop the index if it exists
      try {
        await queryInterface.removeIndex(
          "Distributions",
          "distributions_batch_id_index"
        );
        console.log("✓ Dropped index");
      } catch (error) {
        console.log("⚠ Index not found or already dropped");
      }

      // Drop the column
      await queryInterface.removeColumn("Distributions", "batchId");
      console.log("✓ Dropped batchId column");
    }

    // Add the column back without foreign key constraint
    await queryInterface.addColumn("Distributions", "batchId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log("✓ Added batchId column without foreign key constraint");

    // Add index for better query performance
    await queryInterface.addIndex("Distributions", ["batchId"], {
      name: "distributions_batch_id_index",
    });
    console.log("✓ Added index");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "Distributions",
      "distributions_batch_id_index"
    );
    await queryInterface.removeColumn("Distributions", "batchId");
  },
};
