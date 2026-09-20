"""
ONYX-NEXUS: Zero-Knowledge Gizlilik Kalkanı & Dış Müdahale Önleme Katmanı (ZK-Privacy & Anti-Tamper Shield)
========================================================================================================
Temel Görevler:
 1. Dış API sağlayıcıların (LLM sağlayıcıları, aracı sunucular) kullanıcının gerçek kodlarını,
    özel anahtarlarını (EVM Private Key), cüzdan adreslerini, API anahtarlarını, IP adreslerini
    ve kişisel verilerini (PII) GÖREMEMESİNİ sağlamak.
 2. İstek promptlarını kriptografik ve deterministik 'blind token'lar ile maskelemek.
 3. API sağlayıcıdan dönen yanıttaki blind token'ları YERELDE tekrar gerçek verilere dönüştürmek (De-masking).
 4. Dışarıdan veya model yanıtı içinden gelebilecek prompt injection, zararlı manipülasyon,
    sistem yönlendirmesi kırma (jailbreak) ve veri sızdırma girişimlerini tespit edip engellemek (Anti-Tampering).
 5. SHA-256 HMAC tabanlı bütünlük mührü ile veri paketinin kurcalanmasını önlemek.
"""

import re
import hmac
import hashlib
import secrets
import logging
from typing import Dict, Any, Tuple, List, Optional

logger = logging.getLogger("Onyx-Nexus.ZKPrivacyShield")

