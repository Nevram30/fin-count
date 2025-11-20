"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // For MySQL, we need to alter the ENUM to include 'Red Tilapia'
    await queryInterface.sequelize.query(`
      ALTER TABLE Distributions 
      MODIFY COLUMN species ENUM('Tilapia', 'Bangus', 'Red Tilapia') NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original ENUM values
    // Note: This will fail if there are 'Red Tilapia' entries in the database
    await queryInterface.sequelize.query(`
      ALTER TABLE Distributions 
      MODIFY COLUMN species ENUM('Tilapia', 'Bangus') NOT NULL;
    `);
  },
};
