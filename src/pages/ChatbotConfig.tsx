
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Palette } from 'lucide-react';

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

export default function ChatbotConfig() {
  const [config, setConfig] = useState({
    webhookUrl: 'https://luccatora.app.n8n.cloud/webhook/webbot',
    title: 'Chat Support',
    placeholder: 'Type your message...',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    secondaryColor: '#f3f4f6',
    textColor: '#000000',
    userTextColor: '#ffffff',
    chatBackground: '#ffffff',
    welcomeMessage: 'Hello! How can I help you today?',
    logoUrl: ''
  });

  const [chatbotInstance, setChatbotInstance] = useState<any>(null);

  useEffect(() => {
    document.title = 'Chatbot Configuration | Dashboard Platform';
  }, []);

  const initializeChatbot = () => {
    if (typeof window !== 'undefined' && window.ChatbotWidget?.ChatbotManager) {
      try {
        const instance = new window.ChatbotWidget.ChatbotManager();
        instance.init(config);
        setChatbotInstance(instance);
        console.log('Chatbot initialized with config:', config);
      } catch (error) {
        console.error('Failed to initialize chatbot:', error);
      }
    } else {
      console.error('ChatbotWidget not available');
    }
  };

  // Update chatbot in real-time when config changes
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeChatbot();
    }, 300); // Debounce updates

    return () => clearTimeout(timer);
  }, [config]);

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ColorPicker = ({ label, value, onChange, description }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    description: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-8 rounded border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-theme-dark-lighter border-gray-600 text-white"
            placeholder="#000000"
          />
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-dark p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Chatbot Configuration</h1>
          <p className="text-gray-400">Configure your chatbot's appearance and behavior with real-time preview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Settings */}
          <Card className="bg-theme-dark-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-theme-blue" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">Webhook URL</Label>
                <Input
                  value={config.webhookUrl}
                  onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                  className="bg-theme-dark-lighter border-gray-600 text-white"
                  placeholder="https://your-api.com/webhook"
                />
                <p className="text-xs text-gray-400">API endpoint for chatbot messages</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Widget Title</Label>
                  <Input
                    value={config.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-theme-dark-lighter border-gray-600 text-white"
                    placeholder="Chat Support"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Position</Label>
                  <Select value={config.position} onValueChange={(value) => handleInputChange('position', value)}>
                    <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-theme-dark-card border-gray-600">
                      <SelectItem value="bottom-right" className="text-white hover:bg-gray-700">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left" className="text-white hover:bg-gray-700">Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Input Placeholder</Label>
                <Input
                  value={config.placeholder}
                  onChange={(e) => handleInputChange('placeholder', e.target.value)}
                  className="bg-theme-dark-lighter border-gray-600 text-white"
                  placeholder="Type your message..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Welcome Message</Label>
                <Input
                  value={config.welcomeMessage}
                  onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                  className="bg-theme-dark-lighter border-gray-600 text-white"
                  placeholder="Hello! How can I help you today?"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Logo URL (optional)</Label>
                <Input
                  value={config.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  className="bg-theme-dark-lighter border-gray-600 text-white"
                  placeholder="https://your-domain.com/logo.png"
                />
              </div>

              <Button 
                onClick={initializeChatbot}
                className="w-full bg-theme-blue hover:bg-theme-blue/80 text-white"
              >
                Apply Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Color Customization */}
          <Card className="bg-theme-dark-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5 text-theme-blue" />
                Color Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorPicker
                label="Primary Color"
                value={config.primaryColor}
                onChange={(value) => handleInputChange('primaryColor', value)}
                description="Header background and user message bubbles"
              />

              <ColorPicker
                label="Secondary Color"
                value={config.secondaryColor}
                onChange={(value) => handleInputChange('secondaryColor', value)}
                description="Bot message bubble background"
              />

              <ColorPicker
                label="Chat Background"
                value={config.chatBackground}
                onChange={(value) => handleInputChange('chatBackground', value)}
                description="Main chat window background"
              />

              <ColorPicker
                label="Bot Text Color"
                value={config.textColor}
                onChange={(value) => handleInputChange('textColor', value)}
                description="Text color for bot messages"
              />

              <ColorPicker
                label="User Text Color"
                value={config.userTextColor}
                onChange={(value) => handleInputChange('userTextColor', value)}
                description="Text color for user messages"
              />

              {/* Preview Section */}
              <div className="mt-8 p-4 bg-theme-dark-lighter rounded-lg border border-gray-600">
                <h3 className="text-white text-sm font-medium mb-3">Live Preview</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Position: {config.position}</p>
                  <p>• Title: "{config.title}"</p>
                  <p>• Primary Color: {config.primaryColor}</p>
                  <p>• The chatbot widget will appear in the {config.position} corner</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Summary */}
        <Card className="bg-theme-dark-card border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-theme-dark-lighter rounded-lg p-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
