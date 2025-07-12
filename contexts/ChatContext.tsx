"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getStoredChats, storeChats } from "@/utils/storage"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatContextType {
  currentChat: Chat | null
  recentChats: Chat[]
  startNewChat: (initialMessage?: string) => void
  selectChat: (chatId: string) => void
  addMessage: (message: Message) => void
  updateLastMessage: (messageId: string, content: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [recentChats, setRecentChats] = useState<Chat[]>([])

  useEffect(() => {
    loadStoredChats()
  }, [])

  const loadStoredChats = async () => {
    try {
      const storedChats = await getStoredChats()
      setRecentChats(storedChats)
    } catch (error) {
      console.error("Error loading stored chats:", error)
    }
  }

  const saveChats = async (chats: Chat[]) => {
    try {
      await storeChats(chats)
    } catch (error) {
      console.error("Error saving chats:", error)
    }
  }

  const generateChatTitle = (message: string) => {
    return message.length > 50 ? message.substring(0, 50) + "..." : message
  }

  const startNewChat = (initialMessage?: string) => {
    // Save current chat to recent chats if it exists
    if (currentChat && currentChat.messages.length > 0) {
      const updatedRecentChats = [currentChat, ...recentChats.filter((chat) => chat.id !== currentChat.id)]
      setRecentChats(updatedRecentChats)
      saveChats(updatedRecentChats)
    }

    const newChat: Chat = {
      id: Date.now().toString(),
      title: initialMessage ? generateChatTitle(initialMessage) : "New Chat",
      messages: initialMessage
        ? [
            {
              id: Date.now().toString(),
              role: "user",
              content: initialMessage,
              timestamp: new Date(),
            },
          ]
        : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setCurrentChat(newChat)
  }

  const selectChat = (chatId: string) => {
    // Save current chat to recent chats if it exists and is different
    if (currentChat && currentChat.id !== chatId && currentChat.messages.length > 0) {
      const updatedRecentChats = [currentChat, ...recentChats.filter((chat) => chat.id !== currentChat.id)]
      setRecentChats(updatedRecentChats)
      saveChats(updatedRecentChats)
    }

    const selectedChat = recentChats.find((chat) => chat.id === chatId)
    if (selectedChat) {
      setCurrentChat(selectedChat)
      // Remove from recent chats since it's now current
      const updatedRecentChats = recentChats.filter((chat) => chat.id !== chatId)
      setRecentChats(updatedRecentChats)
      saveChats(updatedRecentChats)
    }
  }

  const addMessage = (message: Message) => {
    if (!currentChat) return

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, message],
      updatedAt: new Date(),
    }

    setCurrentChat(updatedChat)
  }

  const updateLastMessage = (messageId: string, content: string) => {
    if (!currentChat) return

    const updatedMessages = currentChat.messages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg))

    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      updatedAt: new Date(),
    }

    setCurrentChat(updatedChat)
  }

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        recentChats,
        startNewChat,
        selectChat,
        addMessage,
        updateLastMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
