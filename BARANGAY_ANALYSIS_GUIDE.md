# Barangay Level Trend Analysis Guide

## Overview

The **Barangay Level Trend Analysis** feature is integrated into the **Forecasting** page, providing detailed insights into beneficiary distribution data at the barangay level, including fingerlings count and harvest forecasts based on actual distribution data.

## Location

**Access**: Admin Dashboard → Analytics → **Forecasting**

## Features

### 1. **Forecasting Parameters**
Configure your analysis with:
- **Date Range**: Select start and end dates
- **Species**: Choose between Red Tilapia or Bangus
- **Location Hierarchy**:
  - Province selection
  - City/Municipality selection
  - Barangay selection (cascading dropdowns)
- **Facility Type**: Fish Cage or Pond System

### 2. **Geographic Trend Analysis**

After generating a forecast, the page displays three levels of geographic analysis:

#### **Province Level Trend**
- Aggregated data for the entire province
- Area chart showing harvest volume trends
- **"View Details" button** opens modal with:
  - All cities in the province
  - Batch IDs
  - Fingerlings Count per batch
  - Harvest Forecasted per batch

#### **City/Municipality Level Trend**
- City-specific aggregated data
- Area chart showing harvest trends for the selected city
- **"View Details" button** opens modal with:
  - All barangays in the city
  - Batch IDs
  - Fingerlings Count per batch
  - Harvest Forecasted per batch

#### **Barangay Level Trend** ⭐
- **Barangay-specific detailed analysis**
- Area chart showing harvest trends for the selected barangay
- **"View Details" button** opens modal with:
  - **Beneficiary Names** - Individual beneficiaries in the barangay
  - **Batch IDs** - Unique identifiers for each distribution
  - **Fingerlings Count** - Number of fingerlings per beneficiary
  - **Harvest Forecasted** - Expected harvest in kilograms per beneficiary

### 3. **Barangay Details Modal**

When you click "View Details" on the Barangay Level Trend section, you get:

**Summary Cards:**
- Total Batches
- Total Fingerlings (sum of all distributions)
- Forecasted Harvest (total expected harvest in kg)

**Detailed Table:**
- Beneficiary Name
- Batch ID
- Fingerlings Count
- Harvest Forecasted (kg)

**Export Functionality:**
- Export to CSV button for data sharing and analysis

## How to Use

### Step 1: Generate Forecast
1. Navigate to **Forecasting** page
2. Set your parameters:
   - Date range
   - Species (Red Tilapia or Bangus)
   - Province, City, and **Barangay**
   - Facility type
3. Click **"Generate Forecast"**

### Step 2: View Barangay Analysis
1. Scroll down to the **"Geographic Forecast Trend Analysis"** section
2. Find the **"Barangay Level Trend"** card (green-colored)
3. Review the area chart showing harvest trends over time
4. Click **"View Details"** button

### Step 3: Analyze Beneficiary Data
In the modal that opens:
- **Review Summary**: See total batches, fingerlings, and forecasted harvest
- **Browse Table**: View individual beneficiary details
- **Export Data**: Click "Export CSV" to download the complete dataset

## Data Displayed

### Barangay Level Information:
- **Beneficiary Names**: Individual recipients of fingerlings
- **Batch IDs**: Unique distribution identifiers
- **Fingerlings Count**: Number of fingerlings distributed to each beneficiary
- **Harvest Forecasted**: Expected harvest in kilograms based on:
  - Survival rate
  - Average weight
  - Distribution data

## Benefits

1. **Granular Insights**: Drill down from province → city → barangay level
2. **Beneficiary Tracking**: Monitor individual beneficiaries and their allocations
3. **Data-Driven Decisions**: Make informed decisions based on actual distribution data
4. **Trend Identification**: Spot patterns in fingerlings distribution and harvest forecasts
5. **Export Capability**: Share data with stakeholders via CSV export
6. **Integrated View**: All analysis in one place with the forecasting data

## Technical Details

### Data Source
- Uses `/api/distributions-data` endpoint
- Filters by barangay (case-insensitive matching)
- Aggregates data by month for trend charts
- Calculates harvest from `harvestKilo` field

### Modal Features
- Responsive design
- Sortable data
- CSV export functionality
- Summary statistics
- Detailed beneficiary listing

## Tips

1. **Compare Levels**: Use the three geographic levels to compare trends across different scales
2. **Export for Analysis**: Download CSV files for deeper analysis in Excel or other tools
3. **Date Range**: Adjust date ranges to see seasonal patterns
4. **Species Comparison**: Run analysis for both species to compare performance

## Example Workflow

1. Select **Davao del Norte** → **Tagum City** → **Apokon**
2. Choose date range: **2023-01-01** to **2024-12-31**
3. Select species: **Red Tilapia**
4. Click **Generate Forecast**
5. Scroll to **Barangay Level Trend** section
6. Click **View Details** to see all beneficiaries in Apokon
7. Review fingerlings distribution and harvest forecasts
8. Export data if needed for reporting

## Support

For questions about the Barangay Level Trend Analysis feature, refer to the main application documentation or contact your system administrator.
