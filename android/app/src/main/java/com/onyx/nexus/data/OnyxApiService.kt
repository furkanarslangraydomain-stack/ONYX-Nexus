package com.onyx.nexus.data

import com.onyx.nexus.model.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface OnyxApiService {

    @POST("api/chat/completion")
    suspend fun sendChatCompletion(@Body request: ChatRequest): ChatResponse

    @GET("api/agents")
    suspend fun getAgents(): List<AgentBot>

    @GET("api/workflows")
    suspend fun getWorkflows(): List<Workflow>

    @GET("api/mesh/nodes")
    suspend fun getMeshNodes(): List<MeshNode>

    @GET("api/security/privacy-status")
    suspend fun getPrivacyStatus(): PrivacyStatus
}
