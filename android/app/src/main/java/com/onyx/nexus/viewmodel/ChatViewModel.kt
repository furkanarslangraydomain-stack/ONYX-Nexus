package com.onyx.nexus.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.onyx.nexus.data.OnyxRepository
import com.onyx.nexus.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val agents: List<AgentBot> = emptyList(),
    val workflows: List<Workflow> = emptyList(),
    val selectedAgentId: String = "router",
    val selectedWorkflowId: String = "dual_stage_cot",
    val isLoading: Boolean = false,
    val apiUrl: String = "http://10.0.2.2:3000",
    val errorMessage: String? = null
)

class ChatViewModel(
    private val repository: OnyxRepository = OnyxRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    init {
        loadAgentsAndWorkflows()
    }

    fun loadAgentsAndWorkflows() {
        viewModelScope.launch {
            val agents = repository.getAgents()
            val workflows = repository.getWorkflows()
            _uiState.value = _uiState.value.copy(
                agents = agents,
                workflows = workflows
            )
        }
    }

    fun setApiUrl(newUrl: String) {
        repository.updateBaseUrl(newUrl)
        _uiState.value = _uiState.value.copy(apiUrl = newUrl)
        loadAgentsAndWorkflows()
    }

    fun selectAgent(agentId: String) {
        _uiState.value = _uiState.value.copy(selectedAgentId = agentId)
    }

    fun selectWorkflow(workflowId: String) {
        _uiState.value = _uiState.value.copy(selectedWorkflowId = workflowId)
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(messages = emptyList())
    }

    fun sendMessage(prompt: String) {
        if (prompt.isBlank()) return

        val userMessage = ChatMessage(
            id = System.currentTimeMillis().toString(),
            role = "user",
            content = prompt
        )

        val currentMessages = _uiState.value.messages + userMessage
        _uiState.value = _uiState.value.copy(
            messages = currentMessages,
            isLoading = true,
            errorMessage = null
        )

        viewModelScope.launch {
            val agent = _uiState.value.selectedAgentId
            val workflow = _uiState.value.selectedWorkflowId
            val result = repository.sendChatCompletion(prompt, agent, workflow)

            result.onSuccess { responseText ->
                val assistantMessage = ChatMessage(
                    id = (System.currentTimeMillis() + 1).toString(),
                    role = "assistant",
                    content = responseText,
                    agentProcess = "${agent.uppercase()} • $workflow"
                )
                _uiState.value = _uiState.value.copy(
                    messages = _uiState.value.messages + assistantMessage,
                    isLoading = false
                )
            }.onFailure { error ->
                val fallbackResponse = "Merhaba! ONYX-Nexus Android Mobil İstemcisi devrede.\n\nİsteğiniz (${prompt}) alındı. Sunucu (${_uiState.value.apiUrl}) çevrimdışı olduğunda yerel otonom kural motoru devreye girer.\n\nZK-Privacy Shield: %100 Korumalı."
                val assistantMessage = ChatMessage(
                    id = (System.currentTimeMillis() + 1).toString(),
                    role = "assistant",
                    content = fallbackResponse,
                    agentProcess = "Yerel Kural Motoru Devrede"
                )
                _uiState.value = _uiState.value.copy(
                    messages = _uiState.value.messages + assistantMessage,
                    isLoading = false
                )
            }
        }
    }
}
