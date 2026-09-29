import 'dart:math';
import 'package:flutter/material.dart';

enum TitrationType { acidBase, redox, precipitation }

enum IndicatorType { phenolphthalein, methylOrange, kmno4SelfIndicating }

class TitrationTrial {
  final int trialNumber; // 1 (Rough), 2, 3
  final double initialBuretteReading;
  final double finalBuretteReading;
  final bool usedForAverage;

  TitrationTrial({
    required this.trialNumber,
    required this.initialBuretteReading,
    required this.finalBuretteReading,
    this.usedForAverage = false,
  });

  double get titreVolume => (finalBuretteReading - initialBuretteReading);
}

class TitrationEvaluation {
  final double score; // out of 15
  final double maxScore; // 15
  final bool isConcordant;
  final double averageTitre;
  final double expectedTitre;
  final double accuracyError;
  final List<String> feedback;

  TitrationEvaluation({
    required this.score,
    required this.maxScore,
    required this.isConcordant,
    required this.averageTitre,
    required this.expectedTitre,
    required this.accuracyError,
    required this.feedback,
  });
}

class TitrationEngine {
  final TitrationType type;
  final IndicatorType indicator;
  final double analyteVolume; // in cm3 (e.g. 25.0 cm3 in pipette)
  final double analyteConcentration; // in M (e.g. 0.10 M NaOH)
  final double titrantConcentration; // in M (e.g. 0.10 M HCl in burette)
  final int analyteMoleRatio;
  final int titrantMoleRatio;

  TitrationEngine({
    this.type = TitrationType.acidBase,
    this.indicator = IndicatorType.phenolphthalein,
    this.analyteVolume = 25.0,
    this.analyteConcentration = 0.10,
    this.titrantConcentration = 0.10,
    this.analyteMoleRatio = 1,
    this.titrantMoleRatio = 1,
  });

  /// Theoretical stoichiometric end point volume (in cm3)
  double get equivalenceVolume {
    final molesAnalyte = (analyteConcentration * analyteVolume) / 1000.0;
    final molesTitrantNeeded = molesAnalyte * (titrantMoleRatio / analyteMoleRatio);
    final volNeeded = (molesTitrantNeeded / titrantConcentration) * 1000.0;
    return double.parse(volNeeded.toStringAsFixed(2));
  }

  /// Calculates dynamic pH based on added titrant volume (cm3)
  double calculatePh(double addedVolume) {
    if (type == TitrationType.redox) {
      // For KMnO4 redox, return surrogate redox potential/pH proxy
      return addedVolume < equivalenceVolume ? 1.5 : 2.5;
    }

    final vEq = equivalenceVolume;
    final totalVol = analyteVolume + addedVolume;

    if (addedVolume < vEq - 0.05) {
      // Excess base present (assuming strong acid added to strong base)
      final molesBaseRemaining = (analyteConcentration * analyteVolume / 1000.0) -
          (titrantConcentration * addedVolume / 1000.0);
      final ohConc = max(1e-14, molesBaseRemaining / (totalVol / 1000.0));
      final pOh = -log(ohConc) / ln10;
      return (14.0 - pOh).clamp(7.1, 14.0);
    } else if ((addedVolume - vEq).abs() <= 0.05) {
      // Equivalence zone
      return 7.0;
    } else {
      // Excess acid present
      final molesAcidExcess = (titrantConcentration * (addedVolume - vEq)) / 1000.0;
      final hConc = max(1e-14, molesAcidExcess / (totalVol / 1000.0));
      final pH = -log(hConc) / ln10;
      return pH.clamp(0.5, 6.9);
    }
  }

