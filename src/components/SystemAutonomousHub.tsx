import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Database, 
  GitBranch, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Play, 
  RefreshCw, 
  Cpu, 
  Globe, 
  Layers, 
  Sparkles,
  GitPullRequest
} from 'lucide-react';

export function SystemAutonomousHub() {
  const [activeSection, setActiveSection] = useState<'consensus' | 'db' | 'git' | 'openapi' | 'freellm'>('consensus');

  // Consensus State
  const [consensusCode, setConsensusCode] = useState(`// Akıllı Kontrat / Sistem Kodu Örneği
function transferFunds(address recipient, uint256 amount) public {
    require(balances[msg.sender] >= amount, "Yetersiz bakiye");
    balances[msg.sender] -= amount;
    (bool sent, ) = recipient.call{value: amount}("");
    require(sent, "Transfer basarisiz");
}`);
  const [consensusResult, setConsensusResult] = useState<any>(null);
  const [isConsensusLoading, setIsConsensusLoading] = useState(false);

  // DB Optimizer State
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE users.status = 'active';");
  const [sqlDialect, setSqlDialect] = useState<'sqlite' | 'postgresql'>('sqlite');
  const [dbResult, setDbResult] = useState<any>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);

  // Git Automation State
  const [commitMessage, setCommitMessage] = useState("feat: integrate 5-node colab mesh, polyglot compiler, and 3d render studio");
  const [isPushing, setIsPushing] = useState(false);
  const [gitOutput, setGitOutput] = useState<any>(null);

  // OpenAPI State
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [curls, setCurls] = useState<any>(null);

  // Free LLM Repos State
  const [freeRepos, setFreeRepos] = useState<any[]>([]);
  const [isSyncingRepos, setIsSyncingRepos] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchOpenApi();
    fetchFreeRepos();
  }, []);

  const fetchOpenApi = async () => {
    try {
      const res = await fetch('/api/openapi/spec');
      const data = await res.json();
      setOpenApiSpec(data);

      const curlRes = await fetch('/api/openapi/curls');
      const curlData = await curlRes.json();
      setCurls(curlData);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFreeRepos = async () => {
    try {
      const res = await fetch('/api/freellm/repos');
      const data = await res.json();
      setFreeRepos(data.repos || []);
    } catch (e) {
      console.error(e);
    }
  };

  const runConsensusCheck = async () => {
    setIsConsensusLoading(true);
    try {
      const res = await fetch('/api/swarm/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: consensusCode, task_desc: "Kritik Güvenlik ve Mimari Karar Matrisi" })
      });
      const data = await res.json();
      setConsensusResult(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsConsensusLoading(false);
    }
  };

  const runSqlOptimizer = async () => {
    setIsDbLoading(true);
    try {
      const res = await fetch('/api/db/optimize-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dialect: sqlDialect, query: sqlQuery })
      });
      const data = await res.json();
      setDbResult(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsDbLoading(false);
    }
  };

  const handleGitPush = async () => {
    setIsPushing(true);
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage })
      });
      const data = await res.json();
      setGitOutput(data);
    } catch (e: any) {
      setGitOutput({ success: false, error: e.message });
    } finally {
      setIsPushing(false);
    }
  };

  const handleSyncRepos = async () => {
    setIsSyncingRepos(true);
    try {
      await fetch('/api/freellm/sync', { method: 'POST' });
      await fetchFreeRepos();
    } finally {
      setIsSyncingRepos(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono">
      
      {/* Top Section Nav Tabs */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              SİSTEM & OTONOM ARAŞTIRMA YETENEKLERİ
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Swarm Engine
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              3-Ajan Karar Matrisi • DB/SQL Optimizasyonu • Otomatik Git/PR • OpenAPI • 5 Free LLM Havuzu
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {[
            { id: 'consensus', label: '1. Swarm Konsensüsü', icon: ShieldCheck },
            { id: 'db', label: '2. DB/SQL Sihirbazı', icon: Database },
            { id: 'git', label: '3. GitHub/PR Otomasyonu', icon: GitBranch },
            { id: 'openapi', label: '4. OpenAPI / Swagger', icon: FileText },
            { id: 'freellm', label: '5. 5 Free LLM Havuzu', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
        
        {/* 1. KONSENSÜS SWARM */}
        {activeSection === 'consensus' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Akıllı Çoklu Ajan Konsensüsü (Consensus Swarm)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kod yazılırken <b>Baş Mimar</b>, <b>Web3 Güvenlik Uzmanı</b> ve <b>QA Ajanı</b> ortak karar matrisi ile kodu 3 aşamada denetler.
                </p>
              </div>
              <button
                onClick={runConsensusCheck}
                disabled={isConsensusLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                {isConsensusLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {isConsensusLoading ? 'Denetleniyor...' : 'Konsensüs Denetimi Başlat'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Code Input */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col">
                <div className="text-xs text-slate-400 mb-2 font-semibold flex justify-between">
                  <span>Denetlenecek Kaynak Kod:</span>
                  <span className="text-[11px] text-emerald-400">Solidity / Python / TS</span>
                </div>
                <textarea
                  value={consensusCode}
                  onChange={(e) => setConsensusCode(e.target.value)}
                  className="w-full flex-1 min-h-[220px] bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-emerald-300 font-mono resize-none focus:outline-none"
                />
              </div>

              {/* Matrix Results */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="text-xs text-slate-400 mb-2 font-semibold">3-Ajan Karar Matrisi Sonucu:</div>
                
                {consensusResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Ortak Karar (Verdict)</div>
                        <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" /> {consensusResult.verdict}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">Konsensüs Skoru</div>
                        <div className="text-lg font-bold text-emerald-400">%{consensusResult.consensus_score}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {consensusResult.agents.map((ag: any, idx: number) => (
                        <div key={idx} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                          <div className="flex justify-between font-semibold mb-1">
                            <span className="text-slate-200">{ag.role}</span>
                            <span className={ag.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                              {ag.verdict} (%{ag.score})
                            </span>
                          </div>
                          <ul className="text-[10px] text-slate-400 space-y-0.5">
                            {ag.findings.map((f: string, fIdx: number) => (
                              <li key={fIdx}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center">
                    Karar matrisini hesaplamak için "Konsensüs Denetimi Başlat" butonuna tıklayın.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. DB / SQL OPTİMİZASYON SİHİRBAZI */}
        {activeSection === 'db' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Veritabanı & SQL Optimizasyon Sihirbazı
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  PostgreSQL / SQLite WAL modu, indeksleme stratejileri, CTE & Nested Loop JOIN optimizasyonu.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sqlDialect}
                  onChange={(e) => setSqlDialect(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="sqlite">SQLite (FTS5 + WAL)</option>
                  <option value="postgresql">PostgreSQL (B-Tree + Hash Join)</option>
                </select>
                <button
                  onClick={runSqlOptimizer}
                  disabled={isDbLoading}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
                >
                  {isDbLoading ? 'Analiz Ediliyor...' : 'Sorguyu Optimize Et'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-semibold">Ham SQL Sorgusu:</div>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-32 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-cyan-300 font-mono resize-none focus:outline-none"
                />

                <div className="text-xs text-slate-400 font-semibold mt-2">Önerilen Sistem Yapılandırması:</div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                  {sqlDialect === 'sqlite' ? (
                    <>
                      <div>PRAGMA journal_mode = WAL;</div>
                      <div>PRAGMA synchronous = NORMAL;</div>
                      <div>PRAGMA cache_size = -64000;</div>
                    </>
                  ) : (
                    <>
                      <div>SET work_mem = '64MB';</div>
                      <div>SET random_page_cost = 1.1;</div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-semibold">Optimize Edilmiş Sorgu & İndeksler:</div>
                {dbResult ? (
                  <div className="space-y-3">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-emerald-400 font-mono">
                      {dbResult.rewritten_query}
                    </div>

                    {dbResult.recommended_indexes.length > 0 && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                        <div className="text-emerald-400 font-bold mb-1">Oluşturulacak İndeksler:</div>
                        {dbResult.recommended_indexes.map((idx: string, i: number) => (
                          <div key={i}>{idx}</div>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      Tahmini Hız Artışı: <span className="text-emerald-400 font-bold">{dbResult.estimated_speedup}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                    Optimizasyon planı için "Sorguyu Optimize Et" butonuna tıklayın.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. GITHUB & AKILLI COMMIT/PR OTOMASYONU */}
        {activeSection === 'git' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-orange-400" />
                GitHub & Akıllı Commit/PR Otomasyonu
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Üretilen tüm kodlar ve testler verilen GitHub tokeni ile doğrudan depoya (branch/PR) otomatik commit & push edilir.
              </p>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">
                  Semantic Commit Mesajı:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleGitPush}
                    disabled={isPushing}
                    className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs transition flex items-center gap-2"
                  >
                    {isPushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitPullRequest className="w-4 h-4" />}
                    {isPushing ? 'Push Ediliyor...' : 'Doğrudan Depoya Push Et'}
                  </button>
                </div>
              </div>

              {gitOutput && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                  <div className="text-slate-400 font-bold mb-1">Git İşlem Çıktısı:</div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(gitOutput, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. OPENAPI / SWAGGER SPECS */}
        {activeSection === 'openapi' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  API & Swagger / OpenAPI 3.0 Spesifikasyon Üreteci
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Geliştirilen tüm uç noktalar için otomatik OpenAPI 3.0 dokümantasyonu, cURL ve Postman koleksiyonu.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(openApiSpec, null, 2));
                  alert("OpenAPI JSON panoya kopyalandı!");
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
              >
                OpenAPI JSON Kopyala
              </button>
            </div>

            {curls && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 font-semibold">Hazır cURL Komutları:</div>
                {Object.entries(curls).map(([k, cmd]: any) => (
                  <div key={k} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-indigo-400 uppercase font-bold mb-1">{k} Endpoint:</div>
                    <pre className="bg-slate-950 p-2 rounded text-[10px] text-slate-300 overflow-x-auto font-mono">
                      {cmd}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. 5 FREE LLM API SAĞLAYICI HAVUZU */}
        {activeSection === 'freellm' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  5 Ücretsiz LLM Sağlayıcı GitHub Depo Entegrasyonu
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sıfır maliyetli ve API key gerektirmeyen 5 popüler açık kaynak katalog canlı olarak taranıp harmanlanır.
                </p>
              </div>
              <button
                onClick={handleSyncRepos}
                disabled={isSyncingRepos}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
              >
                {isSyncingRepos ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isSyncingRepos ? 'Kataloglar Taranıyor...' : 'Depoları Canlı Eşitle'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeRepos.map((r) => (
                <div key={r.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-200 truncate">{r.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">{r.desc}</p>
                    <div className="space-y-1 text-[10px] text-slate-400 font-mono mb-3">
                      <div>Bulunan Uç Nokta: <span className="text-emerald-400 font-bold">{r.endpoints_found}</span></div>
                      <div>Modeller: <span className="text-cyan-400">{r.models?.join(', ')}</span></div>
                    </div>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800"
                  >
                    GitHub Deposunu Görüntüle <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
