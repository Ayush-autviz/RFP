"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectContextType {
  selectedChat: { id: number; name: string } | null;
  setSelectedChat: (chat: { id: number; name: string } | null) => void;
}

const ChatContext = createContext<ProjectContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChat, setSelectedChat] = useState<{ id: number; name: string } | null>(null);

  return (
    <ChatContext.Provider value={{ selectedChat, setSelectedChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};