"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, check if there are any users to associate batches with
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log(
        "No users found. Please create users first before seeding batches."
      );
      return;
    }

    const userId = users[0].id;
    const now = new Date();

    await queryInterface.bulkInsert("Batches", [
      {
        id: "BF-20240115-001",
        name: "Red Tilapia",
        description:
          "Pond A1, Tagum City, Davao del Norte - Initial stocking session with high-quality fingerlings",
        userId: userId,
        totalCount: 5000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "BF-20240220-002",
        name: "Bangus",
        description:
          "Fish Cage B2, Davao City - Premium milkfish fingerlings from certified supplier",
        userId: userId,
        totalCount: 3000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "BF-20240305-003",
        name: "Nile Tilapia",
        description:
          "Pond C3, Panabo City, Davao del Norte - Fast-growing strain for commercial production",
        userId: userId,
        totalCount: 7500,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "BF-20250627-018",
        name: "Red Tilapia",
        description:
          "Pond R2, New Bataan, Davao de Oro - Latest batch with advanced breeding stock",
        userId: userId,
        totalCount: 6800,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log("Demo batches seeded successfully!");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Batches", null, {});
  },
};
