import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) async {
      final user = await LocalStorage.getUser();
      final isAuthenticated = user != null;
      final isAuthRoute = state.matchedLocation == '/auth';

      if (!isAuthenticated && !isAuthRoute) {
        return '/auth';
      }
      if (isAuthenticated && (isAuthRoute || state.matchedLocation == '/')) {
        return '/dashboard';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      ),
      GoRoute(
        path: '/auth',
        builder: (context, state) => AuthScreen(
          onAuthenticated: () => context.go('/dashboard'),
        ),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => StudentDashboardScreen(
          onOpenTitration: () => context.push('/titration'),
          onOpenQualitative: () => context.push('/qualitative'),
          onOpenMockExam: () => context.push('/mock_exam'),
          onLogout: () async {
            await LocalStorage.clearAuth();
            if (context.mounted) {
              context.go('/auth');
            }
          },
        ),
      ),
      GoRoute(
        path: '/titration',
        builder: (context, state) => TitrationLabScreen(
          onBack: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/dashboard');
            }
          },
        ),
      ),
      GoRoute(
        path: '/qualitative',
        builder: (context, state) => QualitativeLabScreen(
          onBack: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/dashboard');
            }
          },
        ),
      ),
      GoRoute(
        path: '/mock_exam',
        builder: (context, state) => CompositeMockExamScreen(
          onBack: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/dashboard');
            }
          },
        ),
      ),
    ],
  );
});

class VirtuLabApp extends ConsumerWidget {
  const VirtuLabApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'VirtuLab Kenya',
      debugShowCheckedModeBanner: false,
      theme: StemTheme.darkTheme,
      routerConfig: router,
    );
  }
}
