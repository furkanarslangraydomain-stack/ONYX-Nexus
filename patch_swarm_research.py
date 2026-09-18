import re

with open("swarm_engine.py", "r") as f:
    content = f.read()

# Add new tools to SupremePrompt
old_rules = """3. 3D ve Animasyon Desteği: Eğer bir arayüz veya görsel yapıyorsan, CDN üzerinden Three.js (3D için) veya GSAP/Tailwind (Animasyon için) kullanıp tek bir HTML dosyası içine yazabilirsin."""

new_rules = """3. 3D ve Animasyon Desteği: Eğer bir arayüz veya görsel yapıyorsan, CDN üzerinden Three.js (3D için) veya GSAP/Tailwind (Animasyon için) kullanıp tek bir HTML dosyası içine yazabilirsin.
4. Deep Research (Derin Araştırma): Eğer bilmediğin güncel bir konu varsa, sistem otomatik olarak Wikipedia/Web üzerinden veri çekecektir. Analizlerini kanıtlara dayandır.
5. Auto-Git (CI/CD): Eğer kodu başarıyla yazdığına inanıyorsan, sistem bunu otomatik olarak Git reposuna commit edecektir. Kalite standardın bu yüzden kusursuz olmalıdır.
6. Multimodal Vision: Eğer kullanıcı bir görsel yüklediyse, bu sana kodlama bağlamı olarak verilecektir. Görseli analiz et ve ona göre CSS/HTML veya 3D tasarım yap."""

if "Deep Research (Derin Araştırma)" not in content:
    content = content.replace(old_rules, new_rules)

# Import new engines in swarm
if "from deep_research import" not in content:
    content = "from deep_research import DeepResearchEngine\nfrom git_agent import AutoGitAgent\n" + content

# Inject Deep Research dynamically into Architect Agent
old_arch = """        architect_sys = SupremePromptBuilder.build("Master Architect", "Sistem Analizi, Görev Dağıtımı")
        architect_prompt = f"İstek: '{user_prompt}'\\nGörevi mantıksal alt ajanlara böl.\\nFormat:\\nAGENT 1: [Rol] - [İş]\\nAGENT 2: [Rol] - [İş]"
"""
new_arch = """        # 0. DEEP RESEARCH AŞAMASI (Eğer soru teknik bilgi gerektiriyorsa)
        researcher = DeepResearchEngine()
        research_data = researcher.search_wikipedia(user_prompt, limit=2)
        logger.info(f"[Swarm] Deep Research Sonucu: {research_data[:100]}...")

        architect_sys = SupremePromptBuilder.build("Master Architect", "Sistem Analizi, Görev Dağıtımı")
        architect_prompt = f"İstek: '{user_prompt}'\\n[Web Araştırması Arka Plan Bilgisi]: {research_data}\\nGörevi mantıksal alt ajanlara böl.\\nFormat:\\nAGENT 1: [Rol] - [İş]\\nAGENT 2: [Rol] - [İş]"
"""
if "DEEP RESEARCH AŞAMASI" not in content:
    content = content.replace(old_arch, new_arch)

# Inject Auto-Git into Synthesizer output
old_synth = """        final_result = await self.router.call_llm_with_fallback(synth_sys, synth_prompt, temperature=0.2, max_tokens=4000)
        return final_result"""
new_synth = """        final_result = await self.router.call_llm_with_fallback(synth_sys, synth_prompt, temperature=0.2, max_tokens=4000)
        
        # 4. AUTO-GIT CI/CD AŞAMASI
        if "```" in final_result:
            logger.info("[Swarm] Aşama 4: Auto-Git (CI/CD) kodları repoya pushluyor...")
            git_bot = AutoGitAgent()
            git_logs = git_bot.auto_commit_and_push(commit_message="feat(ai): Otonom Swarm Ajanı tarafından oluşturulan yeni sistem güncellemesi")
            final_result += f"\\n\\n*Not: Ürettiğim bu kod bloğu CI/CD botu tarafından başarıyla Git reposuna aktarıldı.*"

        return final_result"""
if "AUTO-GIT CI/CD AŞAMASI" not in content:
    content = content.replace(old_synth, new_synth)

with open("swarm_engine.py", "w") as f:
    f.write(content)
print("Swarm engine patched with Research and Git integrations.")
