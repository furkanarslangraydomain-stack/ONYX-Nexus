import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode, 
  Terminal, 
  Copy, 
  Sparkles, 
  Layers, 
  Cpu, 
  Flame, 
  RefreshCw 
} from 'lucide-react';

type SupportedLanguage = 'solidity' | 'rust' | 'go' | 'cpp' | 'typescript' | 'python';
type TestFramework = 'foundry' | 'pytest' | 'jest';

const CODE_TEMPLATES: Record<SupportedLanguage, string> = {
  solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ONYX-Nexus Akıllı Kasa Sözleşmesi (EVM / Hardhat Testi)
contract SecureVault {
    address public owner;
    mapping(address => uint256) public balances;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Sifir bakiye yatirilamaz");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Yetersiz bakiye");
        balances[msg.sender] -= amount;
        
        // Guvenli Checks-Effects-Interactions paterni
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer basarisiz");
        emit Withdrawn(msg.sender, amount);
    }
}`,

  rust: `// ONYX-Nexus Zero-Cost Abstraction & Memory Safe Rust Modülü
use std::collections::HashMap;

#[derive(Debug)]
pub struct SwarmNode {
    pub id: String,
    pub active: bool,
    pub metrics: HashMap<String, f64>,
}

impl SwarmNode {
    pub fn new(id: &str) -> Self {
        SwarmNode {
            id: id.to_string(),
            active: true,
            metrics: HashMap::new(),
        }
    }

    pub fn record_metric(&mut self, key: &str, val: f64) {
        self.metrics.insert(key.to_string(), val);
    }
}

fn main() {
    let mut node = SwarmNode::new("node-primary-colab");
    node.record_metric("cpu_usage", 42.5);
    node.record_metric("ram_gb", 18.2);
    println!("Düğüm Başlatıldı: {:?}", node);
}`,

  go: `package main

import (
	"fmt"
	"sync"
	"time"
)

// ONYX-Nexus Eşzamanlı Goroutine ve Race Detector Simülasyonu
type MeshNode struct {
	ID    int
	Name  string
	Ready bool
}

func worker(id int, wg *sync.WaitGroup, ch chan<- string) {
	defer wg.Done()
	time.Sleep(50 * time.Millisecond)
	ch <- fmt.Sprintf("Node %d: Mesh Gossip Senkronizasyonu Tamam", id)
}

func main() {
	var wg sync.WaitGroup
	ch := make(chan string, 5)

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go worker(i, &wg, ch)
	}

	wg.Wait()
	close(ch)

	for msg := range ch {
		fmt.Println("[Go Worker]", msg)
	}
}`,

  cpp: `// ONYX-Nexus C++20 Modern Standart & Smart Pointer Güvenliği
#include <iostream>
#include <vector>
#include <memory>
#include <string>

class TensorBuffer {
public:
    TensorBuffer(size_t size) : size_(size), data_(std::make_unique<float[]>(size)) {
        std::cout << "TensorBuffer tahsis edildi: " << size_ << " eleman (RAII).\n";
    }
    ~TensorBuffer() {
        std::cout << "TensorBuffer guvenle serbest birakildi (Bellek sizintisi yok).\n";
    }
    size_t size() const { return size_; }

private:
    size_t size_;
    std::unique_ptr<float[]> data_;
};

int main() {
    auto tensor = std::make_shared<TensorBuffer>(1024);
    std::cout << "C++20 Zero-Overhead Memory Yönetimi Doğrulandı.\n";
    return 0;
}`,

  typescript: `// ONYX-Nexus Tip Güvenli Ajan Protokolü (TypeScript 5.4)
export interface AgentPayload {
  readonly taskId: string;
  readonly role: 'Architect' | 'Coder' | 'Reviewer' | 'Researcher';
  confidence: number;
  metadata: Record<string, unknown>;
}

