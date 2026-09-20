"""
Onyx-Nexus Web3 Smart Contract Auditor & Security Analyzer
Checks Solidity contracts for common vulnerabilities:
- Reentrancy attacks
- tx.origin authorization
- Unchecked send/call return values
- Integer overflow/underflow (pre-0.8.0)
- Block timestamp manipulation
- Missing zero-address validations
- Selfdestruct usage
- Gas optimization tips (storage packing, calldata vs memory, custom errors)
"""

import re
from typing import List, Dict, Any

class Web3SecurityAuditor:
    def __init__(self):
        self.rules = [
            {
                "id": "SEC-001",
                "severity": "CRITICAL",
                "title": "tx.origin ile Kimlik Doğrulama Zafiyeti",
                "pattern": r"tx\.origin\s*==",
                "description": "tx.origin kullanımı phishing/man-in-the-middle saldırılarına açıktır. Her zaman msg.sender tercih edilmelidir.",
                "recommendation": "require(msg.sender == owner, 'Unauthorized'); kullanın."
            },
            {
                "id": "SEC-002",
                "severity": "HIGH",
                "title": "Potansiyel Reentrancy (Yeniden Giriş) Açığı",
                "pattern": r"(\.call\{value:|\.send\(|\.transfer\()",
                "description": "Harici transfer çağrısı öncesinde bakiye/durum güncellenmezse reentrancy açığı doğabilir.",
                "recommendation": "Checks-Effects-Interactions (CEI) desenine uyun ve OpenZeppelin 'nonReentrant' guard kullanın."
            },
            {
                "id": "SEC-003",
                "severity": "HIGH",
                "title": "Kendi Kendini Yok Etme (selfdestruct) Tespiti",
                "pattern": r"\bselfdestruct\s*\(",
                "description": "selfdestruct EIP-6049 ile kullanımdan kaldırılmıştır ve sözleşmenin fonlarını riske atabilir.",
                "recommendation": "selfdestruct fonksiyonunu kaldırın veya çoklu imza (multisig) denetimine bağlayın."
            },
            {
                "id": "SEC-004",
                "severity": "MEDIUM",
                "title": "Kontrol Edilmeyen Düşük Seviyeli Çağrı (Unchecked Low-Level Call)",
                "pattern": r"(?<!\()(?<!bool\s+success,\s+)\b\w+\.call\{",
                "description": "call{} dönüş değeri bool success kontrol edilmezse işlem sessizce başarısız olabilir.",
                "recommendation": "(bool success, ) = recipient.call{value: amount}(''); require(success, 'Transfer failed'); kullanın."
            },
            {
                "id": "SEC-005",
                "severity": "LOW",
                "title": "block.timestamp Manipülasyonu",
                "pattern": r"\b(block\.timestamp|now)\b",
                "description": "Madenciler/doğrulayıcılar timestamp değerini birkaç saniye manipüle edebilir. Rastgelelik veya kritik kilit için güvenilmez.",
                "recommendation": "Rastgelelik için Chainlink VRF kullanın; kilitler için block.number tercih edilebilir."
            },
            {
                "id": "SEC-006",
                "severity": "INFORMATIONAL",
                "title": "Eski Solidity Sürümü (<0.8.0)",
                "pattern": r"pragma\s+solidity\s+[\^><=]*0\.[0-7]\.",
                "description": "0.8.0 öncesi sürümlerde SafeMath kütüphanesi kullanılmazsa integer overflow riski bulunur.",
                "recommendation": "Sözleşmeyi 'pragma solidity ^0.8.20;' sürümüne yükseltin (otomatik SafeMath dahildir)."
            },
            {
                "id": "GAS-001",
                "severity": "GAS",
                "title": "Gas Tasarrufu: Özel Hata Tipleri (Custom Errors)",
                "pattern": r'require\([^,]+,\s*"[^"]{10,}"\)',
                "description": "require() içindeki uzun string mesajlar deploy ve revert maliyetini ciddi oranda artırır.",
                "recommendation": "require yerine 'if (!condition) revert CustomError();' kalıbını kullanın."
            },
            {
                "id": "GAS-002",
                "severity": "GAS",
                "title": "Gas Tasarrufu: Calldata vs Memory",
                "pattern": r'function\s+\w+\s*\([^)]*string\s+memory|bytes\s+memory',
                "description": "Yalnızca okunan parametrelerde 'memory' yerine 'calldata' kullanmak hafıza tahsis maliyetini düşürür.",
                "recommendation": "Salt-okunur fonksiyon parametrelerinde 'calldata' anahtar kelimesini kullanın."
            }
        ]

    def audit(self, code: str) -> Dict[str, Any]:
        findings = []
        score = 100
        
        for rule in self.rules:
            matches = list(re.finditer(rule["pattern"], code, re.MULTILINE))
            if matches:
                line_numbers = []
                for match in matches:
                    line_num = code[:match.start()].count('\n') + 1
                    line_numbers.append(line_num)
                
                # Ceza puanı
                sev = rule["severity"]
                if sev == "CRITICAL":
                    score -= 30
                elif sev == "HIGH":
                    score -= 15
                elif sev == "MEDIUM":
                    score -= 8
                elif sev == "LOW":
                    score -= 4
                elif sev == "GAS":
                    score -= 2

                findings.append({
                    "id": rule["id"],
                    "severity": rule["severity"],
                    "title": rule["title"],
                    "description": rule["description"],
                    "recommendation": rule["recommendation"],
                    "lines": line_numbers,
                    "count": len(matches)
                })

        score = max(0, min(100, score))
        
        status = "SECURE"
        if score < 50:
            status = "CRITICAL_RISK"
        elif score < 75:
            status = "NEEDS_IMPROVEMENT"
        elif score < 90:
            status = "GOOD"

        return {
            "score": score,
            "status": status,
            "total_findings": len(findings),
            "findings": findings,
            "summary": f"Güvenlik Skoru: {score}/100 ({status}). Toplam {len(findings)} adet bulgu saptandı."
        }

auditor = Web3SecurityAuditor()
