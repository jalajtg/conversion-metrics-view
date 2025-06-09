
import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    ChatbotWidget?: {
      init: (config: any) => void;
    };
  }
}

export function ChatbotWidget() {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (window.ChatbotWidget) {
      initializeChatbot();
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://chirodashboard-chat.onrender.com/chatbot-widget.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Chatbot script loaded successfully');
      setScriptLoaded(true);
      // Wait a bit for the script to fully initialize
      setTimeout(() => {
        initializeChatbot();
      }, 100);
    };
    
    script.onerror = () => {
      console.error('Failed to load chatbot script');
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeChatbot = () => {
    if (window.ChatbotWidget && typeof window.ChatbotWidget.init === 'function') {
      try {
        window.ChatbotWidget.init({
          webhookUrl: 'https://luccatora.app.n8n.cloud/webhook/webbot',
          title: 'Chat Support',
          placeholder: 'Type your message...',
          position: 'bottom-right',
          primaryColor: '#3b82f6',
          secondaryColor: '#f3f4f6',
          textColor: '#1f2937',
          userTextColor: '#ffffff',
          chatBackground: '#ffffff',
          welcomeMessage: 'Hello! How can I help you today?',
          logoUrl: 'https://conversion-metrics-view.lovable.app/lovable-uploads/460f8654-9a04-4cac-a568-cd5421a2911e.png'
        });
        console.log('Chatbot initialized successfully');
      } catch (error) {
        console.error('Error initializing chatbot:', error);
      }
    } else {
      console.error('ChatbotWidget.init is not available');
    }
  };

  // This component doesn't render anything visible
  return null;
}
