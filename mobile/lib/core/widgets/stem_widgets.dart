import 'package:flutter/material.dart';
import '../theme/stem_colors.dart';
import '../theme/stem_typography.dart';

/// Reusable Stitch-spec STEM Card
class StemCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? borderColor;
  final Color? backgroundColor;

  const StemCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.borderColor,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? StemColors.surfacePanel,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: borderColor ?? StemColors.borderSubtle,
          width: 1,
        ),
      ),
      child: child,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: card,
      );
    }
    return card;
  }
}

/// Stitch-spec Telemetry Badge
class TelemetryBadge extends StatelessWidget {
  final String label;
  final String value;
  final Color statusColor;
  final IconData? icon;

  const TelemetryBadge({
    super.key,
    required this.label,
    required this.value,
    this.statusColor = StemColors.secondary,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: StemColors.surfaceBase,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: StemColors.borderSubtle, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: statusColor,
              boxShadow: [
                BoxShadow(
                  color: statusColor.withOpacity(0.5),
                  blurRadius: 6,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label.toUpperCase(),
            style: StemTypography.textTheme.labelSmall?.copyWith(
              color: StemColors.textMuted,
              fontSize: 10,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            value,
            style: StemTypography.monospaceReadout.copyWith(
              fontSize: 13,
              color: StemColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

/// Stitch-spec Primary & Secondary Button
enum StemButtonType { primary, secondary, danger, success }

class StemButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final StemButtonType type;
  final bool isLoading;

  const StemButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.type = StemButtonType.primary,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    BorderSide border;

    switch (type) {
      case StemButtonType.primary:
        bg = StemColors.primary;
        fg = Colors.white;
        border = BorderSide.none;
        break;
      case StemButtonType.secondary:
        bg = StemColors.surfacePanelElevated;
        fg = Colors.white;
        border = const BorderSide(color: StemColors.borderSubtle, width: 1);
        break;
      case StemButtonType.danger:
        bg = StemColors.labDanger.withOpacity(0.2);
        fg = StemColors.labDanger;
        border = const BorderSide(color: StemColors.labDanger, width: 1);
        break;
      case StemButtonType.success:
        bg = StemColors.labSuccess.withOpacity(0.2);
        fg = StemColors.labSuccess;
        border = const BorderSide(color: StemColors.labSuccess, width: 1);
        break;
    }

    return SizedBox(
      height: 48,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: border,
          ),
        ),
        child: isLoading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18, color: fg),
                    const SizedBox(width: 8),
                  ],
                  Text(label, style: StemTypography.textTheme.labelLarge?.copyWith(color: fg)),
                ],
              ),
      ),
    );
  }
}
