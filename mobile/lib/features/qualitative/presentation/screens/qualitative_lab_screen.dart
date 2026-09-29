import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';
import '../../../../core/theme/stem_typography.dart';
import '../../../../core/widgets/stem_widgets.dart';
import '../../../../core/storage/local_storage.dart';
import '../../domain/qualitative_engine.dart';
import '../widgets/test_tube_painter.dart';
import '../widgets/bunsen_flame_painter.dart';

class QualitativeLabScreen extends StatefulWidget {
  final VoidCallback onBack;

  const QualitativeLabScreen({super.key, required this.onBack});

  @override
  State<QualitativeLabScreen> createState() => _QualitativeLabScreenState();
}

class _QualitativeLabScreenState extends State<QualitativeLabScreen> {
  SaltDefinition _selectedSalt = QualitativeEngine.availableSalts[0]; // Salt A (ZnSO4)
  bool _isFlameTestMode = false;

  // Test tube reaction state
  Reagent? _activeReagent;
  ReactionResult? _currentReaction;

  // Flame test state
  bool _isWireInFlame = false;
  Color _flameColor = Colors.transparent;

  final List<String> _recordedObservations = [];

  void _applyReagent(Reagent reagent, {bool isExcess = false}) {
    setState(() {
      _activeReagent = reagent;
      _currentReaction = QualitativeEngine.testReagent(
        _selectedSalt,
        reagent,
        isExcess: isExcess,
      );
      final obs = 'Added ${_reagentName(reagent)}${isExcess ? " in excess" : ""}: ${_currentReaction!.observation}';
      if (!_recordedObservations.contains(obs)) {
        _recordedObservations.add(obs);
      }
    });
  }

