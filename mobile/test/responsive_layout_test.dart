import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auth/presentation/screens/auth_screen.dart';
import 'package:mobile/features/titration/presentation/screens/titration_lab_screen.dart';
import 'package:mobile/features/titration/presentation/widgets/burette_painter.dart';
import 'package:mobile/features/qualitative/presentation/screens/qualitative_lab_screen.dart';
import 'package:mobile/features/exam/presentation/screens/composite_mock_screen.dart';

void main() {
  setUp(() {
    GoogleFonts.config.allowRuntimeFetching = false;
  });

  const compactPhone = Size(320, 640);
  const standardMobile = Size(390, 844);
  const tablet = Size(768, 1024);
  const landscape = Size(844, 390);

  void setViewport(WidgetTester tester, Size size) {
    tester.view.physicalSize = size;
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });
  }

  group('Adaptive Burette Stopcock Widget Tests', () {
    testWidgets('BuretteWidget adapts to compact width (<= 100px) with vertical layout without overflow', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 100,
              height: 400,
              child: BuretteWidget(
                currentVolume: 12.5,
                isDispensing: false,
                flowRate: 0.5,
                onToggleTap: () {},
                onFlowRateChanged: (_) {},
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      // Verify no RenderFlex overflow exception was thrown
      expect(tester.takeException(), isNull);
      expect(find.byType(BuretteWidget), findsOneWidget);
      expect(find.byType(Slider), findsOneWidget);
      expect(find.byIcon(Icons.play_circle_fill), findsOneWidget);
    });

    testWidgets('BuretteWidget expands to row layout when wide (>= 160px)', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 200,
              height: 400,
              child: BuretteWidget(
                currentVolume: 12.5,
                isDispensing: true,
                flowRate: 0.7,
                onToggleTap: () {},
                onFlowRateChanged: (_) {},
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.byIcon(Icons.stop_circle), findsOneWidget);
    });
  });

  group('TitrationLabScreen Responsive Layout Tests', () {
    testWidgets('Renders on compact phone (320x640) without overflow', (tester) async {
      setViewport(tester, compactPhone);

      await tester.pumpWidget(
        MaterialApp(
          home: TitrationLabScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('Titration Workbench (Q1)'), findsOneWidget);
      expect(find.text('BURETTE READING'), findsOneWidget);
      expect(find.text('PH'), findsOneWidget);
      expect(find.text('TRIAL'), findsOneWidget);
    });

    testWidgets('Renders on standard mobile (390x844)', (tester) async {
      setViewport(tester, standardMobile);

      await tester.pumpWidget(
        MaterialApp(
          home: TitrationLabScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.byType(BuretteWidget), findsOneWidget);
    });

    testWidgets('Renders on tablet (768x1024) with responsive layout', (tester) async {
      setViewport(tester, tablet);

      await tester.pumpWidget(
        MaterialApp(
          home: TitrationLabScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.byType(BuretteWidget), findsOneWidget);
    });

    testWidgets('Renders safely on landscape phone (844x390)', (tester) async {
      setViewport(tester, landscape);

      await tester.pumpWidget(
        MaterialApp(
          home: TitrationLabScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('Titration Workbench (Q1)'), findsOneWidget);
    });
  });

  group('QualitativeLabScreen Responsive Layout Tests', () {
    testWidgets('Renders on compact phone (320x640) with touch-safe reagent chips', (tester) async {
      setViewport(tester, compactPhone);

      await tester.pumpWidget(
        MaterialApp(
          home: QualitativeLabScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('Qualitative Salt Analysis (Q2)'), findsOneWidget);
      expect(find.text('2M NaOH (Dropwise)'), findsOneWidget);
      expect(find.text('LIVE OBSERVATION & INFERENCE'), findsOneWidget);
    });

    testWidgets('Renders on landscape phone (844x390) with scroll-protected stage', (tester) async {
      setViewport(tester, landscape);

      await tester.pumpWidget(
        MaterialApp(
          home: QualitativeLabScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('Qualitative Salt Analysis (Q2)'), findsOneWidget);
    });
  });

  group('AuthScreen Responsive Layout Tests', () {
    testWidgets('Renders on compact phone (320x640) with accessible touch targets', (tester) async {
      setViewport(tester, compactPhone);

      await tester.pumpWidget(
        MaterialApp(
          home: AuthScreen(onAuthenticated: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('VirtuLab Kenya'), findsOneWidget);
      expect(find.text('Login'), findsOneWidget);
      expect(find.text('Register'), findsOneWidget);
      expect(find.text('Offline PIN'), findsOneWidget);
    });

    testWidgets('Centers and constrains width on tablet (768x1024)', (tester) async {
      setViewport(tester, tablet);

      await tester.pumpWidget(
        MaterialApp(
          home: AuthScreen(onAuthenticated: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      final constrainedBoxFinder = find.byWidgetPredicate(
        (widget) => widget is ConstrainedBox && widget.constraints.maxWidth == 480,
      );
      expect(constrainedBoxFinder, findsOneWidget);
    });
  });

  group('CompositeMockScreen Responsive Layout Tests', () {
    testWidgets('Renders tabs and timer on compact phone (320x640) without overflow', (tester) async {
      setViewport(tester, compactPhone);

      await tester.pumpWidget(
        MaterialApp(
          home: CompositeMockExamScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('KCSE Mock Exam (40 Mks)'), findsOneWidget);
      expect(find.text('Submit Official KCSE Exam'), findsOneWidget);
    });

    testWidgets('Constrains content width on tablet (768x1024)', (tester) async {
      setViewport(tester, tablet);

      await tester.pumpWidget(
        MaterialApp(
          home: CompositeMockExamScreen(onBack: () {}),
        ),
      );
      await tester.pump();

      expect(tester.takeException(), isNull);
      final constrainedBoxFinder = find.byWidgetPredicate(
        (widget) => widget is ConstrainedBox && widget.constraints.maxWidth == 840,
      );
      expect(constrainedBoxFinder, findsAtLeastNWidgets(1));
    });
  });
}
