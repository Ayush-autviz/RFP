"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { deleteChatSession, getChats } from "@/lib/APIservice"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useChat } from "@/app/chatContext"
import axios from "axios"




export default function ChatSidebar() {
  const { selectedChat, setSelectedChat } = useChat()
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true)
  const queryClient = useQueryClient()

  const { data: Chats, isLoading: ChatsLoading, error: ChatError } = useQuery({ 
    queryKey: ['chatList'], 
    queryFn: getChats
  })

  const deleteMutation = useMutation({
    mutationFn: deleteChatSession,
    onSuccess: () => {
      // Invalidate and refetch the chat list
      queryClient.invalidateQueries({ queryKey: ['chatList'] })
      // If the deleted chat was selected, clear the selection
      if (selectedChat) {
        setSelectedChat(null)
      }
    },
    onError: (error) => {
      console.error('Failed to delete chat:', error)
    }
  })

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d")
    } catch {
      return "Unknown date"
    }
  }

  const handleNewChat = () => {
    setSelectedChat(null)
  }

  const handleSelectChat = (chatId: number, firstMessage: string) => {
    setSelectedChat({ id: chatId, name: firstMessage })
  }

  const handleDeleteChat = (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering chat selection
    deleteMutation.mutate(chatId)
  }

  const toggleChatSidebar = () => {
    setChatSidebarOpen(!chatSidebarOpen)
  }

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={toggleChatSidebar}
        className="fixed right-4  bottom-20 lg:hidden z-10 bg-[#111827] text-white p-3 rounded-full shadow-lg"
        aria-label="Toggle chat list"
      >
        <MessageSquare size={20} />
      </button>

      {/* Chat sidebar */}
      <div
        className={`fixed lg:static right-0 top-0 h-full bg-[#202123] text-white min-w-[280px] flex flex-col transition-transform duration-300 ease-in-out z-40 ${
          chatSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Chat History</h2>
            <button
              onClick={toggleChatSidebar}
              className="lg:hidden text-gray-400 hover:text-white"
              aria-label="Close chat sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <Button
            onClick={handleNewChat}
            className="w-full mb-4 bg-transparent hover:bg-gray-700 border border-gray-600 text-white rounded-md flex items-center justify-center gap-2 py-3"
          >
            <PlusCircle size={16} />
            <span>New chat</span>
          </Button>

          <div className="flex-1 overflow-y-auto">
            {ChatsLoading ? (
              <div className="text-gray-400 text-sm">Loading chats...</div>
            ) : ChatError ? (
              <div className="text-red-400 text-sm">Error loading chats</div>
            ) : (
              <div className="space-y-2">
                {Chats?.result?.map((chat: { id: number; first_message: string; created_at: string }) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id, chat.first_message)}
                    className={`p-3 rounded-md cursor-pointer flex items-start gap-3 hover:bg-gray-700 transition-colors ${
                      selectedChat?.id === chat.id ? "bg-gray-700" : ""
                    }`}
                  >
                    <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {chat.first_message.length > 30 ? chat.first_message.substring(0, 30) + "..." : chat.first_message}
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(chat.created_at)}</div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Delete chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {chatSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setChatSidebarOpen(false)} />
      )}
    </>
  )
}