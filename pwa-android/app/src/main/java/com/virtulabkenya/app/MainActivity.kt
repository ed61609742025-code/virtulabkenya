package com.virtulabkenya.app

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    @Volatile
    private var offlineFallbackActive = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Seamless dark theme matching VirtuLab
        window.statusBarColor = Color.parseColor("#0F172A")
        window.navigationBarColor = Color.parseColor("#0F172A")

        webView = WebView(this).apply {
            setBackgroundColor(Color.parseColor("#0F172A"))
            isVerticalScrollBarEnabled = true
            isHorizontalScrollBarEnabled = false
        }
        setContentView(webView)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = false
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        val prefsInit = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
        val initialUrl = prefsInit.getString("server_url", null)
        if (initialUrl == null || initialUrl.contains("192.168.") || initialUrl.contains("localhost") || initialUrl.contains("127.0.0.1")) {
            prefsInit.edit().putString("server_url", "https://virtulab-web.onrender.com").apply()
        }

        webView.addJavascriptInterface(object {
            @JavascriptInterface
            fun getServer(): String {
                val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                var url = prefs.getString("server_url", "https://virtulab-web.onrender.com") ?: "https://virtulab-web.onrender.com"
                if (url.contains("192.168.") || url.contains("localhost") || url.contains("127.0.0.1")) {
                    url = "https://virtulab-web.onrender.com"
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
                    val serverBase = prefs.getString("server_url", "https://virtulab-web.onrender.com")?.trimEnd('/') ?: "https://virtulab-web.onrender.com"
                    webView.loadUrl("$serverBase/student/home.html")
                }
            }

            @JavascriptInterface
            fun isOffline(): Boolean {
                return offlineFallbackActive
            }
        }, "VirtuLabNative")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    android.util.Log.d("VirtuLabPWA", "${it.message()} -- line ${it.lineNumber()} of ${it.sourceId()}")
                }
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                val url = request.url
                val host = url.host ?: ""

                val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                var serverBase = prefs.getString("server_url", "https://virtulab-web.onrender.com")?.trimEnd('/') ?: "https://virtulab-web.onrender.com"
                if (serverBase.contains("192.168.") || serverBase.contains("localhost") || serverBase.contains("127.0.0.1")) {
                    serverBase = "https://virtulab-web.onrender.com"
                }
                val serverHost = try { Uri.parse(serverBase).host ?: "" } catch (_: Exception) { "" }

                val isLocalOrigin = (host == "virtulab.local" || host == "appassets.androidplatform.net")
                val isBackendHost = (serverHost.isNotEmpty() && host.equals(serverHost, ignoreCase = true))

                // Intercept our local origin or backend host
                if (isLocalOrigin || isBackendHost) {
                    val rawPath = url.path?.trimStart('/') ?: ""
                    val assetPath = if (rawPath.isEmpty()) "index.html" else rawPath

                    // Handle API calls
                    if (assetPath.startsWith("api/")) {
                        if (offlineFallbackActive || !isNetworkAvailable(this@MainActivity)) {
                            return getOfflineApiResponse(assetPath)
                        }
                        return proxyLiveApiRequest(request, serverBase, assetPath, url.query)
                    }

                    // Static Assets (HTML, JS, CSS, media, fonts):
                    // If offline fallback is triggered, or device has no network, or request is to virtulab.local:
                    if (offlineFallbackActive || !isNetworkAvailable(this@MainActivity) || isLocalOrigin) {
                        val assetResponse = serveFromAssets(assetPath)
                        if (assetResponse != null) {
                            return assetResponse
                        }
                    }

                    // When online and loading backend host, allow WebView to load live over HTTPS.
                    // This delivers instant Over-The-Air (OTA) updates on git push / Render deploys!
                    if (isBackendHost) {
                        return super.shouldInterceptRequest(view, request)
                    }

                    // Fallback to local asset if not found
                    return serveFromAssets(assetPath) ?: super.shouldInterceptRequest(view, request)
                }

                return super.shouldInterceptRequest(view, request)
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                super.onReceivedError(view, request, error)
                // Only trigger offline fallback if the main page document fails to load.
                // Sub-resource failures (single image, font, CDN) must NOT drop the app into offline mode.
                if (request.isForMainFrame) {
                    android.util.Log.w("VirtuLabPWA", "Main frame load failed: ${error.description}. Triggering offline asset fallback.")
                    if (!offlineFallbackActive) {
                        offlineFallbackActive = true
                        runOnUiThread {
                            Toast.makeText(this@MainActivity, "Offline Mode: Running from local lab assets", Toast.LENGTH_SHORT).show()
                            val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
                            val serverBase = prefs.getString("server_url", "https://virtulab-web.onrender.com")?.trimEnd('/') ?: "https://virtulab-web.onrender.com"
                            view.loadUrl("$serverBase/student/home.html")
                        }
                    }
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                // If loaded successfully online (and NOT in asset fallback mode), keep online confirmed
                if (!offlineFallbackActive && isNetworkAvailable(this@MainActivity) && !url.contains("virtulab.local")) {
                    offlineFallbackActive = false
                }
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Determine initial connectivity state
        val online = isNetworkAvailable(this)
        offlineFallbackActive = !online

        // Start at student home / login gate on the unified backend domain
        // When online: Loads live from Render (OTA auto-update on git push)
        // When offline: Intercepted seamlessly and served from local APK assets
        val prefs = getSharedPreferences("virtulab_prefs", MODE_PRIVATE)
        val serverBase = prefs.getString("server_url", "https://virtulab-web.onrender.com")?.trimEnd('/') ?: "https://virtulab-web.onrender.com"
        webView.loadUrl("$serverBase/student/home.html")
    }

    private fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return false
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        } else {
            @Suppress("DEPRECATION")
            connectivityManager.activeNetworkInfo?.isConnected == true
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
            // If file didn't exist directly, check with .html extension
            if (!assetPath.contains('.')) {
                try {
                    val htmlStream = assets.open("$assetPath.html")
                    return WebResourceResponse("text/html", "UTF-8", 200, "OK", mapOf("Access-Control-Allow-Origin" to "*"), htmlStream)
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
            else -> MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "application/octet-stream"
        }
    }
}
