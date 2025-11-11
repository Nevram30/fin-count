# Flutter App Setup Guide for Backend Integration

This guide will help you set up your Flutter app to communicate with the Next.js backend API.

## Prerequisites

- Flutter SDK installed
- Next.js backend running (see API_DOCUMENTATION.md for setup)
- Basic understanding of HTTP requests in Flutter

---

## Step 1: Install Required Packages

Add these dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0                    # For HTTP requests
  flutter_secure_storage: ^9.0.0  # For secure token storage
  provider: ^6.1.1                # For state management (optional)
```

Run:
```bash
flutter pub get
```

---

## Step 2: Configure API Base URL

Create a configuration file for your API endpoints:

**`lib/config/api_config.dart`**:
```dart
class ApiConfig {
  // Change this based on your environment
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // static const String baseUrl = 'http://localhost:3000/api'; // iOS simulator
  // static const String baseUrl = 'https://your-domain.com/api'; // Production
  
  // API Endpoints
  static const String users = '$baseUrl/user';
  static const String batches = '$baseUrl/batches';
  static const String distributions = '$baseUrl/distributions';
}
```

**Note**: 
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For iOS simulator, use `localhost` or `127.0.0.1`
- For physical devices, use your computer's IP address (e.g., `192.168.1.100:3000`)

---

## Step 3: Create API Service Class

Create a service class to handle all API requests:

**`lib/services/api_service.dart`**:
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  // Helper method to get headers
  Map<String, String> _getHeaders({String? token}) {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    
    return headers;
  }

  // Handle API response
  Map<String, dynamic> _handleResponse(http.Response response) {
    final body = jsonDecode(response.body);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      throw Exception(body['error'] ?? 'Unknown error occurred');
    }
  }

  // ==================== USER ENDPOINTS ====================
  
  // Create user (registration)
  Future<Map<String, dynamic>> createUser(Map<String, dynamic> userData) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.users),
        headers: _getHeaders(),
        body: jsonEncode(userData),
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to create user: $e');
    }
  }

  // Get users with pagination and filters
  Future<Map<String, dynamic>> getUsers({
    int page = 1,
    int limit = 10,
    String? userType,
    String? search,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (userType != null) 'userType': userType,
        if (search != null) 'search': search,
      };
      
      final uri = Uri.parse(ApiConfig.users).replace(queryParameters: queryParams);
      final response = await http.get(uri, headers: _getHeaders());
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to get users: $e');
    }
  }

  // Update user
  Future<Map<String, dynamic>> updateUser(int userId, Map<String, dynamic> userData) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConfig.users}/$userId'),
        headers: _getHeaders(),
        body: jsonEncode(userData),
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to update user: $e');
    }
  }

  // Delete user
  Future<Map<String, dynamic>> deleteUser(int userId) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConfig.users}/$userId'),
        headers: _getHeaders(),
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to delete user: $e');
    }
  }

  // ==================== BATCH ENDPOINTS ====================
  
  // Create batch
  Future<Map<String, dynamic>> createBatch(Map<String, dynamic> batchData) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.batches),
        headers: _getHeaders(),
        body: jsonEncode(batchData),
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to create batch: $e');
    }
  }

  // Get batches with pagination and filters
  Future<Map<String, dynamic>> getBatches({
    int page = 1,
    int limit = 10,
    String? species,
    String? location,
    String? search,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (species != null) 'species': species,
        if (location != null) 'location': location,
        if (search != null) 'search': search,
      };
      
      final uri = Uri.parse(ApiConfig.batches).replace(queryParameters: queryParams);
      final response = await http.get(uri, headers: _getHeaders());
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to get batches: $e');
    }
  }

  // ==================== DISTRIBUTION ENDPOINTS ====================
  
  // Create distribution
  Future<Map<String, dynamic>> createDistribution(Map<String, dynamic> distributionData) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.distributions),
        headers: _getHeaders(),
        body: jsonEncode(distributionData),
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to create distribution: $e');
    }
  }

  // Get distributions with pagination and filters
  Future<Map<String, dynamic>> getDistributions({
    int page = 1,
    int limit = 10,
    String? beneficiaryType,
    String? species,
    String? batchId,
    String? search,
  }) async {
    try {
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        if (beneficiaryType != null) 'beneficiaryType': beneficiaryType,
        if (species != null) 'species': species,
        if (batchId != null) 'batchId': batchId,
        if (search != null) 'search': search,
      };
      
      final uri = Uri.parse(ApiConfig.distributions).replace(queryParameters: queryParams);
      final response = await http.get(uri, headers: _getHeaders());
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to get distributions: $e');
    }
  }

  // Update distribution (for harvest tracking)
  Future<Map<String, dynamic>> updateDistribution(Map<String, dynamic> distributionData) async {
    try {
      final response = await http.put(
        Uri.parse(ApiConfig.distributions),
        headers: _getHeaders(),
        body: jsonEncode(distributionData),
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Failed to update distribution: $e');
    }
  }
}
```

---

## Step 4: Create Model Classes

Create model classes for type-safe data handling:

**`lib/models/batch.dart`**:
```dart
class Batch {
  final String id;
  final String date;
  final String species;
  final String location;
  final String notes;
  final int totalFingerlings;

  Batch({
    required this.id,
    required this.date,
    required this.species,
    required this.location,
    required this.notes,
    required this.totalFingerlings,
  });

  factory Batch.fromJson(Map<String, dynamic> json) {
    return Batch(
      id: json['id'],
      date: json['date'],
      species: json['species'],
      location: json['location'],
      notes: json['notes'] ?? '',
      totalFingerlings: json['totalFingerlings'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'species': species,
      'location': location,
      'notes': notes,
      'totalFingerlings': totalFingerlings,
    };
  }
}
```

