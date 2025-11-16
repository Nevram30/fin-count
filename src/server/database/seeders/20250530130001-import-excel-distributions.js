"use strict";

const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get a user ID to associate with distributions
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users ORDER BY id ASC LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log("⚠ No users found. Please seed users first.");
      console.log("  Skipping distribution import.");
      return Promise.resolve();
    }

    const userId = users[0].id;
    console.log(`Using userId: ${userId} for distributions and batches`);

    // Helper function to generate random batch ID
    const generateBatchId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `BATCH-${timestamp}-${random}`;
    };

    // Helper function to parse dates
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date();
      if (dateStr instanceof Date) return dateStr;

      if (typeof dateStr === "string") {
        // Handle dates with slashes (MM/DD/YYYY or DD/MM/YYYY)
        if (dateStr.includes("/")) {
          // Remove any extra slashes (e.g., "04/01//2025" -> "04/01/2025")
          const cleanedStr = dateStr.replace(/\/+/g, "/");
          const parts = cleanedStr.split("/");

          if (parts.length === 3) {
            let month = parseInt(parts[0]);
            let day = parseInt(parts[1]);
            let year = parseInt(parts[2]);

            // Fix malformed years (e.g., "0203" -> "2023", "13" -> "2023")
            if (year < 100) {
              year = 2000 + year;
            } else if (year < 1000) {
              // Handle years like "203" -> "2023"
              year = 2000 + (year % 100);
            }

            // Fix invalid months (e.g., month 13 -> swap with day)
            if (month > 12) {
              [month, day] = [day, month];
            }

            // Ensure month is valid (1-12)
            if (month < 1 || month > 12) {
              console.log(`Invalid date: ${dateStr}, using current date`);
              return new Date();
            }

            // Ensure day is valid (1-31)
            if (day < 1 || day > 31) {
              console.log(`Invalid date: ${dateStr}, using current date`);
              return new Date();
            }

            const date = new Date(year, month - 1, day);

            if (isNaN(date.getTime())) {
              console.log(
                `Could not parse date: ${dateStr}, using current date`
              );
              return new Date();
            }

            return date;
          }
        }

        // Try parsing as ISO date string
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      // Handle Excel serial date numbers
      if (typeof dateStr === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + dateStr * 86400000);
      }

      console.log(`Could not parse date: ${dateStr}, using current date`);
      return new Date();
    };

    // Function to import from Excel file
    const importFromExcel = (filePath, defaultSpecies) => {
      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return [];
      }

      console.log(`Reading ${defaultSpecies} data from: ${filePath}`);

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Found ${data.length} records in ${defaultSpecies} file`);

      const distributions = [];
      let skippedCount = 0;

      for (const row of data) {
        // Skip rows without beneficiary name or date
        if (!row["Beneficiary Name"] || !row["Date Distributed"]) {
          skippedCount++;
          continue;
        }

        // Use Species from Excel if available, otherwise use default
        const species = row["Species"] || defaultSpecies;

        // Determine default values based on species
        const isTimapia = species.toLowerCase().includes("tilapia");
        const defaultSurvivalRate = isTimapia ? 0.78 : 0.935;
        const defaultAvgWeight = isTimapia ? 0.25 : 0.39;

        const parsedDate = parseDate(row["Date Distributed"]);

        // Fix known date typo: 2027-07-25 should be 2023-07-25
        if (
          parsedDate.getFullYear() === 2027 &&
          parsedDate.getMonth() === 6 &&
          parsedDate.getDate() === 25
        ) {
          parsedDate.setFullYear(2023);
        }

        // Get actual harvest from Excel
        const actualHarvestKilos =
          parseFloat(row["Actual Harvest(Kilo)"]) || null;
        const fingerlings = parseInt(row["Fingerlings"]) || 0;

        // Calculate forecasted harvest based on fingerlings, survival rate, and avg weight
        const forecastedHarvestKilos =
          fingerlings * defaultSurvivalRate * defaultAvgWeight;

        distributions.push({
          dateDistributed: parsedDate,
          beneficiaryName: row["Beneficiary Name"] || "Unknown",
          barangay: row["Barangay"] || null,
          municipality: row["Municipality"] || "Unknown",
          province: row["Province"] || "Unknown",
          fingerlings: fingerlings,
          species: species,
          forecastedHarvestKilos: forecastedHarvestKilos,
          actualHarvestKilos: actualHarvestKilos,
          actualHarvestDate: actualHarvestKilos ? parsedDate : null,
          remarks: actualHarvestKilos ? "Harvested" : null,
          userId: userId,
          batchId: generateBatchId(), // Generate unique batch ID for each distribution
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (skippedCount > 0) {
        console.log(`⚠ Skipped ${skippedCount} rows with missing data`);
      }

      return distributions;
    };

    // Define file paths - files are in src directory
    const srcDir = path.join(__dirname, "../../../..");
    const tilapiaFile = path.join(
      srcDir,
      "src",
      "Red_Tilapia Distribution_Data.xlsx"
    );
    const bangusFile = path.join(
      srcDir,
      "src",
      "Bangus Distribution_Data.xlsx"
    );

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
        "  To import Excel data locally, place the following files in the src directory:"
      );
      console.log("  - Red_Tilapia Distribution_Data.xlsx");
      console.log("  - Bangus Distribution_Data.xlsx");
      console.log(
        "\nThen run: npx sequelize-cli db:seed --seed 20250530130001-import-excel-distributions.js"
      );

      // Exit successfully without error
      return Promise.resolve();
    }

    // Check if batchId column exists in Distributions table
    const tableDescription = await queryInterface.describeTable(
      "Distributions"
    );
    const hasBatchIdColumn = tableDescription.hasOwnProperty("batchId");

    if (hasBatchIdColumn) {
      console.log("\n✓ batchId column found, creating batches...");

      // Group distributions by date and species to create batches
      const batchGroups = {};
      allDistributions.forEach((dist) => {
        const dateKey = dist.dateDistributed.toISOString().split("T")[0];
        const key = `${dateKey}-${dist.species}`;

        if (!batchGroups[key]) {
          batchGroups[key] = [];
        }
        batchGroups[key].push(dist);
      });

      // Create batches and assign batch IDs
      const batches = [];
      const batchMap = new Map(); // Track batch IDs to avoid duplicates

      Object.keys(batchGroups).forEach((key) => {
        const groups = key.split("-");
        const year = groups[0];
        const month = groups[1];
        const day = groups[2];
        const species = groups.slice(3).join("-");

        const batchKey = `${year}-${month}-${species}`;

        if (!batchMap.has(batchKey)) {
          const batchIndex = batchMap.size + 1;
          const batchId = `BATCH-${year}-${month}-${batchIndex}`;
          batchMap.set(batchKey, batchId);
        }

        const batchId = batchMap.get(batchKey);
        const distributions = batchGroups[key];

        // Assign batch ID to all distributions in this group
        distributions.forEach((d) => {
          d.batchId = batchId;
        });
      });

      // Create batch records from the map
      batchMap.forEach((batchId, key) => {
        const [year, month, species] = key.split("-");
        const relatedDistributions = allDistributions.filter(
          (d) => d.batchId === batchId
        );
        const totalCount = relatedDistributions.reduce(
          (sum, d) => sum + d.fingerlings,
          0
        );

        batches.push({
          id: batchId,
          name: `${month} Batch ${year}`,
          description: `Batch for ${month} distributed on ${year} (${relatedDistributions.length} distributions)`,
          userId: userId,
          totalCount: totalCount,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Insert batches first with validation disabled
      console.log(`\nInserting ${batches.length} batches...`);
      try {
        await queryInterface.bulkInsert("Batches", batches, {
          validate: false,
          ignoreDuplicates: true,
        });
      } catch (error) {
        console.log(`⚠ Error inserting batches: ${error.message}`);
        console.log("  Continuing without batches...");

        // Remove batchId from distributions if batch insertion failed
        allDistributions.forEach((dist) => {
          delete dist.batchId;
        });
      }
    } else {
      console.log(
        "\n⚠ batchId column not found in Distributions table. Skipping batch creation."
      );
      console.log("  Run migrations first: npx sequelize-cli db:migrate");

      // Remove batchId from distributions if column doesn't exist
      allDistributions.forEach((dist) => {
        delete dist.batchId;
      });
    }

    // Insert all distributions
    console.log(`Inserting ${allDistributions.length} distributions...`);
    await queryInterface.bulkInsert("Distributions", allDistributions, {});

    // Verify the count in database
    const result = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM Distributions;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const totalInDb = result[0].count;

    console.log(
      `\n✓ Successfully imported ${allDistributions.length} distribution records!`
    );
    console.log(`✓ Total records in database: ${totalInDb}`);
    console.log(
      `✓ Breakdown: ${
        allDistributions.filter((d) =>
          d.species.toLowerCase().includes("tilapia")
        ).length
      } Tilapia + ${
        allDistributions.filter((d) =>
          d.species.toLowerCase().includes("bangus")
        ).length
      } Bangus`
    );
  },

  async down(queryInterface, Sequelize) {
    // Delete distributions first (due to foreign key constraint)
    await queryInterface.sequelize.query(
      `DELETE FROM Distributions WHERE id > 6;`
    );

    // Delete batches that were created by this seeder
    await queryInterface.sequelize.query(
      `DELETE FROM Batches WHERE id LIKE 'BATCH-%';`
    );
  },
};
