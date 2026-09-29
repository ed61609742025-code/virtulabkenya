import 'dart:math';
import 'package:flutter/material.dart';

class ConicalFlaskWidget extends StatefulWidget {
  final double currentVolume; // total volume in flask in cm3
  final Color solutionColor;
  final bool isSwirling;

  const ConicalFlaskWidget({
    super.key,
    required this.currentVolume,
    required this.solutionColor,
    this.isSwirling = false,
  });

  @override
  State<ConicalFlaskWidget> createState() => _ConicalFlaskWidgetState();
}

class _ConicalFlaskWidgetState extends State<ConicalFlaskWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          size: const Size(160, 160),
          painter: ConicalFlaskPainter(
            volume: widget.currentVolume,
            solutionColor: widget.solutionColor,
            isSwirling: widget.isSwirling,
            animationProgress: _controller.value,
          ),
        );
      },
    );
  }
}

class ConicalFlaskPainter extends CustomPainter {
  final double volume; // 25.0 to ~75.0 cm3
  final Color solutionColor;
  final bool isSwirling;
  final double animationProgress;

  ConicalFlaskPainter({
    required this.volume,
    required this.solutionColor,
    required this.isSwirling,
    required this.animationProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    const neckWidth = 32.0;
    final neckLeft = centerX - (neckWidth / 2);
    final neckRight = centerX + (neckWidth / 2);
    const neckTop = 15.0;
    const neckBottom = 50.0;

    const baseWidth = 130.0;
    final baseLeft = centerX - (baseWidth / 2);
    final baseRight = centerX + (baseWidth / 2);
    final flaskBottom = size.height - 15.0;

    // 1. Solution Liquid Inside Conical Flask
    // Volume starts at 25 cm3, maxes around 75 cm3
    final fillFraction = (volume / 100.0).clamp(0.20, 0.75);
    final liquidHeight = (flaskBottom - neckBottom) * fillFraction;
    final liquidTopY = flaskBottom - liquidHeight;

    // Calculate width of the flask at liquidTopY (conical interpolation)
    final conicalProgress = (liquidTopY - neckBottom) / (flaskBottom - neckBottom);
    final currentWidth = neckWidth + ((baseWidth - neckWidth) * conicalProgress);
    final currentLeft = centerX - (currentWidth / 2);
    final currentRight = centerX + (currentWidth / 2);

    // Wave / Swirl displacement
    final waveOffset = isSwirling ? sin(animationProgress * 2 * pi) * 3.5 : 0.0;

    final liquidPath = Path()
      ..moveTo(baseLeft + 6, flaskBottom - 2)
      ..lineTo(currentLeft + 2, liquidTopY + waveOffset)
      ..quadraticBezierTo(centerX, liquidTopY - 3 + waveOffset, currentRight - 2, liquidTopY + waveOffset)
      ..lineTo(baseRight - 6, flaskBottom - 2)
      ..quadraticBezierTo(centerX, flaskBottom + 3, baseLeft + 6, flaskBottom - 2)
      ..close();

    final liquidPaint = Paint()..color = solutionColor;
    canvas.drawPath(liquidPath, liquidPaint);

    // Liquid surface ring reflection
    final liquidRingPaint = Paint()
      ..color = Colors.white.withOpacity(0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(centerX, liquidTopY + waveOffset),
        width: currentWidth - 4,
        height: 6,
      ),
      liquidRingPaint,
    );

    // 2. Glass Outline of Flask
    final flaskOutline = Path()
      // Lip at top of neck
      ..moveTo(neckLeft - 4, neckTop)
      ..lineTo(neckRight + 4, neckTop)
      ..lineTo(neckRight + 2, neckTop + 4)
      // Neck down to conical shoulder
      ..lineTo(neckRight, neckBottom)
      // Slanted conical body
      ..lineTo(baseRight, flaskBottom)
      // Rounded bottom corners & slightly curved base
      ..quadraticBezierTo(baseRight, flaskBottom + 6, baseRight - 10, flaskBottom + 6)
      ..lineTo(baseLeft + 10, flaskBottom + 6)
      ..quadraticBezierTo(baseLeft, flaskBottom + 6, baseLeft, flaskBottom)
      ..lineTo(neckLeft, neckBottom)
      ..lineTo(neckLeft - 2, neckTop + 4)
      ..close();

    final glassBorderPaint = Paint()
      ..color = const Color(0x99FFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawPath(flaskOutline, glassBorderPaint);

    // Glass sheen reflections
    final sheenPaint = Paint()
      ..color = Colors.white.withOpacity(0.18)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;

    final sheenPath = Path()
      ..moveTo(neckLeft + 3, neckBottom + 5)
      ..lineTo(baseLeft + 15, flaskBottom - 4);
    canvas.drawPath(sheenPath, sheenPaint);

    // Volume graduation marks on flask side (e.g. 50, 100, 150 ml)
    final markPaint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..strokeWidth = 1.0;
    for (double f = 0.3; f <= 0.7; f += 0.2) {
      final y = flaskBottom - ((flaskBottom - neckBottom) * f);
      final p = (y - neckBottom) / (flaskBottom - neckBottom);
      final w = neckWidth + ((baseWidth - neckWidth) * p);
      canvas.drawLine(Offset(centerX + (w / 2) - 14, y), Offset(centerX + (w / 2) - 4, y), markPaint);
    }
  }

  @override
  bool shouldRepaint(covariant ConicalFlaskPainter oldDelegate) {
    return oldDelegate.volume != volume ||
        oldDelegate.solutionColor != solutionColor ||
        oldDelegate.isSwirling != isSwirling ||
        oldDelegate.animationProgress != animationProgress;
  }
}
