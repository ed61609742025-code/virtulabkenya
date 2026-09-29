import 'package:flutter/material.dart';

enum Reagent {
  naoh,          // 2M Sodium hydroxide
  ammonia,       // 2M Aqueous Ammonia
  bariumNitrate, // Ba(NO3)2
  silverNitrate, // AgNO3
  nitricAcid,    // Dilute HNO3
  hydrochloric,  // Dilute HCl
  kmno4,         // Acidified KMnO4
}

enum FlameCation {
  sodium,    // Na+ -> Persistent Golden Yellow
  potassium, // K+ -> Lilac
  calcium,   // Ca2+ -> Brick Red
  copper,    // Cu2+ -> Green / Blue-Green
  barium,    // Ba2+ -> Apple Green
  none,      // No distinctive flame
}

class SaltDefinition {
  final String id; // 'A', 'B', 'C', ...
  final String name;
  final String formula;
  final String cation;
  final String anion;
  final FlameCation flameCation;
  final String description;

  const SaltDefinition({
    required this.id,
    required this.name,
    required this.formula,
    required this.cation,
    required this.anion,
    required this.flameCation,
    required this.description,
  });
}

class ReactionResult {
  final String observation;
  final String inference;
  final Color precipitateColor;
  final bool hasPrecipitate;
  final bool isSolubleInExcess;
  final String gasEvolved; // e.g. "Effervescence of CO2", "SO2 pungent gas", "none"

  const ReactionResult({
    required this.observation,
    required this.inference,
    required this.precipitateColor,
    required this.hasPrecipitate,
    required this.isSolubleInExcess,
    this.gasEvolved = 'none',
  });
}

class QualitativeEngine {
  static const List<SaltDefinition> availableSalts = [
    SaltDefinition(
      id: 'Salt A',
      name: 'Zinc Sulfate',
      formula: 'ZnSO4',
      cation: 'Zn2+',
      anion: 'SO4 2-',
      flameCation: FlameCation.none,
      description: 'White crystalline solid soluble in water forming a colorless solution.',
    ),
    SaltDefinition(
      id: 'Salt B',
      name: 'Lead(II) Nitrate',
      formula: 'Pb(NO3)2',
      cation: 'Pb2+',
      anion: 'NO3 -',
      flameCation: FlameCation.none,
      description: 'White solid soluble in water forming a clear colorless solution.',
    ),
    SaltDefinition(
      id: 'Salt C',
      name: 'Iron(II) Sulfate',
      formula: 'FeSO4',
      cation: 'Fe2+',
      anion: 'SO4 2-',
      flameCation: FlameCation.none,
      description: 'Pale green crystals soluble in water forming a pale green solution.',
    ),
    SaltDefinition(
      id: 'Salt D',
      name: 'Sodium Sulfite',
      formula: 'Na2SO3',
      cation: 'Na+',
      anion: 'SO3 2-',
      flameCation: FlameCation.sodium,
      description: 'White powder soluble in water forming a clear solution.',
    ),
    SaltDefinition(
      id: 'Salt E',
      name: 'Copper(II) Chloride',
      formula: 'CuCl2',
      cation: 'Cu2+',
      anion: 'Cl-',
      flameCation: FlameCation.copper,
      description: 'Blue-green crystals dissolving to form a vibrant blue solution.',
    ),
    SaltDefinition(
      id: 'Salt F',
      name: 'Iron(III) Chloride',
      formula: 'FeCl3',
      cation: 'Fe3+',
      anion: 'Cl-',
      flameCation: FlameCation.none,
      description: 'Yellow-brown solid dissolving to form a reddish-brown solution.',
    ),
    SaltDefinition(
      id: 'Salt G',
      name: 'Calcium Chloride',
      formula: 'CaCl2',
      cation: 'Ca2+',
      anion: 'Cl-',
      flameCation: FlameCation.calcium,
      description: 'Deliquescent white solid soluble in water.',
    ),
    SaltDefinition(
      id: 'Salt H',
      name: 'Barium Chloride',
      formula: 'BaCl2',
      cation: 'Ba2+',
      anion: 'Cl-',
      flameCation: FlameCation.barium,
      description: 'White crystalline solid soluble in water.',
    ),
  ];

