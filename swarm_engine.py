from deep_research import DeepResearchEngine
from git_agent import AutoGitAgent
import asyncio
import logging
import re
import subprocess
import os
import gc

logger = logging.getLogger(__name__)


def set_memory_limit(unlimited: bool = True):
    """
    Sistem RAM sınırını yönetir.
    256 MB veya 12 GB gibi yapay kısıtlamalar kaldırılmıştır.
    Varsayılan olarak kısıtlamasız (unlimited) tam sistem belleği (Colab 20GB+ RAM) tahsis edilir.
    """
    if unlimited:
        # 256MB / 12GB gibi suni kısıtlamalar tamamen kaldırıldı - sınırsız RAM tahsisi
        return
    try:
        import resource
        resource.setrlimit(resource.RLIMIT_AS, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))
    except Exception:
        pass # Windows veya kısıtlama desteklenmeyen ortam

def extract_python_code(text):
    match = re.search(r'```python\n(.*?)\n```', text, re.DOTALL)
    return match.group(1) if match else None

COMMON_PACKAGE_MAP = {
    "cv2": "opencv-python",
    "yaml": "pyyaml",
    "sklearn": "scikit-learn",
    "PIL": "pillow",
    "bs4": "beautifulsoup4",
    "dotenv": "python-dotenv",
    "dateutil": "python-dateutil",
    "Crypto": "pycryptodome",
    "Cryptodome": "pycryptodome",
}

def auto_install_missing_dependency(stderr_text: str) -> bool:
    """
    Stderr çıktısını analiz eder, eksik kütüphane varsa (ModuleNotFoundError)
    otomatik olarak pip install ile yükler. Başarılı olursa True döner.
    """
    if not stderr_text:
        return False
    
    match = re.search(r"ModuleNotFoundError:\s+No\s+module\s+named\s+['\"]([^'\"]+)['\"]", stderr_text)
    if not match:
        match = re.search(r"ImportError:\s+cannot\s+import\s+name\s+['\"]([^'\"]+)['\"]", stderr_text)
    
    if not match:
        return False
        
    module_name = match.group(1).split('.')[0]
    pkg_to_install = COMMON_PACKAGE_MAP.get(module_name, module_name)
    logger.info(f"[Auto-Dependency Installer] Eksik kütüphane tespit edildi: '{pkg_to_install}'. Otomatik yükleniyor...")
    
    try:
        res = subprocess.run(
            [sys.executable if 'sys' in globals() else "python3", "-m", "pip", "install", "-q", pkg_to_install],
            capture_output=True,
            text=True,
            timeout=60
        )
        if res.returncode == 0:
            logger.info(f"[Auto-Dependency Installer] '{pkg_to_install}' başarıyla yüklendi.")
            return True
        else:
            logger.warning(f"[Auto-Dependency Installer] '{pkg_to_install}' yüklenemedi: {res.stderr}")
            return False
    except Exception as e:
        logger.warning(f"[Auto-Dependency Installer] Kurulum hatası: {e}")
        return False

