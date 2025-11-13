/**
 * Script to import distribution data from Excel files
 *
 * Usage:
 * 1. Install required packages: npm install xlsx
 * 2. Place your Excel files in the project root
 * 3. Run: node scripts/import-distributions.js
 */

const XLSX = require("xlsx");
const path = require("path");

// Import database models
const models = require("../src/server/database/models").default;
const Distribution = models.Distribution;

/**
 * Parse date from various formats in Excel
 */
function parseExcelDate(dateValue) {
  if (!dateValue) return new Date();

  // If it's already a Date object
  if (dateValue instanceof Date) return dateValue;

  // If it's a string
  if (typeof dateValue === "string") {
    // Handle DD/MM/YYYY or MM/DD/YYYY format
    if (dateValue.includes("/")) {
      const parts = dateValue.split("/");
      if (parts.length === 3) {
        // Try MM/DD/YYYY first
        let date = new Date(parts[2], parts[0] - 1, parts[1]);
        if (isNaN(date.getTime())) {
          // Try DD/MM/YYYY
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return date;
      }
    }
    // Try standard date parsing
    return new Date(dateValue);
  }

  // If it's an Excel serial date number
  if (typeof dateValue === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + dateValue * 86400000);
  }

  return new Date();
}

/**
 * Import distributions from an Excel file
 */
async function importFromExcel(filePath, species, userId) {
  console.log(`\nImporting ${species} data from: ${filePath}`);

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} records in Excel file`);

    let imported = 0;
    let skipped = 0;

    // Process each row
    for (const row of data) {
      try {
        // Skip rows without beneficiary name
        if (!row["Beneficiary Name"]) {
          skipped++;
          continue;
        }

        // Create distribution record
        await Distribution.create({
          dateDistributed: parseExcelDate(row["Date Distributed"]),
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
        });

        imported++;

        // Log progress every 50 records
        if (imported % 50 === 0) {
          console.log(`  Imported ${imported} records...`);
        }
      } catch (error) {
        console.error(`  Error importing row:`, error.message);
        skipped++;
      }
    }

    console.log(`✓ Successfully imported ${imported} ${species} distributions`);
    console.log(`  Skipped ${skipped} records`);

    return { imported, skipped };
  } catch (error) {
    console.error(`✗ Error reading Excel file:`, error.message);
    throw error;
  }
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log("=== Distribution Data Import Script ===\n");

    // Get the first user from database
    const user = await models.User.findOne();
    if (!user) {
      console.error(
        "✗ No users found in database. Please create a user first."
      );
      process.exit(1);
    }

    console.log(`Using user: ${user.username} (ID: ${user.id})`);

    // Define file paths (adjust these to match your file locations)
    const tilapiaFile = path.join(
      __dirname,
      "../Red_Tilapia Distribution_Data.xlsx"
    );
    const bangusFile = path.join(__dirname, "../Bangus Distribution_Data.xlsx");

    let totalImported = 0;
    let totalSkipped = 0;

    // Import Tilapia data
    try {
      const tilapiaResult = await importFromExcel(
        tilapiaFile,
        "Tilapia",
        user.id
      );
      totalImported += tilapiaResult.imported;
      totalSkipped += tilapiaResult.skipped;
    } catch (error) {
      console.error("Failed to import Tilapia data:", error.message);
    }

    // Import Bangus data
    try {
      const bangusResult = await importFromExcel(bangusFile, "Bangus", user.id);
      totalImported += bangusResult.imported;
      totalSkipped += bangusResult.skipped;
    } catch (error) {
      console.error("Failed to import Bangus data:", error.message);
    }

    console.log("\n=== Import Summary ===");
    console.log(`Total imported: ${totalImported}`);
    console.log(`Total skipped: ${totalSkipped}`);
    console.log("\n✓ Import completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Import failed:", error);
    process.exit(1);
  }
}

// Run the import
main();
