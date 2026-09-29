import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';
import '../../../../core/theme/stem_typography.dart';
import '../../../../core/widgets/stem_widgets.dart';
import '../../../../core/storage/local_storage.dart';
import '../../domain/titration_engine.dart';
import '../widgets/burette_painter.dart';
import '../widgets/meniscus_zoom_viewfinder.dart';
import '../widgets/conical_flask_painter.dart';

class TitrationLabScreen extends StatefulWidget {
  final VoidCallback onBack;

  const TitrationLabScreen({super.key, required this.onBack});

  @override
  State<TitrationLabScreen> createState() => _TitrationLabScreenState();
}

class _TitrationLabScreenState extends State<TitrationLabScreen> {
  final TitrationEngine _engine = TitrationEngine(
    type: TitrationType.acidBase,
    indicator: IndicatorType.phenolphthalein,
    analyteVolume: 25.0,
    analyteConcentration: 0.10,
    titrantConcentration: 0.10,
  );

  double _buretteReading = 0.00; // cm3 dispensed from burette
  double _flowRate = 0.4;
  bool _isDispensing = false;
  Timer? _dispenseTimer;

  int _currentTrialNumber = 1; // 1 = Rough, 2 = 1st Accurate, 3 = 2nd Accurate
  double _trialInitialReading = 0.00;
  final List<TitrationTrial> _trials = [];

  @override
  void dispose() {
    _dispenseTimer?.cancel();
    super.dispose();
  }

  void _toggleDispensing() {
    if (_isDispensing) {
      _stopDispensing();
    } else {
      _startDispensing();
    }
  }

