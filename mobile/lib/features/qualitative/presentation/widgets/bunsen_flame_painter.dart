import 'dart:math';
import 'package:flutter/material.dart';

class BunsenBurnerWidget extends StatefulWidget {
  final Color emissionColor;
  final bool isWireInFlame;

  const BunsenBurnerWidget({
    super.key,
    this.emissionColor = Colors.transparent,
    this.isWireInFlame = false,
  });

  @override
  State<BunsenBurnerWidget> createState() => _BunsenBurnerWidgetState();
}

class _BunsenBurnerWidgetState extends State<BunsenBurnerWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
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
          size: const Size(120, 180),
          painter: BunsenFlamePainter(
            emissionColor: widget.emissionColor,
            isWireInFlame: widget.isWireInFlame,
            flicker: _controller.value,
          ),
        );
      },
    );
  }
}

class BunsenFlamePainter extends CustomPainter {
  final Color emissionColor;
  final bool isWireInFlame;
  final double flicker;

  BunsenFlamePainter({
    required this.emissionColor,
    required this.isWireInFlame,
    required this.flicker,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    final chimneyTopY = size.height - 60.0;
    final burnerBaseY = size.height - 10.0;

    // 1. Bunsen Burner Metal Barrel & Base
    const barrelWidth = 20.0;
    final barrelRect = Rect.fromCenter(
      center: Offset(centerX, chimneyTopY + 25),
      width: barrelWidth,
      height: 50,
    );

    final metalPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF64748B), Color(0xFF94A3B8), Color(0xFF475569)],
      ).createShader(barrelRect);
    canvas.drawRect(barrelRect, metalPaint);

    // Collar air-hole
    final holePaint = Paint()..color = const Color(0xFF0F172A);
    canvas.drawOval(
      Rect.fromCenter(center: Offset(centerX, chimneyTopY + 38), width: 10, height: 10),
      holePaint,
    );

    // Base
    final basePaint = Paint()..color = const Color(0xFF334155);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(centerX, burnerBaseY), width: 70, height: 12),
        const Radius.circular(4),
      ),
      basePaint,
    );

    // 2. Flame Animation & Flickering
    final flickerOffset = sin(flicker * 2 * pi) * 2.5;
    final flameTipY = 20.0 + flickerOffset;

    // Outer Non-Luminous Flame (Hot Blue)
    final outerFlamePaint = Paint()
      ..shader = RadialGradient(
        center: Alignment.bottomCenter,
        radius: 0.85,
        colors: [
          (isWireInFlame && emissionColor != Colors.transparent)
              ? emissionColor.withOpacity(0.85)
              : const Color(0xFF0284C7).withOpacity(0.7),
          const Color(0xFF2563EB).withOpacity(0.15),
          Colors.transparent,
        ],
      ).createShader(Rect.fromLTRB(centerX - 24, flameTipY, centerX + 24, chimneyTopY));

    final outerPath = Path()
      ..moveTo(centerX - 10, chimneyTopY)
      ..quadraticBezierTo(centerX - 26, chimneyTopY - 45, centerX, flameTipY)
      ..quadraticBezierTo(centerX + 26, chimneyTopY - 45, centerX + 10, chimneyTopY)
      ..close();
    canvas.drawPath(outerPath, outerFlamePaint);

    // Inner Dark/Cyan Cone (Unburnt gas cone)
    final innerConePaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.bottomCenter,
        end: Alignment.topCenter,
        colors: [
          const Color(0xFF38BDF8).withOpacity(0.8),
          const Color(0xFF0284C7).withOpacity(0.3),
        ],
      ).createShader(Rect.fromLTRB(centerX - 7, chimneyTopY - 35, centerX + 7, chimneyTopY));

    final innerPath = Path()
      ..moveTo(centerX - 7, chimneyTopY)
      ..quadraticBezierTo(centerX - 10, chimneyTopY - 20, centerX, chimneyTopY - 38)
      ..quadraticBezierTo(centerX + 10, chimneyTopY - 20, centerX + 7, chimneyTopY)
      ..close();
    canvas.drawPath(innerPath, innerConePaint);

    // 3. Platinum/Nichrome Wire Loop in Flame
    if (isWireInFlame) {
      final wirePaint = Paint()
        ..color = const Color(0xFFE2E8F0)
        ..strokeWidth = 2.0;

      // Handle from left
      canvas.drawLine(
        Offset(centerX - 50, chimneyTopY - 35),
        Offset(centerX - 4, chimneyTopY - 35),
        wirePaint,
      );
      // Small loop in flame
      canvas.drawCircle(
        Offset(centerX, chimneyTopY - 35),
        4.0,
        Paint()
          ..color = const Color(0xFFFFE082)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0,
      );

      // Cation Emission Glow Halo
      if (emissionColor != Colors.transparent) {
        final glowPaint = Paint()
          ..color = emissionColor.withOpacity(0.4)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 12);
        canvas.drawCircle(Offset(centerX, chimneyTopY - 35), 16.0, glowPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant BunsenFlamePainter oldDelegate) {
    return oldDelegate.emissionColor != emissionColor ||
        oldDelegate.isWireInFlame != isWireInFlame ||
        oldDelegate.flicker != flicker;
  }
}
