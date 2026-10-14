---
name: cross-platform-mobile
description: >-
  Engineering guidelines for cross-platform mobile apps using Flutter and Android native / TWA wrappers. Use when developing mobile UI layouts, handling platform-specific capabilities, configuring Gradle/Kotlin build pipelines, touch optimization, and running mobile tests.
---

# Cross-Platform Mobile Engineering: Flutter & Android TWA

You are a mobile development specialist experienced in Flutter (Dart) and Android Native / Trusted Web Activities (TWA / WebView wrappers).

## Architecture in This Project

VirtuLab Kenya operates a dual-pronged mobile architecture:
1. `mobile/`: Full Flutter & Dart application with native widget trees, offline chemistry engines, and cross-platform compilation (Android, iOS, Web).
2. `pwa-android/`: Native Android application wrapper powered by Gradle Kotlin DSL (`build.gradle.kts`), wrapping the PWA experience in a standalone Trusted Web Activity (TWA) with zero browser chrome.

---

## 1. Flutter Best Practices (`mobile/`)

### Responsive Layout Building
Never use hardcoded pixel widths (`width: 380`). Always adapt dynamically to viewport constraints:
```dart
Widget build(BuildContext context) {
  return LayoutBuilder(
    builder: (context, constraints) {
      if (constraints.maxWidth > 768) {
        // Tablet / Desktop layout: Side-by-side split screen
        return Row(
          children: [
            Expanded(flex: 3, child: ApparatusViewportWidget()),
            Expanded(flex: 2, child: ExperimentControlsPanel()),
          ],
        );
      } else {
        // Mobile layout: Stacked column with bottom control sheet
        return Column(
          children: [
            Expanded(child: ApparatusViewportWidget()),
            ExperimentControlsPanel(),
          ],
        );
      }
    },
  );
}
```

### Ergonomic Safe Area & Navigation
- Wrap root screens with `SafeArea` to respect notches, camera cutouts, and gesture navigation bars.
- Utilize `Navigator 2.0` (or `go_router`) for declarative, deep-linkable URL routing that mirrors web paths (`/student/lab/titration`).

### Automated Flutter Testing
Run tests from the `mobile/` directory:
```bash
# Run all unit and widget tests
flutter test

# Run with coverage report
flutter test --coverage
```

---

## 2. Android Native & TWA Engineering (`pwa-android/`)

### Gradle Kotlin DSL Configuration (`pwa-android/build.gradle.kts`)
- Ensure `compileSdk` and `targetSdk` are aligned with the latest stable Android platform (API 34+).
- Set `minSdk = 24` (Android 7.0+) to support 99%+ of secondary school mobile hardware in Kenya.

### Digital Asset Links (`.well-known/assetlinks.json`)
For the TWA to run seamlessly without an address bar, the Android app signing certificate SHA-256 fingerprint must match the hosted web domain:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "ke.co.virtulab.app",
    "sha256_cert_fingerprints": [
      "14:6D:E9:..."
    ]
  }
}]
```

### Hardware Acceleration & WebView Performance
Ensure hardware acceleration is enabled in `AndroidManifest.xml`:
```xml
<application
    android:hardwareAccelerated="true"
    android:icon="@mipmap/ic_launcher"
    android:label="VirtuLab Kenya"
    android:theme="@style/Theme.VirtuLab.NoActionBar">
    <activity
        android:name=".MainActivity"
        android:exported="true"
        android:configChanges="orientation|screenSize|keyboardHidden">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

---

## 3. Mobile Verification Checklist

- [ ] Tap targets meet or exceed 48x48dp.
- [ ] No layout overflow warnings (no yellow-and-black striped render overflow errors in Flutter).
- [ ] Orientation changes (portrait <-> landscape) preserve experiment state without reloading or resetting titrations.
- [ ] Android back gesture / back button gracefully prompts before discarding unsaved practical data.
