# Forecast Prediction API Integration

## Overview
Successfully integrated the external harvest prediction API endpoint into the forecasting page to provide real-time harvest forecasts for fish species (Tilapia and Bangus).

## API Endpoint Details

### External API
- **URL**: `https://fast-api-prediction-production.up.railway.app/api/v1/predict`
- **Method**: POST
- **Purpose**: Forecast fish harvest for a given date range (by month)

### Internal API Route
- **Path**: `/api/predict`
- **File**: `src/app/api/predict/route.ts`
- **Method**: POST

## Request Parameters

```typescript
{
  species: string,      // "Red Tilapia" or "Bangus"
  dateFrom: string,     // Start date in YYYY-MM-DD format
  dateTo: string,       // End date in YYYY-MM-DD format
  province: string,     // Province name
  city: string          // City/Municipality name
}
```

## Response Format

### Success Response
```typescript
{
  success: true,
  predictions: [
    {
      date: string,                // YYYY-MM-DD format
      predicted_harvest: number,   // Predicted harvest in kg
      input_features: {            // Features used for this prediction
        Fingerlings: number,
        SurvivalRate: number,
        AvgWeight: number
      },
      confidence_lower: number,    // Lower confidence bound
      confidence_upper: number     // Upper confidence bound
    }
  ],
  model_info: {
    model_name: string,            // e.g., "Tilapia Harvest Forecast Model"
    species: string,               // "tilapia" or "bangus"
    version: string,               // Model version
    last_trained: string,          // Last training date (YYYY-MM-DD)
    features_used: string[]        // ["Fingerlings", "SurvivalRate", "AvgWeight"]
  },
  metadata: {
    province: string,
    city: string,
    date_from: string,             // YYYY-MM-DD format
    date_to: string,               // YYYY-MM-DD format
    prediction_count: number,
    request_id: string,            // UUID for tracking
    timestamp: string              // ISO 8601 timestamp
  }
}
```

### Error Response
```typescript
{
  success: false,
  error: string,
  details?: string
}
```

## Implementation Details

### 1. API Route Handler (`src/app/api/predict/route.ts`)

**Features:**
- ✅ Validates all required parameters
- ✅ Maps UI species names to API format:
  - "Red Tilapia" → "tilapia"
  - "Bangus" → "bangus"
- ✅ Proxies requests to external prediction API
- ✅ Handles errors with detailed messages
- ✅ Logs requests and responses for debugging
- ✅ Returns structured JSON responses

**Error Handling:**
1. **Missing Parameters** (400): Returns error if any required parameter is missing
2. **Invalid Species** (400): Returns error if species is not recognized
3. **External API Errors**: Forwards status code and error details from external API
4. **Network Errors** (500): Catches and returns connection/parsing errors

### 2. Frontend Integration (`src/app/admin/forecasting/page.tsx`)

**API Call Implementation:**
```typescript
const response = await fetch('/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    species: formData.species,
    dateFrom: formData.dateFrom,
    dateTo: formData.dateTo,
    province: formData.province,
    city: formData.city,
  }),
});
```

**Data Transformation:**
The API response is transformed for chart visualization:
- Dates converted to month abbreviations (Jan, Feb, Mar, etc.)
- `predicted_harvest` values rounded to whole numbers
- Historical comparison data generated (85-95% of predicted)
- Confidence scores calculated from confidence bounds (confidence_lower and confidence_upper)

**UI Features:**
1. **Loading State**: Shows spinner while fetching predictions
2. **Error Display**: Shows user-friendly error messages
3. **Success Display**: 
   - Model information card
   - Summary statistics (Total, Average, Peak, Count)
   - Harvest forecast bar chart
   - Harvest trend line chart
   - Geographic trend analysis

## Usage Example

### 1. Select Parameters
```
Date From: 2025-06-01
Date To: 2025-12-31
Species: Red Tilapia
Province: Davao del Norte
City: Tagum City
```

### 2. Generate Forecast
Click "Generate Forecast" button

### 3. View Results
- **Summary Statistics**:
  - Total Predicted Harvest: X,XXX kg
  - Avg Harvest/Month: X,XXX kg
  - Peak Harvest: X,XXX kg
  - Months Forecasted: X

- **Charts**:
  - Bar chart showing monthly harvest predictions
  - Line chart showing harvest trends
  - Area charts for geographic analysis

## Testing Checklist

- [x] API route created and configured
- [x] Frontend updated to match API response structure
- [ ] Test with Red Tilapia species
- [ ] Test with Bangus species
- [ ] Test with different date ranges
- [ ] Test with different provinces
- [ ] Test with different cities
- [ ] Test error handling (missing parameters)
- [ ] Test error handling (invalid species)
- [ ] Test error handling (API unavailable)
- [ ] Verify data visualization
- [ ] Verify summary statistics calculation

