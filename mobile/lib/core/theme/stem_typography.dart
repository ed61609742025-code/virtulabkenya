import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'stem_colors.dart';

/// Typography specification from Stitch 'STEM Workbench'
/// Headlines: Plus Jakarta Sans
/// Body, Labels, and Monospace Readouts: Inter
class StemTypography {
  static TextTheme textTheme = TextTheme(
    displayLarge: GoogleFonts.plusJakartaSans(
      fontSize: 32,
      fontWeight: FontWeight.w700,
      color: StemColors.textPrimary,
      letterSpacing: -0.5,
    ),
    displayMedium: GoogleFonts.plusJakartaSans(
      fontSize: 26,
      fontWeight: FontWeight.w700,
      color: StemColors.textPrimary,
      letterSpacing: -0.3,
    ),
    headlineMedium: GoogleFonts.plusJakartaSans(
      fontSize: 22,
      fontWeight: FontWeight.w600,
      color: StemColors.textPrimary,
      letterSpacing: -0.2,
    ),
    headlineSmall: GoogleFonts.plusJakartaSans(
      fontSize: 18,
      fontWeight: FontWeight.w600,
      color: StemColors.textPrimary,
    ),
    titleMedium: GoogleFonts.plusJakartaSans(
      fontSize: 16,
      fontWeight: FontWeight.w600,
      color: StemColors.textPrimary,
    ),
    bodyLarge: GoogleFonts.inter(
      fontSize: 16,
      fontWeight: FontWeight.w400,
      color: StemColors.textPrimary,
    ),
    bodyMedium: GoogleFonts.inter(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: StemColors.textSecondary,
    ),
    bodySmall: GoogleFonts.inter(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: StemColors.textMuted,
    ),
    labelLarge: GoogleFonts.inter(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      color: StemColors.textPrimary,
      letterSpacing: 0.2,
    ),
    labelMedium: GoogleFonts.inter(
      fontSize: 12,
      fontWeight: FontWeight.w500,
      color: StemColors.textSecondary,
      letterSpacing: 0.3,
    ),
    labelSmall: GoogleFonts.inter(
      fontSize: 11,
      fontWeight: FontWeight.w600,
      color: StemColors.textSecondary,
      letterSpacing: 0.5,
    ),
  );

  static TextStyle monospaceReadout = GoogleFonts.jetBrainsMono(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: StemColors.secondary,
    letterSpacing: 0.5,
  );
}
