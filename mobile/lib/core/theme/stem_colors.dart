import 'package:flutter/material.dart';

/// Design tokens derived from Stitch 'STEM Workbench' Design System
/// Project: VirtuLab Design System (projects/9275356646092054097)
/// Asset: assets/80acf99ed1214ccdac7ec4ec446d3e21
class StemColors {
  // Canvas & Surfaces
  static const Color surfaceBase = Color(0xFF0B0F19);
  static const Color surfacePanel = Color(0xFF111827);
  static const Color surfacePanelElevated = Color(0xFF1E293B);
  static const Color surfaceContainer = Color(0xFF1C1F2A);
  static const Color surfaceBright = Color(0xFF353944);

  // Borders & Dividers
  static const Color borderSubtle = Color(0xFF1E293B);
  static const Color borderFocus = Color(0xFF38BDF8);

  // Primary & Accents
  static const Color primary = Color(0xFF0284C7);
  static const Color primaryHover = Color(0xFF0369A1);
  static const Color primaryFixed = Color(0xFFCCE5FF);
  static const Color primaryGlow = Color(0x5938BDF8);
  static const Color secondary = Color(0xFF38BDF8);

  // Lab Telemetry & Status Accents
  static const Color labSuccess = Color(0xFF10B981); // Emerald / passed
  static const Color labWarning = Color(0xFFF59E0B); // Amber / caution
  static const Color labDanger = Color(0xFFEF4444);  // Crimson / hazard

  // Typography Tokens
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Glassware & Solution Aesthetics
  static const Color borosilicateGlass = Color(0x33A0C4E2);
  static const Color glassHighlight = Color(0x66FFFFFF);
  static const Color meniscusLine = Color(0xFF38BDF8);

  // Bunsen Flame Tones
  static const Color flameCool = Color(0xFFFFB800); // Luminous yellow
  static const Color flameHotOuter = Color(0xFF2563EB); // Non-luminous blue
  static const Color flameHotInner = Color(0xFF0EA5E9); // Inner cone light cyan
}
