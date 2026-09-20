package com.onyx.nexus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.onyx.nexus.model.ChatMessage
import com.onyx.nexus.theme.*
import com.onyx.nexus.viewmodel.ChatViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GeminiChatScreen(
    viewModel: ChatViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    var showAgentDialog by remember { mutableStateOf(false) }
    var showWorkflowDialog by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var tempApiUrl by remember { mutableStateOf(uiState.apiUrl) }

    val activeAgent = uiState.agents.find { it.id == uiState.selectedAgentId }
        ?: uiState.agents.firstOrNull()

    val activeWorkflow = uiState.workflows.find { it.id == uiState.selectedWorkflowId }
        ?: uiState.workflows.firstOrNull()

    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(OnyxCyan, OnyxEmerald)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = "Sparkle",
                                tint = Color.Black,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "ONYX-NEXUS",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = OnyxTextPrimary
                            )
                            Text(
                                text = "Gemini 2.5 • AI OS",
                                fontSize = 11.sp,
                                color = OnyxCyanBright,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { showSettingsDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Ayarlar",
                            tint = OnyxTextSecondary
                        )
                    }
                    IconButton(onClick = { viewModel.clearMessages() }) {
                        Icon(
                            imageVector = Icons.Default.DeleteOutline,
                            contentDescription = "Temizle",
                            tint = OnyxTextSecondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = OnyxSurface
                )
            )
        },
        containerColor = OnyxBackground
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Agent & Workflow Selector Chips Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Agent Selector Chip
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = OnyxCard,
                    border = androidx.compose.foundation.BorderStroke(1.dp, OnyxBorder),
                    modifier = Modifier.clickable { showAgentDialog = true }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(text = activeAgent?.avatar ?: "🧭", fontSize = 14.sp)
                        Text(
                            text = activeAgent?.name ?: "Nexus Router",
                            color = OnyxCyanBright,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = null,
                            tint = OnyxTextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                // Workflow Selector Chip
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = OnyxCard,
                    border = androidx.compose.foundation.BorderStroke(1.dp, OnyxBorder),
                    modifier = Modifier.clickable { showWorkflowDialog = true }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Layers,
                            contentDescription = null,
                            tint = OnyxPurple,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = activeWorkflow?.name ?: "Dual-Stage CoT",
                            color = OnyxPurple,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = null,
                            tint = OnyxTextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            // Message Area
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                if (uiState.messages.isEmpty()) {
                    // Empty State: Gemini Welcome
                    GeminiWelcomeView(
                        onSuggestionClick = { prompt, agentId, wfId ->
                            if (agentId != null) viewModel.selectAgent(agentId)
                            if (wfId != null) viewModel.selectWorkflow(wfId)
                            viewModel.sendMessage(prompt)
                        }
                    )
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        contentPadding = PaddingValues(vertical = 12.dp)
                    ) {
                        items(uiState.messages) { message ->
                            MessageBubble(message = message)
                        }
                        if (uiState.isLoading) {
                            item {
                                LoadingBubble(activeAgent?.name ?: "Ajan")
                            }
                        }
                    }
                }
            }

            // Floating Gemini-Style Prompt Input Bar
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                shape = RoundedCornerShape(28.dp),
                color = OnyxCard,
                border = androidx.compose.foundation.BorderStroke(1.dp, OnyxCyan.copy(alpha = 0.3f)),
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = {
                            Text(
                                text = "ONYX-Nexus'a bir görev verin...",
                                color = OnyxTextSecondary,
                                fontSize = 14.sp
                            )
                        },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            disabledContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            cursorColor = OnyxCyanBright,
                            focusedTextColor = OnyxTextPrimary,
                            unfocusedTextColor = OnyxTextPrimary
                        ),
                        modifier = Modifier.weight(1f),
                        maxLines = 4
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    IconButton(
                        onClick = {
                            if (inputText.isNotBlank() && !uiState.isLoading) {
                                val text = inputText
                                inputText = ""
                                viewModel.sendMessage(text)
                            }
                        },
                        enabled = inputText.isNotBlank() && !uiState.isLoading,
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(
                                if (inputText.isNotBlank())
                                    Brush.linearGradient(listOf(OnyxCyan, OnyxEmerald))
                                else
                                    Brush.linearGradient(listOf(OnyxBorder, OnyxBorder))
                            )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "Gönder",
                            tint = if (inputText.isNotBlank()) Color.Black else OnyxTextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }

    // Dialogs
    if (showAgentDialog) {
        AlertDialog(
            onDismissRequest = { showAgentDialog = false },
            title = { Text(text = "Uzman Ajan Seçin", color = OnyxTextPrimary) },
            text = {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(uiState.agents) { agent ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (uiState.selectedAgentId == agent.id) OnyxCyan.copy(alpha = 0.15f) else OnyxSurface,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (uiState.selectedAgentId == agent.id) OnyxCyan else OnyxBorder
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.selectAgent(agent.id)
                                    showAgentDialog = false
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = agent.avatar, fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = agent.name,
                                        color = OnyxTextPrimary,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = agent.role,
                                        color = OnyxTextSecondary,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showAgentDialog = false }) {
                    Text("Kapat", color = OnyxCyanBright)
                }
            },
            containerColor = OnyxCard
        )
    }

    if (showWorkflowDialog) {
        AlertDialog(
            onDismissRequest = { showWorkflowDialog = false },
            title = { Text(text = "Otonom İş Akışı Seçin", color = OnyxTextPrimary) },
            text = {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(uiState.workflows) { wf ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (uiState.selectedWorkflowId == wf.id) OnyxPurple.copy(alpha = 0.15f) else OnyxSurface,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (uiState.selectedWorkflowId == wf.id) OnyxPurple else OnyxBorder
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.selectWorkflow(wf.id)
                                    showWorkflowDialog = false
                                }
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = wf.name,
                                    color = OnyxPurple,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = wf.description,
                                    color = OnyxTextSecondary,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showWorkflowDialog = false }) {
                    Text("Kapat", color = OnyxPurple)
                }
            },
            containerColor = OnyxCard
        )
    }

    if (showSettingsDialog) {
        AlertDialog(
            onDismissRequest = { showSettingsDialog = false },
            title = { Text(text = "API Sunucu Ayarları", color = OnyxTextPrimary) },
            text = {
                Column {
                    Text(
                        text = "Colab, Cloudflare tüneli veya yerel sunucu adresi:",
                        color = OnyxTextSecondary,
                        fontSize = 13.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = tempApiUrl,
                        onValueChange = { tempApiUrl = it },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = OnyxTextPrimary,
                            unfocusedTextColor = OnyxTextPrimary,
                            focusedBorderColor = OnyxCyanBright,
                            unfocusedBorderColor = OnyxBorder
                        )
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.setApiUrl(tempApiUrl)
                    showSettingsDialog = false
                }) {
                    Text("Kaydet", color = OnyxCyanBright)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSettingsDialog = false }) {
                    Text("İptal", color = OnyxTextSecondary)
                }
            },
            containerColor = OnyxCard
        )
    }
}

