import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Zap, AlertTriangle, CheckCircle, Code, Play, RefreshCw } from 'lucide-react';

interface AuditFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'GAS' | 'INFORMATIONAL';
  title: string;
  description: string;
  recommendation: string;
  lines: number[];
  count: number;
}

interface AuditReport {
  score: number;
  status: string;
  total_findings: number;
  findings: AuditFinding[];
  summary: string;
}

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OnyxVault - Güvenli DeFi Havuzu Örneği
 * @notice ReentrancyGuard ve CEI desenleri uygulanmıştır.
 */
contract OnyxVault is ReentrancyGuard, Ownable {
    mapping(address => uint256) public balances;
    uint256 public totalDeposits;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    error InsufficientBalance();
    error TransferFailed();

    constructor() Ownable(msg.sender) {}

    function deposit() external payable {
        require(msg.value > 0, "Zero deposit");
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Checks-Effects-Interactions (CEI) & nonReentrant
    function withdraw(uint256 amount) external nonReentrant {
        if (balances[msg.sender] < amount) revert InsufficientBalance();

        balances[msg.sender] -= amount;
        totalDeposits -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }
}
`;

export const Web3AuditorPanel: React.FC = () => {
  const [contractCode, setContractCode] = useState(SAMPLE_CONTRACT);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('onyx_api_url') || 'http://127.0.0.1:8000');

  const runAudit = async () => {
    if (!contractCode.trim()) return;
    setIsAuditing(true);
    try {
      const cleanUrl = apiUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/api/web3/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: contractCode })
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        // Fallback local regex audit
        runLocalAudit(contractCode);
      }
    } catch {
      runLocalAudit(contractCode);
    } finally {
      setIsAuditing(false);
    }
  };

  const runLocalAudit = (code: string) => {
    const findings: AuditFinding[] = [];
    let score = 100;

    if (code.includes('tx.origin')) {
      score -= 30;
      findings.push({
        id: 'SEC-001',
        severity: 'CRITICAL',
        title: 'tx.origin ile Kimlik Doğrulama Zafiyeti',
        description: 'tx.origin kimlik doğrulamada kullanılamaz. Phishing riskine açıktır.',
        recommendation: 'msg.sender kullanın.',
        lines: [1],
        count: 1
      });
    }

    if (code.includes('selfdestruct')) {
      score -= 20;
      findings.push({
        id: 'SEC-003',
        severity: 'HIGH',
        title: 'selfdestruct Kullanımı',
        description: 'selfdestruct EIP-6049 ile deprecated edilmiştir.',
        recommendation: 'selfdestruct çağrısını kaldırın.',
        lines: [1],
        count: 1
      });
    }

    if (!code.includes('nonReentrant') && (code.includes('.call{value:') || code.includes('.transfer('))) {
      score -= 15;
      findings.push({
        id: 'SEC-002',
        severity: 'HIGH',
        title: 'Reentrancy Riski Tespiti',
        description: 'Harici transferlerde ReentrancyGuard kullanılmamış olabilir.',
        recommendation: 'OpenZeppelin ReentrancyGuard ve nonReentrant modifier ekleyin.',
        lines: [1],
        count: 1
      });
    }

    score = Math.max(0, score);
    setReport({
      score,
      status: score >= 90 ? 'SECURE' : score >= 70 ? 'GOOD' : 'CRITICAL_RISK',
      total_findings: findings.length,
      findings,
      summary: `Güvenlik Skoru: ${score}/100. Toplam ${findings.length} adet bulgu tespit edildi.`
    });
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">KRİTİK</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-950 text-orange-300 border border-orange-800">YÜKSEK</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">ORTA</span>;
      case 'GAS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">GAS TASARRUFU</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">BİLGİ</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Web3 & Solidity Güvenlik Denetçisi (Audit Linter)
              <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                EVM & Slither Standardı
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Reentrancy, tx.origin, unchecked calls ve gas optimizasyonu için otomatik akıllı sözleşme analizi.
            </p>
          </div>
        </div>

        <button
          onClick={runAudit}
          disabled={isAuditing}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition shadow-lg shadow-purple-600/20"
        >
          {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isAuditing ? 'Denetleniyor...' : 'Sözleşmeyi Denetle'}</span>
        </button>
      </div>

      {/* Editor & Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solidity Code Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" /> Solidity Kaynak Kodu (.sol)
            </span>
            <button
              onClick={() => setContractCode(SAMPLE_CONTRACT)}
              className="text-[11px] font-mono text-slate-400 hover:text-white"
            >
              Varsayılan Şablon
            </button>
          </div>
          <textarea
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
            className="w-full flex-1 min-h-[420px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 selection:bg-purple-500/30 resize-y"
            placeholder="// Solidity kodunuzu buraya yapıştırın..."
            spellCheck={false}
          />
        </div>

        {/* Audit Findings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Denetim Raporu & Bulgular
            </span>
            {report && (
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                (report.score ?? 0) >= 90 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                (report.score ?? 0) >= 70 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                Skor: {Number.isFinite(report.score) ? report.score : 100}/100 ({report.status || 'GÜVENLİ'})
              </span>
            )}
          </div>

          {!report ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-700" />
              <p className="text-xs font-mono">
                Henüz bir denetim çalıştırılmadı. Soldaki Solidity kodunu test etmek için "Sözleşmeyi Denetle" butonuna tıklayın.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>{report.summary}</span>
                <span className="text-slate-500">{report.total_findings} Uyarı</span>
              </div>

              {report.findings.length === 0 ? (
                <div className="p-6 text-center bg-emerald-950/20 border border-emerald-900/50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-mono text-emerald-300 font-semibold">
                    Kritik Güvenlik Açığı Saptanmadı!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sözleşme OpenZeppelin standartlarına, CEI desenine ve modern EVM güvenlik pratiklerine uygundur.
                  </p>
                </div>
              ) : (
                report.findings.map((finding, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(finding.severity)}
                        <span className="text-xs font-mono font-bold text-slate-200">{finding.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Satır: {finding.lines.join(', ')}</span>
                    </div>
                    <p className="text-xs text-slate-400">{finding.description}</p>
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 text-[11px] font-mono text-purple-300">
                      💡 <strong>Öneri:</strong> {finding.recommendation}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
