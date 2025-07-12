import AsyncStorage from "@react-native-async-storage/async-storage"

const AUTH_KEY = "auth_user"
const CHATS_KEY = "chat_history"

export interface User {
  id: string
  name: string
  email: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// Auth storage functions
export const storeAuth = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } catch (error) {
    console.error("Error storing auth:", error)
    throw error
  }
}

export const getStoredAuth = async (): Promise<User | null> => {
  try {
    const stored = await AsyncStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Error getting stored auth:", error)
    return null
  }
}

export const clearAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_KEY, CHATS_KEY])
  } catch (error) {
    console.error("Error clearing auth:", error)
    throw error
  }
}

// Chat storage functions
export const storeChats = async (chats: Chat[]): Promise<void> => {
  try {
    const serializedChats = chats.map((chat) => ({
      ...chat,
      messages: chat.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }))
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(serializedChats))
  } catch (error) {
    console.error("Error storing chats:", error)
    throw error
  }
}

export const getStoredChats = async (): Promise<Chat[]> => {
  try {
    const stored = await AsyncStorage.getItem(CHATS_KEY)
    if (!stored) return []

    const parsedChats = JSON.parse(stored)
    return parsedChats.map((chat: any) => ({
      ...chat,
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    }))
  } catch (error) {
    console.error("Error getting stored chats:", error)
    return []
  }
}