  void _runFlameTest() {
    setState(() {
      _isWireInFlame = true;
      _flameColor = QualitativeEngine.getFlameColor(_selectedSalt.flameCation);
      final flameObs = 'Flame Test: ${_selectedSalt.flameCation == FlameCation.none ? "No characteristic color observed" : "Characteristic ${_flameCationName(_selectedSalt.flameCation)} flame emitted"}';
      if (!_recordedObservations.contains(flameObs)) {
        _recordedObservations.add(flameObs);
      }
    });

    // Wire remains in flame for 3 seconds
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isWireInFlame = false;
        });
      }
    });
  }

  void _resetTubes() {
    setState(() {
      _activeReagent = null;
      _currentReaction = null;
      _isWireInFlame = false;
      _flameColor = Colors.transparent;
    });
  }

  void _submitObservations() async {
    // Score based on number of systematic tests performed
    final score = (_recordedObservations.length * 3.2).clamp(4.0, 13.0);

    // Save offline session
    await LocalStorage.enqueueOfflineSubmission({
      'type': 'qualitative',
      'salt_id': _selectedSalt.id,
      'score': double.parse(score.toStringAsFixed(1)),
      'max_score': 13.0,
      'observations': _recordedObservations,
      'duration_seconds': 150,
      'timestamp': DateTime.now().toIso8601String(),
    });

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: StemColors.surfacePanel,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: StemColors.borderFocus, width: 1.5),
        ),
        title: Row(
          children: [
            const Icon(Icons.verified, color: StemColors.labSuccess),
            const SizedBox(width: 8),
            Text('KNEC Q2 Evaluation', style: StemTypography.textTheme.headlineSmall),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Score: ${score.toStringAsFixed(1)} / 13 Marks',
              style: StemTypography.textTheme.headlineMedium?.copyWith(
                color: score >= 10 ? StemColors.labSuccess : StemColors.labWarning,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Tested Salt: ${_selectedSalt.id} (${_selectedSalt.name})',
              style: StemTypography.monospaceReadout,
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            Text('Recorded Inferences:', style: StemTypography.textTheme.titleMedium),
            const SizedBox(height: 4),
            ..._recordedObservations.take(3).map(
              (o) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Text('• $o', style: StemTypography.textTheme.bodySmall),
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
    return Scaffold(
      backgroundColor: StemColors.surfaceBase,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
        title: Text(
          _isFlameTestMode ? 'Flame Test Bench (Q2/Q3)' : 'Qualitative Salt Analysis (Q2)',
          style: StemTypography.textTheme.headlineSmall,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: StemColors.secondary),
            tooltip: 'Clean apparatus',
            onPressed: _resetTubes,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. Salt & Bench Mode Switcher
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: StemColors.surfacePanel,
              child: Row(
                children: [
                  // Unknown Salt Dropdown
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<SaltDefinition>(
                        value: _selectedSalt,
                        dropdownColor: StemColors.surfacePanelElevated,
                        isExpanded: true,
                        style: StemTypography.textTheme.titleMedium,
                        items: QualitativeEngine.availableSalts.map((salt) {
                          return DropdownMenuItem(
                            value: salt,
                            child: Text(
                              '${salt.id}: ${salt.name}',
                              style: const TextStyle(fontSize: 13, color: Colors.white),
                            ),
                          );
                        }).toList(),
                        onChanged: (newSalt) {
                          if (newSalt != null) {
                            setState(() {
                              _selectedSalt = newSalt;
                              _resetTubes();
                              _recordedObservations.clear();
                            });
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Stage toggle button (Reagents vs Flame Test)
                  ActionChip(
                    backgroundColor: _isFlameTestMode ? StemColors.primary : StemColors.surfaceBase,
                    label: Text(
                      _isFlameTestMode ? 'Flame Test' : 'Test Tubes',
                      style: TextStyle(
                        fontSize: 11,
                        color: _isFlameTestMode ? Colors.white : StemColors.textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onPressed: () {
                      setState(() {
                        _isFlameTestMode = !_isFlameTestMode;
                        _resetTubes();
                      });
                    },
                  ),
                ],
              ),
            ),

            // 2. Interactive Apparatus Stage
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: StemColors.surfacePanel,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: StemColors.borderSubtle),
                ),
                child: _isFlameTestMode
                    ? _buildFlameTestStage()
                    : _buildTestTubeStage(),
              ),
            ),

            // 3. Reagents Shelf or Flame Action Controls
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: StemColors.surfacePanel,
                border: Border(top: BorderSide(color: StemColors.borderSubtle)),
              ),
              child: _isFlameTestMode
                  ? _buildFlameControls()
                  : _buildReagentShelf(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestTubeStage() {
    return Column(
      children: [
        // Live Observation Banner
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: StemColors.surfaceBase,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: StemColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'LIVE OBSERVATION & INFERENCE',
                style: StemTypography.textTheme.labelSmall?.copyWith(color: StemColors.secondary),
              ),
              const SizedBox(height: 4),
              Text(
                _currentReaction != null
                    ? _currentReaction!.observation
                    : 'Select a reagent from the shelf below to add dropwise into the test tube.',
                style: StemTypography.textTheme.bodyMedium?.copyWith(color: Colors.white),
              ),
              if (_currentReaction != null) ...[
                const SizedBox(height: 4),
                Text(
                  'Inference: ${_currentReaction!.inference}',
                  style: TextStyle(fontSize: 12, color: StemColors.labSuccess, fontStyle: FontStyle.italic),
                ),
              ],
            ],
          ),
        ),
        const Spacer(),
        // Test Tubes on Rack
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Tube 1: Salt Solution
            TestTubeWidget(
              label: 'Original Salt Solution',
              solutionColor: const Color(0x33B2EBF2),
              precipitateColor: Colors.transparent,
              hasPrecipitate: false,
              isSolubleInExcess: false,
            ),
            // Tube 2: Active Reaction Tube
            TestTubeWidget(
              label: _activeReagent != null
                  ? '+ ${_reagentName(_activeReagent!)}'
                  : 'Reaction Tube',
              solutionColor: const Color(0x44B2EBF2),
              precipitateColor: _currentReaction?.precipitateColor ?? Colors.transparent,
              hasPrecipitate: _currentReaction?.hasPrecipitate ?? false,
              isSolubleInExcess: _currentReaction?.isSolubleInExcess ?? false,
            ),
          ],
        ),
        const Spacer(),
      ],
    );
  }

  Widget _buildFlameTestStage() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          BunsenBurnerWidget(
            emissionColor: _flameColor,
            isWireInFlame: _isWireInFlame,
          ),
          const SizedBox(height: 16),
          Text(
            _isWireInFlame
                ? 'Heating platinum wire coated with ${_selectedSalt.id} in non-luminous flame...'
                : 'Dip wire in clean HCl, moisten with ${_selectedSalt.id}, then introduce to flame.',
            textAlign: TextAlign.center,
            style: StemTypography.textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildFlameControls() {
    return Row(
      children: [
        Expanded(
          child: StemButton(
            label: 'Introduce Wire to Flame',
            icon: Icons.local_fire_department,
            onPressed: _runFlameTest,
          ),
        ),
        const SizedBox(width: 8),
        StemButton(
          label: 'Save Findings',
          type: StemButtonType.success,
          onPressed: _submitObservations,
        ),
      ],
    );
  }

  Widget _buildReagentShelf() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('REAGENTS SHELF (KNEC STANDARD)', style: StemTypography.textTheme.labelSmall),
            Text('${_recordedObservations.length} tests logged', style: TextStyle(fontSize: 11, color: StemColors.secondary)),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _reagentChip('2M NaOH (Dropwise)', () => _applyReagent(Reagent.naoh, isExcess: false)),
            _reagentChip('NaOH (In Excess)', () => _applyReagent(Reagent.naoh, isExcess: true)),
            _reagentChip('2M NH3 (Dropwise)', () => _applyReagent(Reagent.ammonia, isExcess: false)),
            _reagentChip('NH3 (In Excess)', () => _applyReagent(Reagent.ammonia, isExcess: true)),
            _reagentChip('Ba(NO3)2 + HNO3', () => _applyReagent(Reagent.bariumNitrate)),
            _reagentChip('AgNO3 + HNO3', () => _applyReagent(Reagent.silverNitrate)),
            _reagentChip('Acidified KMnO4', () => _applyReagent(Reagent.kmno4)),
          ],
        ),
        const SizedBox(height: 10),
        StemButton(
          label: 'Submit Observations for KNEC Grading',
          icon: Icons.assignment_turned_in,
          type: StemButtonType.primary,
          onPressed: _submitObservations,
        ),
      ],
    );
  }

  Widget _reagentChip(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: StemColors.surfacePanelElevated,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: StemColors.borderSubtle),
        ),
        child: Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }

  String _reagentName(Reagent r) {
    switch (r) {
      case Reagent.naoh:
        return '2M NaOH';
      case Reagent.ammonia:
        return '2M NH3';
      case Reagent.bariumNitrate:
        return 'Ba(NO3)2';
      case Reagent.silverNitrate:
        return 'AgNO3';
      case Reagent.nitricAcid:
        return 'Dilute HNO3';
      case Reagent.hydrochloric:
        return 'Dilute HCl';
      case Reagent.kmno4:
        return 'KMnO4';
    }
  }

  String _flameCationName(FlameCation f) {
    switch (f) {
      case FlameCation.sodium:
        return 'Golden-Yellow (Na+)';
      case FlameCation.calcium:
        return 'Brick-Red (Ca2+)';
      case FlameCation.copper:
        return 'Blue-Green (Cu2+)';
      case FlameCation.barium:
        return 'Apple-Green (Ba2+)';
      case FlameCation.potassium:
        return 'Lilac (K+)';
      case FlameCation.none:
        return 'None';
    }
  }
}
