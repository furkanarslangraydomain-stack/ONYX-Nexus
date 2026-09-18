with open("src/components/ChatInterface.tsx", "r") as f:
    content = f.read()

# Let's fix it by string split instead of regex which causes escape issues with \s
start_idx = content.find("const handleSend = async () => {")
end_idx = content.find("  return (", start_idx)

new_func = """const handleSend = async () => {
    if (!input.trim() && !imageData) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      imageData: imageData || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    saveMessage(userMsg);
    
    const currentInput = input;
    const currentImage = imageData;
    setInput('');
    setImageData(null);
    setIsLoading(true);

    try {
      const assistantMsgId = 'msg-' + Date.now().toString();
      
      if (chatMode === 'normal') {
          setMessages(prev => [...prev, {
            id: assistantMsgId,
            role: 'assistant',
            content: 'Düşünüyor...',
            agentProcess: 'Bilinç Modülü Devrede'
          }]);
          
          const chatRes = await fetch(`${apiUrl}/api/chat/completion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: currentInput })
          });
          const chatData = await chatRes.json();
          const finalMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: chatData.response,
            agentProcess: 'Normal Sohbet Yanıtı'
          };
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? finalMsg : m));
          saveMessage(finalMsg);
          setIsLoading(false);
          return;
      }

      // AGENT TASK MODE
      const taskRes = await fetch(`${apiUrl}/api/tasks/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput, engine: 'auto', image_data: currentImage })
      });
      const data = await taskRes.json();
      
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: 'Görev işleniyor, lütfen bekleyin...',
        taskId: data.id,
        agentProcess: 'Görev kuyruğa alındı'
      }]);

      // Polling
      const poll = setInterval(async () => {
        const checkRes = await fetch(`${apiUrl}/api/tasks/${data.id}`);
        const checkData = await checkRes.json();
        
        if (checkData.status === 'COMPLETED' || checkData.status === 'FAILED') {
          clearInterval(poll);
          
          let content = checkData.result || checkData.error || 'İşlem tamamlandı.';
          let htmlPreview;
          
          if (content.includes('```html') && currentInput.toLowerCase().includes('3d')) {
             const match = content.match(/```html\\n([\\s\\S]*?)\\n```/);
             if (match && match[1]) {
                htmlPreview = match[1];
             }
          }

          const finalMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content,
            htmlPreview,
            agentProcess: checkData.status === 'COMPLETED' ? 'İşlem Tamamlandı' : 'Hata Oluştu'
          };
          
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? finalMsg : m));
          saveMessage(finalMsg);
          
          if (htmlPreview) {
             setActiveArtifact({type: 'html', content: htmlPreview});
          } else if (content.includes('```')) {
             const codeMatch = content.match(/```[a-z]*\\n([\\s\\S]*?)\\n```/);
             if(codeMatch) setActiveArtifact({type: 'code', content: codeMatch[1]});
          }
          setIsLoading(false);
        } else {
           setMessages(prev => prev.map(m => 
            m.id === assistantMsgId 
              ? { ...m, agentProcess: `Ajanlar çalışıyor (${checkData.status})...` }
              : m
          ));
        }
      }, 2000);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `Bağlantı hatası: Backend servisi (${apiUrl}) aktif mi? Sağ üstteki ayarlar ikonundan uç noktayı değiştirebilirsiniz.`
      }]);
      setIsLoading(false);
    }
  };

"""

content = content[:start_idx] + new_func + content[end_idx:]

with open("src/components/ChatInterface.tsx", "w") as f:
    f.write(content)