export function validateConsensus(payload: AgentPayload): boolean {
  if (payload.confidence < 0.8) {
    console.warn(\`Guven esigi yetersiz: \${payload.confidence}\`);
    return false;
  }
  return true;
}

const testAgent: AgentPayload = {
  taskId: "task-colab-492",
  role: "Reviewer",
  confidence: 0.96,
  metadata: { engine: "e2b_sandbox", passed: true }
};

console.log("Doğrulama Durumu:", validateConsensus(testAgent));`,

  python: `# ONYX-Nexus Python AST & Otonom Sandbox Yürütme Modülü
import sys
import time

def execute_agent_pipeline():
    nodes = ["Orchestrator", "Polyglot", "Consensus", "3D_Studio", "Memory_DB"]
    print(f"[Python Sandbox] ONYX v2.0 Çekirdek Başlatıldı (Python {sys.version.split()[0]})")
    for i, node in enumerate(nodes, 1):
        print(f"  ✓ Düğüm {i}: {node} hazırlandı.")
    return {"status": "SUCCESS", "nodes_active": len(nodes)}

result = execute_agent_pipeline()
print("Sonuç:", result)
`
};

export function PolyglotSandbox() {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('solidity');
  const [code, setCode] = useState(CODE_TEMPLATES['solidity']);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<any>(null);

  // QA Test Generator State
  const [activeTab, setActiveTab] = useState<'compiler' | 'qa'>('compiler');
  const [qaFramework, setQaFramework] = useState<TestFramework>('foundry');
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [generatedTests, setGeneratedTests] = useState<any>(null);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    setCode(CODE_TEMPLATES[lang]);
    setCompileResult(null);
    if (lang === 'solidity') setQaFramework('foundry');
    else if (lang === 'python') setQaFramework('pytest');
    else setQaFramework('jest');
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const res = await fetch('/api/polyglot/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLang, code, auto_repair: true })
      });
      const data = await res.json();
      setCompileResult(data);
    } catch (err: any) {
      setCompileResult({
        success: false,
        stderr: 'Derleyici servisiyle bağlantı hatası: ' + err.message,
        errors: [err.message]
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleAutoRepair = () => {
    if (compileResult?.repair_suggestion) {
      setCode(compileResult.repair_suggestion);
      setCompileResult(null);
    }
  };

  const handleGenerateTests = async () => {
    setIsGeneratingTests(true);
    try {
      const res = await fetch('/api/qa/generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLang, code, framework: qaFramework })
      });
      const data = await res.json();
      setGeneratedTests(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGeneratingTests(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono">
      
      {/* Header Toolbar */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              POLYGLOT SANDBOX & DERLEME HAKİMİYETİ
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                6 Dil Destekli
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Solidity (solc/EVM), Rust (cargo), Go, C++20, TypeScript & Python + Otomatik Onarım
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('compiler')}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'compiler'
                ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Canlı Derleyici & Sandbox
          </button>
          <button
            onClick={() => {
              setActiveTab('qa');
              if (!generatedTests) handleGenerateTests();
            }}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'qa'
                ? 'bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Otomatik Birim Test (QA Tester)
          </button>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Dil Seçin:</span>
          {[
            { id: 'solidity', label: 'Solidity (EVM)', icon: Flame, color: 'text-orange-400' },
            { id: 'rust', label: 'Rust (Cargo)', icon: ShieldCheck, color: 'text-amber-400' },
            { id: 'go', label: 'Go (Golang)', icon: Cpu, color: 'text-cyan-400' },
            { id: 'cpp', label: 'C++20 (g++)', icon: Layers, color: 'text-blue-400' },
            { id: 'typescript', label: 'TypeScript', icon: FileCode, color: 'text-indigo-400' },
            { id: 'python', label: 'Python (AST)', icon: Terminal, color: 'text-emerald-400' },
          ].map((lang) => {
            const Icon = lang.icon;
            const isSelected = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id as SupportedLanguage)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition border ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/50 text-slate-100 font-bold shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${lang.color}`} />
                {lang.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'compiler' && (
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            {isCompiling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isCompiling ? 'Derleniyor...' : 'Derle & Çalıştır'}
          </button>
        )}

        {activeTab === 'qa' && (
          <button
            onClick={handleGenerateTests}
            disabled={isGeneratingTests}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-100 font-bold text-xs transition shadow-sm"
          >
            {isGeneratingTests ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isGeneratingTests ? 'Üretiliyor...' : 'Testleri Yeniden Üret'}
          </button>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Code Editor Pane */}
        <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-950">
          <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              Kaynak Kod Düzenleyici ({selectedLang})
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
                alert("Kod panoya kopyalandı!");
              }}
              className="hover:text-slate-200 flex items-center gap-1 text-[11px]"
            >
              <Copy className="w-3 h-3" /> Kopyala
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 p-4 font-mono text-xs text-emerald-300 leading-relaxed resize-none focus:outline-none selection:bg-emerald-500/30"
          />
        </div>

        {/* Right Output / QA Pane */}
        <div className="w-[45%] flex flex-col bg-slate-900/40 overflow-hidden">
          
          {activeTab === 'compiler' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Derleme Çıktısı & Ajan Tanılama Konsolu
                </span>
                {compileResult && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    compileResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {compileResult.success ? 'BAŞARILI' : 'HATA BULUNDU'}
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3">
                {!compileResult && !isCompiling && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
                    <Terminal className="w-10 h-10 mb-2 opacity-40 text-cyan-400" />
                    <p className="text-xs">Kodu doğrulamak ve çalıştırmak için yukarıdaki <b>"Derle & Çalıştır"</b> butonuna tıklayın.</p>
                  </div>
                )}

                {isCompiling && (
                  <div className="h-full flex items-center justify-center text-slate-400 gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>Kod derleniyor ve güvenlik denetimi yapılıyor...</span>
                  </div>
                )}

                {compileResult && (
                  <>
                    {/* Success Output */}
                    {compileResult.stdout && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400 whitespace-pre-wrap leading-relaxed">
                        {compileResult.stdout}
                      </div>
                    )}

                    {/* Stderr & Errors */}
                    {compileResult.stderr && (
                      <div className="bg-red-950/30 p-3 rounded-lg border border-red-800/50 text-red-300 whitespace-pre-wrap leading-relaxed">
                        <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Derleme Hatası:
                        </div>
                        {compileResult.stderr}
                      </div>
                    )}

                    {/* Warnings */}
                    {compileResult.warnings && compileResult.warnings.length > 0 && (
                      <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-800/50 text-amber-300 space-y-1">
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Uyarılar & Öneriler:
                        </div>
                        {compileResult.warnings.map((w: string, idx: number) => (
                          <div key={idx} className="text-[11px]">• {w}</div>
                        ))}
                      </div>
                    )}

                    {/* Auto-Repair Agent Proposal */}
                    {compileResult.repair_suggestion && (
                      <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-800/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-purple-400" /> Ajan Otomatik Onarım Teklifi
                          </span>
                          <button
                            onClick={handleAutoRepair}
                            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-slate-100 font-bold text-[10px] transition"
                          >
                            Tek Tıkla Uygula
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Ajan tespit edilen sözdizimi ve güvenlik hatasını analiz etti ve düzeltilmiş kod blokunu hazırladı.
                        </p>
                        <pre className="bg-slate-950 p-2 rounded text-[10px] text-purple-300 overflow-x-auto max-h-36">
                          {compileResult.repair_suggestion}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* QA Test Generator Pane */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Otomatik Birim Test & Foundry / PyTest Jeneratörü
                </span>
                <div className="flex items-center gap-1">
                  {(['foundry', 'pytest', 'jest'] as TestFramework[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setQaFramework(f);
                        handleGenerateTests();
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded transition uppercase ${
                        qaFramework === f
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {generatedTests ? (
                  <>
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="text-slate-300">
                        <span className="font-bold text-purple-400">{generatedTests.test_count} Test Senaryosu</span> üretildi: Fuzzing, Invariant & Sınır Durumlar
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedTests.test_code);
                          alert("Test kodu panoya kopyalandı!");
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Testi Kopyala
                      </button>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto whitespace-pre leading-relaxed">
                      {generatedTests.test_code}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    Testler yükleniyor...
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
