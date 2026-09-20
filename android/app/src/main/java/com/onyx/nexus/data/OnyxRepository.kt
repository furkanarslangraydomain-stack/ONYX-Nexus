package com.onyx.nexus.data

import com.onyx.nexus.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class OnyxRepository(var baseUrl: String = "http://10.0.2.2:3000/") {

    private var apiService: OnyxApiService = createApiService(baseUrl)

    fun updateBaseUrl(newUrl: String) {
        val formatted = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        baseUrl = formatted
        apiService = createApiService(formatted)
    }

    private fun createApiService(url: String): OnyxApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(url)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(OnyxApiService::class.java)
    }

    suspend fun sendChatCompletion(prompt: String, agent: String, workflow: String): Result<String> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.sendChatCompletion(ChatRequest(prompt, agent, workflow))
                val content = response.response ?: response.result ?: "İşlem tamamlandı."
                Result.success(content)
            } catch (e: Exception) {
                // Return descriptive error or simulated intelligent response when offline
                Result.failure(e)
            }
        }

    suspend fun getAgents(): List<AgentBot> = withContext(Dispatchers.IO) {
        try {
            apiService.getAgents()
        } catch (e: Exception) {
            fallbackAgents()
        }
    }

    suspend fun getWorkflows(): List<Workflow> = withContext(Dispatchers.IO) {
        try {
            apiService.getWorkflows()
        } catch (e: Exception) {
            fallbackWorkflows()
        }
    }

    suspend fun getMeshNodes(): List<MeshNode> = withContext(Dispatchers.IO) {
        try {
            apiService.getMeshNodes()
        } catch (e: Exception) {
            listOf(
                MeshNode(1, "Master Orchestrator", 8000, "Leader", "ONLINE", "12ms"),
                MeshNode(2, "Polyglot Compiler", 8001, "Compiler", "ONLINE", "15ms"),
                MeshNode(3, "Swarm Consensus", 8002, "Auditor", "ONLINE", "18ms"),
                MeshNode(4, "3D Studio & Vision", 8003, "Renderer", "ONLINE", "22ms"),
                MeshNode(5, "Vector DB & Memory", 8004, "Storage", "ONLINE", "10ms")
            )
        }
    }

    private fun fallbackAgents(): List<AgentBot> {
        return listOf(
            AgentBot("router", "Nexus Router", "Niyet & Yönlendirici", "🧭", "Kullanıcı isteğinin niyetini analiz eder ve en uygun LLM havuzuna yönlendirir.", "ACTIVE", listOf("Intent Detection", "Model Pool Routing")),
            AgentBot("architect", "Master Architect", "Sistem & Veri Mimarisi", "🏛️", "Modüler mimariyi, FTS5 WAL şemasını ve .md blueprint hazırlar.", "ACTIVE", listOf("Blueprint", "Topology")),
            AgentBot("coder", "Polyglot Developer", "2-Aşamalı Kod Üreticisi", "💻", "Mimari plana bağlı kalarak temiz ve optimize kod üretir.", "ACTIVE", listOf("Kotlin", "Python", "TypeScript")),
            AgentBot("sentinel", "Sentinel (ZK-Shield)", "Güvenlik & ZK-Kalkanı", "🛡️", "Dış API'leri körleştirir, hassas verileri maskeler.", "ACTIVE", listOf("Blind Tokens", "Anti-Tamper")),
            AgentBot("runner", "QA Runner & Sandbox", "Test & Onarım", "🧪", "Kodu sandbox ortamında test eder ve otomatik onarır.", "ACTIVE", listOf("Subprocess", "Auto-Repair")),
            AgentBot("researcher", "Deep Scholar", "Derin Araştırmacı", "🔬", "Web ve dokümanlardan kanıta dayalı analiz yapar.", "ACTIVE", listOf("Knowledge Graph", "Scraper")),
            AgentBot("web3", "Web3 Auditor Bot", "Sözleşme Denetimi", "⛓️", "Reentrancy ve gas optimizasyonu analizleri yapar.", "ACTIVE", listOf("EVM Analysis", "Gas Audit")),
            AgentBot("devops", "Auto-Git Bot", "Sürüm Yöneticisi", "🚀", "Onaylı kodları GitHub deposuna aktarır.", "ACTIVE", listOf("Auto-Commit", "Push")),
            AgentBot("reporter", "Notion Bot", "Dokümantasyon", "📝", "Oturum kararlarını ve telemetriyi belgeler.", "ACTIVE", listOf("Notion Sync", "Logs"))
        )
    }

    private fun fallbackWorkflows(): List<Workflow> {
        return listOf(
            Workflow("dual_stage_cot", "Dual-Stage CoT Akışı", "Planlama ve kod üretimini ayıran 2 aşamalı düşünce zinciri.", listOf("Mimar Blueprint", "Geliştirici Kod", "QA Doğrulama"), "3.2s"),
            Workflow("consensus_swarm", "3-Ajanlı Swarm Konsensüsü", "Architect, Coder ve Reviewer ajanlarının bağımsız oylaması.", listOf("İstek Analizi", "Paralel Matris", "Konsensüs"), "2.8s"),
            Workflow("auto_repair_loop", "Sandbox & Auto-Repair", "Kodu test eder, hata çıkarsa otomatik onarır.", listOf("Kodlama", "Sandbox Test", "Hata Düzeltme"), "4.5s"),
            Workflow("deep_research_flow", "Otonom Derin Araştırma", "Kaynakları tarayarak kanıta dayalı sentez raporu üretir.", listOf("Sorgu Analizi", "Web Tarama", "Rapor"), "3.8s"),
            Workflow("zk_privacy_flow", "Zero-Knowledge Gizlilik", "Hassas verileri maskeler ve yerelde de-maske eder.", listOf("Maskeleme", "Kör Çağrı", "De-maskeleme"), "1.9s")
        )
    }
}
