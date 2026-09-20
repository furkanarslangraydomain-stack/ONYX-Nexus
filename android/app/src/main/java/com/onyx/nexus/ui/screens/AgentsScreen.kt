package com.onyx.nexus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onyx.nexus.theme.*
import com.onyx.nexus.viewmodel.ChatViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgentsScreen(
    viewModel: ChatViewModel,
    onSelectAgent: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Uzman Ajanlar & Swarm (${uiState.agents.size})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = OnyxTextPrimary
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OnyxSurface)
            )
        },
        containerColor = OnyxBackground
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.agents) { agent ->
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = OnyxCard,
                    border = androidx.compose.foundation.BorderStroke(1.dp, OnyxBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = agent.avatar, fontSize = 24.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = agent.name,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = OnyxTextPrimary
                                    )
                                    Text(
                                        text = agent.role,
                                        fontSize = 12.sp,
                                        color = OnyxCyanBright
                                    )
                                }
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = OnyxEmerald.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = agent.status,
                                    color = OnyxEmerald,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Text(
                            text = agent.description,
                            color = OnyxTextSecondary,
                            fontSize = 12.sp,
                            lineHeight = 17.sp,
                            modifier = Modifier.padding(top = 10.dp)
                        )

                        // Capabilities Chips
                        if (agent.capabilities.isNotEmpty()) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 10.dp),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                agent.capabilities.take(3).forEach { cap ->
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = OnyxSurface,
                                        border = androidx.compose.foundation.BorderStroke(1.dp, OnyxBorder)
                                    ) {
                                        Text(
                                            text = cap,
                                            fontSize = 9.sp,
                                            color = OnyxTextSecondary,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                        )
                                    }
                                }
                            }
                        }

                        // Activate in Chat Button
                        Button(
                            onClick = { onSelectAgent(agent.id) },
                            colors = ButtonDefaults.buttonColors(containerColor = OnyxSurface),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp)
                        ) {
                            Text("Bu Ajanla Sohbet Başlat", color = OnyxCyanBright, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
