import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/titration/domain/titration_engine.dart';

void main() {
  group('TitrationEngine Stoichiometry & Chemistry Tests', () {
    test('Calculates theoretical equivalence volume accurately for 1:1 acid-base system', () {
      final engine = TitrationEngine(
        type: TitrationType.acidBase,
        analyteVolume: 25.0,
        analyteConcentration: 0.10,
        titrantConcentration: 0.10,
        analyteMoleRatio: 1,
        titrantMoleRatio: 1,
      );

      // (0.10 * 25.0 * 1) / (0.10 * 1) = 25.0 cm3
      expect(engine.equivalenceVolume, equals(25.0));
    });

    test('Calculates theoretical equivalence volume for 2:1 ratio (H2SO4 vs NaOH)', () {
      final engine = TitrationEngine(
        type: TitrationType.acidBase,
        analyteVolume: 25.0,
        analyteConcentration: 0.10, // 0.10M H2SO4
        titrantConcentration: 0.10, // 0.10M NaOH
        analyteMoleRatio: 1,
        titrantMoleRatio: 2, // 2 moles NaOH per 1 mole H2SO4
      );

      expect(engine.equivalenceVolume, equals(50.0));
    });

    test('pH drops as acid titrant is added to base analyte', () {
      final engine = TitrationEngine(
        analyteVolume: 25.0,
        analyteConcentration: 0.10,
        titrantConcentration: 0.10,
      );

      final initialPh = engine.calculatePh(0.0);
      final midPh = engine.calculatePh(15.0);
      final eqPh = engine.calculatePh(25.0);
      final postPh = engine.calculatePh(30.0);

      expect(initialPh, greaterThan(12.0));
      expect(midPh, greaterThan(11.0));
      expect(eqPh, closeTo(7.0, 0.1));
      expect(postPh, lessThan(3.0));
    });

    test('Phenolphthalein shifts color at equivalence boundary', () {
      final engine = TitrationEngine(
        analyteVolume: 25.0,
        analyteConcentration: 0.10,
        titrantConcentration: 0.10,
        indicator: IndicatorType.phenolphthalein,
      );

      final colorBefore = engine.getSolutionColor(24.5);
      final colorAfter = engine.getSolutionColor(25.2);

      // In base it has opacity > 0.4, in acid it becomes water-clear
      expect(colorBefore.opacity, greaterThan(0.5));
      expect(colorAfter.opacity, lessThan(0.4));
    });
  });

  group('KNEC Paper 3 Question 1 Scoring Evaluation Tests', () {
    final engine = TitrationEngine(
      analyteVolume: 25.0,
      analyteConcentration: 0.10,
      titrantConcentration: 0.10,
    );

    test('Awards maximum marks (15/15) for concordant trials within +/- 0.10 cm3 and high accuracy', () {
      final trials = [
        TitrationTrial(trialNumber: 1, initialBuretteReading: 0.0, finalBuretteReading: 25.4), // Rough
        TitrationTrial(trialNumber: 2, initialBuretteReading: 0.0, finalBuretteReading: 25.0),
        TitrationTrial(trialNumber: 3, initialBuretteReading: 0.0, finalBuretteReading: 25.05),
      ];

      final eval = engine.evaluateKnecPerformance(trials);

      expect(eval.isConcordant, isTrue);
      expect(eval.score, equals(15.0));
      expect(eval.averageTitre, closeTo(25.025, 0.01));
      expect(eval.accuracyError, closeTo(0.03, 0.01));
    });

    test('Penalizes discordant trials (> 0.20 cm3 spread)', () {
      final trials = [
        TitrationTrial(trialNumber: 1, initialBuretteReading: 0.0, finalBuretteReading: 24.0),
        TitrationTrial(trialNumber: 2, initialBuretteReading: 0.0, finalBuretteReading: 24.5),
        TitrationTrial(trialNumber: 3, initialBuretteReading: 0.0, finalBuretteReading: 25.1), // 0.60 spread
      ];

      final eval = engine.evaluateKnecPerformance(trials);

      expect(eval.isConcordant, isFalse);
      expect(eval.score, lessThan(15.0));
    });
  });
}
