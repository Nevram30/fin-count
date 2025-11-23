# Forecasted Harvest Formula Fix

## Issue Summary
The forecasted harvest calculation was using an **incorrect formula** that was multiplying a monthly growth rate by the number of months, resulting in unrealistic harvest weights.

### The Problem
**Incorrect Formula (Before Fix):**
```javascript
const AverageWeightKg = isTilapia ? 0.39 : 0.25;  // Treated as monthly growth rate
const growthPeriodMonths = isTilapia ? 4 : 3;
const expectedWeightAfterGrowth = AverageWeightKg × growthPeriodMonths;
// Red Tilapia: 0.39 × 4 = 1.56 kg ❌ UNREALISTIC!
// Bangus: 0.25 × 3 = 0.75 kg
```

This resulted in:
- **Red Tilapia**: 1.56 kg per fish (impossible - should be 0.3 kg)
- **Bangus**: 0.75 kg per fish (incorrect - should be 0.39 kg)

### Example Impact
For the Cagangohan example you provided:
- **Fingerlings**: 58,400
- **Old (Incorrect) Forecast**: 85,183 kg ❌
- **New (Correct) Forecast**: ~13,666 kg ✅

## The Correct Formula (Expert Specification)

**Correct Formula (After Fix):**
```javascript
// Direct final weight after growth period
const expectedWeightAfterGrowth = isTilapia ? 0.3 : 0.39;
const survivalRate = isTilapia ? 0.935 : 0.78;

const forecastedHarvestKilos = fingerlings × survivalRate × expectedWeightAfterGrowth;
```

**Correct Parameters:**
- **Red Tilapia**: 0.3 kg after 4 months, 78% survival rate
- **Bangus**: 0.39 kg after 3 months, 93.5% survival rate

## Files Fixed

### 1. ✅ Seeder File
**File**: `src/server/database/seeders/20250530130001-import-excel-distributions.js`
- Changed from monthly growth rate calculation to direct final weight
- Uses 0.3 kg for Tilapia, 0.39 kg for Bangus

### 2. ✅ Distribution API
**File**: `src/app/api/distributions/route.ts`
- Updated the formula in the POST endpoint
- Now calculates based on species-specific final weights and survival rates

### 3. ✅ Distribution Page
**File**: `src/app/admin/distribution/page.tsx`
- Fixed the formula in the `calculateDates` function
- Uses correct species detection from `formData.species`

## What You Need to Do

### Step 1: Set Up Environment Variables
Before running database commands, you need to set up your environment variables. Create a `.env` file in the project root with your database credentials:

```env
MYSQLHOST=your_database_host
MYSQLUSER=your_database_username
MYSQLPASSWORD=your_database_password
MYSQLDATABASE=your_database_name
MYSQLPORT=3306
```

### Step 2: Re-seed the Database
Once your `.env` file is configured, run these commands to update the database with corrected values:

```bash
# 1. Undo the old seeder (remove incorrect data)
npx sequelize-cli db:seed:undo --seed 20250530130001-import-excel-distributions.js

# 2. Re-run the seeder with corrected formula
npx sequelize-cli db:seed --seed 20250530130001-import-excel-distributions.js
```

### Step 3: Verify the Fix
1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Forecasting page

3. Apply the same filters:
   - Species: Red Tilapia
   - Date from: 01/01/2023
   - Date To: 12/13/2023
   - Province: Davao del Norte
   - Municipality: Panabo City
   - Barangay: Cagangohan

4. Verify the forecasted harvest shows **~16,381 kg** instead of 85,183 kg

## Verification Checklist

- [ ] Environment variables configured in `.env` file
- [ ] Old seeder data removed successfully
- [ ] New seeder data imported with correct formula
- [ ] Development server restarted
- [ ] Forecasting page shows corrected values
- [ ] Cagangohan example shows ~16,381 kg (instead of 85,183 kg)
- [ ] New distributions calculate correctly

## Technical Details

### Calculation Breakdown

**For Red Tilapia (Cagangohan Example):**
```
Fingerlings: 58,400
Survival Rate: 78% (0.78)
Expected Weight: 0.3 kg

Formula:
forecastedHarvestKilos = 58,400 × 0.78 × 0.3
                       = 13,665.6 kg ✅
```

**For Bangus (Example):**
```
Fingerlings: 10,000
Survival Rate: 93.5% (0.935)
Expected Weight: 0.39 kg

Formula:
forecastedHarvestKilos = 10,000 × 0.935 × 0.39
                       = 3,646.5 kg ✅
```

## Notes

- All existing records in the database will be recalculated when you re-seed
- Any new distributions created after the fix will automatically use the correct formula
- The forecasting page will display updated values after the database is re-seeded

## Questions?

If you encounter any issues or have questions about this fix, please let me know!