@Composable
fun GeminiWelcomeView(
    onSuggestionClick: (prompt: String, agentId: String?, wfId: String?) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(
                    Brush.linearGradient(
                        listOf(OnyxCyan, OnyxEmerald)
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = null,
                tint = Color.Black,
                modifier = Modifier.size(32.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Merhaba, ben ONYX-Nexus",
            fontSize = 22.sp,
            fontWeight = FontWeight.ExtraBold,
            color = OnyxTextPrimary
        )

        Text(
            text = "9 Uzman Ajan • Sıfır Maliyet Model Havuzu • ZK-Shield",
            fontSize = 12.sp,
            color = OnyxCyanBright,
            fontFamily = FontFamily.Monospace,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        // Suggestion Cards
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            SuggestionCard(
                title = "5-Ajanlı Swarm Konsensüsü",
                desc = "Architect, Coder ve Reviewer ile otonom kod üret",
                onClick = {
                    onSuggestionClick(
                        "Mikroservis mimarisinde çalışan bir veri işleme motoru için blueprint ve Python kodunu üret.",
                        "architect",
                        "consensus_swarm"
                    )
                }
            )

            SuggestionCard(
                title = "Web3 & EVM Akıllı Sözleşme",
                desc = "Solidity Staking sözleşmesi ve Slither analizi",
                onClick = {
                    onSuggestionClick(
                        "Solidity 0.8.24 ile reentrancy korumalı ERC-20 Staking sözleşmesi yaz.",
                        "web3",
                        "auto_repair_loop"
                    )
                }
            )

            SuggestionCard(
                title = "Zero-Knowledge Gizlilik Kalkanı",
                desc = "Hassas API anahtarlarını dış sağlayıcılardan gizle",
                onClick = {
                    onSuggestionClick(
                        "0x71C84183203fCd82004E82554CE1B31580A76356 cüzdan adresini ZK maskeleme ile körleştir.",
                        "sentinel",
                        "zk_privacy_flow"
                    )
                }
            )
        }
    }
}

@Composable
fun SuggestionCard(
    title: String,
    desc: String,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = OnyxCard,
        border = androidx.compose.foundation.BorderStroke(1.dp, OnyxBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = title,
                color = OnyxCyanBright,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = desc,
                color = OnyxTextSecondary,
                fontSize = 11.sp,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}

@Composable
fun MessageBubble(message: ChatMessage) {
    val isUser = message.role == "user"

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(OnyxCyan, OnyxEmerald)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = Color.Black,
                    modifier = Modifier.size(16.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Column(
            modifier = Modifier.widthIn(max = 300.dp),
            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
        ) {
            if (!isUser && message.agentProcess != null) {
                Text(
                    text = message.agentProcess,
                    fontSize = 10.sp,
                    color = OnyxCyanBright,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(bottom = 2.dp)
                )
            }

            Surface(
                shape = RoundedCornerShape(
                    topStart = 16.dp,
                    topEnd = 16.dp,
                    bottomStart = if (isUser) 16.dp else 4.dp,
                    bottomEnd = if (isUser) 4.dp else 16.dp
                ),
                color = if (isUser) OnyxCyan.copy(alpha = 0.85f) else OnyxCard,
                border = if (isUser) null else androidx.compose.foundation.BorderStroke(1.dp, OnyxBorder)
            ) {
                Text(
                    text = message.content,
                    color = if (isUser) Color.Black else OnyxTextPrimary,
                    fontSize = 13.sp,
                    lineHeight = 19.sp,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
                )
            }
        }
    }
}

@Composable
fun LoadingBubble(agentName: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(18.dp),
            color = OnyxCyanBright,
            strokeWidth = 2.dp
        )
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = "$agentName otonom olarak işliyor...",
            color = OnyxCyanBright,
            fontSize = 12.sp,
            fontFamily = FontFamily.Monospace
        )
    }
}
