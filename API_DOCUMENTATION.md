# API Documentation for Flutter Integration

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication
Most endpoints require authentication using NextAuth. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. User Management

#### Create User (Registration)
**Endpoint**: `POST /api/user`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "userType": "staff", // or "admin"
  
  // For staff users:
  "fullName": "Juan Dela Cruz",
  "username": "juandc",
  "phoneNumber": "09123456789",
  "profilePhoto": "https://example.com/photo.jpg", // optional
  
  // For admin users:
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "userType": "staff",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

#### Get Users
**Endpoint**: `GET /api/user`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `userType` (optional): Filter by user type ("staff" or "admin")
- `search` (optional): Search by email

**Example**: `GET /api/user?page=1&limit=10&userType=staff&search=juan`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "userType": "staff",
        "name": "Juan Dela Cruz",
        "username": "juandc",
        "phoneNumber": "09123456789",
        "profilePhoto": "https://example.com/photo.jpg",
        "firstName": null,
        "lastName": null,
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z",
        "status": "active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### Update User
**Endpoint**: `PUT /api/user/[id]`

**Request Body**:
```json
{
  "email": "newemail@example.com", // optional
  "userType": "admin", // optional
  "staffProfile": { // optional
    "fullName": "Updated Name",
    "username": "newusername",
    "phoneNumber": "09987654321",
    "profilePhoto": "https://example.com/newphoto.jpg"
  },
  "adminProfile": { // optional
    "firstName": "Updated",
    "lastName": "Name"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "newemail@example.com",
    "userType": "staff",
    "name": "Updated Name",
    // ... other fields
  },
  "message": "User updated successfully"
}
```

---

#### Delete User
**Endpoint**: `DELETE /api/user/[id]`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 2. Batch Management

#### Create Batch
**Endpoint**: `POST /api/batches`

**Request Body**:
```json
{
  "date": "Monday January 15, 2024",
  "species": "Red Tilapia",
  "location": "Pond A1, Tagum City, Davao del Norte",
  "notes": "Initial stocking session with high-quality fingerlings",
  "totalFingerlings": 5000
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "BF-20240115-001",
    "date": "Monday January 15, 2024",
    "species": "Red Tilapia",
    "location": "Pond A1, Tagum City, Davao del Norte",
    "notes": "Initial stocking session with high-quality fingerlings",
    "totalFingerlings": 5000
  },
  "message": "Batch created successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Missing required fields: date, species, location, totalFingerlings"
}
```

---

#### Get Batches
**Endpoint**: `GET /api/batches`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `species` (optional): Filter by species
- `location` (optional): Filter by location
- `search` (optional): Search by ID, species, or location

