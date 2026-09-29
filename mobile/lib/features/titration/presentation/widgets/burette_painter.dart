import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';

class BuretteWidget extends StatelessWidget {
  final double currentVolume; // 0.00 to 50.00 cm3
  final bool isDispensing;
  final VoidCallback onToggleTap;
  final ValueChanged<double> onFlowRateChanged;
  final double flowRate; // 0.0 (closed) to 1.0 (fast)

  const BuretteWidget({
    super.key,
    required this.currentVolume,
    required this.isDispensing,
    required this.onToggleTap,
    required this.onFlowRateChanged,
    this.flowRate = 0.5,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: CustomPaint(
            size: const Size(80, double.infinity),
            painter: BurettePainter(
              currentVolume: currentVolume,
              isDispensing: isDispensing,
            ),
          ),
        ),
        const SizedBox(height: 8),
        // Tactile Stopcock Valve Controller
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: StemColors.surfacePanel,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: StemColors.borderSubtle),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: Icon(
                  isDispensing ? Icons.stop_circle : Icons.play_circle_fill,
                  color: isDispensing ? StemColors.labDanger : StemColors.labSuccess,
                  size: 32,
                ),
                onPressed: onToggleTap,
                tooltip: isDispensing ? 'Close Stopcock' : 'Open Stopcock (Dropwise)',
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 100,
                child: SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: StemColors.primary,
                    thumbColor: StemColors.secondary,
                    trackHeight: 3,
                  ),
                  child: Slider(
                    value: flowRate,
                    min: 0.1,
                    max: 1.0,
                    onChanged: onFlowRateChanged,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class BurettePainter extends CustomPainter {
  final double currentVolume;
  final bool isDispensing;

  BurettePainter({
    required this.currentVolume,
    required this.isDispensing,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final centerX = size.width / 2;
    const tubeWidth = 24.0;
    final tubeLeft = centerX - (tubeWidth / 2);
    final tubeRight = centerX + (tubeWidth / 2);
    final topY = 20.0;
    final bottomY = size.height - 40.0;
    final totalHeight = bottomY - topY;

    // 1. Draw Burette Stand Clamp
    final clampPaint = Paint()
      ..color = const Color(0xFF475569)
      ..strokeWidth = 4.0;
    canvas.drawLine(Offset(centerX - 35, topY + 50), Offset(tubeLeft, topY + 50), clampPaint);
    canvas.drawCircle(Offset(centerX - 35, topY + 50), 5, clampPaint);

    // 2. Liquid Column
    // Burette 0.0 is at the top, 50.0 is at the bottom
    final fractionFilled = (50.0 - currentVolume.clamp(0.0, 50.0)) / 50.0;
    final liquidTopY = bottomY - (totalHeight * fractionFilled);

    final liquidPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
        colors: [
          const Color(0xFF38BDF8).withOpacity(0.35),
          const Color(0xFF0284C7).withOpacity(0.55),
          const Color(0xFF38BDF8).withOpacity(0.40),
        ],
      ).createShader(Rect.fromLTRB(tubeLeft, liquidTopY, tubeRight, bottomY));

    final liquidPath = Path()
      ..moveTo(tubeLeft + 1, bottomY)
      ..lineTo(tubeLeft + 1, liquidTopY)
      ..quadraticBezierTo(centerX, liquidTopY + 4, tubeRight - 1, liquidTopY) // Concave meniscus
      ..lineTo(tubeRight - 1, bottomY)
      ..close();
    canvas.drawPath(liquidPath, liquidPaint);

    // Meniscus highlight line
    final meniscusPaint = Paint()
      ..color = StemColors.secondary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    final meniscusPath = Path()
      ..moveTo(tubeLeft + 2, liquidTopY)
      ..quadraticBezierTo(centerX, liquidTopY + 4, tubeRight - 2, liquidTopY);
    canvas.drawPath(meniscusPath, meniscusPaint);

    // 3. Borosilicate Glass Tube Walls & Reflection
    final glassPaint = Paint()
      ..color = const Color(0x66FFFFFF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8;
    canvas.drawRect(Rect.fromLTRB(tubeLeft, topY, tubeRight, bottomY), glassPaint);

    // Glass sheen reflection down the left side
    final sheenPaint = Paint()
      ..color = Colors.white.withOpacity(0.2)
      ..strokeWidth = 2.0;
    canvas.drawLine(Offset(tubeLeft + 3, topY + 10), Offset(tubeLeft + 3, bottomY - 10), sheenPaint);

    // 4. Graduations (Ticks and numbers)
    final tickPaint = Paint()
      ..color = const Color(0xFFCBD5E1)
      ..strokeWidth = 1.0;
    final majorTickPaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.5;

    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    for (int vol = 0; vol <= 50; vol += 5) {
      final y = topY + (totalHeight * (vol / 50.0));
      // Major tick on right
      canvas.drawLine(Offset(tubeRight, y), Offset(tubeRight - 7, y), majorTickPaint);

      // Number text on the right of the burette
      textPainter.text = TextSpan(
        text: '$vol',
        style: const TextStyle(
          color: Color(0xFF94A3B8),
          fontSize: 8,
          fontWeight: FontWeight.bold,
        ),
      );
      textPainter.layout();
      textPainter.paint(canvas, Offset(tubeRight + 4, y - 5));

      // Minor ticks
      if (vol < 50) {
        for (int m = 1; m < 5; m++) {
          final minorY = topY + (totalHeight * ((vol + m) / 50.0));
          canvas.drawLine(Offset(tubeRight, minorY), Offset(tubeRight - 4, minorY), tickPaint);
        }
      }
    }

    // 5. Stopcock & Tip
    final stopcockPaint = Paint()
      ..color = const Color(0xFF64748B)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(centerX, bottomY + 10), 6, stopcockPaint);

    // Tip jet
    final tipPath = Path()
      ..moveTo(centerX - 3, bottomY)
      ..lineTo(centerX - 1.5, bottomY + 25)
      ..lineTo(centerX + 1.5, bottomY + 25)
      ..lineTo(centerX + 3, bottomY)
      ..close();
    canvas.drawPath(tipPath, glassPaint..style = PaintingStyle.fill);

    // Droplet falling when dispensing
    if (isDispensing) {
      final dropPaint = Paint()..color = StemColors.secondary;
      canvas.drawCircle(Offset(centerX, bottomY + 34), 2.5, dropPaint);
    }
  }

  @override
  bool shouldRepaint(covariant BurettePainter oldDelegate) {
    return oldDelegate.currentVolume != currentVolume ||
        oldDelegate.isDispensing != isDispensing;
  }
}
