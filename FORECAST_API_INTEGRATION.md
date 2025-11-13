# Forecast API Integration Documentation

## Overview
Successfully integrated the external prediction API endpoint into the forecasting page to provide real-time price predictions for fish fingerlings (Tilapia and Bangus).

## API Endpoint
- **URL**: `https://fast-api-prediction-production.up.railway.app/api/v1/predict`
- **Method**: POST
- **Purpose**: Predict fish fingerling prices based on species, location, and date range

## Implementation Details

### 1. API Route (`src/app/api/forecast/route.ts`)
Created a Next.js API route that acts as a proxy to the external prediction API:

**Features:**
- Validates required parameters (species, dateFrom, dateTo, province, city)
- Maps species names to API format (e.g., "Red Tilapia" → "tilapia", "Bangus" → "bangus")
- Handles errors gracefully with detailed error messages
- Returns structured response with prediction data

**Request Parameters:**
```typescript
{
  species: string,      // "Red Tilapia" or "Bangus"
  dateFrom: string,     // YYYY-MM-DD format
  dateTo: string,       // YYYY-MM-DD format
  province: string,     // Province name
  city: string          // City/Municipality name
}
```

**Response Format:**
```typescript
{
  success: boolean,
  data: {
    predictions: [
      {
        date: string,
        predicted_price: number
      }
    ],
    model_info: {
      model_type: string,
      features_used: string[],
      training_period: string
    },
    metadata: {
      prediction_count: number,
      date_range: {
        start: string,
        end: string
      },
      location: {
        province: string,
        city: string
      },
      species: string
    }
  }
}
```

### 2. Forecasting Page Updates (`src/app/admin/forecasting/page.tsx`)

**New Features:**
1. **Real API Integration**
   - Replaced mock data generation with actual API calls
   - Fetches predictions from `/api/forecast` endpoint
   - Transforms API response to chart-compatible format

2. **Model Information Display**
   - Shows prediction model type
   - Displays training period
   - Lists features used in the model
   - Shows prediction count

3. **Enhanced Summary Statistics**
   - Total Predicted Price (with ₱ currency symbol)
   - Average Price per Month
   - Peak Price
   - Number of Months Forecasted

4. **Updated Charts**
   - **Price Forecast Chart**: Bar chart showing predicted prices by month
   - **Price Trend Chart**: Line chart showing price trends over time
   - Both charts display prices in Philippine Peso (₱)

5. **Error Handling**
   - Displays user-friendly error messages
   - Shows API error details for debugging
   - Maintains UI state during errors

6. **Loading States**
   - Shows loading spinner during API calls
   - Disables form submission while generating forecast
   - Provides visual feedback to users

## Usage

### Generating a Forecast

1. **Select Parameters:**
   - Date From: Start date for predictions
   - Date To: End date for predictions
   - Species: Choose between "Red Tilapia" or "Bangus"
   - Facility Type: Select facility type (Fish Cage, Pond System)
   - Province: Select from Davao Region provinces
   - City/Municipality: Select city within chosen province
   - Barangay: Select barangay within chosen city

2. **Generate Forecast:**
   - Click "Generate Forecast" button
   - Wait for API response (loading indicator shown)
   - View results including:
     - Model information
     - Summary statistics
     - Price forecast charts
     - Geographic trend analysis

3. **View Results:**
   - Model information card shows prediction model details
   - Summary cards display key metrics
   - Charts visualize price predictions and trends
   - Geographic analysis shows trends at province, city, and barangay levels

## Error Handling

The implementation includes comprehensive error handling:

1. **API Validation Errors**: Missing or invalid parameters
2. **Network Errors**: Connection issues with external API
3. **Response Errors**: Invalid or unexpected API responses
4. **User Feedback**: Clear error messages displayed in the UI

## Data Transformation

The API response is transformed to match the existing chart format:
- Dates are converted to month abbreviations (Jan, Feb, etc.)
- Predicted prices are rounded to whole numbers
- Currency formatting is applied (₱ symbol)
- Historical data is generated for comparison (85-95% of predicted)
- Confidence scores are generated (85-95%)

## Testing Recommendations

1. **Test with different species:**
   - Red Tilapia
   - Bangus

2. **Test with different date ranges:**
   - Short range (1-3 months)
   - Medium range (6 months)
   - Long range (12+ months)

3. **Test with different locations:**
   - Various provinces in Davao Region
   - Different cities within provinces
   - Different barangays within cities

4. **Test error scenarios:**
   - Invalid date ranges
   - Network connectivity issues
   - API unavailability

## Future Enhancements

Potential improvements for future iterations:

1. **Caching**: Implement response caching to reduce API calls
2. **Export Functionality**: Add ability to export prediction data
3. **Comparison View**: Compare predictions across different locations
4. **Historical Accuracy**: Show actual vs predicted prices when available
5. **Confidence Intervals**: Display prediction confidence ranges
6. **Batch Predictions**: Support multiple location predictions at once

## Notes

- The API expects species names in lowercase ("tilapia", "bangus")
- The implementation automatically maps UI species names to API format
- Geographic trend analysis uses the API predictions as a base for generating location-specific trends
- The facility type parameter is used for UI display but not sent to the prediction API
