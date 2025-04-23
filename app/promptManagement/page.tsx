"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchPromptTypes, fetchPrompts, updatePrompt } from "@/lib/APIservice"
import { Loader2 } from "lucide-react"



// Types
interface PromptType {
  id: number
  created_at: string
  user_id: null | string
  prompt_type: string
  updated_at: string
}

interface Prompt {
  id: number
  created_at: string
  user_id: null | string
  prompt: string
  prompt_type_id: number
  updated_at: string
}

export default function PromptManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPromptTypeId, setSelectedPromptTypeId] = useState<number | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [promptContent, setPromptContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Fetch prompt types
  const { data: promptTypesData, isLoading: isLoadingPromptTypes } = useQuery({
    queryKey: ["promptTypes"],
    queryFn: fetchPromptTypes,
  })

  // Fetch prompts for selected type
  const {
    data: promptsData,
    isLoading: isLoadingPrompts,
    refetch: refetchPrompts,
  } = useQuery({
    queryKey: ["prompts", selectedPromptTypeId],
    queryFn: () => fetchPrompts(selectedPromptTypeId!),
    enabled: !!selectedPromptTypeId,
  })

  // Update prompt mutation
  const { mutate: updatePromptMutation, isPending: isUpdating } = useMutation({
    mutationFn: updatePrompt,
    onSuccess: () => {
      toast.success(isCreating ? "Prompt created successfully" : "Prompt updated successfully")
      refetchPrompts()
      resetForm()
    },
    onError: (error) => {
      toast.error(`Failed to ${isCreating ? "create" : "update"} prompt: ${error.message}`)
    },
  })

  // Reset form state
  const resetForm = () => {
    setSelectedPrompt(null)
    setPromptContent("")
    setIsEditing(false)
    setIsCreating(false)
  }

  // Handle prompt type selection
  const handlePromptTypeChange = (value: string) => {
    setSelectedPromptTypeId(Number(value))
    resetForm()
  }

  // Handle prompt selection
  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setPromptContent(prompt.prompt)
    setIsEditing(true)
    setIsCreating(false)
  }

  // Handle creating new prompt
  const handleCreateNew = () => {
    if (!selectedPromptTypeId) {
      toast.error("Please select a prompt type first")
      return
    }

    setSelectedPrompt(null)
    setPromptContent("")
    setIsEditing(false)
    setIsCreating(true)
  }

  // Handle saving prompt
  const handleSavePrompt = () => {
    if (!promptContent.trim()) {
      toast.error("Prompt content cannot be empty")
      return
    }

    if (!selectedPromptTypeId) {
      toast.error("Please select a prompt type")
      return
    }

    updatePromptMutation({
      prompt: promptContent,
      promptTypeId: selectedPromptTypeId,
      promptId: isCreating ? undefined : selectedPrompt?.id,
    })
  }

  // Format prompt type for display
  const formatPromptType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="flex-1 overflow-auto w-full">
        <div className="mx-auto bg-white min-h-full shadow-sm">
          <Header title="Prompt Management" setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

          <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Prompt Management</h1>
                <p className="text-muted-foreground mt-1">Manage prompts for your application</p>
              </div>
              {/* <Button
                onClick={handleCreateNew}
                disabled={!selectedPromptTypeId}
                size="lg"
                className="whitespace-nowrap"
              >
                Create New Prompt
              </Button> */}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Left sidebar - Prompt Type Selection */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prompt Types</CardTitle>
                    <CardDescription>Select a prompt type to manage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPromptTypes ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : (
                      <Select onValueChange={handlePromptTypeChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a prompt type" />
                        </SelectTrigger>
                        <SelectContent>
                          {promptTypesData?.result.map((type: PromptType) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {formatPromptType(type.prompt_type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {/* Selected Type Info */}
                {selectedPromptTypeId && promptTypesData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p className="font-medium">
                          {formatPromptType(
                            promptTypesData.result.find((t: PromptType) => t.id === selectedPromptTypeId)
                              ?.prompt_type || "",
                          )}
                        </p>
                        <p className="text-muted-foreground mt-1">
                          {promptsData?.result?.length || 0} prompts available
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main content area */}
              <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
                {/* Prompts List */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedPromptTypeId
                        ? `Prompts for ${formatPromptType(
                            promptTypesData?.result.find((t: PromptType) => t.id === selectedPromptTypeId)
                              ?.prompt_type || "",
                          )}`
                        : "Available Prompts"}
                    </CardTitle>
                    <CardDescription>
                      {selectedPromptTypeId
                        ? "Select a prompt to edit or create a new one"
                        : "Please select a prompt type to view prompts"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedPromptTypeId ? (
                      <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-md">
                        Please select a prompt type from the sidebar to view available prompts
                      </div>
                    ) : isLoadingPrompts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading prompts...</span>
                      </div>
                    ) : promptsData?.result?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-md">
                        No prompts found for this type. Create a new one!
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {promptsData?.result.map((prompt: Prompt) => (
                          <div
                            key={prompt.id}
                            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedPrompt?.id === prompt.id ? "border-primary bg-gray-50 ring-1 ring-primary" : ""
                            }`}
                            onClick={() => handlePromptSelect(prompt)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">Prompt #{prompt.id}</div>
                              <div className="text-xs text-muted-foreground">
                                Last updated: {new Date(prompt.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2 line-clamp-2">{prompt.prompt}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Prompt Editor */}
                {(isEditing || isCreating) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{isCreating ? "Create New Prompt" : `Edit Prompt #${selectedPrompt?.id}`}</CardTitle>
                      <CardDescription>
                        {isCreating
                          ? "Create a new prompt for the selected type"
                          : "Make changes to the existing prompt"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={promptContent}
                        onChange={(e) => setPromptContent(e.target.value)}
                        placeholder="Enter prompt content..."
                        className="min-h-[300px] mb-6 resize-y"
                      />
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={resetForm} size="lg">
                          Cancel
                        </Button>
                        <Button onClick={handleSavePrompt} disabled={isUpdating} size="lg">
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Prompt"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-90 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
