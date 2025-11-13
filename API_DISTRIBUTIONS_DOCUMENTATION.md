# Distribution Data API Documentation

This document describes the API endpoints for accessing historical distribution data (Tilapia and Bangus) imported from Excel files.

## Base URL
All endpoints are prefixed with `/api/distributions-data`

---

## Endpoints

### 1. Get All Distributions

**GET** `/api/distributions-data`

Fetch all distribution records with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | No | Filter by species: "Tilapia" or "Bangus" |
| `municipality` | string | No | Filter by municipality (case-insensitive partial match) |
| `province` | string | No | Filter by province (case-insensitive partial match) |
| `search` | string | No | Search across beneficiary name, municipality, province, and barangay |
| `startDate` | string | No | Filter distributions from this date (ISO format: YYYY-MM-DD) |
| `endDate` | string | No | Filter distributions until this date (ISO format: YYYY-MM-DD) |
| `page` | number | No | Page number for pagination (default: 1) |
| `limit` | number | No | Number of records per page (default: 10) |

#### Example Request
```bash
GET /api/distributions-data?species=Tilapia&province=Davao%20del%20Norte&page=1&limit=20
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "distributions": [
      {
        "id": 1,
        "dateDistributed": "2023-01-03T00:00:00.000Z",
        "beneficiaryName": "Pablito Emperio",
        "area": null,
        "barangay": null,
        "municipality": "Carmen",
        "province": "Davao del Norte",
        "fingerlings": 3000,
        "species": "Tilapia",
        "survivalRate": "0.7800",
        "avgWeight": "0.25",
        "harvestKilo": "585.00",
        "userId": 1,
        "createdAt": "2025-01-13T00:00:00.000Z",
        "updatedAt": "2025-01-13T00:00:00.000Z",
        "user": {
          "id": 1,
          "username": "admin",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalDistributions": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

---

### 2. Get Single Distribution

**GET** `/api/distributions-data/[id]`

Fetch a single distribution record by ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Distribution ID |

#### Example Request
```bash
GET /api/distributions-data/1
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "dateDistributed": "2023-01-03T00:00:00.000Z",
    "beneficiaryName": "Pablito Emperio",
    "area": null,
    "barangay": null,
    "municipality": "Carmen",
    "province": "Davao del Norte",
    "fingerlings": 3000,
    "species": "Tilapia",
    "survivalRate": "0.7800",
    "avgWeight": "0.25",
    "harvestKilo": "585.00",
    "userId": 1,
    "createdAt": "2025-01-13T00:00:00.000Z",
    "updatedAt": "2025-01-13T00:00:00.000Z",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

---

### 3. Create Distribution

**POST** `/api/distributions-data`

Create a new distribution record.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dateDistributed` | string | Yes | Distribution date (ISO format) |
| `beneficiaryName` | string | Yes | Name of beneficiary |
| `area` | string | No | Area size (e.g., "2 hectares") |
| `barangay` | string | No | Barangay name |
| `municipality` | string | Yes | Municipality name |
| `province` | string | Yes | Province name |
| `fingerlings` | number | Yes | Number of fingerlings distributed |
| `species` | string | Yes | "Tilapia" or "Bangus" |
| `survivalRate` | number | Yes | Survival rate (0-1, e.g., 0.78 for 78%) |
| `avgWeight` | number | Yes | Average weight in kg |
| `harvestKilo` | number | Yes | Total harvest in kilograms |
| `userId` | number | Yes | ID of user creating the record |

#### Example Request
```bash
POST /api/distributions-data
Content-Type: application/json

{
  "dateDistributed": "2024-01-15",
  "beneficiaryName": "Juan Dela Cruz",
  "area": "1 hectare",
  "barangay": "Poblacion",
  "municipality": "Tagum City",
  "province": "Davao del Norte",
  "fingerlings": 5000,
  "species": "Tilapia",
  "survivalRate": 0.78,
  "avgWeight": 0.25,
  "harvestKilo": 975,
  "userId": 1
}
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 101,
    "dateDistributed": "2024-01-15T00:00:00.000Z",
    "beneficiaryName": "Juan Dela Cruz",
    "area": "1 hectare",
    "barangay": "Poblacion",
    "municipality": "Tagum City",
    "province": "Davao del Norte",
    "fingerlings": 5000,
    "species": "Tilapia",
    "survivalRate": "0.7800",
    "avgWeight": "0.25",
    "harvestKilo": "975.00",
    "userId": 1,
    "createdAt": "2025-01-13T07:00:00.000Z",
    "updatedAt": "2025-01-13T07:00:00.000Z",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  },
  "message": "Distribution record created successfully"
}
```

---

### 4. Update Distribution

**PUT** `/api/distributions-data/[id]`

Update an existing distribution record.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Distribution ID |

#### Request Body
All fields are optional. Only include fields you want to update.

#### Example Request
```bash
PUT /api/distributions-data/1
Content-Type: application/json

