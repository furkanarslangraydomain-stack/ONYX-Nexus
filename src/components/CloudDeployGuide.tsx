import React, { useState } from 'react';
import { Cloud, Server, Terminal, Copy, Check, Sparkles, Zap, Shield, ExternalLink, Cpu, Database, Globe } from 'lucide-react';

export const CloudDeployGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const oneLinerCommand = `curl -sSL https://raw.githubusercontent.com/furkanarslangray/onyx-nexus/main/install.sh | bash`;
  const colabCommand = `!pip install -q fastapi uvicorn httpx pydantic && curl -sSL https://raw.githubusercontent.com/furkanarslangray/onyx-nexus/main/colab_runner.py | python3`;
  const manualOneLiner = `mkdir -p ~/onyx-nexus && cd ~/onyx-nexus && cat << 'EOF' > install.sh\n# install.sh içeriğini buraya yapıştırıp çalıştırın\nEOF\nchmod +x install.sh && ./install.sh`;

  const FREE_CLOUD_PROVIDERS = [
    {
      name: 'Oracle Cloud Always Free (En Güçlüsü)',
      specs: '4 OCPU ARM Ampere • 24 GB RAM • 200 GB NVMe Disk',
      price: 'Tamamen Ücretsiz (Süresiz)',
      crewAiReady: true,
      langChainReady: true,
      description: 'Dünyadaki en cömert ücretsiz bulut katmanıdır. 24 GB RAM sayesinde CrewAI, LangChain, LiteLLM, ChromaDB ve yerel Ollama modellerini dahi rahatlıkla 7/24 kesintisiz çalıştırır.',
      link: 'https://cloud.oracle.com/free',
      bestFor: 'Kalıcı 7/24 Çoklu Ajan ve LLM Sunucusu',
    },
    {
      name: 'Hugging Face Spaces (Docker / Python)',
      specs: '2 vCPU • 16 GB RAM • 50 GB Depolama • Ücretsiz HTTPS',
      price: 'Tamamen Ücretsiz',
      crewAiReady: true,
      langChainReady: true,
      description: 'Doğrudan bir Dockerfile veya FastAPI uygulaması barındırabilir. Otomatik olarak public HTTPS adresi verir. Open WebUI doğrudan bu HTTPS adresine bağlanabilir.',
      link: 'https://huggingface.co/spaces',
      bestFor: 'Kalıcı HTTPS API Uç Noktası',
    },
    {
      name: 'Google Colab + Cloudflare Tunnel',
      specs: '2 vCPU • 12-16 GB RAM • Opsiyonel T4 GPU',
      price: 'Tamamen Ücretsiz',
      crewAiReady: true,
      langChainReady: true,
      description: 'Ağır LangChain & CrewAI testleri için anında açılabilir. "cloudflared tunnel" ile tek satırda dış dünyaya ücretsiz tünel açarak Open WebUI ile eşleştirebilirsiniz.',
      link: 'https://colab.research.google.com',
      bestFor: 'Yüksek RAM ve GPU Gerektiren Testler',
    },
    {
      name: 'GitHub Codespaces',
      specs: '2 Çekirdek • 8 GB RAM • 32 GB Depolama',
      price: 'Aylık 60 Saat Ücretsiz',
      crewAiReady: true,
      langChainReady: true,
      description: 'Doğrudan GitHub deponuz üzerinden tek tıkla çalışır. Otomatik port iletme (port forwarding) özelliğiyle 8000 portunu hemen genel internete açabilir.',
      link: 'https://github.com/features/codespaces',
      bestFor: 'Hızlı Geliştirme & Canlı Test',
    },
  ];

  const ROADMAP_FEATURES = [
    {
      title: 'SSE Canlı Düşünce Akışı (<thought>)',
      category: 'Kullanıcı Deneyimi',
      description: 'Open WebUI içinde her ajanın ne düşündüğünü (Tasarımcı, Geliştirici, Düzeltici) katlanabilir düşünce baloncukları olarak anlık akıtır.',
      difficulty: 'Kolay',
      ready: true,
    },
    {
      title: 'Sıfır Maliyetli Web Arama Ajanı',
      category: 'Özerklik & Bilgi',
      description: 'DuckDuckGo HTML tarayıcısı ile hiçbir API anahtarı veya ödeme gerektirmeden internetten gerçek zamanlı dokümantasyon ve kütüphane çeker.',
      difficulty: 'Orta',
      ready: true,
    },
    {
      title: 'RAM Dostu SQLite Belleği (FTS5)',
      category: 'Hafıza',
      description: 'ChromaDB veya FAISS gibi ağır RAM yutan kütüphaneler yerine, Python yerleşik SQLite FTS5 ile <1MB bellek harcayan kalıcı hafıza.',
      difficulty: 'Kolay',
      ready: true,
    },
    {
      title: 'Çoklu Dil Yürütme Desteği',
      category: 'Yürütme',
      description: 'Piston Cloud altyapısıyla sadece Python değil; JavaScript (Node.js), Bash, Rust, Go ve C++ kodlarını da sıfır telefon yüküyle çalıştırır.',
      difficulty: 'Kolay',
      ready: true,
    },
    {
      title: 'Awesome-FreeLLM-APIs Gömülü Havuz',
      category: 'Model Sağlayıcı',
      description: 'Pollinations AI (DeepSeek / OpenAI) sıfır anahtar public uç noktaları doğrudan entegredir; kullanıcıdan hiçbir API anahtarı istenmez.',
      difficulty: 'Tamamlandı',
      ready: true,
    },
    {
      title: 'Telegram & Discord Köprüsü',
      category: 'İsteğe Bağlı',
      description: 'Kullanıcı tercihi doğrultusunda şu anda devre dışı bırakılmıştır.',
      difficulty: 'Hariç Tutuldu',
      ready: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Google Colab & Cloudflare Tünel (20GB RAM) Özel Kartı */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5 mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                20 GB RAM &amp; T4 GPU
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Cloudflare HTTPS Tüneli
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Google Colab + Cloudflare Tunnel ile Sıfır Maliyetli Başlatma
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Google Colab'ın devasa 20GB RAM'ini kullanarak kodları sıfır gecikmeyle çalıştırın. Cloudflare Tunnel, Colab'daki FastAPI sunucunuza ücretsiz, güvenli genel HTTPS linki (<code className="text-cyan-300 font-mono">trycloudflare.com</code>) açar.
            </p>
          </div>
          <a
            href="https://colab.research.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md whitespace-nowrap"
          >
            <span>Google Colab'ı Aç</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Colab Tek Tık Komutu */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-200 font-semibold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Colab Not Defteri Hücresine Yapıştırıp Çalıştırın (Play):
            </span>
            <button
              onClick={() => copyToClipboard(colabCommand, 'colab')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
            >
              {copiedKey === 'colab' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'colab' ? 'Kopyalandı!' : 'Colab Komutunu Kopyala'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-indigo-500/30 font-mono text-xs text-cyan-300 overflow-x-auto select-all shadow-inner">
            {colabCommand}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">1. Adım</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">Colab'da Çalıştır</div>
              <div className="text-[11px] text-slate-400 mt-1">Yukarıdaki tek satırı Colab hücresinde çalıştırın. 10 saniyede tünel linki üretilir.</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">2. Adım</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">Tünel Linkini Al</div>
              <div className="text-[11px] text-slate-400 mt-1">Konsolda beliren <code className="text-emerald-400 font-mono">https://...trycloudflare.com/v1</code> linkini kopyalayın.</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">3. Adım</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">Open WebUI'a Yapıştır</div>
              <div className="text-[11px] text-slate-400 mt-1">Ayarlar → Bağlantılar → OpenAI API yoluna yapıştırıp model olarak <code className="text-cyan-400 font-mono">onyx-nexus-agent</code> seçin.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tek Tıkla Kurulum Başlığı */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Tek Tıkla Kurulum &amp; Başlatma (One-Click Installer)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Termux'ta veya herhangi bir Linux sunucuda (Ubuntu/Debian) tek bir komutla tüm bağımlılıkları yükleyin, ortamı hazırlayın ve sistemi başlatın.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Otomatik Kurulum Aktif
          </span>
        </div>

        {/* Tek Satırlık Komut Kutusu */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Termux / Linux Tek Satırlık Kurulum Komutu:
            </span>
            <button
              onClick={() => copyToClipboard(oneLinerCommand, 'oneliner')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              {copiedKey === 'oneliner' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'oneliner' ? 'Kopyalandı!' : 'Komutu Kopyala'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto select-all">
            {oneLinerCommand}
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            * Bu komut: Paketleri günceller, Python ve derleyicileri kurar, Termux wake-lock açar, .env dosyasını oluşturur ve sunucuyu hazır hale getirir.
          </p>
        </div>
      </div>

      {/* Ücretsiz Güçlü Bulut Sunucuları (LangChain / CrewAI İçin) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" />
              CrewAI &amp; LangChain Kaldıracak Halka Açık Ücretsiz Sunucular
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Telefonun RAM'i yetmediğinde, ağır ajan orkestrasyonunu (CrewAI / AutoGen) sıfır maliyetle çalıştırabileceğiniz en güçlü bulut sağlayıcıları:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FREE_CLOUD_PROVIDERS.map((provider, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    {provider.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                    {provider.price}
                  </span>
                </div>

                <div className="text-xs font-mono text-cyan-400 font-medium mb-2.5">
                  {provider.specs}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {provider.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px]">{provider.bestFor}</span>
                <a
                  href={provider.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <span>Kayıt Ol / Aç</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sisteme Daha Neler Eklenebilir? (Gelecek Yol Haritası) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4 mb-5">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Sisteme Daha Neler Eklenebilir? (Geliştirme Yol Haritası)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Mevcut Termux + Open WebUI mimarisine eklenebilecek en verimli, RAM tüketmeyen özellikler:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROADMAP_FEATURES.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                  {item.ready ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Hazır / Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400">
                      Önerilen Eklenti
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200 mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Zorluk: {item.difficulty}</span>
                <span className="text-slate-400">0 Ekstra RAM Yükü</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
