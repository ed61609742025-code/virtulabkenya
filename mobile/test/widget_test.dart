import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auth/presentation/screens/auth_screen.dart';

void main() {
  setUp(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  testWidgets('AuthScreen renders login and offline mode options', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AuthScreen(onAuthenticated: () {}),
      ),
    );

    await tester.pump();

    // Verify VirtuLab branding and elements
    expect(find.text('VirtuLab Kenya'), findsOneWidget);
    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Register'), findsOneWidget);
    expect(find.text('Offline PIN'), findsOneWidget);
    expect(find.text('Sign In to Laboratory'), findsOneWidget);
  });
}