{
  "harvestKilo": 1200,
  "survivalRate": 0.82
}
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "dateDistributed": "2023-01-03T00:00:00.000Z",
    "beneficiaryName": "Pablito Emperio",
    "area": null,
    "barangay": null,
    "municipality": "Carmen",
    "province": "Davao del Norte",
    "fingerlings": 3000,
    "species": "Tilapia",
    "survivalRate": "0.8200",
    "avgWeight": "0.25",
    "harvestKilo": "1200.00",
    "userId": 1,
    "createdAt": "2025-01-13T00:00:00.000Z",
    "updatedAt": "2025-01-13T07:15:00.000Z",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  },
  "message": "Distribution updated successfully"
}
```

---

### 5. Delete Distribution

**DELETE** `/api/distributions-data/[id]`

Delete a distribution record.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Distribution ID |

#### Example Request
```bash
DELETE /api/distributions-data/1
```

#### Example Response
```json
{
  "success": true,
  "message": "Distribution deleted successfully"
}
```

---

### 6. Get Statistics

**GET** `/api/distributions-data/stats`

Get comprehensive statistics about distributions.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | No | Filter by species: "Tilapia" or "Bangus" |
| `province` | string | No | Filter by province |
| `startDate` | string | No | Filter from this date (ISO format) |
| `endDate` | string | No | Filter until this date (ISO format) |

#### Example Request
```bash
GET /api/distributions-data/stats?species=Tilapia&startDate=2023-01-01&endDate=2023-12-31
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalDistributions": 150,
      "totalFingerlings": 450000,
      "totalHarvest": 87750
    },
    "speciesStats": [
      {
        "species": "Tilapia",
        "count": "100",
        "totalFingerlings": "300000",
        "totalHarvest": "58500",
        "avgSurvivalRate": "0.78",
        "avgWeight": "0.25"
      },
      {
        "species": "Bangus",
        "count": "50",
        "totalFingerlings": "150000",
        "totalHarvest": "29250",
        "avgSurvivalRate": "0.935",
        "avgWeight": "0.39"
      }
    ],
    "topMunicipalities": [
      {
        "municipality": "Panabo City",
        "province": "Davao del Norte",
        "count": "45",
        "totalFingerlings": "135000",
        "totalHarvest": "26325"
      }
    ],
    "topProvinces": [
      {
        "province": "Davao del Norte",
        "count": "80",
        "totalFingerlings": "240000",
        "totalHarvest": "46800"
      }
    ],
    "monthlyTrends": [
      {
        "month": "2023-12-01T00:00:00.000Z",
        "species": "Tilapia",
        "count": "15",
        "totalFingerlings": "45000",
        "totalHarvest": "8775"
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Frontend Integration Example

```typescript
// Fetch distributions with filters
async function fetchDistributions(filters: {
  species?: string;
  province?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  
  if (filters.species) params.append('species', filters.species);
  if (filters.province) params.append('province', filters.province);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const response = await fetch(`/api/distributions-data?${params}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.data;
}

// Get statistics
async function getStats(filters?: {
  species?: string;
  startDate?: string;
  endDate?: string;
}) {
  const params = new URLSearchParams();
  
  if (filters?.species) params.append('species', filters.species);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const response = await fetch(`/api/distributions-data/stats?${params}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.data;
}

// Create new distribution
async function createDistribution(distributionData: any) {
  const response = await fetch('/api/distributions-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(distributionData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.data;
}
```

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD or full ISO string)
- The API uses case-insensitive searching for text fields
- Pagination is zero-indexed (page 1 is the first page)
- The `user` object is included in responses to show who created/modified the record
- Decimal fields (survivalRate, avgWeight, harvestKilo) are returned as strings to preserve precision
