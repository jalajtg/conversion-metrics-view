
import { useEffect } from 'react';

declare global {
  interface Window {
    ChatbotWidget?: {
      ChatbotManager: new () => {
        init: (config: {
          webhookUrl: string;
          title: string;
          placeholder: string;
          position: string;
          primaryColor: string;
          secondaryColor: string;
          textColor: string;
          userTextColor: string;
          chatBackground: string;
          welcomeMessage: string;
          logoUrl?: string;
        }) => void;
      };
    };
  }
}

export function PopupChat() {
  useEffect(() => {
    const initializeChatbot = () => {
      // Check if window object exists and ChatbotWidget is available
      if (typeof window !== 'undefined' && window.ChatbotWidget?.ChatbotManager) {
        try {
          const chatbotInstance = new window.ChatbotWidget.ChatbotManager();
          chatbotInstance.init({
            webhookUrl: 'https://luccatora.app.n8n.cloud/webhook/webbot',
            title: 'Chat Support',
            placeholder: 'Type your message...',
            position: 'bottom-right',
            primaryColor: '#3b82f6',
            secondaryColor: '#f3f4f6',
            textColor: '#1f2937',
            userTextColor: '#ffffff',
            chatBackground: '#ffffff',
            welcomeMessage: 'Hello! How can I help you today?'
          });
        } catch (error) {
          console.error('Failed to initialize chatbot:', error);
        }
      } else {
        // If ChatbotWidget is not available yet, retry after a short delay
        setTimeout(initializeChatbot, 100);
      }
    };

    // Initialize chatbot when component mounts
    initializeChatbot();
  }, []);

  // This component doesn't render anything visible
  return null;
}
