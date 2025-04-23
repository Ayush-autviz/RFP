"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ragChat, getRagChatHistory } from "@/lib/APIservice"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import sanitizeHtml from "sanitize-html"
import hljs from "highlight.js"
import "highlight.js/styles/github.css"
import { format } from "date-fns"
import ChatSidebar from "@/components/ChatSidebar"
import { useChat } from "../chatContext"

type ChatMessage = {
  id: number
  query: string
  response: string
  created_at: string | null
  isUser: boolean
}

type ChatInput = {
  query: string
}

export default function ChatScreen() {
  const queryClient = useQueryClient()
  const { selectedChat, setSelectedChat } = useChat() // Access selectedChat and setSelectedChat from context
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatInput, setChatInput] = useState<ChatInput>({ query: "" })
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chatHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["chatHistory", selectedChat?.id], // Include selectedChat.id in queryKey
    queryFn: () => getRagChatHistory(selectedChat?.id), // Pass selectedChat.id to API
    enabled: !!selectedChat?.id, // Only fetch if selectedChat.id exists
  })

  useEffect(() => {
    if (chatHistory?.result) {
      const messages = chatHistory.result.flatMap((item: any) => [
        {
          id: item.id * 2,
          query: item.query,
          response: item.query,
          created_at: item.created_at,
          isUser: true,
        },
        {
          id: item.id * 2 + 1,
          query: item.query,
          response: JSON.parse(item.response)[0],
          created_at: item.created_at,
          isUser: false,
        },
      ])
      setChatMessages(messages)
    } else {
      setChatMessages([])
    }
  }, [chatHistory])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const { mutate: sendChatMessage, isPending: chatPending } = useMutation({
    mutationFn: ({ userQuery }: { userQuery: string }) => ragChat(userQuery, selectedChat?.id , 1), // Use selectedChat.id, fallback to 1
    onSuccess: (data) => {
      toast.success("Message sent successfully")
      const timestamp = new Date().toISOString()
      const tempId = Date.now()
      setChatMessages((prev) => [
        ...prev,
        {
          id: tempId * 2,
          query: chatInput.query,
          response: chatInput.query,
          created_at: timestamp,
          isUser: true,
        },
        {
          id: tempId * 2 + 1,
          query: chatInput.query,
          response: data.result[0],
          created_at: timestamp,
          isUser: false,
        },
      ])
      setChatInput({ query: "" })

      // If this is a new chat (no selectedChat), set the selectedChat to the new chat ID
      if (!selectedChat && data.chat_session_id) {
        queryClient.invalidateQueries({ queryKey: ['chatList'] })
        setSelectedChat({ id: data.chat_session_id, name: "New Chat" })
      }
    },
    onError: (error) => {
      toast.error("Failed to send message")
      console.error("Chat error:", error)
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput({ query: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.query.trim()) {
      toast.error("Please enter a message")
      return
    }
    sendChatMessage({ userQuery: chatInput.query })
  }

  const formatTimestamp = (created_at: string | null) => {
    if (!created_at) return "Unknown time"
    try {
      return format(new Date(created_at), "MMM d, yyyy, h:mm a")
    } catch {
      return "Invalid time"
    }
  }

  const sanitizeMarkdown = (markdown: string) => {
    return sanitizeHtml(markdown, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "pre",
        "code",
        "img",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt"],
        code: ["class"],
      },
    })
  }

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col w-full">
        <div className="mx-auto bg-white min-h-full shadow-sm w-full flex flex-col">
          <Header  title='Chat' setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 ">
            {!selectedChat ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Start a New Conversation</h2>
                  <p className="text-gray-600 mb-6">
                    Type your message below to begin a new chat. Your conversation will be saved automatically.
                  </p>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Example questions you can ask:</p>
                    <ul className="mt-2 space-y-2">
                      <li className="text-gray-700 bg-gray-50 p-2 rounded">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      </li>
                      <li className="text-gray-700 bg-gray-50 p-2 rounded">
                        Lorem ipsum, quibusdam aliquam aut, quos repellendus similique adipisci fuga earum.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : historyLoading ? (
              <div className="text-center text-gray-500">Loading chat history...</div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center text-gray-500">Start the conversation by typing a message below</div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  } transition-all duration-300 ease-in-out animate-slide-in`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                      message.isUser ? "bg-[#111827] text-white" : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "")
                            return !inline && match ? (
                              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                                <code
                                  className={className}
                                  {...props}
                                  dangerouslySetInnerHTML={{
                                    __html: hljs.highlight(String(children), {
                                      language: match[1],
                                    }).value,
                                  }}
                                />
                              </pre>
                            ) : (
                              <code className={`${className || ""} bg-gray-100 px-1 py-0.5 rounded`} {...props}>
                                {children}
                              </code>
                            )
                          },
                          table({ children }) {
                            return (
                              <div className="overflow-x-auto">
                                <table className="border-collapse border border-gray-300 w-full">{children}</table>
                              </div>
                            )
                          },
                          th({ children }) {
                            return (
                              <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
                                {children}
                              </th>
                            )
                          },
                          td({ children }) {
                            return <td className="border border-gray-300 px-4 py-2">{children}</td>
                          },
                          h1({ children }) {
                            return (
                              <h1
                                className={`text-xl font-bold mt-4 mb-2 ${
                                  message.isUser ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {children}
                              </h1>
                            )
                          },
                          h2({ children }) {
                            return (
                              <h2
                                className={`text-lg font-semibold mt-3 mb-2 ${
                                  message.isUser ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {children}
                              </h2>
                            )
                          },
                          ul({ children }) {
                            return (
                              <ul className={`list-disc pl-5 mb-2 ${message.isUser ? "text-white" : "text-gray-800"}`}>
                                {children}
                              </ul>
                            )
                          },
                          ol({ children }) {
                            return (
                              <ol
                                className={`list-decimal pl-5 mb-2 ${message.isUser ? "text-white" : "text-gray-800"}`}
                              >
                                {children}
                              </ol>
                            )
                          },
                          a({ href, children }) {
                            return (
                              <a
                                href={href}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            )
                          },
                        }}
                      >
                        {sanitizeMarkdown(message.response)}
                      </ReactMarkdown>
                    </div>
                    <div className={`text-xs mt-2 ${message.isUser ? "text-gray-300" : "text-gray-500"}`}>
                      {formatTimestamp(message.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Responsive Chat Input */}
          <form
            onSubmit={handleSubmit}
            className="relative bottom-0 w-full left-0 border-t bg-white border-gray-200 p-3 sm:p-4 z-20 md:ml-0"
          >
            <div className="flex items-center gap-2 sm:gap-3 mx-auto w-full">
              <Input
                placeholder="Type your message here..."
                value={chatInput.query}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 focus:ring-2 focus:ring-[#111827] rounded-xl px-4 py-2.5 text-gray-800 placeholder-gray-400 transition-all duration-200 ease-in-out shadow-sm focus:outline-none"
                disabled={chatPending}
                aria-label="Chat input"
              />
              <Button
                type="submit"
                className="bg-[#111827] text-white hover:bg-[#1a2234] rounded-xl px-4 sm:px-6 py-2.5 shadow-sm transition-all duration-200 ease-in-out focus:ring-2 focus:ring-[#111827] focus:outline-none"
                disabled={chatPending}
              >
                {chatPending ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <ChatSidebar />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
