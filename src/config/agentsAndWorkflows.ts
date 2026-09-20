import { AgentBotConfig, WorkflowConfig } from '../types';

export const CONFIGURED_AGENTS: AgentBotConfig[] = [
  {
    id: 'router',
    name: 'Nexus Router',
    role: 'Niyet Analizcisi & Yönlendirici',
    avatar: '🧭',
    description: 'Kullanıcı isteğinin niyetini analiz eder ve en uygun LLM havuzu veya uzman ajana yönlendirir.',
    status: 'ACTIVE',
    capabilities: ['Intent Classification', 'Model Pool Routing', 'Zero Latency Decision'],
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'architect',
    name: 'Master Architect',
    role: 'Sistem & Veri Mimarisi',
    avatar: '🏛️',
    description: 'Yüksek akıl yürütme ile modüler mimariyi, FTS5 WAL veritabanı şemasını ve .md blueprint hazırlar.',
    status: 'ACTIVE',
    capabilities: ['Markdown Blueprint', 'Microservices Topology', 'FTS5 WAL Schema Design'],
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'coder',
    name: 'Polyglot Developer',
    role: '2-Aşamalı Kod Üreticisi',
    avatar: '💻',
    description: 'Mimari blueprint planına harfiyen bağlı kalarak temiz, hatasız ve bellek sızıntısız kod üretir.',
    status: 'ACTIVE',
    capabilities: ['TypeScript & React', 'Python & FastAPI', 'Rust / Go / Solidity', 'Clean Architecture'],
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'sentinel',
    name: 'Sentinel (ZK-Shield)',
    role: 'Güvenlik & ZK-Gizlilik Kalkanı',
    avatar: '🛡️',
    description: 'Zero-Knowledge maskeleme ile dış sağlayıcıları körleştirir, prompt injection ve AST açıklarını engeller.',
    status: 'ACTIVE',
    capabilities: ['Zero-Knowledge Blind Token', 'Anti-Tampering & Injection', 'HMAC-SHA256 Integrity'],
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'runner',
    name: 'QA Runner & Sandbox',
    role: 'Test & Kendi Kendine Onarım',
    avatar: '🧪',
    description: 'Kodu sandbox ortamında çalıştırır. Hata olursa geliştiriciye hata geri bildirimi vererek 3 döngüde onarır.',
    status: 'ACTIVE',
    capabilities: ['Subprocess / E2B Sandbox', 'PyTest & Foundry Runner', '3-Cycle Auto Repair'],
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 'researcher',
    name: 'Deep Scholar',
    role: 'Derin Kanıt Araştırmacısı',
    avatar: '🔬',
    description: 'Halüsinasyonsuz, web ve dokümantasyonlardan kanıta dayalı gerçek zamanlı derin bilgi sentezler.',
    status: 'ACTIVE',
    capabilities: ['Wikipedia Knowledge Graph', 'Web Scraper & Miner', 'Evidence Synthesis'],
    color: 'from-blue-500 to-violet-600'
  },
  {
    id: 'web3',
    name: 'Web3 & EVM Auditor Bot',
    role: 'Akıllı Sözleşme Denetimi',
    avatar: '⛓️',
    description: 'Solidity ve EVM sözleşmelerinde reentrancy, integer overflow ve gas optimizasyonu analizleri yapar.',
    status: 'ACTIVE',
    capabilities: ['Reentrancy Detection', 'Gas Optimization', 'Bytecode & Slither Analysis'],
    color: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'devops',
    name: 'Auto-Git & DevOps Bot',
    role: 'Otonom Sürüm Yöneticisi',
    avatar: '🚀',
    description: 'Doğrulanmış kodları otomatik commit mesajı ile GitHub deposuna aktarır ve sürüm etiketlerini yönetir.',
    status: 'ACTIVE',
    capabilities: ['Auto Commit & Push', 'Token Authentication', 'Changelog Synthesis'],
    color: 'from-slate-400 to-slate-600'
  },
  {
    id: 'reporter',
    name: 'Notion & Telemetri Bot',
    role: 'Dokümantasyon & Telemetri',
    avatar: '📝',
    description: 'Oturum kararlarını, test sonuçlarını ve model performans telemetrisini Notion ve Markdown olarak belgeler.',
    status: 'ACTIVE',
    capabilities: ['Notion Database Sync', 'Markdown Documentation', 'Latency Telemetry'],
    color: 'from-fuchsia-500 to-pink-600'
  }
];

