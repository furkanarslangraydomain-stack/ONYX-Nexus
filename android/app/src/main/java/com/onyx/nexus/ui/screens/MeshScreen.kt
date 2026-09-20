package com.onyx.nexus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onyx.nexus.data.OnyxRepository
import com.onyx.nexus.model.MeshNode
import com.onyx.nexus.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MeshScreen(repository: OnyxRepository = OnyxRepository()) {
    var nodes by remember { mutableStateOf<List<MeshNode>>(emptyList()) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            nodes = repository.getMeshNodes()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Colab 5-Cell Mesh & Telemetri",
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Zero-Knowledge Shield Banner
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = OnyxEmerald.copy(alpha = 0.1f),
                border = androidx.compose.foundation.BorderStroke(1.dp, OnyxEmerald.copy(alpha = 0.3f)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = OnyxEmerald,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Zero-Knowledge Privacy Shield",
                            fontWeight = FontWeight.Bold,
                            color = OnyxEmerald,
                            fontSize = 13.sp
                        )
                        Text(
                            text = "%100 Blind API Masking • Anti-Tampering Devrede",
                            color = OnyxTextSecondary,
                            fontSize = 11.sp
                        )
                    }
                }
            }

            Text(
                text = "Aktif P2P Küme Düğümleri (${nodes.size})",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = OnyxTextPrimary,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(nodes) { node ->
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = OnyxCard,
                        border = androidx.compose.foundation.BorderStroke(1.dp, OnyxBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Node #${node.nodeId}: ${node.name}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = OnyxTextPrimary
                                )
                                Text(
                                    text = "Port: ${node.port} • Rol: ${node.role}",
                                    fontSize = 11.sp,
                                    color = OnyxTextSecondary,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = OnyxCyan.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = node.status,
                                    color = OnyxCyanBright,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