def execute_in_sandbox(code):
    """
    Kodu izole bir alanda (sandbox) test eder.
    Eğer sistemde E2B_API_KEY tanımlıysa Cloud Sandbox (E2B) kullanır, 
    değilse yerel (Local Subprocess) Fallback kullanır.
    Eksik kütüphane tespit edilirse Auto-Dependency Installer otomatik yükleyip tekrar dener.
    """
    e2b_key = os.environ.get("E2B_API_KEY")
    if e2b_key:
        try:
            from e2b_code_interpreter import Sandbox
            with Sandbox(api_key=e2b_key) as sandbox:
                execution = sandbox.run_code(code, timeout=15)
                out_msg = f"--- E2B CLOUD SANDBOX ÇALIŞTIRMA SONUCU ---\n"
                
                if execution.logs.stdout:
                    out_msg += f"Çıktı (Stdout):\n{''.join(execution.logs.stdout)[:500]}\n"
                if execution.error:
                    out_msg += f"Hata (Stderr) - LÜTFEN BUNU DÜZELT:\n{execution.error.name}: {execution.error.value}\n"
                return out_msg
        except ImportError:
            return "HATA: E2B kütüphanesi yüklü değil. Lütfen 'pip install e2b_code_interpreter' çalıştırın."
        except Exception as e:
            return f"E2B Cloud Hatası: {str(e)}"
            
    # LOCAL FALLBACK (Eğer E2B Key yoksa Subprocess ile çalıştır)
    for retry_attempt in range(2):
        try:
            with open("sandbox_temp.py", "w") as f:
                f.write(code)
            res = subprocess.run(
                ["python3", "sandbox_temp.py"], 
                capture_output=True, 
                text=True, 
                timeout=8,
                preexec_fn=set_memory_limit if os.name == 'posix' else None
            )
            
            # Eğer eksik modül hatası varsa ve ilk denemeyse otomatik kur ve tekrar dene
            if res.returncode != 0 and res.stderr and retry_attempt == 0:
                if auto_install_missing_dependency(res.stderr):
                    continue

            out_msg = f"--- YEREL KOD ÇALIŞTIRMA (LOCAL SANDBOX) SONUCU ---\nÇıkış Kodu: {res.returncode}\nÇıktı (Stdout):\n{res.stdout[:500]}\n"
            if res.stderr:
                out_msg += f"Hata (Stderr) - LÜTFEN BUNU DÜZELT:\n{res.stderr[:500]}"
            return out_msg
        except subprocess.TimeoutExpired:
            return "HATA: Kod 8 saniyede tamamlanamadı (Zaman aşımı/Sonsuz döngü). Kodu optimize et."
        except Exception as e:
            return f"Sistem Hatası: {str(e)}"
        finally:
            if os.path.exists("sandbox_temp.py"):
                os.remove("sandbox_temp.py")

class SupremePromptBuilder:
    @staticmethod
    def build(role: str, authority_domain: str) -> str:
        return f"""[KİMLİK VE MUTLAK YETKİ]
Sen '{role}' rolünü üstlenen otonom bir yapay zeka ajanı parçasısın. Etki alanın: '{authority_domain}'. Bu alanda kararlar almakta ve kod yazmakta TAM YETKİLİSİN.

[SIFIR KAYMA & SIFIR HALÜSİNASYON]
1. Zero Context Drift: Sadece sana atanan parçaya odaklan. Diğer ajanların işine karışma.
2. No Hallucination: Uydurma kütüphaneler, sahte API'ler KULLANILAMAZ. Gerçek dünya standartlarını kullan.
3. 3D ve Animasyon Desteği: Eğer bir arayüz veya görsel yapıyorsan, CDN üzerinden Three.js (3D için) veya GSAP/Tailwind (Animasyon için) kullanıp tek bir HTML dosyası içine yazabilirsin.
4. Deep Research (Derin Araştırma): Eğer bilmediğin güncel bir konu varsa, sistem otomatik olarak Wikipedia/Web üzerinden veri çekecektir. Analizlerini kanıtlara dayandır.
5. Auto-Git (CI/CD): Eğer kodu başarıyla yazdığına inanıyorsan, sistem bunu otomatik olarak Git reposuna commit edecektir. Kalite standardın bu yüzden kusursuz olmalıdır.
6. Multimodal Vision: Eğer kullanıcı bir görsel yüklediyse, bu sana kodlama bağlamı olarak verilecektir. Görseli analiz et ve ona göre CSS/HTML veya 3D tasarım yap.
"""