export const CONFIGURED_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'dual_stage_cot',
    name: 'Dual-Stage CoT Akışı',
    description: 'Mimari planlama ve kod üretimini birbirinden ayıran 2 aşamalı düşünce zinciri.',
    steps: ['Mimar (.md Blueprint)', 'Geliştirici (Temiz Kod)', 'QA (Doğrulama & Test)'],
    estimatedDuration: '3.2s',
    recommendedFor: 'Karmaşık Algoritmalar, Sistem Mimarisi ve Çok Dilli Projeler',
    icon: 'Layers',
    activeAgents: ['architect', 'coder', 'runner']
  },
  {
    id: 'consensus_swarm',
    name: '3-Ajanlı Swarm Konsensüsü',
    description: 'Architect, Coder ve Reviewer ajanlarının bağımsız puanlama ve konsensüs oylaması.',
    steps: ['Bölünmüş İstek Analizi', 'Paralel Puanlama & Matris', 'Ağırlıklı Konsensüs Birleşimi'],
    estimatedDuration: '2.8s',
    recommendedFor: 'Yüksek Güvenilirlik Gerektiren Kritik Kararlar ve Güvenlik Denetimleri',
    icon: 'Users',
    activeAgents: ['architect', 'coder', 'sentinel']
  },
  {
    id: 'auto_repair_loop',
    name: 'Sandbox & Auto-Repair Döngüsü',
    description: 'Kodu derleyip test eder, stderr hatası çıkarsa geliştiriciye döndürerek kendi kendini onarır.',
    steps: ['Kod Üretimi', 'Sandbox İzolasyon Testi', 'Hata Analizi', 'Düzeltme & Yeniden Derleme'],
    estimatedDuration: '4.5s',
    recommendedFor: 'Hatasız Çalışması Zorunlu Olan Betikler, API Servisleri ve Web3 Sözleşmeleri',
    icon: 'RefreshCw',
    activeAgents: ['coder', 'runner', 'sentinel']
  },
  {
    id: 'deep_research_flow',
    name: 'Otonom Derin Araştırma Akışı',
    description: 'Web kaynaklarını ve dokümantasyonları tarayarak kanıta dayalı sentez raporu üretir.',
    steps: ['Sorgu Analizi', 'Wikipedia & Web Kazıma', 'Kanıt Doğrulama', 'Nihai Sentez Raporu'],
    estimatedDuration: '3.8s',
    recommendedFor: 'Teknik Dokümantasyon İncelemesi, Kütüphane Karşılaştırması ve Akademik Özet',
    icon: 'Search',
    activeAgents: ['researcher', 'architect', 'reporter']
  },
  {
    id: 'zk_privacy_flow',
    name: 'Zero-Knowledge Gizlilik Kalkanı Akışı',
    description: 'Hassas verileri maskeler, dış LLM sağlayıcılarını körleştirir ve yerelde de-maske eder.',
    steps: ['Hassas Veri Tespiti', 'Deterministik Blind Maskeleme', 'Dış API Çağrısı', 'Yerel De-maskeleme & Mühür'],
    estimatedDuration: '1.9s',
    recommendedFor: 'Özel Anahtarlar, Veritabanı Bilgileri, Gizli API Anahtarları ve Özel Kodlar',
    icon: 'Shield',
    activeAgents: ['sentinel', 'router']
  }
];
