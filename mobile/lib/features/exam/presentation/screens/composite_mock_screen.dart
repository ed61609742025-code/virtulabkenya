import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';
import '../../../../core/theme/stem_typography.dart';
import '../../../../core/widgets/stem_widgets.dart';
import '../../../../core/storage/local_storage.dart';
import '../../domain/mock_exam_engine.dart';
import 'package:mobile/features/titration/presentation/screens/titration_lab_screen.dart';
import 'package:mobile/features/qualitative/presentation/screens/qualitative_lab_screen.dart';

class CompositeMockExamScreen extends StatefulWidget {
  final VoidCallback onBack;

  const CompositeMockExamScreen({super.key, required this.onBack});

  @override
  State<CompositeMockExamScreen> createState() => _CompositeMockExamScreenState();
}

class _CompositeMockExamScreenState extends State<CompositeMockExamScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _secondsRemaining = 15 * 60; // 15-Minute KCSE Practice Mode
  Timer? _timer;

  // Answers & performance trackers
  final double _q1Score = 13.5; // / 15
  final double _q2Score = 11.0; // / 13
  final double _q3Score = 9.5;  // / 12

  final _q1AverageController = TextEditingController(text: '24.85');
  final _q2CationController = TextEditingController(text: 'Zn2+');
  final _q2AnionController = TextEditingController(text: 'SO4 2-');
  final _q3FlameController = TextEditingController(text: 'Golden-Yellow (Na+)');

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        _timer?.cancel();
        _submitExam();
      } else {
        setState(() {
          _secondsRemaining--;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _tabController.dispose();
    _q1AverageController.dispose();
    _q2CationController.dispose();
    _q2AnionController.dispose();
    _q3FlameController.dispose();
    super.dispose();
  }

  String get _formattedTime {
    final minutes = _secondsRemaining ~/ 60;
    final seconds = _secondsRemaining % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void _submitExam() async {
    _timer?.cancel();
    final total = _q1Score + _q2Score + _q3Score;
    final grade = KnecExamGrade.fromScore(total, 40.0);

    final result = MockExamResult(
      examId: 'KCSE_2026_MOCK_${DateTime.now().millisecondsSinceEpoch}',
      question1Score: _q1Score,
      question2Score: _q2Score,
      question3Score: _q3Score,
      totalScore: total,
      knecGrade: grade,
      timeSpentSeconds: (15 * 60) - _secondsRemaining,
      completedAt: DateTime.now(),
      isOfflineSubmission: true,
    );

    // Save to offline sync queue
    await LocalStorage.enqueueOfflineSubmission({
      'type': 'composite_exam',
      'data': result.toJson(),
    });

    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: StemColors.surfacePanel,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: StemColors.borderFocus, width: 2),
        ),
        title: Center(
          child: Column(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: StemColors.primary.withOpacity(0.2),
                  border: Border.all(color: StemColors.borderFocus, width: 2),
                ),
                child: Center(
                  child: Text(
                    grade.grade,
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: grade.grade == 'A' || grade.grade == 'B'
                          ? StemColors.labSuccess
                          : StemColors.labWarning,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'KCSE Paper 3 Result',
                style: StemTypography.textTheme.headlineSmall,
              ),
            ],
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Text(
                'Total: ${total.toStringAsFixed(1)} / 40.0 Marks (${grade.percentage.toStringAsFixed(1)}%)',
                style: StemTypography.textTheme.headlineMedium?.copyWith(
                  color: StemColors.textPrimary,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Center(
              child: Text(
                grade.remarks,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: StemColors.secondary),
              ),
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _scoreRow('Q1 Volumetric Titration', '$_q1Score / 15.0 Mks', StemColors.secondary),
            const SizedBox(height: 6),
            _scoreRow('Q2 Qualitative Salt Analysis', '$_q2Score / 13.0 Mks', StemColors.labSuccess),
            const SizedBox(height: 6),
            _scoreRow('Q3 Flame Test & Cations', '$_q3Score / 12.0 Mks', StemColors.labWarning),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: StemColors.surfaceBase,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.offline_pin, size: 16, color: StemColors.labSuccess),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Exam grade securely saved to local storage. Auto-syncs when online.',
                      style: StemTypography.textTheme.bodySmall?.copyWith(fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          StemButton(
            label: 'Return to Workbench',
            onPressed: () {
              Navigator.pop(context);
              widget.onBack();
            },
          ),
        ],
      ),
    );
  }

  Widget _scoreRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: StemTypography.textTheme.bodySmall),
        Text(value, style: StemTypography.monospaceReadout.copyWith(fontSize: 12, color: color)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StemColors.surfaceBase,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            // Confirm quit exam
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: StemColors.surfacePanel,
                title: const Text('Exit KCSE Exam?'),
                content: const Text('Exiting now will cancel this mock examination trial.'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      widget.onBack();
                    },
                    child: const Text('Exit', style: TextStyle(color: StemColors.labDanger)),
                  ),
                ],
              ),
            );
          },
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('KCSE Mock Exam (40 Mks)', style: StemTypography.textTheme.headlineSmall),
            Text('Chemistry Paper 3 Practical', style: StemTypography.textTheme.bodySmall),
          ],
        ),
        actions: [
          // Timer Widget
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _secondsRemaining < 120
                  ? StemColors.labDanger.withOpacity(0.2)
                  : StemColors.surfacePanelElevated,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: _secondsRemaining < 120 ? StemColors.labDanger : StemColors.borderSubtle,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.timer,
                  size: 16,
                  color: _secondsRemaining < 120 ? StemColors.labDanger : StemColors.secondary,
                ),
                const SizedBox(width: 6),
                Text(
                  _formattedTime,
                  style: StemTypography.monospaceReadout.copyWith(
                    color: _secondsRemaining < 120 ? StemColors.labDanger : Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: StemColors.secondary,
          labelColor: Colors.white,
          unselectedLabelColor: StemColors.textSecondary,
          tabs: const [
            Tab(text: 'Q1: Titration (15M)'),
            Tab(text: 'Q2: Salts (13M)'),
            Tab(text: 'Q3: Flame (12M)'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildQuestion1Tab(),
          _buildQuestion2Tab(),
          _buildQuestion3Tab(),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(12),
        decoration: const BoxDecoration(
          color: StemColors.surfacePanel,
          border: Border(top: BorderSide(color: StemColors.borderSubtle)),
        ),
        child: StemButton(
          label: 'Submit Official KCSE Exam',
          icon: Icons.check_circle,
          type: StemButtonType.primary,
          onPressed: _submitExam,
        ),
      ),
    );
  }

  Widget _buildQuestion1Tab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          StemCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('QUESTION 1: VOLUMETRIC ANALYSIS (15 MARKS)', style: StemTypography.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(
                  'You are provided with Solution A (0.10M HCl) and Solution B (NaOH). You are required to determine the concentration of Solution B by titration.',
                  style: StemTypography.textTheme.bodyMedium,
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (ctx) => TitrationLabScreen(onBack: () => Navigator.pop(ctx)),
                      ),
                    );
                  },
                  icon: const Icon(Icons.science, size: 18),
                  label: const Text('Open Interactive Titration Apparatus'),
                  style: ElevatedButton.styleFrom(backgroundColor: StemColors.surfacePanelElevated),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          StemCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Candidate Recorded Results', style: StemTypography.textTheme.titleMedium),
                const SizedBox(height: 12),
                TextField(
                  controller: _q1AverageController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'Average Titre Volume (cm³)',
                    helperText: 'Must be within +/- 0.10 cm³ concordancy',
                    prefixIcon: Icon(Icons.straighten, color: StemColors.secondary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestion2Tab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          StemCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('QUESTION 2: QUALITATIVE SALT ANALYSIS (13 MARKS)', style: StemTypography.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(
                  'Perform systematic tests on Unknown Solid X using 2M NaOH, 2M NH3, Ba(NO3)2, and dilute HNO3 to identify the cation and anion.',
                  style: StemTypography.textTheme.bodyMedium,
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (ctx) => QualitativeLabScreen(onBack: () => Navigator.pop(ctx)),
                      ),
                    );
                  },
                  icon: const Icon(Icons.biotech, size: 18),
                  label: const Text('Open Interactive Test Tube Rack'),
                  style: ElevatedButton.styleFrom(backgroundColor: StemColors.surfacePanelElevated),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          StemCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Candidate Deductions', style: StemTypography.textTheme.titleMedium),
                const SizedBox(height: 12),
                TextField(
                  controller: _q2CationController,
                  decoration: const InputDecoration(
                    labelText: 'Identified Cation (e.g. Zn2+, Pb2+, Fe2+)',
                    prefixIcon: Icon(Icons.add_circle_outline, color: StemColors.secondary),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _q2AnionController,
                  decoration: const InputDecoration(
                    labelText: 'Identified Anion (e.g. SO4 2-, Cl-, CO3 2-)',
                    prefixIcon: Icon(Icons.remove_circle_outline, color: StemColors.secondary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestion3Tab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          StemCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('QUESTION 3: FLAME EMISSION TEST (12 MARKS)', style: StemTypography.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(
                  'Perform flame tests using a cleaned platinum wire to record the characteristic cation emission color in a non-luminous flame.',
                  style: StemTypography.textTheme.bodyMedium,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          StemCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Flame Emission Observations', style: StemTypography.textTheme.titleMedium),
                const SizedBox(height: 12),
                TextField(
                  controller: _q3FlameController,
                  decoration: const InputDecoration(
                    labelText: 'Observed Flame Color & Confirmed Cation',
                    prefixIcon: Icon(Icons.local_fire_department, color: StemColors.secondary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