  void _startDispensing() {
    setState(() => _isDispensing = true);
    _dispenseTimer?.cancel();
    _dispenseTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (_buretteReading >= 50.0) {
        _stopDispensing();
        return;
      }
      setState(() {
        // Dropwise addition depending on flow rate
        final increment = 0.05 * _flowRate;
        _buretteReading = double.parse((_buretteReading + increment).toStringAsFixed(2));
      });
    });
  }

  void _stopDispensing() {
    _dispenseTimer?.cancel();
    setState(() => _isDispensing = false);
  }

  void _addSingleDrop() {
    if (_buretteReading < 50.0) {
      setState(() {
        _buretteReading = double.parse((_buretteReading + 0.05).toStringAsFixed(2));
      });
    }
  }

  void _recordTrial() {
    final finalReading = _buretteReading;
    final trial = TitrationTrial(
      trialNumber: _currentTrialNumber,
      initialBuretteReading: _trialInitialReading,
      finalBuretteReading: finalReading,
      usedForAverage: _currentTrialNumber > 1,
    );

    setState(() {
      _trials.add(trial);
      if (_currentTrialNumber < 3) {
        _currentTrialNumber++;
        _trialInitialReading = _buretteReading;
      } else {
        // Finished all 3 trials
        _evaluateAndShowResults();
      }
    });
  }

  void _resetBurette() {
    _stopDispensing();
    setState(() {
      _buretteReading = 0.00;
      _trialInitialReading = 0.00;
    });
  }

  void _evaluateAndShowResults() async {
    final evaluation = _engine.evaluateKnecPerformance(_trials);

    // Save offline session submission to local queue
    await LocalStorage.enqueueOfflineSubmission({
      'type': 'titration',
      'score': evaluation.score,
      'max_score': evaluation.maxScore,
      'average_titre': evaluation.averageTitre,
      'accuracy_error': evaluation.accuracyError,
      'duration_seconds': 180,
      'timestamp': DateTime.now().toIso8601String(),
    });

    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: StemColors.surfacePanel,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: StemColors.borderFocus, width: 1.5),
        ),
        title: Row(
          children: [
            const Icon(Icons.verified, color: StemColors.labSuccess, size: 28),
            const SizedBox(width: 10),
            Text('KNEC Scoring Rubric', style: StemTypography.textTheme.headlineSmall),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Final Score: ${evaluation.score} / ${evaluation.maxScore} Marks',
              style: StemTypography.textTheme.headlineMedium?.copyWith(
                color: evaluation.score >= 12 ? StemColors.labSuccess : StemColors.labWarning,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Average Titre: ${evaluation.averageTitre} cm³  (Expected: ${evaluation.expectedTitre} cm³)',
              style: StemTypography.monospaceReadout.copyWith(color: StemColors.secondary),
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            ...evaluation.feedback.map(
              (f) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.check_circle_outline, color: StemColors.secondary, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(f, style: StemTypography.textTheme.bodySmall),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '💾 Result queued for offline sync with teacher portal.',
              style: StemTypography.textTheme.bodySmall?.copyWith(color: StemColors.labSuccess),
            ),
          ],
        ),
        actions: [
          StemButton(
            label: 'Close Lab',
            onPressed: () {
              Navigator.pop(context);
              widget.onBack();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentPh = _engine.calculatePh(_buretteReading);
    final solutionColor = _engine.getSolutionColor(_buretteReading);

    return Scaffold(
      backgroundColor: StemColors.surfaceBase,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
        title: Text('Titration Workbench (Q1)', style: StemTypography.textTheme.headlineSmall),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: StemColors.secondary),
            tooltip: 'Refill Burette to 0.00 cm³',
            onPressed: _resetBurette,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Telemetry Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: StemColors.surfacePanel,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TelemetryBadge(
                    label: 'Burette Reading',
                    value: '${_buretteReading.toStringAsFixed(2)} cm³',
                    statusColor: StemColors.secondary,
                  ),
                  TelemetryBadge(
                    label: 'pH',
                    value: currentPh.toStringAsFixed(1),
                    statusColor: currentPh < 7.0 ? StemColors.labDanger : StemColors.labSuccess,
                  ),
                  TelemetryBadge(
                    label: 'Trial',
                    value: _currentTrialNumber == 1 ? 'Rough' : 'Accurate ${_currentTrialNumber - 1}',
                    statusColor: StemColors.labWarning,
                  ),
                ],
              ),
            ),

            // 2. Interactive Apparatus Stage
            Expanded(
              child: Stack(
                children: [
                  // Burette on left
                  Positioned(
                    top: 10,
                    bottom: 10,
                    left: 10,
                    width: 100,
                    child: BuretteWidget(
                      currentVolume: _buretteReading,
                      isDispensing: _isDispensing,
                      flowRate: _flowRate,
                      onToggleTap: _toggleDispensing,
                      onFlowRateChanged: (val) => setState(() => _flowRate = val),
                    ),
                  ),

                  // Conical Flask below burette tip
                  Positioned(
                    bottom: 20,
                    left: 110,
                    child: ConicalFlaskWidget(
                      currentVolume: 25.0 + _buretteReading,
                      solutionColor: solutionColor,
                      isSwirling: _isDispensing,
                    ),
                  ),

                  // Floating 10x Meniscus Magnifier on Top Right
                  Positioned(
                    top: 15,
                    right: 15,
                    child: MeniscusZoomViewfinder(currentVolume: _buretteReading),
                  ),

                  // Single Drop Addition & Reagent Controls on Right Center
                  Positioned(
                    right: 15,
                    bottom: 80,
                    child: Column(
                      children: [
                        FloatingActionButton.small(
                          heroTag: 'drop_btn',
                          backgroundColor: StemColors.surfacePanelElevated,
                          foregroundColor: StemColors.secondary,
                          tooltip: 'Add Single 0.05 cm³ Drop',
                          onPressed: _addSingleDrop,
                          child: const Icon(Icons.water_drop_outlined),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '+0.05 cm³',
                          style: TextStyle(fontSize: 10, color: StemColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // 3. Observations & Table Recording Panel
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: StemColors.surfacePanel,
                border: Border(top: BorderSide(color: StemColors.borderSubtle)),
              ),
              child: Column(
                children: [
                  // Recorded Trials row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _trialPill('Rough', _getTrialVolume(1)),
                      _trialPill('Trial 1', _getTrialVolume(2)),
                      _trialPill('Trial 2', _getTrialVolume(3)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Record Reading Button
                  StemButton(
                    label: _currentTrialNumber < 3
                        ? 'Record Reading for Trial $_currentTrialNumber'
                        : 'Submit Titration for KNEC Grading',
                    icon: Icons.edit_note,
                    type: _currentTrialNumber == 3 ? StemButtonType.success : StemButtonType.primary,
                    onPressed: _recordTrial,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getTrialVolume(int trialNum) {
    final matches = _trials.where((t) => t.trialNumber == trialNum).toList();
    if (matches.isEmpty) return '—';
    return '${matches.first.titreVolume.toStringAsFixed(2)} cm³';
  }

  Widget _trialPill(String title, String val) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: StemColors.surfaceBase,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: StemColors.borderSubtle),
      ),
      child: Column(
        children: [
          Text(title, style: TextStyle(fontSize: 10, color: StemColors.textMuted)),
          const SizedBox(height: 2),
          Text(val, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: StemColors.secondary)),
        ],
      ),
    );
  }
}
