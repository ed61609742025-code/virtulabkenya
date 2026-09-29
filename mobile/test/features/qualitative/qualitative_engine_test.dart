import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/qualitative/domain/qualitative_engine.dart';

void main() {
  group('QualitativeEngine Inorganic Salt Reactions', () {
    test('Salt A (ZnSO4) produces white ppt soluble in excess NaOH and excess NH3', () {
      final saltA = QualitativeEngine.availableSalts.firstWhere((s) => s.id == 'Salt A');

      // Test NaOH dropwise
      final naohDrop = QualitativeEngine.testReagent(saltA, Reagent.naoh, isExcess: false);
      expect(naohDrop.hasPrecipitate, isTrue);

      // Test NaOH in excess
      final naohExcess = QualitativeEngine.testReagent(saltA, Reagent.naoh, isExcess: true);
      expect(naohExcess.isSolubleInExcess, isTrue);
      expect(naohExcess.hasPrecipitate, isFalse);

      // Test NH3 in excess (Zinc is soluble in excess aqueous ammonia)
      final nh3Excess = QualitativeEngine.testReagent(saltA, Reagent.ammonia, isExcess: true);
      expect(nh3Excess.isSolubleInExcess, isTrue);
      expect(nh3Excess.inference, contains('Zn2+ confirmed'));
    });

    test('Salt E (CuCl2) gives pale blue ppt with NaOH, deep blue solution in excess NH3, and white ppt with AgNO3', () {
      final saltE = QualitativeEngine.availableSalts.firstWhere((s) => s.id == 'Salt E');

      // NaOH
      final naoh = QualitativeEngine.testReagent(saltE, Reagent.naoh);
      expect(naoh.hasPrecipitate, isTrue);

      // Excess NH3 (deep blue complex)
      final nh3Excess = QualitativeEngine.testReagent(saltE, Reagent.ammonia, isExcess: true);
      expect(nh3Excess.isSolubleInExcess, isTrue);
      expect(nh3Excess.observation, contains('deep/royal blue'));

      // AgNO3 for chloride
      final agno3 = QualitativeEngine.testReagent(saltE, Reagent.silverNitrate);
      expect(agno3.hasPrecipitate, isTrue);
      expect(agno3.inference, contains('Cl- confirmed'));
    });

    test('Salt C (FeSO4) gives dirty green precipitate insoluble in excess NaOH', () {
      final saltC = QualitativeEngine.availableSalts.firstWhere((s) => s.id == 'Salt C');

      final naohExcess = QualitativeEngine.testReagent(saltC, Reagent.naoh, isExcess: true);
      expect(naohExcess.hasPrecipitate, isTrue);
      expect(naohExcess.isSolubleInExcess, isFalse);
      expect(naohExcess.observation, contains('Dirty green'));
    });

    test('Flame emission spectral assignments correspond to KNEC syllabus', () {
      expect(QualitativeEngine.getFlameColor(FlameCation.sodium), equals(const Color(0xFFFFD600))); // Golden yellow
      expect(QualitativeEngine.getFlameColor(FlameCation.calcium), equals(const Color(0xFFFF3D00))); // Brick red
      expect(QualitativeEngine.getFlameColor(FlameCation.copper), equals(const Color(0xFF00E676)));  // Blue-green
    });
  });
}