## Error Scenarios

### 1. Missing Parameters
**Request:**
```json
{
  "species": "Red Tilapia",
  "dateFrom": "2025-06-01"
  // Missing dateTo, province, city
}
```
**Response:**
```json
{
  "success": false,
  "error": "Missing required parameters. Please provide species, dateFrom, dateTo, province, and city."
}
```

### 2. Invalid Species
**Request:**
```json
{
  "species": "Salmon",
  "dateFrom": "2025-06-01",
  "dateTo": "2025-12-31",
  "province": "Davao del Norte",
  "city": "Tagum City"
}
```
**Response:**
```json
{
  "success": false,
  "error": "Invalid species: Salmon. Must be \"Red Tilapia\" or \"Bangus\"."
}
```

### 3. External API Error
If the external API is unavailable or returns an error, the response will include:
```json
{
  "success": false,
  "error": "Prediction API returned error: 500 Internal Server Error",
  "details": "Error details from external API"
}
```

## Security Considerations

1. **API Key**: Currently no API key required for external API
2. **Rate Limiting**: No rate limiting implemented (consider adding if needed)
3. **Input Validation**: All parameters validated before forwarding to external API
4. **Error Exposure**: Error details logged server-side, sanitized for client

## Future Enhancements

1. **Caching**: Implement Redis/memory cache for repeated requests
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Batch Requests**: Support multiple location predictions in one call
4. **Historical Comparison**: Store predictions and compare with actual harvest
5. **Export Functionality**: Add CSV/Excel export for prediction data
6. **Confidence Intervals**: Display prediction uncertainty ranges from API data
7. **API Key Management**: Add authentication if external API requires it
8. **Retry Logic**: Implement exponential backoff for failed requests

## Troubleshooting

### Issue: "Failed to fetch predictions"
**Possible Causes:**
1. External API is down
2. Network connectivity issues
3. Invalid request format

**Solution:**
- Check browser console for detailed error logs
- Verify external API status
- Check network tab in browser DevTools

### Issue: "Missing required parameters"
**Possible Causes:**
1. Form fields not properly filled
2. State management issue in frontend

**Solution:**
- Ensure all form fields have values
- Check browser console for state values

### Issue: Charts not displaying
**Possible Causes:**
1. API response format mismatch
2. Data transformation error

**Solution:**
- Check console logs for API response structure
- Verify `predicted_harvest` field exists in response
- Check data transformation logic

## API Response Example

```json
{
  "success": true,
  "predictions": [
    {
      "date": "2025-06-01",
      "predicted_harvest": 975,
      "input_features": {
        "Fingerlings": 1000,
        "SurvivalRate": 0.85,
        "AvgWeight": 0.25
      },
      "confidence_lower": 828.75,
      "confidence_upper": 1121.25
    },
    {
      "date": "2025-07-01",
      "predicted_harvest": 975,
      "input_features": {
        "Fingerlings": 1000,
        "SurvivalRate": 0.85,
        "AvgWeight": 0.25
      },
      "confidence_lower": 828.75,
      "confidence_upper": 1121.25
    },
    {
      "date": "2025-08-01",
      "predicted_harvest": 975,
      "input_features": {
        "Fingerlings": 1000,
        "SurvivalRate": 0.85,
        "AvgWeight": 0.25
      },
      "confidence_lower": 828.75,
      "confidence_upper": 1121.25
    }
  ],
  "model_info": {
    "model_name": "Tilapia Harvest Forecast Model",
    "species": "tilapia",
    "version": "1.0.0",
    "last_trained": "2025-11-13",
    "features_used": ["Fingerlings", "SurvivalRate", "AvgWeight"]
  },
  "metadata": {
    "province": "Davao del Norte",
    "city": "Tagum City",
    "date_from": "2025-06-01",
    "date_to": "2025-12-31",
    "prediction_count": 7,
    "request_id": "f1525a49-113d-4165-b537-d6fa8c96a78b",
    "timestamp": "2025-11-13T22:50:21.682890Z"
  }
}
```

## Conclusion

The forecast prediction API has been successfully integrated into the application. The implementation includes:
- ✅ Robust error handling
- ✅ Input validation
- ✅ Data transformation for visualization
- ✅ User-friendly error messages
- ✅ Loading states and feedback
- ✅ Comprehensive logging for debugging
- ✅ Support for confidence intervals from API

The system is ready for testing and can be extended with additional features as needed.
