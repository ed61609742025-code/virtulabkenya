import 'package:dio/dio.dart';
import '../storage/local_storage.dart';

class ApiClient {
  static const String defaultBaseUrl = 'http://10.0.2.2:3000'; // Standard Android emulator localhost
  // Note: Use http://localhost:3000 for iOS simulator / web / local desktop
  
  final Dio dio;

  ApiClient({String baseUrl = defaultBaseUrl})
      : dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
            headers: {'Content-Type': 'application/json'},
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await LocalStorage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<Response> login({
    required String admissionNumber,
    required String password,
    String role = 'student',
  }) async {
    return await dio.post('/api/auth/login', data: {
      'admission_number': admissionNumber,
      'password': password,
      'role': role,
    });
  }

  Future<Response> register({
    required String name,
    required String admissionNumber,
    required String password,
    required String schoolCode,
    String role = 'student',
  }) async {
    return await dio.post('/api/auth/register', data: {
      'name': name,
      'admission_number': admissionNumber,
      'password': password,
      'school_code': schoolCode,
      'role': role,
    });
  }

  Future<Response> submitTitrationSession({
    required double score,
    required double maxScore,
    required double averageTitre,
    required double error,
    required int durationSeconds,
  }) async {
    return await dio.post('/api/sessions', data: {
      'practical_type': 'titration',
      'score': score,
      'max_score': maxScore,
      'average_titre': averageTitre,
      'accuracy_error': error,
      'duration_seconds': durationSeconds,
      'completed_at': DateTime.now().toIso8601String(),
    });
  }

  Future<Response> submitCompositeExam({
    required Map<String, dynamic> examResult,
  }) async {
    return await dio.post('/api/composite/submit', data: examResult);
  }
}
