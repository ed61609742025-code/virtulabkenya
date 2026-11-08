package com.virtulabkenya.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Base64
import android.view.HapticFeedbackConstants
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    companion object {
        const val CHANNEL_ID = "virtulab_lab_alerts"
        const val CHANNEL_NAME = "VirtuLab Kenya Alerts"
        const val DOWNLOAD_CHANNEL_ID = "virtulab_downloads"
        const val DOWNLOAD_CHANNEL_NAME = "VirtuLab Lab Downloads"
        const val DEFAULT_SERVER_URL = "https://virtulab-web.onrender.com"
    }

    private lateinit var rootContainer: FrameLayout
    private lateinit var webView: WebView
    private lateinit var assetLoader: WebViewAssetLoader

    @Volatile
    private var offlineFallbackActive = false
    private var lastBackPressTime = 0L

    // File picker callback for <input type="file"> support
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val results = WebChromeClient.FileChooserParams.parseResult(result.resultCode, data)
            filePathCallback?.onReceiveValue(results)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    // Notification runtime permission
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            android.util.Log.d("VirtuLabPWA", "POST_NOTIFICATIONS granted")
            webView.post {
                webView.evaluateJavascript(
                    "if (window.VLKPush && typeof window.VLKPush.syncUI === 'function') { window.VLKPush.syncUI(); }",
                    null
                )
            }
        } else {
            android.util.Log.d("VirtuLabPWA", "POST_NOTIFICATIONS denied")
        }
    }

    // Dynamic Network State Listener
    private var connectivityManager: ConnectivityManager? = null
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            runOnUiThread {
                android.util.Log.i("VirtuLabPWA", "Network available: notifying WebView")
                notifyNetworkState(true)
            }
        }

        override fun onLost(network: Network) {
            runOnUiThread {
                android.util.Log.w("VirtuLabPWA", "Network lost: notifying WebView")
                notifyNetworkState(false)
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        createNotificationChannels()

        // Configure AndroidX WebViewAssetLoader for secure local asset delivery
        assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        // Container with system safe-area insetting
        val initialBg = Color.parseColor("#0F172A")
        window.statusBarColor = initialBg
        window.navigationBarColor = initialBg

        rootContainer = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(initialBg)
        }

        webView = WebView(this).apply {
            setBackgroundColor(initialBg)
            isVerticalScrollBarEnabled = true
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
        }

        rootContainer.addView(
            webView,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        )
        setContentView(rootContainer)

        ViewCompat.setOnApplyWindowInsetsListener(rootContainer) { _, windowInsets ->
            windowInsets
        }

        configureWebViewSettings()
        setupJavaScriptInterface()
        setupWebClients()
        setupDownloadListener()
        setupBackNavigation()

        // Initialize server preference
        val prefsInit = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
        val configuredServerUrl = prefsInit.getString("server_url", null)
        if (configuredServerUrl == null ||
            configuredServerUrl.contains("192.168.") ||
            configuredServerUrl.contains("localhost") ||
            configuredServerUrl.contains("127.0.0.1")
        ) {
            prefsInit.edit().putString("server_url", DEFAULT_SERVER_URL).apply()
        }

        // Determine initial connectivity state
        val online = isNetworkAvailable(this)
        offlineFallbackActive = !online

        // Resolve target URL from intent or deep link
        val initialUrl = resolveIntentUrl(intent)
        webView.loadUrl(initialUrl)
    }

    private fun configureWebViewSettings() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = false
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        settings.userAgentString = "${settings.userAgentString} VirtuLabApp/1.1.2"

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
    }

    private fun setupJavaScriptInterface() {
        webView.addJavascriptInterface(object {
            @JavascriptInterface
            fun getServer(): String {
                val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                var url = prefs.getString("server_url", DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
                if (url.contains("192.168.") || url.contains("localhost") || url.contains("127.0.0.1")) {
                    url = DEFAULT_SERVER_URL
                    prefs.edit().putString("server_url", url).apply()
                }
                return url
            }

            @JavascriptInterface
            fun setServer(url: String) {
                val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                prefs.edit().putString("server_url", url.trim()).apply()
            }

            @JavascriptInterface
            fun retryOnline() {
                runOnUiThread {
                    offlineFallbackActive = false
                    val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                    val serverBase = prefs.getString("server_url", DEFAULT_SERVER_URL)?.trimEnd('/') ?: DEFAULT_SERVER_URL
                    webView.loadUrl("$serverBase/student/home.html")
                }
            }

            @JavascriptInterface
            fun isOffline(): Boolean = offlineFallbackActive

            @JavascriptInterface
            fun supportsNotifications(): Boolean = true

            @JavascriptInterface
            fun hasNotificationPermission(): Boolean = this@MainActivity.hasNotificationPermission()

            @JavascriptInterface
            fun requestNotificationPermission() {
                runOnUiThread {
                    this@MainActivity.requestNotificationPermission()
                }
            }

            @JavascriptInterface
            fun syncTheme(theme: String) {
                runOnUiThread {
                    this@MainActivity.syncNativeTheme(theme)
                }
            }

            @JavascriptInterface
            fun showNotification(title: String, message: String, targetUrl: String?) {
                runOnUiThread {
                    this@MainActivity.showNativeNotification(title, message, targetUrl)
                }
            }

            @JavascriptInterface
            fun vibrate(type: String?) {
                runOnUiThread {
                    this@MainActivity.performTactileHaptic(type ?: "tick")
                }
            }

            @JavascriptInterface
            fun setFullscreen(enabled: Boolean) {
                runOnUiThread {
                    this@MainActivity.setImmersiveFullscreen(enabled)
                }
            }

            @JavascriptInterface
            fun setOrientation(orientation: String?) {
                runOnUiThread {
                    this@MainActivity.applyOrientation(orientation ?: "auto")
                }
            }

            @JavascriptInterface
            fun saveReport(fileName: String, base64Content: String, mimeType: String?) {
                runOnUiThread {
                    this@MainActivity.saveBase64Document(fileName, base64Content, mimeType ?: "application/pdf")
                }
            }

            @JavascriptInterface
            fun getVersionName(): String = "1.1.2"

            @JavascriptInterface
            fun getVersionCode(): Int = 4
        }, "VirtuLabNative")
    }

    private fun setupWebClients() {
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    android.util.Log.d("VirtuLabPWA", "${it.message()} -- line ${it.lineNumber()} of ${it.sourceId()}")
                }
                return true
            }

            // Handles <input type="file"> across student/teacher portals
            override fun onShowFileChooser(
                view: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                params: FileChooserParams?
            ): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback

                val intent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }
                return try {
                    filePickerLauncher.launch(intent)
                    true
                } catch (e: Exception) {
                    filePathCallback = null
                    false
                }
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                val url = request.url
                val host = url.host ?: ""

                // 1. AndroidX WebViewAssetLoader intercepts local appassets
                val assetLoaded = assetLoader.shouldInterceptRequest(url)
                if (assetLoaded != null) {
                    return assetLoaded
                }

                val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                var serverBase = prefs.getString("server_url", DEFAULT_SERVER_URL)?.trimEnd('/') ?: DEFAULT_SERVER_URL
                if (serverBase.contains("192.168.") || serverBase.contains("localhost") || serverBase.contains("127.0.0.1")) {
                    serverBase = DEFAULT_SERVER_URL
                }
                val serverHost = try { Uri.parse(serverBase).host ?: "" } catch (_: Exception) { "" }

                val isLocalOrigin = (host == "virtulab.local" || host == "appassets.androidplatform.net")
                val isBackendHost = (serverHost.isNotEmpty() && host.equals(serverHost, ignoreCase = true))

                if (isLocalOrigin || isBackendHost) {
                    val rawPath = url.path?.trimStart('/') ?: ""
                    val assetPath = if (rawPath.isEmpty()) "index.html" else rawPath

                    // Handle API calls
                    if (assetPath.startsWith("api/")) {
                        if (offlineFallbackActive || !isNetworkAvailable(this@MainActivity)) {
                            return getOfflineApiResponse(assetPath)
                        }
                        if (isBackendHost) {
                            return super.shouldInterceptRequest(view, request)
                        }
                        return proxyLiveApiRequest(request, serverBase, assetPath, url.query)
                    }

                    // Static Assets (HTML, JS, CSS, media, SVG, fonts):
                    if (offlineFallbackActive || !isNetworkAvailable(this@MainActivity) || isLocalOrigin) {
                        val assetResponse = serveFromAssets(assetPath)
                        if (assetResponse != null) {
                            return assetResponse
                        }
                    }

                    // Online live backend access (OTA updates)
                    if (isBackendHost) {
                        return super.shouldInterceptRequest(view, request)
                    }

                    return serveFromAssets(assetPath) ?: super.shouldInterceptRequest(view, request)
                }

                return super.shouldInterceptRequest(view, request)
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                super.onReceivedError(view, request, error)
                if (request.isForMainFrame) {
                    android.util.Log.w("VirtuLabPWA", "Main frame load failed: ${error.description}. Triggering offline asset fallback.")
                    if (!offlineFallbackActive) {
                        offlineFallbackActive = true
                        runOnUiThread {
                            Toast.makeText(this@MainActivity, "Offline Mode: Running from local lab assets", Toast.LENGTH_SHORT).show()
                            val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                            val serverBase = prefs.getString("server_url", DEFAULT_SERVER_URL)?.trimEnd('/') ?: DEFAULT_SERVER_URL
                            view.loadUrl("$serverBase/student/home.html")
                        }
                    }
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                if (!offlineFallbackActive && isNetworkAvailable(this@MainActivity) && !url.contains("virtulab.local")) {
                    offlineFallbackActive = false
                }
                view.post {
                    view.evaluateJavascript(
                        "if (window.VLKPush && typeof window.VLKPush.syncUI === 'function') { window.VLKPush.syncUI(); }",
                        null
                    )
                    view.evaluateJavascript(
                        "(function() { return document.documentElement.getAttribute('data-theme') || localStorage.getItem('vlk_theme') || 'light'; })();"
                    ) { result ->
                        val theme = result?.replace("\"", "")?.trim() ?: "light"
                        this@MainActivity.syncNativeTheme(theme)
                    }
                }
            }
        }
    }

    private fun setupDownloadListener() {
        webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, contentLength ->
            when {
                url.startsWith("data:") -> {
                    // Extract data URL format data:[<mediatype>][;base64],<data>
                    val commaIndex = url.indexOf(',')
                    if (commaIndex != -1) {
                        val header = url.substring(0, commaIndex)
                        val payload = url.substring(commaIndex + 1)
                        val detectedMime = header.substringAfter("data:").substringBefore(';')
                        val isBase64 = header.contains("base64")
                        val ext = when {
                            detectedMime.contains("pdf") -> "pdf"
                            detectedMime.contains("csv") -> "csv"
                            detectedMime.contains("json") -> "json"
                            detectedMime.contains("png") -> "png"
                            else -> "bin"
                        }
                        val fileName = "VirtuLab_Report_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())}.$ext"

                        if (isBase64) {
                            saveBase64Document(fileName, payload, detectedMime)
                        } else {
                            val decoded = Uri.decode(payload)
                            savePlainTextDocument(fileName, decoded, detectedMime)
                        }
                    }
                }
                url.startsWith("blob:") -> {
                    Toast.makeText(this, "Generating report for download...", Toast.LENGTH_SHORT).show()
                }
                else -> {
                    // Standard HTTP/HTTPS download via Android DownloadManager
                    try {
                        val request = DownloadManager.Request(Uri.parse(url)).apply {
                            setMimeType(mimeType)
                            val cookies = CookieManager.getInstance().getCookie(url)
                            addRequestHeader("cookie", cookies)
                            addRequestHeader("User-Agent", userAgent)
                            setDescription("VirtuLab Kenya Laboratory Document")
                            val guessedName = URLUtil.guessFileName(url, contentDisposition, mimeType)
                            setTitle(guessedName)
                            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                            setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, guessedName)
                        }
                        val dm = getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
                        dm?.enqueue(request)
                        Toast.makeText(this, "Downloading report to Downloads folder...", Toast.LENGTH_SHORT).show()
                    } catch (e: Exception) {
                        Toast.makeText(this, "Download failed: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    val now = System.currentTimeMillis()
                    if (now - lastBackPressTime < 2000) {
                        finish()
                    } else {
                        lastBackPressTime = now
                        Toast.makeText(this@MainActivity, "Press back again to exit VirtuLab", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    override fun onStart() {
        super.onStart()
        registerNetworkMonitoring()
    }

    override fun onStop() {
        super.onStop()
        unregisterNetworkMonitoring()
    }

    private fun registerNetworkMonitoring() {
        try {
            connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            val request = NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .build()
            connectivityManager?.registerNetworkCallback(request, networkCallback)
        } catch (e: Exception) {
            android.util.Log.w("VirtuLabPWA", "Failed to register network callback: ${e.message}")
        }
    }

    private fun unregisterNetworkMonitoring() {
        try {
            connectivityManager?.unregisterNetworkCallback(networkCallback)
        } catch (_: Exception) {}
    }

    private fun notifyNetworkState(isOnline: Boolean) {
        webView.post {
            webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('vlk:network_status', { detail: { isOnline: $isOnline } }));",
                null
            )
        }
    }

    private fun resolveIntentUrl(intent: Intent?): String {
        val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
        val serverBase = prefs.getString("server_url", DEFAULT_SERVER_URL)?.trimEnd('/') ?: DEFAULT_SERVER_URL

        val targetUrl = intent?.getStringExtra("NAVIGATE_URL")
        if (!targetUrl.isNullOrEmpty()) {
            return if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
                targetUrl
            } else {
                "$serverBase/${targetUrl.trimStart('/')}"
            }
        }

        // Check for Android App Links or Deep Links
        val data: Uri? = intent?.data
        if (data != null) {
            val scheme = data.scheme?.lowercase()
            if (scheme == "virtulab") {
                val host = data.host ?: ""
                val path = data.path ?: ""
                val query = if (data.query.isNullOrEmpty()) "" else "?${data.query}"
                return "$serverBase/$host$path$query"
            } else if (scheme == "http" || scheme == "https") {
                return data.toString()
            }
        }

        return "$serverBase/student/home.html"
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val url = resolveIntentUrl(intent)
        webView.loadUrl(url)
    }

    private fun isNetworkAvailable(context: Context): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = cm.activeNetwork ?: return false
            val capabilities = cm.getNetworkCapabilities(network) ?: return false
            capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } else {
            @Suppress("DEPRECATION")
            cm.activeNetworkInfo?.isConnected == true
        }
    }

    private fun serveFromAssets(assetPath: String): WebResourceResponse? {
        try {
            val inputStream: InputStream = assets.open(assetPath)
            val mime = getMimeType(assetPath)
            val encoding = if (isTextMime(mime)) "UTF-8" else null
            val headers = mapOf(
                "Access-Control-Allow-Origin" to "*",
                "Cache-Control" to "no-cache"
            )
            return WebResourceResponse(mime, encoding, 200, "OK", headers, inputStream)
        } catch (_: Exception) {
            if (!assetPath.contains('.')) {
                try {
                    val htmlStream = assets.open("$assetPath.html")
                    return WebResourceResponse(
                        "text/html",
                        "UTF-8",
                        200,
                        "OK",
                        mapOf("Access-Control-Allow-Origin" to "*"),
                        htmlStream
                    )
                } catch (_: Exception) {}
            }
        }
        return null
    }

    private fun getOfflineApiResponse(assetPath: String): WebResourceResponse {
        val jsonResponse = if (assetPath == "api/auth/config") {
            """{"googleClientId":null,"offline":true}"""
        } else {
            """{"offline":true,"message":"Offline Mode — Local device storage active"}"""
        }
        val inputStream = jsonResponse.byteInputStream(Charsets.UTF_8)
        val headers = mapOf(
            "Content-Type" to "application/json; charset=utf-8",
            "Access-Control-Allow-Origin" to "*",
            "Access-Control-Allow-Methods" to "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers" to "*"
        )
        return WebResourceResponse("application/json", "UTF-8", 503, "Offline", headers, inputStream)
    }

    private fun proxyLiveApiRequest(
        request: WebResourceRequest,
        serverBase: String,
        assetPath: String,
        queryString: String?
    ): WebResourceResponse {
        val queryStr = if (queryString.isNullOrEmpty()) "" else "?$queryString"
        val targetUrl = "$serverBase/$assetPath$queryStr"

        return try {
            val conn = (URL(targetUrl).openConnection() as HttpURLConnection).apply {
                requestMethod = request.method
                connectTimeout = 15000
                readTimeout = 20000
                instanceFollowRedirects = true
                request.requestHeaders?.forEach { (k, v) ->
                    if (!k.equals("Host", ignoreCase = true)) {
                        setRequestProperty(k, v)
                    }
                }
            }
            val code = conn.responseCode
            val stream = if (code in 200..399) conn.inputStream else (conn.errorStream ?: conn.inputStream)
            val contentType = conn.contentType ?: "application/json"
            val mime = contentType.substringBefore(';').trim()
            val encoding = if (contentType.contains("charset=", ignoreCase = true)) {
                contentType.substringAfter("charset=").substringBefore(';').trim()
            } else "UTF-8"

            val headers = mutableMapOf<String, String>()
            conn.headerFields.forEach { (k, v) ->
                if (k != null && v.isNotEmpty()) headers[k] = v.joinToString(", ")
            }
            headers["Access-Control-Allow-Origin"] = "*"
            headers["Access-Control-Allow-Credentials"] = "true"
            headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            headers["Access-Control-Allow-Headers"] = "*"
            WebResourceResponse(mime, encoding, code, conn.responseMessage ?: "OK", headers, stream)
        } catch (e: Exception) {
            getOfflineApiResponse(assetPath)
        }
    }

    private fun isTextMime(mime: String): Boolean {
        return mime.startsWith("text/") ||
                mime == "application/javascript" ||
                mime == "application/json" ||
                mime == "image/svg+xml"
    }

    private fun getMimeType(path: String): String {
        val ext = path.substringAfterLast('.', "").lowercase()
        return when (ext) {
            "html", "htm" -> "text/html"
            "js", "mjs" -> "application/javascript"
            "css" -> "text/css"
            "svg" -> "image/svg+xml"
            "png" -> "image/png"
            "jpg", "jpeg" -> "image/jpeg"
            "webp" -> "image/webp"
            "gif" -> "image/gif"
            "ico" -> "image/x-icon"
            "json" -> "application/json"
            "woff" -> "font/woff"
            "woff2" -> "font/woff2"
            "ttf" -> "font/ttf"
            "otf" -> "font/otf"
            "mp3" -> "audio/mpeg"
            "wav" -> "audio/wav"
            "ogg" -> "audio/ogg"
            "pdf" -> "application/pdf"
            "csv" -> "text/csv"
            else -> MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "application/octet-stream"
        }
    }

    // ── Tactile Laboratory Haptics ──────────────────────────────────────────
    fun performTactileHaptic(type: String) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val vibrator = vibratorManager?.defaultVibrator
                when (type.lowercase()) {
                    "tick", "tap" -> vibrator?.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
                    "click" -> vibrator?.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
                    "success" -> {
                        val waveform = longArrayOf(0, 30, 60, 40)
                        vibrator?.vibrate(VibrationEffect.createWaveform(waveform, -1))
                    }
                    "warning" -> vibrator?.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
                    else -> webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                when (type.lowercase()) {
                    "tick", "tap" -> vibrator?.vibrate(VibrationEffect.createOneShot(15, VibrationEffect.DEFAULT_AMPLITUDE))
                    "click" -> vibrator?.vibrate(VibrationEffect.createOneShot(25, VibrationEffect.DEFAULT_AMPLITUDE))
                    "success" -> {
                        val waveform = longArrayOf(0, 30, 60, 40)
                        vibrator?.vibrate(VibrationEffect.createWaveform(waveform, -1))
                    }
                    "warning" -> vibrator?.vibrate(VibrationEffect.createOneShot(120, VibrationEffect.DEFAULT_AMPLITUDE))
                    else -> webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                }
            } else {
                webView.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
            }
        } catch (_: Exception) {}
    }

    // ── Immersive Fullscreen Mode ──────────────────────────────────────────
    fun setImmersiveFullscreen(enabled: Boolean) {
        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        if (enabled) {
            windowInsetsController.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())
        } else {
            windowInsetsController.show(WindowInsetsCompat.Type.systemBars())
        }
    }

    // ── Dynamic Orientation ────────────────────────────────────────────────
    fun applyOrientation(mode: String) {
        requestedOrientation = when (mode.lowercase()) {
            "landscape" -> ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
            "portrait" -> ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
            else -> ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        }
    }

    // ── Saving Base64 Lab Reports & PDF Certificates ───────────────────────
    fun saveBase64Document(fileName: String, base64Content: String, mimeType: String) {
        try {
            val bytes = Base64.decode(base64Content, Base64.DEFAULT)
            saveBytesToDisk(fileName, bytes, mimeType)
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to decode document: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    fun savePlainTextDocument(fileName: String, content: String, mimeType: String) {
        try {
            val bytes = content.toByteArray(Charsets.UTF_8)
            saveBytesToDisk(fileName, bytes, mimeType)
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to save document: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun saveBytesToDisk(fileName: String, bytes: ByteArray, mimeType: String) {
        try {
            val reportsDir = File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "Reports")
            if (!reportsDir.exists()) reportsDir.mkdirs()

            val targetFile = File(reportsDir, fileName)
            FileOutputStream(targetFile).use { it.write(bytes) }

            val uri = FileProvider.getUriForFile(
                this,
                "${applicationContext.packageName}.fileprovider",
                targetFile
            )

            // Notify user and provide one-tap intent to view document
            showDocumentReadyNotification(fileName, uri, mimeType)
            Toast.makeText(this, "Saved: $fileName", Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Error saving document: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showDocumentReadyNotification(fileName: String, fileUri: Uri, mimeType: String) {
        val viewIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(fileUri, mimeType)
            flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            viewIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, DOWNLOAD_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Laboratory Report Ready")
            .setContentText("Tap to open $fileName")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager = NotificationManagerCompat.from(this)
        if (hasNotificationPermission()) {
            val id = (System.currentTimeMillis() % 100000).toInt()
            notificationManager.notify(id, builder.build())
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

            val labAlertsChannel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Laboratory simulation alerts, announcements, and assignment reminders"
                enableLights(true)
                lightColor = Color.parseColor("#06B6D4")
                enableVibration(true)
            }

            val downloadsChannel = NotificationChannel(
                DOWNLOAD_CHANNEL_ID,
                DOWNLOAD_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Laboratory reports, KCSE certificates, and exam score exports"
                enableLights(true)
                lightColor = Color.parseColor("#10B981")
            }

            manager?.createNotificationChannel(labAlertsChannel)
            manager?.createNotificationChannel(downloadsChannel)
        }
    }

    fun hasNotificationPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            NotificationManagerCompat.from(this).areNotificationsEnabled()
        }
    }

    fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (!hasNotificationPermission()) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun showNativeNotification(title: String, message: String, targetUrl: String?) {
        if (!hasNotificationPermission()) {
            requestNotificationPermission()
            return
        }

        val notifyIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            if (!targetUrl.isNullOrEmpty()) {
                putExtra("NAVIGATE_URL", targetUrl)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            notifyIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager = NotificationManagerCompat.from(this)
        val notificationId = (System.currentTimeMillis() % 100000).toInt()
        notificationManager.notify(notificationId, builder.build())
    }

    fun syncNativeTheme(theme: String) {
        val isLight = theme.equals("light", ignoreCase = true)
        val isGreen = theme.equals("green", ignoreCase = true)

        val themeColor = when {
            isLight -> Color.parseColor("#FFFFFF")
            isGreen -> Color.parseColor("#0C2114")
            else -> Color.parseColor("#0F172A")
        }

        if (::rootContainer.isInitialized) {
            rootContainer.setBackgroundColor(themeColor)
        }
        window.statusBarColor = themeColor
        window.navigationBarColor = themeColor

        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        insetsController.isAppearanceLightStatusBars = isLight
        insetsController.isAppearanceLightNavigationBars = isLight
    }

    override fun onPause() {
        super.onPause()
        if (::webView.isInitialized) {
            webView.onPause()
            webView.pauseTimers()
        }
    }

    override fun onResume() {
        super.onResume()
        if (::webView.isInitialized) {
            webView.onResume()
            webView.resumeTimers()
        }
    }

    override fun onDestroy() {
        if (::webView.isInitialized) {
            rootContainer.removeView(webView)
            webView.destroy()
        }
        super.onDestroy()
    }
}
