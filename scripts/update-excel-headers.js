const XLSX = require("xlsx");
const path = require("path");

// Expected headers based on the seeder file
const correctHeaders = [
  "Date Distributed",
  "Beneficiary Name",
  "Barangay",
  "Municipality",
  "Province",
  "Fingerlings",
  "Species",
  "Actual Harvest(Kilo)",
];

function updateExcelHeaders(filePath, fileName) {
  console.log(`\nUpdating ${fileName}...`);

  // Read the Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Get current data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`Current headers: ${data[0]}`);

  // Map old headers to new headers
  const headerMapping = {
    "Date Distributed": "Date Distributed",
    "Beneficiary Name": "Beneficiary Name",
    Barangay: "Barangay",
    Municipality: "Municipality",
    Province: "Province",
    Fingerlings: "Fingerlings",
    Species: "Species",
    "Forecasted(kg)": "Species", // This will be removed, Species takes priority
    "Forecasted(kd)": "Species", // This will be removed, Species takes priority
    "Harvest(Kilo)": "Actual Harvest(Kilo)",
  };

  // Get the old headers
  const oldHeaders = data[0];

  // Create new data array with updated headers
  const newData = [correctHeaders];

  // Process each row (skip header row)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const newRow = [];

    // Map each column based on correct headers
    correctHeaders.forEach((newHeader, newIndex) => {
      // Find the old header index that maps to this new header
      let oldIndex = -1;

      if (newHeader === "Date Distributed") {
        oldIndex = oldHeaders.indexOf("Date Distributed");
      } else if (newHeader === "Beneficiary Name") {
        oldIndex = oldHeaders.indexOf("Beneficiary Name");
      } else if (newHeader === "Barangay") {
        oldIndex = oldHeaders.indexOf("Barangay");
      } else if (newHeader === "Municipality") {
        oldIndex = oldHeaders.indexOf("Municipality");
      } else if (newHeader === "Province") {
        oldIndex = oldHeaders.indexOf("Province");
      } else if (newHeader === "Fingerlings") {
        oldIndex = oldHeaders.indexOf("Fingerlings");
      } else if (newHeader === "Species") {
        // Check if Species column exists
        oldIndex = oldHeaders.indexOf("Species");
        // If not, we'll set default value based on file name
      } else if (newHeader === "Actual Harvest(Kilo)") {
        oldIndex = oldHeaders.indexOf("Harvest(Kilo)");
      }

      // Get the value from old row or set default
      if (oldIndex >= 0 && oldIndex < row.length) {
        newRow[newIndex] = row[oldIndex];
      } else if (newHeader === "Species") {
        // Set default species based on filename
        if (fileName.includes("Bangus")) {
          newRow[newIndex] = "Bangus";
        } else if (fileName.includes("Tilapia")) {
          newRow[newIndex] = "Tilapia";
        } else {
          newRow[newIndex] = "";
        }
      } else {
        newRow[newIndex] = "";
      }
    });

    newData.push(newRow);
  }

  // Create new worksheet with updated data
  const newWorksheet = XLSX.utils.aoa_to_sheet(newData);

  // Replace the old worksheet
  workbook.Sheets[sheetName] = newWorksheet;

  // Write the updated workbook back to file
  XLSX.writeFile(workbook, filePath);

  console.log(`✓ Updated headers to: ${correctHeaders}`);
  console.log(`✓ File saved: ${filePath}`);
}

// Update both files
const srcDir = path.join(__dirname, "..");
const bangusFile = path.join(srcDir, "src", "Bangus Distribution_Data.xlsx");
const tilapiaFile = path.join(
  srcDir,
  "src",
  "Red_Tilapia Distribution_Data.xlsx"
);

console.log("=".repeat(60));
console.log("Updating Excel File Headers");
console.log("=".repeat(60));

try {
  updateExcelHeaders(bangusFile, "Bangus Distribution_Data.xlsx");
  updateExcelHeaders(tilapiaFile, "Red_Tilapia Distribution_Data.xlsx");

  console.log("\n" + "=".repeat(60));
  console.log("✓ All files updated successfully!");
  console.log("=".repeat(60));
} catch (error) {
  console.error("\n✗ Error updating files:", error.message);
  process.exit(1);
}