**Example**: `GET /api/batches?page=1&limit=10&species=Tilapia&search=Tagum`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "batches": [
      {
        "id": "BF-20240115-001",
        "date": "Monday January 15, 2024",
        "species": "Red Tilapia",
        "location": "Pond A1, Tagum City, Davao del Norte",
        "notes": "Initial stocking session with high-quality fingerlings",
        "totalFingerlings": 5000
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalBatches": 18,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

---

### 3. Distribution Management

#### Create Distribution
**Endpoint**: `POST /api/distributions`

**Request Body**:
```json
{
  "beneficiaryType": "Individual", // or "Organization"
  "beneficiary": "Juan Dela Cruz",
  "phoneNumber": "09123456789",
  "species": "Red Tilapia",
  "batchId": "BF-20240115-001",
  "fingerlingsCount": 1500,
  "location": "Purok 1, Apokon, Tagum City, Davao del Norte",
  "facilityType": "Pond",
  "date": "2024-01-20",
  
  // Optional fields (auto-calculated if not provided):
  "forecast": "2024-04-20",
  "harvestDate": "2024-07-20",
  "forecastedHarvestDate": "2024-06-20",
  "forecastedHarvestKilos": 750
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "DIST-1734307200000",
    "beneficiaryType": "Individual",
    "beneficiary": "Juan Dela Cruz",
    "phoneNumber": "09123456789",
    "species": "Red Tilapia",
    "batchId": "BF-20240115-001",
    "fingerlingsCount": 1500,
    "location": "Purok 1, Apokon, Tagum City, Davao del Norte",
    "facilityType": "Pond",
    "date": "2024-01-20",
    "forecast": "2024-04-20",
    "harvestDate": "2024-07-20",
    "forecastedHarvestDate": "2024-06-20",
    "forecastedHarvestKilos": 750,
    "actualHarvestDate": "",
    "actualHarvestKilos": 0,
    "remarks": "",
    "customRemarks": ""
  },
  "message": "Distribution created successfully"
}
```

---

#### Get Distributions
**Endpoint**: `GET /api/distributions`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `beneficiaryType` (optional): Filter by beneficiary type
- `species` (optional): Filter by species
- `batchId` (optional): Filter by batch ID
- `search` (optional): Search by beneficiary, batch ID, species, or phone number

**Example**: `GET /api/distributions?page=1&limit=10&beneficiaryType=Individual&search=Juan`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "distributions": [
      {
        "id": "DIST-1734307200000",
        "beneficiaryType": "Individual",
        "beneficiary": "Juan Dela Cruz",
        "phoneNumber": "09123456789",
        "species": "Red Tilapia",
        "batchId": "BF-20240115-001",
        "fingerlingsCount": 1500,
        "location": "Purok 1, Apokon, Tagum City, Davao del Norte",
        "facilityType": "Pond",
        "date": "2024-01-20",
        "forecast": "2024-04-20",
        "harvestDate": "2024-07-20",
        "forecastedHarvestDate": "2024-06-20",
        "forecastedHarvestKilos": 750,
        "actualHarvestDate": "2024-07-15",
        "actualHarvestKilos": 820,
        "remarks": "Harvested",
        "customRemarks": ""
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalDistributions": 2,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

---

#### Update Distribution (Harvest Tracking)
**Endpoint**: `PUT /api/distributions`

**Request Body**:
```json
{
  "id": "DIST-1734307200000",
  "actualHarvestDate": "2024-07-15",
  "actualHarvestKilos": 820,
  "remarks": "Harvested", // Options: "Harvested", "Not Harvested", "Damaged", "Lost", "Disaster", "Other", ""
  "customRemarks": "Excellent harvest quality"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "DIST-1734307200000",
    "beneficiaryType": "Individual",
    "beneficiary": "Juan Dela Cruz",
    // ... all other fields with updated values
    "actualHarvestDate": "2024-07-15",
    "actualHarvestKilos": 820,
    "remarks": "Harvested",
    "customRemarks": "Excellent harvest quality"
  },
  "message": "Distribution updated successfully"
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Flutter Integration Notes

### 1. HTTP Package Setup
```dart
dependencies:
  http: ^1.1.0
```

### 2. Example API Service Class
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Create batch example
  Future<Map<String, dynamic>> createBatch(Map<String, dynamic> batchData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/batches'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode(batchData),
    );
    
    return jsonDecode(response.body);
  }
  
  // Get batches with pagination
  Future<Map<String, dynamic>> getBatches({
    int page = 1,
    int limit = 10,
    String? species,
    String? search,
  }) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (species != null) 'species': species,
      if (search != null) 'search': search,
    };
    
    final uri = Uri.parse('$baseUrl/batches').replace(queryParameters: queryParams);
    final response = await http.get(uri);
    
    return jsonDecode(response.body);
  }
}
```

### 3. CORS Configuration
The API is configured to accept requests from any origin during development (`ALLOWED_ORIGINS=*`). For production, update the `.env` file with your Flutter app's domain.

### 4. Authentication
When authentication is implemented, store the JWT token securely using `flutter_secure_storage` and include it in all API requests:
```dart
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer $token',
}
```

---

## Setup Instructions

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables** in `.env`:
   - Set database credentials
   - Add admin emails
   - Configure CORS origins for production

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Setup database**:
   ```bash
   npm run db:create
   npm run db:migrate
   npm run db:seed
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

---

## Notes

- All dates should be in ISO 8601 format or readable format as shown in examples
- Pagination is available on all GET endpoints that return lists
- The API uses mock data for batches currently - consider connecting to database
- CORS is configured via middleware to allow Flutter app communication
- All responses follow the `{ success, data/error }` format
