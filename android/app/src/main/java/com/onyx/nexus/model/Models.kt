package com.onyx.nexus.model

import com.google.gson.annotations.SerializedName

data class ChatMessage(
    val id: String,
    val role: String, // "user", "assistant", "system"
    val content: String,
    val agentProcess: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

data class AgentBot(
    val id: String,
    val name: String,
    val role: String,
    val avatar: String,
    val description: String,
    val status: String,
    val capabilities: List<String> = emptyList()
)

data class Workflow(
    val id: String,
    val name: String,
    val description: String,
    val steps: List<String> = emptyList(),
    val estimatedDuration: String = "2-4s"
)

data class ChatRequest(
    val prompt: String,
    val agent: String = "router",
    val workflow: String = "dual_stage_cot"
)

data class ChatResponse(
    val id: String?,
    val response: String?,
    val result: String?,
    val agent: String?,
    val workflow: String?
)

data class MeshNode(
    @SerializedName("node_id") val nodeId: Int,
    val name: String,
    val port: Int,
    val role: String,
    val status: String,
    val latency: String? = null
)

data class PrivacyStatus(
    val status: String?,
    @SerializedName("api_provider_blindness") val apiBlindness: String?,
    @SerializedName("anti_tampering") val antiTampering: String?
)
