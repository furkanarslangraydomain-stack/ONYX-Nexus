package com.onyx.nexus.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val OnyxBackground = Color(0xFF0A0D14)
val OnyxSurface = Color(0xFF0E121A)
val OnyxCard = Color(0xFF131823)
val OnyxBorder = Color(0xFF1E2638)
val OnyxCyan = Color(0xFF06B6D4)
val OnyxCyanBright = Color(0xFF22D3EE)
val OnyxEmerald = Color(0xFF10B981)
val OnyxPurple = Color(0xFFA855F7)
val OnyxTextPrimary = Color(0xFFF1F5F9)
val OnyxTextSecondary = Color(0xFF94A3B8)

private val DarkColorScheme = darkColorScheme(
    primary = OnyxCyan,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF083344),
    secondary = OnyxEmerald,
    onSecondary = Color.Black,
    tertiary = OnyxPurple,
    background = OnyxBackground,
    onBackground = OnyxTextPrimary,
    surface = OnyxSurface,
    onSurface = OnyxTextPrimary,
    surfaceVariant = OnyxCard,
    onSurfaceVariant = OnyxTextSecondary,
    outline = OnyxBorder
)

@Composable
fun OnyxNexusTheme(
    darkTheme: Boolean = true, // Force premium Gemini dark atmosphere
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography(),
        content = content
    )
}
