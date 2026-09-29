import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';

class MeniscusZoomViewfinder extends StatelessWidget {
  final double currentVolume;

  const MeniscusZoomViewfinder({super.key, required this.currentVolume});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 130,
      height: 130,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: StemColors.surfacePanel,
        border: Border.all(color: StemColors.borderFocus, width: 2),
        boxShadow: [
          BoxShadow(
            color: StemColors.primaryGlow,
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ClipOval(
        child: Stack(
          children: [
            CustomPaint(
              size: const Size(130, 130),
              painter: MeniscusMagnifierPainter(volume: currentVolume),
            ),
            Positioned(
              bottom: 6,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '10x LENS (0.05 cm³)',
                    style: TextStyle(
                      color: StemColors.secondary,
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MeniscusMagnifierPainter extends CustomPainter {
  final double volume;

  MeniscusMagnifierPainter({required this.volume});

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    final centerY = size.height / 2;

    // Background tint
    final bgPaint = Paint()..color = const Color(0xFF0F172A);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Crosshairs
    final crosshairPaint = Paint()
      ..color = Colors.white.withOpacity(0.15)
      ..strokeWidth = 1.0;
    canvas.drawLine(Offset(centerX, 0), Offset(centerX, size.height), crosshairPaint);
    canvas.drawLine(Offset(0, centerY), Offset(size.width, centerY), crosshairPaint);

    // Magnified Liquid Curve
    final liquidPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          const Color(0xFF0284C7).withOpacity(0.25),
          const Color(0xFF0284C7).withOpacity(0.75),
        ],
      ).createShader(Rect.fromLTWH(0, centerY, size.width, size.height - centerY));

    // Meniscus parabolic bottom rests directly on the vertical center line
    final meniscusPath = Path()
      ..moveTo(0, centerY - 15)
      ..quadraticBezierTo(centerX, centerY + 8, size.width, centerY - 15)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(meniscusPath, liquidPaint);

    // Sharp Meniscus boundary curve
    final linePaint = Paint()
      ..color = StemColors.secondary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    final curvePath = Path()
      ..moveTo(0, centerY - 15)
      ..quadraticBezierTo(centerX, centerY + 8, size.width, centerY - 15);
    canvas.drawPath(curvePath, linePaint);

    // Magnified graduation ticks on right side
    final tickPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.5;
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    final baseInt = volume.floor();
    for (int offset = -2; offset <= 2; offset++) {
      final markVol = baseInt + offset;
      if (markVol < 0 || markVol > 50) continue;

      // Position relative to current volume
      final delta = markVol - volume;
      final y = centerY + (delta * 40.0);

      if (y >= 10 && y <= size.height - 10) {
        // Major tick
        canvas.drawLine(Offset(size.width - 25, y), Offset(size.width - 5, y), tickPaint);

        textPainter.text = TextSpan(
          text: '$markVol',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 10,
            fontWeight: FontWeight.bold,
          ),
        );
        textPainter.layout();
        textPainter.paint(canvas, Offset(size.width - 45, y - 6));

        // Sub-ticks (0.1 cm3 increments)
        for (int sub = 1; sub < 10; sub++) {
          final subY = y + (sub * 4.0);
          if (subY >= 10 && subY <= size.height - 10) {
            canvas.drawLine(
              Offset(size.width - (sub == 5 ? 18 : 12), subY),
              Offset(size.width - 5, subY),
              Paint()
                ..color = Colors.white.withOpacity(0.6)
                ..strokeWidth = 1.0,
            );
          }
        }
      }
    }

    // Indicator of reading line (read bottom of curve)
    final pointerPaint = Paint()
      ..color = StemColors.labWarning
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    canvas.drawLine(Offset(centerX - 15, centerY + 8), Offset(centerX + 15, centerY + 8), pointerPaint);
  }

  @override
  bool shouldRepaint(covariant MeniscusMagnifierPainter oldDelegate) {
    return oldDelegate.volume != volume;
  }
}
