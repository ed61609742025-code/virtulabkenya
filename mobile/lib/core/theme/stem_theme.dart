import 'package:flutter/material.dart';
import 'stem_colors.dart';
import 'stem_typography.dart';

class StemTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: StemColors.surfaceBase,
      colorScheme: const ColorScheme.dark(
        primary: StemColors.primary,
        onPrimary: Colors.white,
        primaryContainer: StemColors.surfacePanelElevated,
        onPrimaryContainer: StemColors.secondary,
        secondary: StemColors.secondary,
        surface: StemColors.surfacePanel,
        onSurface: StemColors.textPrimary,
        error: StemColors.labDanger,
      ),
      textTheme: StemTypography.textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: StemColors.surfacePanel,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: StemTypography.textTheme.headlineSmall,
        iconTheme: const IconThemeData(color: StemColors.secondary),
        shape: const Border(
          bottom: BorderSide(color: StemColors.borderSubtle, width: 1),
        ),
      ),
      cardTheme: CardThemeData(
        color: StemColors.surfacePanel,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: StemColors.borderSubtle, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: StemColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: StemTypography.textTheme.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: const BorderSide(color: StemColors.borderSubtle, width: 1),
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: StemTypography.textTheme.labelLarge,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: StemColors.surfacePanel,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: StemTypography.textTheme.bodyMedium?.copyWith(
          color: StemColors.textMuted,
        ),
        labelStyle: StemTypography.textTheme.bodyMedium?.copyWith(
          color: StemColors.textSecondary,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: StemColors.borderSubtle, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: StemColors.borderFocus, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: StemColors.labDanger, width: 1),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: StemColors.borderSubtle,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
