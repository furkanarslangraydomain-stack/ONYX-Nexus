import React from 'react';
import { Smartphone, Monitor, Server, Cloud, Cpu, Database, ArrowRight, RefreshCw, CheckCircle2, Shield } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4 mb-6">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Onyx-Nexus Sunucusuz Mobil Orkestrasyon Topolojisi
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Donanım kısıtlı bir mobil cihazın (Android Termux) bir OpenAI uç noktası olarak nasıl hizmet verdiği ve ağır bilgi işlem yükünü bulut altyapısına nasıl devrettiği.
          </p>
        </div>

        {/* Dağıtık Mimari Şeması */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Düğüm 1: İstemci Katmanı (Open WebUI) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" /> İstemci Katmanı
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  PC / Tarayıcı
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Open WebUI</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Telefona OpenAI uyumlu bir API sağlayıcısı olarak bağlanır (<code className="text-emerald-400">/v1/chat/completions</code>).
              </p>

              <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800/60 font-mono text-[11px] text-slate-300 space-y-1">
                <div>Metot: <span className="text-amber-300 font-bold">POST</span></div>
                <div>Uç Nokta: <span className="text-emerald-400">/v1/chat/completions</span></div>
                <div>Format: <span className="text-purple-300">OpenAI JSON / SSE Akışı</span></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
              Yerel Ağ (LAN) Wi-Fi Köprüsü (Port 8000)
            </div>
          </div>

          {/* Düğüm 2: Çekirdek Motor (Android Termux) */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/40 rounded-xl p-5 shadow-lg shadow-emerald-950/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-3">
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Android Çalışma Zamanı
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Termux Düşük-RAM
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100">Onyx-Nexus Motoru (FastAPI)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Saf asenkron olay döngüsü (<code className="text-slate-200">httpx</code>, <code className="text-slate-200">asyncio</code>, tek worker'lı <code className="text-slate-200">uvicorn</code>). Bellek kullanımı &lt; 35MB RAM.
              </p>

              {/* 5 Fazlı Mikro Döngü */}
              <div className="mt-4 space-y-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>Faz 1: Sys Admin Ajanı</span>
                  <span className="text-emerald-400 text-[10px]">Sistem Denetimi</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>Faz 2: Designer (Tasarımcı)</span>
                  <span className="text-cyan-400 text-[10px]">Mimari Taslak</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>Faz 3: Developer (Geliştirici)</span>
                  <span className="text-purple-400 text-[10px]">Saf Python</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-amber-500/30 text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    Faz 4: Runner (Çalıştırıcı)
                  </span>
                  <span className="text-amber-400 text-[10px]">Sandbox & Onarım</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>Faz 5: Reporter (Raporlayıcı)</span>
                  <span className="text-emerald-400 text-[10px]">Notion / Git Push</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Sıfır yerel derleme ve CPU yükü</span>
            </div>
          </div>

          {/* Düğüm 3: Harici Bulut Servisleri */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <span className="text-[11px] font-mono text-purple-400 font-bold flex items-center gap-1.5">
                  <Cloud className="w-4 h-4" /> Bulut Servisleri
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Devredilen Yük
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Sunucusuz Altyapı</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ağır CPU iş yükleri TLS REST çağrılarıyla buluta devredilir; telefon serin ve tepkisel kalır.
              </p>

              <div className="mt-4 space-y-2.5 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="text-cyan-400 font-semibold">Merkezi API Havuzu / LLM Router</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Mimari tasarım ve kod sentezi için yüksek hızlı çıkarım</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-slate-300">
                  <div className="text-amber-300 font-semibold">Piston Public Cloud Sandbox</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Sıfır maliyetli ve anahtarsız izole bulut konteyner ortamı</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="text-emerald-400 font-semibold">Notion Database / Yerel JSONL</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Değişmez denetim kaydı ve kalıcı durum hafızası</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
              Giden HTTPS REST (HTTPX)
            </div>
          </div>
        </div>

        {/* Kendi Kendini Onarma Döngüsü Açıklaması */}
        <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-lg p-4">
          <h5 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            Faz 4: Kendi Kendini Onaran (Self-Healing) Yeniden Deneme Döngüsü
          </h5>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Çalıştırıcı Ajan (Runner) üretilen Python kodunu bulut sandbox'ında çalıştırdığında, meydana gelen herhangi bir yürütme hatası (<code className="text-rose-400 font-mono">SyntaxError</code>, <code className="text-rose-400 font-mono">ModuleNotFoundError</code>, <code className="text-rose-400 font-mono">TypeError</code> vb.) yapılandırılmış bir hata izi (traceback) üretir. Onyx-Nexus bu hatayı yakalar, hatalı betikle paketler ve Geliştirici (Developer) Ajanı <em>Onarım Modunda</em> yeniden tetikler. Bu kendini onarma döngüsü en fazla <strong>3 deneme</strong> boyunca devam eder; ardından durumu raporlayıp sonucu Open WebUI'a iletir.
          </p>
        </div>
      </div>
    </div>
  );
};