**`lib/models/distribution.dart`**:
```dart
class Distribution {
  final String id;
  final String beneficiaryType;
  final String beneficiary;
  final String phoneNumber;
  final String species;
  final String batchId;
  final int fingerlingsCount;
  final String location;
  final String facilityType;
  final String date;
  final String forecast;
  final String harvestDate;
  final String? forecastedHarvestDate;
  final int? forecastedHarvestKilos;
  final String? actualHarvestDate;
  final int? actualHarvestKilos;
  final String? remarks;
  final String? customRemarks;

  Distribution({
    required this.id,
    required this.beneficiaryType,
    required this.beneficiary,
    required this.phoneNumber,
    required this.species,
    required this.batchId,
    required this.fingerlingsCount,
    required this.location,
    required this.facilityType,
    required this.date,
    required this.forecast,
    required this.harvestDate,
    this.forecastedHarvestDate,
    this.forecastedHarvestKilos,
    this.actualHarvestDate,
    this.actualHarvestKilos,
    this.remarks,
    this.customRemarks,
  });

  factory Distribution.fromJson(Map<String, dynamic> json) {
    return Distribution(
      id: json['id'],
      beneficiaryType: json['beneficiaryType'],
      beneficiary: json['beneficiary'],
      phoneNumber: json['phoneNumber'],
      species: json['species'],
      batchId: json['batchId'],
      fingerlingsCount: json['fingerlingsCount'],
      location: json['location'],
      facilityType: json['facilityType'],
      date: json['date'],
      forecast: json['forecast'],
      harvestDate: json['harvestDate'],
      forecastedHarvestDate: json['forecastedHarvestDate'],
      forecastedHarvestKilos: json['forecastedHarvestKilos'],
      actualHarvestDate: json['actualHarvestDate'],
      actualHarvestKilos: json['actualHarvestKilos'],
      remarks: json['remarks'],
      customRemarks: json['customRemarks'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'beneficiaryType': beneficiaryType,
      'beneficiary': beneficiary,
      'phoneNumber': phoneNumber,
      'species': species,
      'batchId': batchId,
      'fingerlingsCount': fingerlingsCount,
      'location': location,
      'facilityType': facilityType,
      'date': date,
      if (forecastedHarvestDate != null) 'forecastedHarvestDate': forecastedHarvestDate,
      if (forecastedHarvestKilos != null) 'forecastedHarvestKilos': forecastedHarvestKilos,
    };
  }
}
```

---

## Step 5: Usage Example

Here's how to use the API service in your Flutter app:

**`lib/screens/batch_list_screen.dart`**:
```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/batch.dart';

class BatchListScreen extends StatefulWidget {
  @override
  _BatchListScreenState createState() => _BatchListScreenState();
}

class _BatchListScreenState extends State<BatchListScreen> {
  final ApiService _apiService = ApiService();
  List<Batch> _batches = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBatches();
  }

  Future<void> _loadBatches() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _apiService.getBatches(page: 1, limit: 20);
      
      if (response['success']) {
        final batchesData = response['data']['batches'] as List;
        setState(() {
          _batches = batchesData.map((json) => Batch.fromJson(json)).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Batches')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : ListView.builder(
                  itemCount: _batches.length,
                  itemBuilder: (context, index) {
                    final batch = _batches[index];
                    return ListTile(
                      title: Text(batch.species),
                      subtitle: Text('${batch.location} - ${batch.totalFingerlings} fingerlings'),
                      trailing: Text(batch.date),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadBatches,
        child: Icon(Icons.refresh),
      ),
    );
  }
}
```

---

## Step 6: Testing the Connection

1. **Start the Next.js backend**:
   ```bash
   npm run dev
   ```

2. **Run your Flutter app**:
   ```bash
   flutter run
   ```

3. **Test API calls** from your Flutter app

---

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to API from Android emulator
- **Solution**: Use `10.0.2.2` instead of `localhost` in `ApiConfig.baseUrl`

**Problem**: Cannot connect from iOS simulator
- **Solution**: Use `localhost` or `127.0.0.1` in `ApiConfig.baseUrl`

**Problem**: Cannot connect from physical device
- **Solution**: 
  1. Make sure your device and computer are on the same network
  2. Use your computer's IP address (e.g., `http://192.168.1.100:3000/api`)
  3. Ensure your firewall allows connections on port 3000

### CORS Issues

If you see CORS errors:
1. Check that `src/middleware.ts` is properly configured
2. Verify `ALLOWED_ORIGINS` in `.env` includes your Flutter app's origin
3. Restart the Next.js server after changing `.env`

### SSL Certificate Issues (Production)

For production with HTTPS:
```dart
// In your API service, add this for development only:
class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
  }
}

// In main.dart (ONLY FOR DEVELOPMENT):
void main() {
  HttpOverrides.global = MyHttpOverrides();
  runApp(MyApp());
}
```

**Warning**: Never use `badCertificateCallback` in production!

---

## Next Steps

1. Implement authentication flow with JWT tokens
2. Add error handling and retry logic
3. Implement offline caching with local database (SQLite/Hive)
4. Add loading states and error messages
5. Implement pagination for large datasets

---

## Additional Resources

- [Flutter HTTP Package Documentation](https://pub.dev/packages/http)
- [API Documentation](./API_DOCUMENTATION.md)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
