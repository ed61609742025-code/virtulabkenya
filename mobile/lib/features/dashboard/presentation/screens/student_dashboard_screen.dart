import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';
import '../../../../core/theme/stem_typography.dart';
import '../../../../core/widgets/stem_widgets.dart';
import '../../../../core/storage/local_storage.dart';
import '../../../../core/sync/offline_sync_manager.dart';
import '../../../../core/network/api_client.dart';

class StudentDashboardScreen extends StatefulWidget {
  final VoidCallback onOpenTitration;
  final VoidCallback onOpenQualitative;
  final VoidCallback onOpenMockExam;
  final VoidCallback onLogout;

  const StudentDashboardScreen({
    super.key,
    required this.onOpenTitration,
    required this.onOpenQualitative,
    required this.onOpenMockExam,
    required this.onLogout,
  });

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  Map<String, dynamic>? _user;
  int _pendingSyncCount = 0;
  bool _isSyncing = false;
  String _language = 'EN';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final user = await LocalStorage.getUser();
    final queue = LocalStorage.getPendingQueue();
    setState(() {
      _user = user;
      _pendingSyncCount = queue.length;
    });
  }

  Future<void> _triggerSync() async {
    setState(() => _isSyncing = true);
    final manager = OfflineSyncManager(apiClient: ApiClient());
    final synced = await manager.syncPendingQueue();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(synced > 0 ? 'Successfully synced $synced pending sessions!' : 'No new offline items to sync.'),
          backgroundColor: StemColors.labSuccess,
        ),
      );
      _loadData();
      setState(() => _isSyncing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StemColors.surfaceBase,
      appBar: AppBar(
        title: Row(
          children: [
            const Text('🧪', style: TextStyle(fontSize: 20)),
            const SizedBox(width: 8),
            Text('VirtuLab Workbench', style: StemTypography.textTheme.headlineSmall),
          ],
        ),
        actions: [
          // Language toggle
          TextButton(
            onPressed: () {
              setState(() {
                _language = _language == 'EN' ? 'SW' : 'EN';
              });
            },
            child: Text(
              _language == 'EN' ? '🇰🇪 SW' : '🇬🇧 EN',
              style: const TextStyle(color: StemColors.secondary, fontWeight: FontWeight.bold),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: StemColors.textSecondary, size: 20),
            onPressed: widget.onLogout,
            tooltip: 'Sign Out',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        backgroundColor: StemColors.surfacePanel,
        color: StemColors.secondary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Learner Profile & Status Header
              StemCard(
                backgroundColor: StemColors.surfacePanel,
                borderColor: StemColors.borderSubtle,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 22,
                          backgroundColor: StemColors.surfacePanelElevated,
                          child: const Icon(Icons.school, color: StemColors.secondary, size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _user?['name'] ?? 'KCSE Chemistry Learner',
                                style: StemTypography.textTheme.titleMedium,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${_user?['admission_number'] ?? 'STU/2026/042'} • ${_user?['school_code'] ?? 'Makunda Secondary'}',
                                style: StemTypography.textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(),
                    const SizedBox(height: 14),
                    // Telemetry row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const TelemetryBadge(label: 'KCSE Readiness', value: '88% A', statusColor: StemColors.labSuccess),
                        TelemetryBadge(
                          label: 'Offline Queue',
                          value: '$_pendingSyncCount Items',
                          statusColor: _pendingSyncCount > 0 ? StemColors.labWarning : StemColors.labSuccess,
                        ),
                        if (_pendingSyncCount > 0)
                          IconButton(
                            icon: _isSyncing
                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Icon(Icons.sync, color: StemColors.secondary, size: 20),
                            onPressed: _triggerSync,
                            tooltip: 'Sync Offline Results with Server',
                          ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 2. Syllabus Section Header
              Text(
                _language == 'EN' ? 'KCSE PAPER 3 PRACTICAL LABS' : 'MAJARIBIO YA KCSE KARATASI YA 3',
                style: StemTypography.textTheme.labelSmall?.copyWith(
                  letterSpacing: 1.0,
                  color: StemColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),

              // Module 1: Titration Workbench (Paper 3 Q1)
              _buildPracticalModuleCard(
                title: _language == 'EN' ? 'Volumetric Analysis (Titration)' : 'Uchambuzi wa Kiasi (Bureti)',
                knecTag: 'Paper 3 (Q1) • 15 Marks',
                description: _language == 'EN'
                    ? '50cm³ Burette with dropwise stopcock addition, 10x meniscus magnifier lens (0.05cm³ precision), and phenolphthalein/methyl orange indicators.'
                    : 'Bureti ya 50cm³ na koki ya matone, lenzi ya kukuza meniskasi ya 10x, na viashiria vya asidi na besi.',
                icon: Icons.water_drop,
                badgeColor: StemColors.secondary,
                onTap: widget.onOpenTitration,
              ),

              const SizedBox(height: 14),

              // Module 2: Qualitative Salt Analysis (Paper 3 Q2)
              _buildPracticalModuleCard(
                title: _language == 'EN' ? 'Qualitative Salt Analysis' : 'Uchambuzi wa Chumvi Isiyo Hai',
                knecTag: 'Paper 3 (Q2) • 13 Marks',
                description: _language == 'EN'
                    ? '10 unknown salts (Salts A-J). Systematic reagent testing with 2M NaOH, NH3, Ba(NO3)2, and AgNO3 for cation & anion identification.'
                    : 'Chumvi 10 zisizojulikana. Upimaji wa kina wa vitendanishi vya NaOH, NH3, na Ba(NO3)2 kugundua ioni.',
                icon: Icons.science,
                badgeColor: StemColors.labSuccess,
                onTap: widget.onOpenQualitative,
              ),

              const SizedBox(height: 14),

              // Module 3: Flame Test Bench
              _buildPracticalModuleCard(
                title: _language == 'EN' ? 'Flame Test Bench' : 'Mtihani wa Mwali wa Moto',
                knecTag: 'Paper 3 (Q2/Q3) • Cation Emission',
                description: _language == 'EN'
                    ? 'Clean platinum/nichrome wire loop tests in non-luminous flame for Na+, K+, Ca2+, Cu2+, and Ba2+ spectral identification.'
                    : 'Upimaji wa waya ya platinamu kwenye moto usio na moshi kugundua rangi ya ioni za metali.',
                icon: Icons.local_fire_department,
                badgeColor: StemColors.labWarning,
                onTap: widget.onOpenQualitative,
              ),

              const SizedBox(height: 14),

              // Module 4: 40-Mark Composite Mock Exam
              _buildPracticalModuleCard(
                title: _language == 'EN' ? '40-Mark Composite KCSE Mock Exam' : 'Mtihani Kamili wa KCSE (Alama 40)',
                knecTag: 'Full Paper 3 Simulation • Official KNEC Rubric',
                description: _language == 'EN'
                    ? 'Timed practical exam (Titration Q1 + Salt Analysis Q2 + Gas/Flame Q3). Scored with official KNEC grades (A to E).'
                    : 'Mtihani uliopimwa kwa wakati unaojumuisha maswali yote matatu na kutoa alama rasmi za KNEC (A hadi E).',
                icon: Icons.assignment_turned_in,
                badgeColor: StemColors.labDanger,
                isHighlight: true,
                onTap: widget.onOpenMockExam,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPracticalModuleCard({
    required String title,
    required String knecTag,
    required String description,
    required IconData icon,
    required Color badgeColor,
    required VoidCallback onTap,
    bool isHighlight = false,
  }) {
    return StemCard(
      onTap: onTap,
      borderColor: isHighlight ? StemColors.borderFocus : StemColors.borderSubtle,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: badgeColor, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: StemTypography.textTheme.titleMedium),
                    const SizedBox(height: 2),
                    Text(
                      knecTag,
                      style: StemTypography.textTheme.labelSmall?.copyWith(color: badgeColor),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 14, color: StemColors.textMuted),
            ],
          ),
          const SizedBox(height: 10),
          Text(description, style: StemTypography.textTheme.bodyMedium),
        ],
      ),
    );
  }
}
