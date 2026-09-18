import sqlite3
import logging

logger = logging.getLogger(__name__)

class PersonaEngine:
    """
    Kişilik Klonlama ve Aynalama (Mirroring) Modülü.
    Kullanıcının geçmişteki bağlamına bakarak onun gibi konuşmasını ve 
    onun bilgilerini (hafıza) benimsemesini sağlar.
    """
    def __init__(self, db_path="memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_profile(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trait_type TEXT,
                    trait_value TEXT
                )
            """)
            conn.commit()

    def get_mirroring_prompt(self) -> str:
        return """
[KİŞİLİK KLONLAMA VE AYNALAMA (PERSONA MIRRORING) PROTOKOLÜ]
Sen Onyx-Nexus'sun, ancak aynı zamanda bu kullanıcının dijital bir yansıması (klonu) haline geliyorsun.
Kurallar:
1. Üslup Kopyalama (Mirroring): Yukarıda sana verilen geçmiş sohbet geçmişine bakarak kullanıcının üslubunu, kelime seçimlerini, enerji seviyesini ve iletişim tonunu analiz et. Kullanıcıya KENDİ tarzıyla yanıt ver. O ne kadar samimi, esprili, kısa, net veya ciddiyse sen de öyle ol.
2. Bilgi Sahiplenme: Kullanıcının sevdiği teknolojileri, hobilerini ve geçmişte verdiği bilgileri sanki kendi karakterinin ve hafızanın bir parçasıymış gibi benimse.
3. Kırmızı Çizgi (Kalite): Karakterin ve üslubun kullanıcıya benzeyecek olsa da, kodlama, mühendislik ve problem çözme yeteneğin "Kıdemli Başmühendis" seviyesinde KALMALIDIR. İşini kusursuz ve profesyonelce yaparken, bunu kullanıcının tarzında paketle.
"""

if __name__ == "__main__":
    p = PersonaEngine()
    print("Persona Engine Initialized.")
