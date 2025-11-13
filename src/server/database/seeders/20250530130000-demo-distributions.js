"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get a user ID to associate with distributions (using the first user)
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log("No users found. Please seed users first.");
      return;
    }

    const userId = users[0].id;

    // Sample distribution data (a few examples from each species)
    const sampleDistributions = [
      // Tilapia samples
      {
        dateDistributed: new Date("2023-01-03"),
        beneficiaryName: "Pablito Emperio",
        area: null,
        barangay: null,
        municipality: "Carmen",
        province: "Davao del Norte",
        fingerlings: 3000,
        species: "Tilapia",
        survivalRate: 0.78,
        avgWeight: 0.25,
        harvestKilo: 585,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dateDistributed: new Date("2023-03-11"),
        beneficiaryName: "Robertus Bijakasan",
        area: null,
        barangay: "Brgy. Sibagat",
        municipality: "Butuan City",
        province: "Agusan del Sur",
        fingerlings: 40000,
        species: "Tilapia",
        survivalRate: 0.78,
        avgWeight: 0.25,
        harvestKilo: 7800,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dateDistributed: new Date("2024-02-05"),
        beneficiaryName: "PLGU",
        area: null,
        barangay: null,
        municipality: "Digos City",
        province: "Davao del Sur",
        fingerlings: 80000,
        species: "Tilapia",
        survivalRate: 0.78,
        avgWeight: 0.25,
        harvestKilo: 15600,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Bangus samples
      {
        dateDistributed: new Date("2024-06-23"),
        beneficiaryName: "Bruciel Keith h. Casiano",
        area: null,
        barangay: null,
        municipality: "San Isidro",
        province: "Davao Oriental",
        fingerlings: 17000,
        species: "Bangus",
        survivalRate: 0.935,
        avgWeight: 0.39,
        harvestKilo: 6199.05,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dateDistributed: new Date("2024-06-24"),
        beneficiaryName: "Norman Dimaala",
        area: "2 hectares",
        barangay: null,
        municipality: "Panabo City",
        province: "Davao del Norte",
        fingerlings: 25000,
        species: "Bangus",
        survivalRate: 0.935,
        avgWeight: 0.39,
        harvestKilo: 9116.25,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        dateDistributed: new Date("2023-10-01"),
        beneficiaryName: "Darwin Urboda",
        area: "10 hectares",
        barangay: "Brgy. Malaga",
        municipality: "Panabo City",
        province: "Davao del Norte",
        fingerlings: 35000,
        species: "Bangus",
        survivalRate: 0.935,
        avgWeight: 0.39,
        harvestKilo: 12762.75,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Distributions", sampleDistributions, {});

    console.log(
      `✓ Seeded ${sampleDistributions.length} sample distribution records`
    );
    console.log(
      "  For full data import, use: node scripts/import-distributions.js"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Distributions", null, {});
  },
};
