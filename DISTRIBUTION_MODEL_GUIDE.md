# Distribution Model Guide

## Overview
The Distribution model tracks the distribution of fish fingerlings (Tilapia and Bangus) to beneficiaries across different locations in the Philippines. This model captures essential data for monitoring aquaculture distribution programs.

## Model Structure

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | INTEGER | Yes | Auto-incrementing primary key |
| `dateDistributed` | DATE | Yes | Date when fingerlings were distributed |
| `beneficiaryName` | STRING | Yes | Name of the beneficiary receiving the fingerlings |
| `area` | STRING | No | Area size (e.g., "2 hectares", "100 sq.m.") |
| `barangay` | STRING | No | Barangay (village) location |
| `municipality` | STRING | Yes | Municipality where distribution occurred |
| `province` | STRING | Yes | Province where distribution occurred |
| `fingerlings` | INTEGER | Yes | Number of fingerlings distributed |
| `species` | ENUM | Yes | Species type: "Tilapia" or "Bangus" |
| `survivalRate` | DECIMAL(5,4) | Yes | Survival rate as decimal (e.g., 0.78 = 78%) |
| `avgWeight` | DECIMAL(10,2) | Yes | Average weight in kilograms |
| `harvestKilo` | DECIMAL(10,2) | Yes | Total harvest in kilograms |
| `userId` | INTEGER | Yes | Foreign key to Users table |
| `createdAt` | DATE | Yes | Record creation timestamp |
| `updatedAt` | DATE | Yes | Record update timestamp |

### Species Types
- **Tilapia**: Red Tilapia with typical survival rate of 0.78 (78%) and average weight of 0.25 kg
- **Bangus**: Milkfish with typical survival rate of 0.935 (93.5%) and average weight of 0.39 kg

### Indexes
The model includes the following indexes for optimized queries:
- `distributions_user_id_index` - For filtering by user
- `distributions_species_index` - For filtering by species type
- `distributions_date_distributed_index` - For date-based queries
- `distributions_municipality_index` - For location-based queries
- `distributions_province_index` - For province-level analysis

## Database Setup

### Running the Migration

To create the Distributions table in your database:

```bash
npx sequelize-cli db:migrate
```

To rollback the migration:

```bash
npx sequelize-cli db:migrate:undo
```

### Seeding Sample Data

To populate the database with sample distribution data (6 sample records):

```bash
npx sequelize-cli db:seed --seed 20250530130000-demo-distributions.js
```

To undo the seeding:

```bash
npx sequelize-cli db:seed:undo --seed 20250530130000-demo-distributions.js
```

### Importing Full Excel Data

To import all the data from your Excel files:

1. **Install the xlsx package:**
   ```bash
   npm install xlsx
   ```

2. **Place your Excel files in the project root:**
   - `Red_Tilapia Distribution_Data.xlsx`
   - `Bangus Distribution_Data.xlsx`

3. **Run the migration first (if not already done):**
   ```bash
   npx sequelize-cli db:migrate
   ```

4. **Run the import script:**
   ```bash
   node scripts/import-distributions.js
   ```

The import script will:
- Read both Excel files
- Parse all distribution records
- Import them into the database
- Show progress and summary statistics
- Handle date parsing from various formats
- Skip invalid records and report errors

**Note:** The script expects the Excel files to have these columns:
- Date Distributed
- Beneficiary Name
- Area (sq.m.)
- Barangay
- Municipality
- Province
- Fingerlings
- Species
- SurvivalRate
- AvgWeight
- Harvest(Kilo)

## Usage Examples

### Importing the Model

```typescript
import Distribution from "@/server/database/models/distribution";
import models from "@/server/database/models";
```

### Creating a Distribution Record

```typescript
const newDistribution = await Distribution.create({
  dateDistributed: new Date("2024-01-15"),
  beneficiaryName: "Juan Dela Cruz",
  area: "1 hectare",
  barangay: "Poblacion",
  municipality: "Tagum City",
  province: "Davao del Norte",
  fingerlings: 5000,
  species: "Tilapia",
  survivalRate: 0.78,
  avgWeight: 0.25,
  harvestKilo: 975,
  userId: 1,
});
```

### Querying Distributions

#### Get all Tilapia distributions
```typescript
const tilapiaDistributions = await Distribution.findAll({
  where: { species: "Tilapia" },
  order: [["dateDistributed", "DESC"]],
});
```

#### Get distributions by province
```typescript
const davaoDistributions = await Distribution.findAll({
  where: { province: "Davao del Norte" },
  include: [{ model: models.User, as: "user" }],
});
```

#### Get distributions within a date range
```typescript
import { Op } from "sequelize";

const distributions = await Distribution.findAll({
  where: {
    dateDistributed: {
      [Op.between]: [new Date("2024-01-01"), new Date("2024-12-31")],
    },
  },
});
```

#### Get total fingerlings by species
```typescript
import { fn, col } from "sequelize";

const totals = await Distribution.findAll({
  attributes: [
    "species",
    [fn("SUM", col("fingerlings")), "totalFingerlings"],
    [fn("SUM", col("harvestKilo")), "totalHarvest"],
  ],
  group: ["species"],
});
```

### Updating a Distribution

```typescript
await Distribution.update(
  { harvestKilo: 1200 },
  { where: { id: 1 } }
);
```

### Deleting a Distribution

```typescript
await Distribution.destroy({
  where: { id: 1 },
});
```

## Relationships

### User Association
Each distribution belongs to a User (the staff member who recorded it):

```typescript
const distribution = await Distribution.findByPk(1, {
  include: [{ model: models.User, as: "user" }],
});

console.log(distribution.user.username);
```

### Getting User's Distributions
```typescript
const user = await models.User.findByPk(1, {
  include: [{ model: Distribution, as: "distributions" }],
});

console.log(user.distributions);
```

## Data Import from Excel

The model structure matches the Excel files provided:
- **Bangus Distribution_Data.xlsx** - Contains Bangus (Milkfish) distribution records
- **Red_Tilapia Distribution_Data.xlsx** - Contains Tilapia distribution records

Both files share the same column structure:
- Date Distributed
- Beneficiary Name
- Area (sq.m.)
- Barangay
- Municipality
- Province
- Fingerlings
- Species
- SurvivalRate
- AvgWeight
- Harvest(Kilo)

## API Integration

You can create API routes to interact with the Distribution model:

```typescript
// Example API route: /api/distributions/route.ts
import { NextResponse } from "next/server";
import Distribution from "@/server/database/models/distribution";

export async function GET() {
  try {
    const distributions = await Distribution.findAll({
      order: [["dateDistributed", "DESC"]],
      limit: 100,
    });
    return NextResponse.json(distributions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch distributions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const distribution = await Distribution.create(data);
    return NextResponse.json(distribution, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create distribution" },
      { status: 500 }
    );
  }
}
```

## Notes

- The `survivalRate` field stores values as decimals (0.78 = 78%, 0.935 = 93.5%)
- The `harvestKilo` is calculated as: `fingerlings × survivalRate × avgWeight`
- Area field is optional and can contain various formats (hectares, sq.m., etc.)
- Barangay field is optional as some distributions may not specify this level of detail
- All monetary and weight values use DECIMAL types for precision

## Migration File Location
`src/server/database/migrations/20250530123730-create-distributions.js`

## Model File Location
`src/server/database/models/distribution.ts`

## Seeder File Location
`src/server/database/seeders/20250530130000-demo-distributions.js`
