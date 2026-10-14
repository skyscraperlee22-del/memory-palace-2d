package com.example.memorypalace.content

import android.annotation.SuppressLint
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import java.net.URLConnection
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

private const val MemoryPalaceUrl = "https://appassets.androidplatform.net/assets/memory-palace/index.html"
private const val AssetOrigin = "https://appassets.androidplatform.net/assets/"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun HomePage() {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
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
                            WebResourceResponse(mime, null, context.assets.open(path))
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

                loadUrl(MemoryPalaceUrl)
            }
        }
    )
}
