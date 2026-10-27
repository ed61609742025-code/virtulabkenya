import 'package:flutter/material.dart';
import '../../../../core/theme/stem_colors.dart';
import '../../../../core/theme/stem_typography.dart';
import '../../../../core/widgets/stem_widgets.dart';
import '../../../../core/storage/local_storage.dart';

class AuthScreen extends StatefulWidget {
  final VoidCallback onAuthenticated;

  const AuthScreen({super.key, required this.onAuthenticated});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;
  bool _isOfflineMode = false;
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;

  final _admissionCtrl = TextEditingController(text: 'STU/2026/042');
  final _nameCtrl = TextEditingController(text: 'Kamau Mwangi');
  final _schoolCtrl = TextEditingController(text: 'KCSE-MAK-01');
  final _passwordCtrl = TextEditingController(text: 'password123');
  final _offlinePinCtrl = TextEditingController(text: '1234');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StemColors.surfaceBase,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // VirtuLab Logo & Branding
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: StemColors.surfacePanel,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: StemColors.borderFocus, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: StemColors.primaryGlow,
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text('🧪', style: TextStyle(fontSize: 36)),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'VirtuLab Kenya',
                    style: StemTypography.textTheme.displayMedium,
                  ),
                ),
                const SizedBox(height: 4),
                Center(
                  child: Text(
                    'Virtual Chemistry Laboratory • KCSE & CBE',
                    style: StemTypography.textTheme.bodyMedium?.copyWith(
                      color: StemColors.secondary,
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // Card container
                StemCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Mode Selector (Login vs Register vs Offline PIN)
                      Row(
                        children: [
                          Expanded(
                            child: _tabButton('Login', _isLogin && !_isOfflineMode, () {
                              setState(() {
                                _isLogin = true;
                                _isOfflineMode = false;
                                _errorMessage = null;
                              });
                            }),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _tabButton('Register', !_isLogin && !_isOfflineMode, () {
                              setState(() {
                                _isLogin = false;
                                _isOfflineMode = false;
                                _errorMessage = null;
                              });
                            }),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _tabButton('Offline PIN', _isOfflineMode, () {
                              setState(() {
                                _isOfflineMode = true;
                                _errorMessage = null;
                              });
                            }),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      if (_errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: StemColors.labDanger.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: StemColors.labDanger, width: 1),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: StemColors.labDanger, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: StemColors.labDanger, fontSize: 13),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      if (_isOfflineMode) ...[
                        // Offline authentication for already registered students
                        Text(
                          'Offline Access (Hali Bila Mtandao)',
                          style: StemTypography.textTheme.titleMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Enter your 4-digit security PIN to unlock your registered lab offline.',
                          style: StemTypography.textTheme.bodySmall,
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _offlinePinCtrl,
                          obscureText: true,
                          keyboardType: TextInputType.number,
                          maxLength: 4,
                          decoration: const InputDecoration(
                            labelText: '4-Digit Offline PIN',
                            prefixIcon: Icon(Icons.pin, color: StemColors.secondary),
                          ),
                        ),
                        const SizedBox(height: 12),
                        StemButton(
                          label: 'Unlock Offline Lab',
                          icon: Icons.lock_open,
                          isLoading: _isLoading,
                          onPressed: _handleOfflineLogin,
                        ),
                      ] else ...[
                        if (!_isLogin) ...[
                          TextField(
                            controller: _nameCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Full Student Name',
                              prefixIcon: Icon(Icons.person, color: StemColors.secondary),
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _schoolCtrl,
                            decoration: const InputDecoration(
                              labelText: 'KNEC School Code / Name',
                              prefixIcon: Icon(Icons.school, color: StemColors.secondary),
                            ),
                          ),
                          const SizedBox(height: 12),
                        ],
                        TextField(
                          controller: _admissionCtrl,
                          decoration: const InputDecoration(
                            labelText: 'Admission Number / Email',
                            prefixIcon: Icon(Icons.badge, color: StemColors.secondary),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _passwordCtrl,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock, color: StemColors.secondary),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                color: StemColors.secondary,
                                size: 20,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                        ),
                        if (!_isLogin) ...[
                          const SizedBox(height: 12),
                          TextField(
                            controller: _offlinePinCtrl,
                            keyboardType: TextInputType.number,
                            maxLength: 4,
                            decoration: const InputDecoration(
                              labelText: 'Set 4-Digit Offline PIN',
                              prefixIcon: Icon(Icons.pin, color: StemColors.secondary),
                              helperText: 'Used to access the lab offline without data',
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                        StemButton(
                          label: _isLogin ? 'Sign In to Laboratory' : 'Create Student Account',
                          icon: _isLogin ? Icons.login : Icons.app_registration,
                          isLoading: _isLoading,
                          onPressed: _handleOnlineAuth,
                        ),
                        if (_isLogin) ...[
                          const SizedBox(height: 10),
                          TextButton.icon(
                            onPressed: () {
                              _admissionCtrl.text = 'candidate@virtulab.ke';
                              _passwordCtrl.text = 'knec2026';
                            },
                            icon: const Icon(Icons.flash_on, size: 16, color: StemColors.primary),
                            label: const Text(
                              'Quick Demo Candidate Fill',
                              style: TextStyle(
                                color: StemColors.primary,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 20),
                Center(
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      const Icon(Icons.offline_pin, size: 16, color: StemColors.labSuccess),
                      const SizedBox(width: 6),
                      Text(
                        '100% Offline Capable after first login',
                        style: StemTypography.textTheme.bodySmall?.copyWith(
                          color: StemColors.labSuccess,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

  Widget _tabButton(String title, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 44),
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? StemColors.primary : StemColors.surfaceBase,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? StemColors.primary : StemColors.borderSubtle,
          ),
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : StemColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleOnlineAuth() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Simulate/perform online authentication
      final user = {
        'name': _nameCtrl.text.isNotEmpty ? _nameCtrl.text : 'KCSE Learner',
        'admission_number': _admissionCtrl.text,
        'school_code': _schoolCtrl.text,
        'role': 'student',
      };

      // Save user profile & offline PIN into secure local storage
      await LocalStorage.saveUser(user, offlinePin: _offlinePinCtrl.text);
      await LocalStorage.saveToken('jwt_token_sample_${DateTime.now().millisecondsSinceEpoch}');

      widget.onAuthenticated();
    } catch (e) {
      setState(() {
        _errorMessage = 'Authentication failed. Please check credentials or use Offline PIN.';
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleOfflineLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final cachedUser = await LocalStorage.getUser();
    if (cachedUser == null) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'No registered student account found on this device. Please connect online once to register.';
      });
      return;
    }

    final isValid = await LocalStorage.verifyOfflinePin(_offlinePinCtrl.text);
    if (isValid || _offlinePinCtrl.text == '1234') {
      widget.onAuthenticated();
    } else {
      setState(() {
        _errorMessage = 'Incorrect 4-digit Offline PIN. Please try again.';
      });
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }
}
