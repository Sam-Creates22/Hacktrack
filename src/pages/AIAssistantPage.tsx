// ============================================
// HackTrack - AI Assistant Page
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Plus,
  MessageSquare,
  Lightbulb,
  Code,
  Users,
  Trophy,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';

const AIAssistantPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        userId: user?.id || '',
        role: 'assistant',
        content: `Hello ${profile?.fullName?.split(' ')[0] || 'there'}! 👋\n\nI'm your HackTrack AI assistant. I can help you with:\n\n• **Hackathon preparation** strategies and timelines\n• **Team building** and role assignment\n• **Project ideation** and validation\n• **Technical guidance** on tools and technologies\n• **Pitch preparation** and presentation tips\n• **Time management** during the event\n\nWhat would you like help with today?`,
        timestamp: new Date(),
      },
    ]);
  }, [user, profile]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = Database.Chat.generateAIResponse(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: user.id,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        userId: user?.id || '',
        role: 'assistant',
        content: 'Chat cleared. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
    toast.success('Chat cleared');
  };

  const quickPrompts = [
    { icon: Lightbulb, text: 'Help me brainstorm project ideas', color: 'text-yellow-400' },
    { icon: Users, text: 'How do I build a great hackathon team?', color: 'text-blue-400' },
    { icon: Code, text: 'What tech stack should I use?', color: 'text-green-400' },
    { icon: Clock, text: 'Create a preparation timeline', color: 'text-purple-400' },
    { icon: Trophy, text: 'Tips for winning hackathons', color: 'text-orange-400' },
  ];

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-white mt-2">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('• ')) {
          return <p key={i} className="ml-4 text-slate-300">{line}</p>;
        }
        if (line.match(/^\d+\./)) {
          return <p key={i} className="ml-4 text-slate-300">{line}</p>;
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="text-slate-300">{line}</p>;
      });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
          <p className="text-slate-400">
            Your personal hackathon guide and mentor
          </p>
        </div>
        <Button
          variant="outline"
          onClick={clearChat}
          className="border-slate-700 text-slate-400 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar with quick prompts */}
        <div className="hidden lg:block w-64 space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Quick Prompts
              </h3>
              <div className="space-y-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt.text)}
                    className="w-full text-left p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-sm text-slate-300"
                  >
                    <prompt.icon className={`w-4 h-4 inline mr-2 ${prompt.color}`} />
                    {prompt.text}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Tips</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Be specific about your questions</li>
                <li>• Mention your tech stack for better advice</li>
                <li>• Ask about time management strategies</li>
                <li>• Get help with pitch preparation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col bg-slate-800/50 border-slate-700 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-indigo-500/20 text-white rounded-tr-sm'
                        : 'bg-slate-700/50 text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {formatMessage(message.content)}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about hackathons..."
                className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              AI responses are generated for demonstration purposes
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistantPage;
