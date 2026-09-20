package com.onyx.nexus

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Hub
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.onyx.nexus.theme.OnyxBorder
import com.onyx.nexus.theme.OnyxCyanBright
import com.onyx.nexus.theme.OnyxNexusTheme
import com.onyx.nexus.theme.OnyxSurface
import com.onyx.nexus.theme.OnyxTextSecondary
import com.onyx.nexus.ui.screens.AgentsScreen
import com.onyx.nexus.ui.screens.GeminiChatScreen
import com.onyx.nexus.ui.screens.MeshScreen
import com.onyx.nexus.viewmodel.ChatViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            OnyxNexusTheme {
                val chatViewModel: ChatViewModel = viewModel()
                var selectedTab by remember { mutableStateOf(0) }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        NavigationBar(
                            containerColor = OnyxSurface
                        ) {
                            NavigationBarItem(
                                selected = selectedTab == 0,
                                onClick = { selectedTab = 0 },
                                icon = { Icon(Icons.Default.AutoAwesome, contentDescription = "Gemini Sohbet") },
                                label = { Text("Gemini") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = OnyxCyanBright,
                                    selectedTextColor = OnyxCyanBright,
                                    unselectedIconColor = OnyxTextSecondary,
                                    unselectedTextColor = OnyxTextSecondary,
                                    indicatorColor = OnyxBorder
                                )
                            )
                            NavigationBarItem(
                                selected = selectedTab == 1,
                                onClick = { selectedTab = 1 },
                                icon = { Icon(Icons.Default.Groups, contentDescription = "Ajanlar") },
                                label = { Text("Ajanlar") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = OnyxCyanBright,
                                    selectedTextColor = OnyxCyanBright,
                                    unselectedIconColor = OnyxTextSecondary,
                                    unselectedTextColor = OnyxTextSecondary,
                                    indicatorColor = OnyxBorder
                                )
                            )
                            NavigationBarItem(
                                selected = selectedTab == 2,
                                onClick = { selectedTab = 2 },
                                icon = { Icon(Icons.Default.Hub, contentDescription = "Mesh") },
                                label = { Text("Mesh Ağı") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = OnyxCyanBright,
                                    selectedTextColor = OnyxCyanBright,
                                    unselectedIconColor = OnyxTextSecondary,
                                    unselectedTextColor = OnyxTextSecondary,
                                    indicatorColor = OnyxBorder
                                )
                            )
                        }
                    }
                ) { innerPadding ->
                    when (selectedTab) {
                        0 -> GeminiChatScreen(
                            viewModel = chatViewModel,
                            modifier = Modifier.padding(innerPadding)
                        )
                        1 -> AgentsScreen(
                            viewModel = chatViewModel,
                            onSelectAgent = { agentId ->
                                chatViewModel.selectAgent(agentId)
                                selectedTab = 0
                            }
                        )
                        2 -> MeshScreen()
                    }
                }
            }
        }
    }
}
