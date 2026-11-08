# VirtuLab Kenya - Proguard & R8 Optimization Rules

# Keep Javascript interfaces for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep MainActivity native bridge classes
-keep class com.virtulabkenya.app.MainActivity$* {
    *;
}

-keepattributes JavascriptInterface
-keepattributes *Annotation*
