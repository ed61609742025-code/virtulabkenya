package com.virtulabkenya.app

import android.annotation.SuppressLint
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.*
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import java.io.InputStream

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

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
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

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

                // Intercept our local origin or backend API calls
                if (isLocalOrigin || isBackendHost) {
                    val rawPath = url.path?.trimStart('/') ?: ""
                    val assetPath = if (rawPath.isEmpty()) "index.html" else rawPath

                    // If an API request reaches virtulab.local/api or the backend server directly, proxy it live via native HttpURLConnection
                    if (assetPath.startsWith("api/")) {
                        val queryStr = if (url.query.isNullOrEmpty()) "" else "?${url.query}"
                        val targetUrl = "$serverBase/$assetPath$queryStr"

                        try {
                            val conn = (java.net.URL(targetUrl).openConnection() as java.net.HttpURLConnection).apply {
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
                            return WebResourceResponse(mime, encoding, code, conn.responseMessage ?: "OK", headers, stream)
                        } catch (e: Exception) {
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
                    }

                    // If not an API request, but matching backend host, don't serve from local assets
                    if (isBackendHost) {
                        return super.shouldInterceptRequest(view, request)
                    }

                    try {
                        val inputStream: InputStream = assets.open(assetPath)
                        val mime = getMimeType(assetPath)
                        val encoding = if (isTextMime(mime)) "UTF-8" else null
                        val headers = mapOf(
                            "Access-Control-Allow-Origin" to "*",
                            "Cache-Control" to "no-cache"
                        )
                        return WebResourceResponse(mime, encoding, 200, "OK", headers, inputStream)
                    } catch (e: Exception) {
                        // If file didn't exist directly, check with .html extension
                        if (!assetPath.contains('.')) {
                            try {
                                val htmlStream = assets.open("$assetPath.html")
                                return WebResourceResponse("text/html", "UTF-8", 200, "OK", mapOf("Access-Control-Allow-Origin" to "*"), htmlStream)
                            } catch (_: Exception) {}
                        }
                    }
                }
                return super.shouldInterceptRequest(view, request)
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

        // Start at student home / login gate
        webView.loadUrl("https://virtulab.local/student/home.html")
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
