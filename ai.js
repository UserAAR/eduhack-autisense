document.addEventListener('DOMContentLoaded', async function() {
    const SUPABASE_URL = 'https://uyxiebkidxkuomecumaw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eGllYmtpZHhrdW9tZWN1bWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDEzNTUsImV4cCI6MjA2MDQ3NzM1NX0.KYlFnmapzdao6fTveUmPzXDayPo66RbnU-nb7EW0s7U';
    const GEMINI_API_KEY = 'AIzaSyCn2CQZDmXSG1VIwFMOy2C9mBIeq7pXgrw';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const currentChildName = document.getElementById('current-child-name');
    const childNameDisplay = document.getElementById('child-name-display');
    const childOptions = document.querySelectorAll('.child-option');
  
    let childData = null;
    let chatHistory = [];
  
    const systemPrompt = `Sən, otizmli uşaqların inkişaf xüsusiyyətləri və valideynlərinə yönəlik yüksək səviyyəli rəhbərlik mövzusunda ixtisaslaşmış, son dərəcə bilgili və empatik bir süni intellektsən...`;
  
    childOptions.forEach(option => {
      option.addEventListener('click', async function() {
        childOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        const childName = this.querySelector('span').textContent;
        if (currentChildName) currentChildName.textContent = `${childName}'s Journey`;
        if (childNameDisplay) childNameDisplay.textContent = `${childName}'s`;
        await fetchChildData();
      });
    });
  
    async function fetchChildData() {
      const dataUrl = `${SUPABASE_URL}/rest/v1/child_profiles?id=eq.1&select=*`;
      try {
        const response = await fetch(dataUrl, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.length > 0) {
          childData = data[0];
          await callGeminiAPI();
        }
      } catch (error) {
        console.error('Error fetching child data:', error);
      }
    }
  
    async function callGeminiAPI(userMessageText = null) {
      if (!childData && !userMessageText) return;
  
      typingIndicator.classList.add('active');
  
      const contents = [...chatHistory];
      let currentTurnText = systemPrompt;
  
      if (childData) {
        currentTurnText += "\n\nAnaliz ediləcək uşağın statistik məlumatları:\n";
        for (const key in childData) {
          const formattedKey = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          currentTurnText += `- ${formattedKey}: ${childData[key]}\n`;
        }
      }
  
      if (contents.length === 0 && userMessageText) {
        currentTurnText += `\n\nValideynin Sualı: ${userMessageText}`;
      } else if (userMessageText) {
        currentTurnText = userMessageText;
      }
  
      contents.push({ role: 'user', parts: [{ text: currentTurnText }] });
  
      try {
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });
        const data = await response.json();
        const aiText = data.candidates[0]?.content?.parts[0]?.text || 'No response';
        updateChatHistory('user', userMessageText || "(Uşaq məlumatlarına əsasən ilkin analiz istənildi)");
        updateChatHistory('model', aiText);
      } catch (error) {
        console.error('Error from Gemini API:', error);
        updateChatHistory('model', 'AI assistentdən cavab alarkən xəta baş verdi.');
      } finally {
        typingIndicator.classList.remove('active');
      }
    }
  
    function updateChatHistory(role, text) {
      const msg = document.createElement('div');
      msg.className = `message ${role === 'user' ? 'outgoing' : 'incoming'}`;
      if (role === 'model') {
        const avatar = document.createElement('img');
        avatar.src = 'https://api.dicebear.com/6.x/bottts/svg?seed=assistant';
        avatar.alt = 'AI Assistant';
        avatar.className = 'message-avatar assistant-avatar';
        msg.appendChild(avatar);
      }
      msg.appendChild(document.createTextNode(text));
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    function sendMessage() {
      const message = userInput.value.trim();
      if (!message) return;
      userInput.value = '';
      callGeminiAPI(message);
    }
  
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
  });
  