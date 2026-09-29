import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/stem_theme.dart';
import 'core/storage/local_storage.dart';
import 'features/auth/presentation/screens/auth_screen.dart';
import 'features/dashboard/presentation/screens/student_dashboard_screen.dart';
import 'features/titration/presentation/screens/titration_lab_screen.dart';
import 'features/qualitative/presentation/screens/qualitative_lab_screen.dart';
import 'features/exam/presentation/screens/composite_mock_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalStorage.init();
  runApp(const ProviderScope(child: VirtuLabApp()));
}

class VirtuLabApp extends StatefulWidget {
  const VirtuLabApp({super.key});

  @override
  State<VirtuLabApp> createState() => _VirtuLabAppState();
}

class _VirtuLabAppState extends State<VirtuLabApp> {
  bool _isAuthenticated = false;
  String _currentRoute = 'dashboard'; // 'dashboard', 'titration', 'qualitative', 'mock_exam'

  @override
  void initState() {
    super.initState();
    _checkInitialAuth();
  }

  Future<void> _checkInitialAuth() async {
    final user = await LocalStorage.getUser();
    if (user != null) {
      setState(() => _isAuthenticated = true);
    }
  }

  void _navigateTo(String route) {
    setState(() => _currentRoute = route);
  }

  void _onLogout() async {
    await LocalStorage.clearAuth();
    setState(() {
      _isAuthenticated = false;
      _currentRoute = 'dashboard';
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VirtuLab Kenya',
      debugShowCheckedModeBanner: false,
      theme: StemTheme.darkTheme,
      home: !_isAuthenticated
          ? AuthScreen(
              onAuthenticated: () => setState(() => _isAuthenticated = true),
            )
          : _buildCurrentScreen(),
    );
  }

  Widget _buildCurrentScreen() {
    switch (_currentRoute) {
      case 'titration':
        return TitrationLabScreen(onBack: () => _navigateTo('dashboard'));
      case 'qualitative':
        return QualitativeLabScreen(onBack: () => _navigateTo('dashboard'));
      case 'mock_exam':
        return CompositeMockExamScreen(onBack: () => _navigateTo('dashboard'));
      case 'dashboard':
      default:
        return StudentDashboardScreen(
          onOpenTitration: () => _navigateTo('titration'),
          onOpenQualitative: () => _navigateTo('qualitative'),
          onOpenMockExam: () => _navigateTo('mock_exam'),
          onLogout: _onLogout,
        );
    }
  }
}
