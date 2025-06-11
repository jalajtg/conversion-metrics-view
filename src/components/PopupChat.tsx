
import { useEffect, useRef, useCallback } from 'react';

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
        destroy?: () => void;
      };
    };
  }
}

interface ChatbotConfig {
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
}

interface PopupChatProps {
  config?: ChatbotConfig;
}

export function PopupChat({ config }: PopupChatProps) {
  const chatbotInstanceRef = useRef<any>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  // Default configuration for when no config is provided
  const defaultConfig: ChatbotConfig = {
    webhookUrl: 'https://luccatora.app.n8n.cloud/webhook/webbot',
    title: 'Chat Support',
    placeholder: 'Type your message...',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    secondaryColor: '#f3f4f6',
    textColor: '#000000',
    userTextColor: '#ffffff',
    chatBackground: '#ffffff',
    welcomeMessage: 'Hello! How can I help you today?'
  };

  const currentConfig = config || defaultConfig;

  const initializeChatbot = useCallback((chatbotConfig: ChatbotConfig) => {
    // Clear any pending initialization
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    const doInit = () => {
      if (typeof window !== 'undefined' && window.ChatbotWidget?.ChatbotManager) {
        try {
          // Destroy existing instance if it exists
          if (chatbotInstanceRef.current?.destroy) {
            chatbotInstanceRef.current.destroy();
          }

          // Create new instance
          chatbotInstanceRef.current = new window.ChatbotWidget.ChatbotManager();
          chatbotInstanceRef.current.init(chatbotConfig);
          
          console.log('Chatbot initialized with config:', chatbotConfig);
        } catch (error) {
          console.error('Failed to initialize chatbot:', error);
        }
      } else {
        // If ChatbotWidget is not available yet, retry after a short delay
        initTimeoutRef.current = setTimeout(() => doInit(), 100);
      }
    };

    // Debounce the initialization to avoid too frequent updates
    initTimeoutRef.current = setTimeout(doInit, 200);
  }, []);

  useEffect(() => {
    initializeChatbot(currentConfig);

    // Cleanup function
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      if (chatbotInstanceRef.current?.destroy) {
        chatbotInstanceRef.current.destroy();
      }
    };
  }, [currentConfig, initializeChatbot]);

  // Re-initialize when config changes
  useEffect(() => {
    if (config) {
      initializeChatbot(config);
    }
  }, [config, initializeChatbot]);

  // This component doesn't render anything visible
  return null;
}