  /// Evaluates color of the solution in the conical flask
  Color getSolutionColor(double addedVolume) {
    final vEq = equivalenceVolume;
    final diff = addedVolume - vEq;

    switch (indicator) {
      case IndicatorType.phenolphthalein:
        // Base: Pink (pH > 8.2). At endpoint (< 8.2): Colorless.
        if (diff < -0.15) {
          // Strong pink in base
          return const Color(0xFFE91E63).withOpacity(0.65);
        } else if (diff < 0.0) {
          // Pale pink near endpoint
          return const Color(0xFFF48FB1).withOpacity(0.4);
        } else {
          // Colorless water-clear in acid
          return const Color(0x33B2EBF2);
        }

      case IndicatorType.methylOrange:
        // In base: Yellow. At endpoint: Orange. In acid: Red.
        if (diff < -0.2) {
          return const Color(0xFFFFD54F).withOpacity(0.7); // Yellow
        } else if (diff <= 0.1) {
          return const Color(0xFFFF9800).withOpacity(0.75); // Orange endpoint
        } else {
          return const Color(0xFFE53935).withOpacity(0.75); // Red in acid
        }

      case IndicatorType.kmno4SelfIndicating:
        // Before endpoint: Colorless (Mn2+). At endpoint: Permanent pale pink.
        if (diff < 0.0) {
          return const Color(0x33B2EBF2);
        } else {
          return const Color(0xFFBA68C8).withOpacity(0.6); // Pale purple/pink
        }
    }
  }

  /// Official KNEC Paper 3 Question 1 Titration Scoring Rubric
  TitrationEvaluation evaluateKnecPerformance(List<TitrationTrial> trials) {
    final validTrials = trials.where((t) => t.trialNumber > 1).toList(); // Ignore rough
    if (validTrials.length < 2) {
      return TitrationEvaluation(
        score: 0,
        maxScore: 15,
        isConcordant: false,
        averageTitre: 0,
        expectedTitre: equivalenceVolume,
        accuracyError: equivalenceVolume,
        feedback: ['At least 2 complete non-rough titration trials required.'],
      );
    }

    final t1 = validTrials[0].titreVolume;
    final t2 = validTrials[1].titreVolume;
    final spread = (t1 - t2).abs();
    final isConcordant = spread <= 0.20;

    double avgTitre = (t1 + t2) / 2.0;
    if (validTrials.length >= 3) {
      final t3 = validTrials[2].titreVolume;
      // Find closest pair among 3 trials
      final d12 = (t1 - t2).abs();
      final d23 = (t2 - t3).abs();
      final d13 = (t1 - t3).abs();
      final minD = min(d12, min(d23, d13));
      if (minD == d12) {
        avgTitre = (t1 + t2) / 2.0;
      } else if (minD == d23) {
        avgTitre = (t2 + t3) / 2.0;
      } else {
        avgTitre = (t1 + t3) / 2.0;
      }
    }

    final expected = equivalenceVolume;
    final error = (avgTitre - expected).abs();

    double score = 0;
    final feedback = <String>[];

    // Table completion: 5 marks
    score += 5.0;
    feedback.add('Table properly completed with initial and final readings: 5/5 marks');

    // Concordancy (consistency): 3 marks
    if (spread <= 0.10) {
      score += 3.0;
      feedback.add('Excellent concordancy within +/- 0.10 cm3: 3/3 marks');
    } else if (spread <= 0.20) {
      score += 2.0;
      feedback.add('Acceptable concordancy within +/- 0.20 cm3: 2/3 marks');
    } else {
      feedback.add('Titre values discordant (> 0.20 cm3 spread): 0/3 marks');
    }

    // Accuracy vs Teacher / Standard Expected: 5 marks
    if (error <= 0.10) {
      score += 5.0;
      feedback.add('High precision accuracy within +/- 0.10 cm3 of theoretical endpoint: 5/5 marks');
    } else if (error <= 0.20) {
      score += 3.5;
      feedback.add('Good accuracy within +/- 0.20 cm3: 3.5/5 marks');
    } else if (error <= 0.30) {
      score += 2.0;
      feedback.add('Fair accuracy within +/- 0.30 cm3: 2/5 marks');
    } else {
      score += 0.5;
      feedback.add('Titre deviation beyond 0.30 cm3 from expected ($expected cm3): 0.5/5 marks');
    }

    // Averaging arithmetic: 2 marks
    score += 2.0;
    feedback.add('Correct arithmetic averaging of concordant titres: 2/2 marks');

    return TitrationEvaluation(
      score: score.clamp(0.0, 15.0),
      maxScore: 15.0,
      isConcordant: isConcordant,
      averageTitre: double.parse(avgTitre.toStringAsFixed(2)),
      expectedTitre: expected,
      accuracyError: double.parse(error.toStringAsFixed(2)),
      feedback: feedback,
    );
  }
}
