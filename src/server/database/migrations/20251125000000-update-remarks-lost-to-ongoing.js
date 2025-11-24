"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, modify the ENUM to include both 'Lost' and 'Ongoing'
    await queryInterface.sequelize.query(`
      ALTER TABLE \`Distributions\` 
      MODIFY COLUMN remarks ENUM(
        'Harvested',
        'Not Harvested',
        'Damaged',
        'Lost',
        'Ongoing',
        'Disaster',
        'Other'
      ) NULL COMMENT 'Harvest status remarks';
    `);

    // Then update any existing 'Lost' values to 'Ongoing'
    await queryInterface.sequelize.query(`
      UPDATE \`Distributions\` 
      SET remarks = 'Ongoing' 
      WHERE remarks = 'Lost';
    `);

    // Finally, remove 'Lost' from the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE \`Distributions\` 
      MODIFY COLUMN remarks ENUM(
        'Harvested',
        'Not Harvested',
        'Damaged',
        'Ongoing',
        'Disaster',
        'Other'
      ) NULL COMMENT 'Harvest status remarks';
    `);
  },

  async down(queryInterface, Sequelize) {
    // First, add 'Lost' back to the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE \`Distributions\` 
      MODIFY COLUMN remarks ENUM(
        'Harvested',
        'Not Harvested',
        'Damaged',
        'Lost',
        'Ongoing',
        'Disaster',
        'Other'
      ) NULL COMMENT 'Harvest status remarks';
    `);

    // Then revert 'Ongoing' back to 'Lost'
    await queryInterface.sequelize.query(`
      UPDATE \`Distributions\` 
      SET remarks = 'Lost' 
      WHERE remarks = 'Ongoing';
    `);

    // Finally, remove 'Ongoing' from the ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE \`Distributions\` 
      MODIFY COLUMN remarks ENUM(
        'Harvested',
        'Not Harvested',
        'Damaged',
        'Lost',
        'Disaster',
        'Other'
      ) NULL COMMENT 'Harvest status remarks';
    `);
  },
};