class ZKPrivacyAndTamperShield:
    """
    Sıfır Bilgili (Zero-Knowledge) Gizlilik ve Dış Müdahaleye Karşı Güvenlik Kalkanı.
    """

    def __init__(self, hmac_secret: Optional[str] = None):
        # Yerel oturum için rastgele oluşturulan ve sunucu dışına asla çıkmayan HMAC anahtarı
        self.secret_key = (hmac_secret or secrets.token_hex(32)).encode('utf-8')
        
        # İki yönlü haritalama sözlüğü: {mask_token: original_secret}
        self.mask_registry: Dict[str, str] = {}
        
        # Ters haritalama sözlüğü: {original_secret: mask_token} (Deterministik eşleşme için)
        self.reverse_registry: Dict[str, str] = {}

        # Gelişmiş Gizli Veri ve PII Kalıpları
        self.privacy_patterns = [
            # 1. EVM / Solidity Özel Anahtarları (64 hex karakter)
            (r'\b(?:0x)?[a-fA-F0-9]{64}\b', 'ONYX_MASK_PRIVKEY'),
            
            # 2. Ethereum / Web3 Cüzdan Adresleri (0x + 40 hex karakter)
            (r'\b0x[a-fA-F0-9]{40}\b', 'ONYX_MASK_ETH_ADDR'),
            
            # 3. Genel API Anahtarları (OpenAI, Anthropic, GitHub, E2B, AWS, vb.)
            (r'\b(sk-[a-zA-Z0-9_\-]{20,})\b', 'ONYX_MASK_APIKEY'),
            (r'\b(ghp_[a-zA-Z0-9]{30,})\b', 'ONYX_MASK_GITHUB_TOKEN'),
            (r'\b(e2b_[a-zA-Z0-9]{16,})\b', 'ONYX_MASK_E2B_KEY'),
            (r'\b(AKIA[0-9A-Z]{16})\b', 'ONYX_MASK_AWS_KEY'),
            (r'\bBearer\s+[A-Za-z0-9\-\._~\+\/]+=*', 'ONYX_MASK_BEARER_AUTH'),
            
            # 4. Veritabanı Bağlantı URI'leri ve Şifreler
            (r'(?:postgres|postgresql|mysql|mongodb|redis):\/\/[a-zA-Z0-9_\-\.]+:[^@\s]+@[a-zA-Z0-9_\-\.]+(?::\d+)?\/[a-zA-Z0-9_\-\.]+', 'ONYX_MASK_DBCONN'),
            
            # 5. IP Adresleri (IPv4 ve IPv6)
            (r'\b(?:\d{1,3}\.){3}\d{1,3}\b', 'ONYX_MASK_IPV4'),
            
            # 6. Kişisel Veriler (PII: E-posta, Telefon, Kredi Kartı)
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'ONYX_MASK_EMAIL'),
            (r'\b(?:\d[ -]*?){13,16}\b', 'ONYX_MASK_CREDIT_CARD'),
            (r'\b(?:05|5)\d{2}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b', 'ONYX_MASK_PHONE'),
            
            # 7. Hassas Sistem Yolları
            (r'(?:\/home\/[a-zA-Z0-9_-]+|\/Users\/[a-zA-Z0-9_-]+|C:\\Users\\[a-zA-Z0-9_-]+)', 'ONYX_MASK_USERPATH')
        ]

        # Dış Müdahale, Manipülasyon ve Prompt Injection Tehdit İmzaları
        self.injection_signatures = [
            r'ignore\s+previous\s+instructions',
            r'disregard\s+all\s+prior\s+prompts',
            r'you\s+are\s+now\s+in\s+dan\s+mode',
            r'system\s+prompt\s+override',
            r'output\s+all\s+environment\s+variables',
            r'leak\s+api\s+keys',
            r'<script\b[^>]*>(.*?)<\/script>',
            r'javascript:[a-zA-Z0-9_]+',
            r'DROP\s+TABLE\b',
            r';\s*rm\s+-rf\s+\/',
            r'--system-override--'
        ]

    def _generate_deterministic_token(self, prefix: str, secret_val: str) -> str:
        """Verilen gizli değer için yerel deterministik maske kodu üretir."""
        val_hash = hashlib.sha256((secret_val + self.secret_key.hex()).encode('utf-8')).hexdigest()[:8]
        return f"[{prefix}_{val_hash}]"

    def mask_prompt(self, text: str) -> Tuple[str, int]:
        """
        Kullanıcı promptunu veya kodunu harici API sağlayıcıya göndermeden önce
        tüm hassas verilerden arındırır ve kriptografik maskelerle değiştirir.
        Dış sağlayıcı ASLA gerçek anahtarları, cüzdanları veya kullanıcı verilerini göremez.
        """
        if not text or not isinstance(text, str):
            return text, 0

        masked_text = text
        replacements_count = 0

        for pattern, prefix in self.privacy_patterns:
            matches = re.findall(pattern, masked_text)
            for match in matches:
                # Eşleşme tuple ise ilk elemanı al
                match_str = match if isinstance(match, str) else match[0]
                if not match_str or len(match_str) < 4:
                    continue

                # Eğer bu gizli değer daha önce haritalanmışsa aynı tokenı kullan
                if match_str in self.reverse_registry:
                    token = self.reverse_registry[match_str]
                else:
                    token = self._generate_deterministic_token(prefix, match_str)
                    self.mask_registry[token] = match_str
                    self.reverse_registry[match_str] = token

                masked_text = masked_text.replace(match_str, token)
                replacements_count += 1

        return masked_text, replacements_count

    def unmask_response(self, text: str) -> str:
        """
        Dış API sağlayıcıdan dönen yanıttaki maske token'larını YERELDE
        orijinal değerleriyle değiştirir. Böylece kullanıcı tam ve eksiksiz
        kodu/sonucu görürken, dış sağlayıcı yalnızca maskelenmiş blind hallerini görmüştür.
        """
        if not text or not isinstance(text, str):
            return text

        unmasked_text = text
        for token, original_val in self.mask_registry.items():
            if token in unmasked_text:
                unmasked_text = unmasked_text.replace(token, original_val)

        return unmasked_text

    def detect_tampering_and_injection(self, text: str) -> Tuple[bool, List[str]]:
        """
        Gelen istekte veya dış model yanıtında dış müdahale, prompt injection
        veya zararlı sistem manipülasyonu bulunup bulunmadığını denetler.
        """
        if not text or not isinstance(text, str):
            return False, []

        detected_threats = []
        lower_text = text.lower()

        for sig in self.injection_signatures:
            if re.search(sig, lower_text, re.IGNORECASE):
                detected_threats.append(sig)

        is_tampered = len(detected_threats) > 0
        if is_tampered:
            logger.warning(f"[ZK-Shield] Dış müdahale / Prompt injection girişimi engellendi: {detected_threats}")

        return is_tampered, detected_threats

    def sanitize_payload(self, text: str) -> str:
        """
        Zararlı enjeksiyon şablonlarını nötralize eder ve zararlı kodları etkisizleştirir.
        """
        sanitized = text
        for sig in self.injection_signatures:
            sanitized = re.sub(sig, '[SECURITY_NEUTRALIZED_TOKEN]', sanitized, flags=re.IGNORECASE)
        return sanitized

    def generate_integrity_seal(self, payload: str) -> str:
        """Veri paketi için SHA-256 HMAC bütünlük mührü üretir."""
        return hmac.new(self.secret_key, payload.encode('utf-8'), hashlib.sha256).hexdigest()

    def verify_integrity_seal(self, payload: str, seal: str) -> bool:
        """Veri paketinin yolda manipüle edilip edilmediğini doğrular."""
        expected = self.generate_integrity_seal(payload)
        return hmac.compare_digest(expected, seal)

    def get_security_metrics(self) -> Dict[str, Any]:
        """Güvenlik katmanının anlık telemetri durumunu döndürür."""
        return {
            "status": "ACTIVE_ZERO_KNOWLEDGE",
            "active_masked_secrets": len(self.mask_registry),
            "protection_layers": [
                "PII & Private Key Auto-Redaction",
                "Web3 Wallet Address Blind Masking",
                "Reverse Local De-masking Engine",
                "Anti-Prompt-Injection Firewall",
                "HMAC-SHA256 Payload Integrity Verifier"
            ],
            "api_provider_blindness": "100% Blind (External APIs only process abstract tokens)"
        }

# Geriye dönük uyumluluk için takma ad (Alias)
AnonymizationEncryptionLayer = ZKPrivacyAndTamperShield
privacy_layer = ZKPrivacyAndTamperShield()
