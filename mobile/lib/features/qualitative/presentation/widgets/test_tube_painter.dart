import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';

class TestTubeWidget extends StatelessWidget {
  final Color solutionColor;
  final Color precipitateColor;
  final bool hasPrecipitate;
  final bool isSolubleInExcess;
  final String label;

  const TestTubeWidget({
    super.key,
    required this.solutionColor,
    required this.precipitateColor,
    required this.hasPrecipitate,
    required this.isSolubleInExcess,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        CustomPaint(
          size: const Size(60, 150),
          painter: TestTubePainter(
            solutionColor: solutionColor,
            precipitateColor: precipitateColor,
            hasPrecipitate: hasPrecipitate,
            isSolubleInExcess: isSolubleInExcess,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: StemColors.surfacePanel,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: StemColors.borderSubtle),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: StemColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}

class TestTubePainter extends CustomPainter {
  final Color solutionColor;
  final Color precipitateColor;
  final bool hasPrecipitate;
  final bool isSolubleInExcess;

  TestTubePainter({
    required this.solutionColor,
    required this.precipitateColor,
    required this.hasPrecipitate,
    required this.isSolubleInExcess,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    const tubeWidth = 24.0;
    final tubeLeft = centerX - (tubeWidth / 2);
    final tubeRight = centerX + (tubeWidth / 2);
    const topY = 10.0;
    final bottomY = size.height - 18.0;

    // 1. Solution Liquid
    const liquidTopY = 60.0;
    final liquidPath = Path()
      ..moveTo(tubeLeft + 1, liquidTopY)
      ..lineTo(tubeLeft + 1, bottomY)
      ..quadraticBezierTo(centerX, bottomY + 14, tubeRight - 1, bottomY)
      ..lineTo(tubeRight - 1, liquidTopY)
      ..close();

    final liquidPaint = Paint()..color = solutionColor;
    canvas.drawPath(liquidPath, liquidPaint);

    // 2. Precipitate Cloud / Settled Layer
    if (hasPrecipitate && !isSolubleInExcess) {
      // Turbid cloudy layer
      final pptPaint = Paint()..color = precipitateColor.withOpacity(0.85);
      final pptPath = Path()
        ..moveTo(tubeLeft + 2, bottomY - 20)
        ..lineTo(tubeLeft + 2, bottomY)
        ..quadraticBezierTo(centerX, bottomY + 12, tubeRight - 2, bottomY)
        ..lineTo(tubeRight - 2, bottomY - 20)
        ..quadraticBezierTo(centerX, bottomY - 14, tubeLeft + 2, bottomY - 20)
        ..close();
      canvas.drawPath(pptPath, pptPaint);

      // Cloudy suspension stipple dots
      final speckPaint = Paint()..color = precipitateColor.withOpacity(0.6);
      for (int i = 0; i < 8; i++) {
        canvas.drawCircle(
          Offset(tubeLeft + 4 + (i * 2.2), bottomY - 30 - (i % 3 * 6)),
          1.2,
          speckPaint,
        );
      }
    }

    // 3. Borosilicate Glass Test Tube
    final tubeOutline = Path()
      // Lip rim
      ..moveTo(tubeLeft - 3, topY)
      ..lineTo(tubeRight + 3, topY)
      ..lineTo(tubeRight + 1, topY + 4)
      ..lineTo(tubeRight, bottomY)
      // Hemispherical bottom
      ..arcToPoint(
        Offset(tubeLeft, bottomY),
        radius: const Radius.circular(tubeWidth / 2),
        clockwise: true,
      )
      ..lineTo(tubeLeft, topY + 4)
      ..lineTo(tubeLeft - 3, topY)
      ..close();

    final glassPaint = Paint()
      ..color = const Color(0x99FFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8;
    canvas.drawPath(tubeOutline, glassPaint);

    // Sheen reflection down the left wall
    final sheenPaint = Paint()
      ..color = Colors.white.withOpacity(0.2)
      ..strokeWidth = 2.0;
    canvas.drawLine(Offset(tubeLeft + 3, topY + 8), Offset(tubeLeft + 3, bottomY - 5), sheenPaint);
  }

  @override
  bool shouldRepaint(covariant TestTubePainter oldDelegate) {
    return oldDelegate.solutionColor != solutionColor ||
        oldDelegate.precipitateColor != precipitateColor ||
        oldDelegate.hasPrecipitate != hasPrecipitate ||
        oldDelegate.isSolubleInExcess != isSolubleInExcess;
  }
}