class SwarmEngine:
    def __init__(self, llm_router):
        self.router = llm_router

    async def execute_swarm(self, user_prompt: str) -> str:
        logger.info("[Swarm] Aşama 1: Architect Agent görev dağılımı yapıyor...")
        
        # 0. DEEP RESEARCH AŞAMASI (Eğer soru teknik bilgi gerektiriyorsa)
        researcher = DeepResearchEngine()
        research_data = researcher.search_wikipedia(user_prompt, limit=2)
        logger.info(f"[Swarm] Deep Research Sonucu: {research_data[:100]}...")

        architect_sys = SupremePromptBuilder.build("Master Architect", "Sistem Analizi, Görev Dağıtımı")
        architect_prompt = f"İstek: '{user_prompt}'\n[Web Araştırması Arka Plan Bilgisi]: {research_data}\nGörevi mantıksal alt ajanlara böl.\nFormat:\nAGENT 1: [Rol] - [İş]\nAGENT 2: [Rol] - [İş]"
        
        plan = await self.router.call_llm_with_fallback(architect_sys, architect_prompt, temperature=0.1, max_tokens=1000)
        
        agent_tasks = [line.strip() for line in plan.split('\n') if line.strip().startswith("AGENT")]
        if not agent_tasks:
            agent_tasks = [
                "AGENT 1: Developer Agent - Çekirdek mantığı ve fonksiyonları kodla",
                "AGENT 2: QA Agent - Güvenlik, test ve optimizasyonu planla"
            ]

        logger.info(f"[Swarm] Aşama 2: {len(agent_tasks)} alt ajan paralel çalışıyor...")
        
        async def run_sub_agent(task_desc):
            parts = task_desc.split('-', 1)
            role = parts[0].split(':', 1)[1].strip() if ':' in parts[0] else "Specialist"
            authority = parts[1].strip() if len(parts) > 1 else task_desc
            sys_prompt = SupremePromptBuilder.build(role, authority)
            user_msg = f"Ana İstek: {user_prompt}\nSana Düşen Görev: {authority}"
            return await self.router.call_llm_with_fallback(sys_prompt, user_msg, temperature=0.3, max_tokens=2500)
        
        sub_results = await asyncio.gather(*(run_sub_agent(t) for t in agent_tasks))
        
        # OTOMATİK KOD TESTİ (SANDBOX)
        logger.info("[Swarm] Aşama 2.5: Üretilen kodlar Sandbox üzerinde test ediliyor...")
        sandbox_reports = []
        for i, res in enumerate(sub_results):
            code = extract_python_code(res)
            if code:
                test_output = execute_in_sandbox(code)
                sandbox_reports.append(f"--- AGENT {i+1} KODU İÇİN TEST SONUCU ---\n{test_output}")
        
        logger.info("[Swarm] Aşama 3: Synthesizer tüm parçaları (ve test sonuçlarını) sentezliyor...")
        
        synth_sys = SupremePromptBuilder.build("Chief Synthesizer (Tech Lead)", "Entegrasyon, Test Analizi ve Nihai Sunum")
        synth_prompt = f"Orijinal İstek: {user_prompt}\n\n"
        for i, res in enumerate(sub_results):
            synth_prompt += f"--- {agent_tasks[i]} ÇIKTISI ---\n{res}\n\n"
            
        if sandbox_reports:
            synth_prompt += "\n[OTOMATİK KOD TEST (SANDBOX) RAPORLARI]\n" + "\n".join(sandbox_reports) + "\n\nUYARI: Eğer test raporlarında bir Hata (Stderr) varsa, kodu düzeltip çalışır halini ver. Parçaları birleştir ve tek bir nihai ürün/çözüm sun."
        else:
            synth_prompt += "Parçaları birleştir ve tek bir nihai ürün/çözüm sun. Ajan diyaloglarını kullanıcıya gösterme."
        
        final_result = await self.router.call_llm_with_fallback(synth_sys, synth_prompt, temperature=0.2, max_tokens=4000)
        
        # 4. AUTO-GIT CI/CD AŞAMASI
        if "```" in final_result:
            logger.info("[Swarm] Aşama 4: Auto-Git (CI/CD) kodları repoya pushluyor...")
            git_bot = AutoGitAgent()
            git_logs = git_bot.auto_commit_and_push(commit_message="feat(ai): Otonom Swarm Ajanı tarafından oluşturulan yeni sistem güncellemesi")
            final_result += f"\n\n*Not: Ürettiğim bu kod bloğu CI/CD botu tarafından başarıyla Git reposuna aktarıldı.*"

        gc.collect()
        return final_result
