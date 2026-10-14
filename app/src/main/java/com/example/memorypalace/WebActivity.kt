package com.example.memorypalace

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import java.net.URLConnection

private const val MemoryPalaceUrl = "https://appassets.androidplatform.net/assets/memory-palace/index.html"
private const val AssetOrigin = "https://appassets.androidplatform.net/assets/"

class WebActivity : Activity() {
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WebView.setWebContentsDebuggingEnabled(true)

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            )
            setBackgroundColor(android.graphics.Color.TRANSPARENT)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.allowFileAccessFromFileURLs = true
            settings.allowUniversalAccessFromFileURLs = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.cacheMode = WebSettings.LOAD_NO_CACHE

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                    val url = request.url.toString()
                    if (!url.startsWith(AssetOrigin)) return super.shouldInterceptRequest(view, request)
                    val path = url.removePrefix(AssetOrigin).substringBefore('?')
                    return try {
                        val mime = when {
                            path.endsWith(".glb") -> "model/gltf-binary"
                            path.endsWith(".webmanifest") -> "application/manifest+json"
                            else -> URLConnection.guessContentTypeFromName(path) ?: "application/octet-stream"
                        }
                        WebResourceResponse(mime, null, assets.open(path))
                    } catch (_: Exception) {
                        null
                    }
                }

                override fun onReceivedHttpError(
                    view: WebView,
                    request: WebResourceRequest,
                    errorResponse: WebResourceResponse,
                ) {
                    Log.w("MemoryPalaceWeb", "HTTP ${errorResponse.statusCode}: ${request.url}")
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                    Log.d(
                        "MemoryPalaceWeb",
                        "${consoleMessage.messageLevel()}: ${consoleMessage.message()} @ ${consoleMessage.sourceId()}:${consoleMessage.lineNumber()}",
                    )
                    return true
                }
            }
        }

        setContentView(webView)
        webView.loadUrl(MemoryPalaceUrl)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
