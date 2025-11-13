"use strict";

const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get a user ID to associate with distributions
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log("No users found. Please seed users first.");
      return;
    }

    const userId = users[0].id;

    // Helper function to parse dates
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date();
      if (dateStr instanceof Date) return dateStr;

      if (typeof dateStr === "string") {
        if (dateStr.includes("/")) {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            let date = new Date(parts[2], parts[0] - 1, parts[1]);
            if (isNaN(date.getTime())) {
              date = new Date(parts[2], parts[1] - 1, parts[0]);
            }
            return date;
          }
        }
        return new Date(dateStr);
      }

      if (typeof dateStr === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + dateStr * 86400000);
      }

      return new Date();
    };

    // Function to import from Excel file
    const importFromExcel = (filePath, species) => {
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return [];
      }

      console.log(`Reading ${species} data from: ${filePath}`);

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Found ${data.length} records in ${species} file`);

      const distributions = [];

      for (const row of data) {
        if (!row["Beneficiary Name"]) continue;

        distributions.push({
          dateDistributed: parseDate(row["Date Distributed"]),
          beneficiaryName: row["Beneficiary Name"] || "Unknown",
          area: row["Area (sq.m.)"] || null,
          barangay: row["Barangay"] || null,
          municipality: row["Municipality"] || "Unknown",
          province: row["Province"] || "Unknown",
          fingerlings: parseInt(row["Fingerlings"]) || 0,
          species: species,
          survivalRate:
            parseFloat(row["SurvivalRate"]) ||
            (species === "Tilapia" ? 0.78 : 0.935),
          avgWeight:
            parseFloat(row["AvgWeight"]) ||
            (species === "Tilapia" ? 0.25 : 0.39),
          harvestKilo: parseFloat(row["Harvest(Kilo)"]) || 0,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return distributions;
    };

    // Define file paths
    const projectRoot = path.join(__dirname, "../../..");
    const tilapiaFile = path.join(
      projectRoot,
      "Red_Tilapia Distribution_Data.xlsx"
    );
    const bangusFile = path.join(projectRoot, "Bangus Distribution_Data.xlsx");

    let allDistributions = [];

    // Import Tilapia data
    try {
      const tilapiaData = importFromExcel(tilapiaFile, "Tilapia");
      allDistributions = allDistributions.concat(tilapiaData);
      console.log(`✓ Loaded ${tilapiaData.length} Tilapia distributions`);
    } catch (error) {
      console.log(`Could not import Tilapia data: ${error.message}`);
    }

    // Import Bangus data
    try {
      const bangusData = importFromExcel(bangusFile, "Bangus");
      allDistributions = allDistributions.concat(bangusData);
      console.log(`✓ Loaded ${bangusData.length} Bangus distributions`);
    } catch (error) {
      console.log(`Could not import Bangus data: ${error.message}`);
    }

    if (allDistributions.length === 0) {
      console.log("\n⚠ No Excel files found. Skipping Excel import seeder.");
      console.log("  This is normal for production deployments.");
      console.log(
        "  To import Excel data locally, place the following files in the project root:"
      );
      console.log("  - Red_Tilapia Distribution_Data.xlsx");
      console.log("  - Bangus Distribution_Data.xlsx");
      console.log(
        "\nThen run: npx sequelize-cli db:seed --seed 20250530130001-import-excel-distributions.js"
      );
      return;
    }

    // Insert all distributions
    console.log(`\nInserting ${allDistributions.length} distributions...`);
    await queryInterface.bulkInsert("Distributions", allDistributions, {});

    console.log(
      `\n✓ Successfully imported ${allDistributions.length} distribution records!`
    );
  },

  async down(queryInterface, Sequelize) {
    // Only delete records that were imported (not the sample ones)
    await queryInterface.sequelize.query(
      `DELETE FROM Distributions WHERE id > 6;`
    );
  },
};