  /// Simulates adding a chemical reagent to a salt solution
  static ReactionResult testReagent(SaltDefinition salt, Reagent reagent, {bool isExcess = false}) {
    switch (reagent) {
      case Reagent.naoh:
        if (salt.cation == 'Zn2+') {
          return ReactionResult(
            observation: isExcess
                ? 'White precipitate dissolves in excess to form a clear colorless solution'
                : 'White gelatinous precipitate formed',
            inference: 'Zn2+, Al3+, or Pb2+ present',
            precipitateColor: Colors.white,
            hasPrecipitate: !isExcess,
            isSolubleInExcess: true,
          );
        } else if (salt.cation == 'Pb2+') {
          return ReactionResult(
            observation: isExcess
                ? 'White precipitate dissolves in excess forming a colorless solution'
                : 'White precipitate formed',
            inference: 'Pb2+ present',
            precipitateColor: Colors.white,
            hasPrecipitate: !isExcess,
            isSolubleInExcess: true,
          );
        } else if (salt.cation == 'Fe2+') {
          return ReactionResult(
            observation: isExcess
                ? 'Dirty green precipitate remains insoluble in excess'
                : 'Dirty green precipitate formed',
            inference: 'Fe2+ present',
            precipitateColor: const Color(0xFF2E7D32),
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else if (salt.cation == 'Fe3+') {
          return ReactionResult(
            observation: isExcess
                ? 'Reddish-brown precipitate remains insoluble in excess'
                : 'Reddish-brown precipitate formed',
            inference: 'Fe3+ present',
            precipitateColor: const Color(0xFF8D6E63),
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else if (salt.cation == 'Cu2+') {
          return ReactionResult(
            observation: isExcess
                ? 'Pale blue precipitate remains insoluble in excess'
                : 'Pale blue precipitate formed',
            inference: 'Cu2+ present',
            precipitateColor: const Color(0xFF03A9F4),
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else if (salt.cation == 'Ca2+') {
          return ReactionResult(
            observation: isExcess
                ? 'White precipitate remains insoluble in excess'
                : 'White precipitate formed',
            inference: 'Ca2+ present',
            precipitateColor: Colors.white,
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else {
          return const ReactionResult(
            observation: 'No precipitate formed; solution remains colorless',
            inference: 'Na+, K+, or NH4+ present',
            precipitateColor: Colors.transparent,
            hasPrecipitate: false,
            isSolubleInExcess: false,
          );
        }

      case Reagent.ammonia:
        if (salt.cation == 'Zn2+') {
          return ReactionResult(
            observation: isExcess
                ? 'White precipitate dissolves in excess aqueous ammonia to form a clear colorless solution'
                : 'White precipitate formed',
            inference: 'Zn2+ confirmed (soluble in excess ammonia)',
            precipitateColor: Colors.white,
            hasPrecipitate: !isExcess,
            isSolubleInExcess: true,
          );
        } else if (salt.cation == 'Pb2+') {
          return ReactionResult(
            observation: isExcess
                ? 'White precipitate is insoluble in excess aqueous ammonia'
                : 'White precipitate formed',
            inference: 'Pb2+ or Al3+ present',
            precipitateColor: Colors.white,
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else if (salt.cation == 'Cu2+') {
          return ReactionResult(
            observation: isExcess
                ? 'Precipitate dissolves in excess ammonia to give a deep/royal blue solution'
                : 'Pale blue precipitate formed',
            inference: 'Cu2+ confirmed ([Cu(NH3)4]2+ complex formed)',
            precipitateColor: const Color(0xFF1565C0),
            hasPrecipitate: false,
            isSolubleInExcess: true,
          );
        } else if (salt.cation == 'Fe2+') {
          return ReactionResult(
            observation: isExcess
                ? 'Dirty green precipitate insoluble in excess'
                : 'Dirty green precipitate formed',
            inference: 'Fe2+ present',
            precipitateColor: const Color(0xFF2E7D32),
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else {
          return const ReactionResult(
            observation: 'No observable change / no precipitate',
            inference: 'Ca2+, Na+, or Ba2+ present',
            precipitateColor: Colors.transparent,
            hasPrecipitate: false,
            isSolubleInExcess: false,
          );
        }

      case Reagent.bariumNitrate:
        if (salt.anion == 'SO4 2-') {
          return const ReactionResult(
            observation: 'White precipitate formed, insoluble upon adding dilute HNO3',
            inference: 'SO4 2- confirmed',
            precipitateColor: Colors.white,
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else if (salt.anion == 'SO3 2-') {
          return const ReactionResult(
            observation: 'White precipitate dissolves upon adding dilute HNO3 with effervescence of choking SO2 gas',
            inference: 'SO3 2- confirmed',
            precipitateColor: Colors.white,
            hasPrecipitate: false,
            isSolubleInExcess: true,
            gasEvolved: 'SO2 gas turns acidified potassium dichromate from orange to green',
          );
        } else {
          return const ReactionResult(
            observation: 'No precipitate formed',
            inference: 'SO4 2- and SO3 2- absent',
            precipitateColor: Colors.transparent,
            hasPrecipitate: false,
            isSolubleInExcess: false,
          );
        }

      case Reagent.silverNitrate:
        if (salt.anion == 'Cl-') {
          return const ReactionResult(
            observation: 'White precipitate formed, insoluble in dilute HNO3',
            inference: 'Cl- confirmed (AgCl precipitate)',
            precipitateColor: Colors.white,
            hasPrecipitate: true,
            isSolubleInExcess: false,
          );
        } else {
          return const ReactionResult(
            observation: 'No precipitate formed',
            inference: 'Cl- absent',
            precipitateColor: Colors.transparent,
            hasPrecipitate: false,
            isSolubleInExcess: false,
          );
        }

      case Reagent.kmno4:
        if (salt.anion == 'SO3 2-' || salt.cation == 'Fe2+') {
          return const ReactionResult(
            observation: 'Purple acidified KMnO4 is decolorized immediately to clear colorless',
            inference: 'Reducing agent present (SO3 2- or Fe2+)',
            precipitateColor: Colors.transparent,
            hasPrecipitate: false,
            isSolubleInExcess: false,
          );
        } else {
          return const ReactionResult(
            observation: 'Purple color of KMnO4 is retained',
            inference: 'Reducing agent absent',
            precipitateColor: Colors.transparent,
            hasPrecipitate: false,
            isSolubleInExcess: false,
          );
        }

      default:
        return const ReactionResult(
          observation: 'No reaction observed',
          inference: 'No conclusion',
          precipitateColor: Colors.transparent,
          hasPrecipitate: false,
          isSolubleInExcess: false,
        );
    }
  }

  /// Flame emission color for cation confirmation
  static Color getFlameColor(FlameCation cation) {
    switch (cation) {
      case FlameCation.sodium:
        return const Color(0xFFFFD600); // Golden Yellow
      case FlameCation.calcium:
        return const Color(0xFFFF3D00); // Brick Red / Orange-Red
      case FlameCation.copper:
        return const Color(0xFF00E676); // Emerald / Blue-Green
      case FlameCation.barium:
        return const Color(0xFF76FF03); // Apple Green
      case FlameCation.potassium:
        return const Color(0xFFCE93D8); // Lilac
      case FlameCation.none:
        return const Color(0xFF0284C7); // Clean blue bunsen flame
    }
  }
}
