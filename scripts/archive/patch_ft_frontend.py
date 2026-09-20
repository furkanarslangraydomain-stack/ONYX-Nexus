import re

with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# Add logic for /learn or /ogret
old_cmd = """    if (input.trim().startsWith('/cron')) {"""
new_cmd = """    // Öğrenme Modülü (Continuous Fine-Tuning)
    if (input.trim().startsWith('/ogret') || input.trim().startsWith('/learn')) {
       const parts = input.trim().split(' ');
       const cmd = parts[0];
       
       // Example: /ogret React_Kurallari Bundan sonra class yerine sadece hooks kullan.
       let topic = "Genel";
       let contentText = "";
       
       if (parts.length > 2 && !parts[1].includes(' ')) {
           topic = parts[1].replace(/_/g, ' ');
           contentText = parts.slice(2).join(' ');
       } else {
           contentText = parts.slice(1).join(' ');
       }
       
       await fetch(`${apiUrl}/api/learn`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({topic, content: contentText})
       });
       
       const ftMsg: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: `✅ Başarılı! Sistem '${topic}' konusunda yeni bilgilerle eğitildi (Fine-Tuned). Bu kurallar artık kalıcı hafızama işlendi.`
       };
       setMessages(prev => [...prev, ftMsg]);
       if (isVoiceInputRef.current) {
          speakText("Başarılı. Sistem bu konuda eğitildi ve kurallar kalıcı hafızaya işlendi.");
          isVoiceInputRef.current = false;
       }
       setInput('');
       return;
    }

    if (input.trim().startsWith('/cron')) {"""

if "Öğrenme Modülü (Continuous Fine-Tuning)" not in content:
    content = content.replace(old_cmd, new_cmd)

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)
print("ChatInterface patched with /ogret command.")
