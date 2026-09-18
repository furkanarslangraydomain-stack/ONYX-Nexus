import re
import hashlib
import json

class AnonymizationEncryptionLayer:
    """
    API Sağlayıcıların hassas verileri görmesini engellemek için Şifreleme/Anonimleştirme Katmanı.
    Bu katman, veriyi LLM'e göndermeden önce maskeler veya şifreler, LLM'den cevap gelince deşifre eder.
    Gerçek dünya senaryolarında PII (Personal Identifiable Information) tespiti için NLP modelleri (örn: Presidio) kullanılır.
    """
    def __init__(self):
        self.mock_pii_patterns = {
            r'\b(?:\d[ -]*?){13,16}\b': '[ENCRYPTED_CREDIT_CARD]', # Kredi kartı 
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b': '[ENCRYPTED_EMAIL]', # E-posta
            r'\b(?:05|5)\d{2}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}\b': '[ENCRYPTED_PHONE]', # Telefon
        }
        self.encryption_map = {}
        
    def encrypt_prompt(self, prompt: str) -> str:
        """Kullanıcının istemini API sağlayıcıya göndermeden önce şifreler/maskeler."""
        encrypted_prompt = prompt
        
        # Basit Regex bazlı PII maskeleme ve sözlüğe kaydetme (Geri dönüşüm için)
        for pattern, replacement in self.mock_pii_patterns.items():
            matches = re.findall(pattern, encrypted_prompt)
            for match in matches:
                # Eşsiz bir hash oluşturarak maskeyi belirle
                hash_key = f"{replacement}_{hashlib.md5(match.encode()).hexdigest()[:8]}"
                self.encryption_map[hash_key] = match
                encrypted_prompt = encrypted_prompt.replace(match, hash_key)
                
        return encrypted_prompt

    def decrypt_response(self, response: str) -> str:
        """API sağlayıcıdan dönen yanıtı deşifre ederek kullanıcıya orijinal veriyi gösterir."""
        decrypted_response = response
        
        for hash_key, original_value in self.encryption_map.items():
            decrypted_response = decrypted_response.replace(hash_key, original_value)
            
        return decrypted_response

# Global Instance
privacy_layer = AnonymizationEncryptionLayer()
