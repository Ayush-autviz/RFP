'use client'

import { useState, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  LayoutGrid,
  Sparkles,
  FileText,
  Pencil,
  X,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteChatQuestion, generateAIdraft, generateOutline, generatePreviousAiDraft, generatePreviousOutline, generatePreviousResponse, generateResponse, getHistory } from "@/lib/APIservice";
import { toast } from "sonner";
import { useProject } from "./projectContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For tables and other GFM features
import rehypeRaw from "rehype-raw"; // For rendering raw HTML
import sanitizeHtml from "sanitize-html"; // For sanitizing HTML
import hljs from "highlight.js"; // For syntax highlighting (optional)
import "highlight.js/styles/github.css"; // Optional: Choose a highlight.js theme

// Types (unchanged)
type QuestionState = {
  isOpen: boolean;
  text: string;
};

type HistoryQuestionState = {
  id: number;
  isOpen: boolean;
  isEditing: boolean;
  message: string;
  response: string;
  editedMessage: string;
};

type HistoryItem = {
  id: number;
  message: string;
  project_id: number;
  created_at: string;
  response: string;
  project_name: string;
};

// Main Component
export default function RFPResponseApp() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedProject } = useProject();
  const [questionIsOpen, setQuestionIsOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionState[]>([{ isOpen: true, text: "" }]);
  const [historyQuestions, setHistoryQuestions] = useState<HistoryQuestionState[]>([]);

  // Query for fetching history (unchanged)
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["history", selectedProject?.id],
    queryFn: () =>
      getHistory({
        filter: "",
        startDate: "",
        endDate: "",
        projectId: selectedProject?.id?.toString() || "",
      }),
    enabled: !!selectedProject?.id,
  });

  // Update history questions when historyData changes (unchanged)
  useEffect(() => {
    if (historyData?.result) {
      setHistoryQuestions(
        historyData.result.map((item: HistoryItem) => ({
          id: item.id,
          isOpen: false,
          isEditing: false,
          message: item.message,
          response: item.result,
          editedMessage: item.message,
        }))
      );
    } else {
      setHistoryQuestions([]);
    }
  }, [historyData]);

  // Mutations for generating responses (unchanged)
  const { mutate: generateResponseFn, isPending: generatePending } = useMutation({
    mutationFn: ({ userQuery, projectId }: { projectId: number; userQuery: string }) =>
      generateResponse(userQuery, projectId),
    onSuccess: (data) => {
      toast.success("Response generated successfully");
      queryClient.invalidateQueries({ queryKey: ["history", selectedProject?.id] });
      setResponse(data.final_response);
      setQuestionText("");
    },
    onError: (error) => {
      toast.error("Failed to generate response");
      console.error("Generation error:", error);
    },
  });

  const { mutate: generateOutlineFn, isPending: generateOutlinePending } = useMutation({
    mutationFn: ({ userQuery, projectId }: { projectId: number; userQuery: string }) =>
      generateOutline(userQuery, projectId),
    onSuccess: (data) => {
      toast.success("Response generated successfully");
      queryClient.invalidateQueries({ queryKey: ["history", selectedProject?.id] });
      setResponse(data.final_response);
      setQuestionText("");
    },
    onError: (error) => {
      toast.error("Failed to generate response");
      console.error("Generation error:", error);
    },
  });

  const { mutate: generateAiFn, isPending: generateAiFnPending } = useMutation({
    mutationFn: ({ userQuery, projectId }: { projectId: number; userQuery: string }) =>
      generateAIdraft(userQuery, projectId),
    onSuccess: (data) => {
      toast.success("Response generated successfully");
      queryClient.invalidateQueries({ queryKey: ["history", selectedProject?.id] });
      setResponse(data.final_response);
      setQuestionText("");
    },
    onError: (error) => {
      toast.error("Failed to generate response");
      console.error("Generation error:", error);
    },
  });



  const { mutate: deleteChat, isPending: deleteChatPending } = useMutation({
    mutationFn: ( chatId: number ) =>
    deleteChatQuestion(chatId),
    onSuccess: (data) => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["history", selectedProject?.id] });
      setResponse(data.final_response);
    },
    onError: (error) => {
      toast.error("Failed to generate response");
      console.error("Generation error:", error);
    },
  });

  const { mutate: generateResponseHistory, isPending: generateHistoryPending } = useMutation({
    mutationFn: ({ userQuery, projectId, chatId }: { projectId: number; userQuery: string; chatId?: string }) =>
      generatePreviousResponse(userQuery, projectId, chatId || ""),
    onSuccess: (data) => {
      toast.success("Response generated successfully");
      queryClient.invalidateQueries({ queryKey: ["history", selectedProject?.id] });
      setResponse(data.final_response);
    },
    onError: (error) => {
      toast.error("Failed to generate response");
      console.error("Generation error:", error);
    },
  });

  const { mutate: generateOutlineHistory, isPending: generateOutlineHistoryPending } = useMutation({
    mutationFn: ({ userQuery, projectId, chatId }: { projectId: number; userQuery: string; chatId?: string }) =>
      generatePreviousOutline(userQuery, projectId, chatId || ""),
    onSuccess: (data) => {
      toast.success("Response generated successfully");
      queryClient.invalidateQueries({ queryKey: ["history", selectedProject?.id] });
      setResponse(data.final_response);
    },
    onError: (error) => {
      toast.error("Failed to generate response");
      console.error("Generation error:", error);
    },
  });


  const { mutate: generateAIDraftHistory, isPending: generateAIDraftHistoryPending } = useMutation({
    mutationFn: ({ userQuery, projectId, chatId }: { projectId: number; userQuery: string; chatId?: string }) =>
      generatePreviousAiDraft(userQuery, projectId, chatId || ""),
    onSuccess: (data) => {
      toast.success("Response generated successfully");
      queryClient.invalidateQueries({ queryKey: ["history", selectedProject?.id] });
      setResponse(data.final_response);
    },
    onError: (error) => {
      toast.error("Failed to generate response");
      console.error("Generation error:", error);
    },
  });

  // Handlers for Current Questions (unchanged)
  const toggleQuestion = () => {
    setQuestionIsOpen(!questionIsOpen);
   // setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, isOpen: !q.isOpen } : q)));
  };

  const updateQuestionText = ( text: string) => {
    setQuestionText(text);
    //setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, text } : q)));
  };

  const addQuestion = () => {
    setQuestions([...questions, { isOpen: true, text: "" }]);
  };

  const deleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const finalizeQuestion = () => {
    const questionTextTrim = questionText.trim();
    if (!questionTextTrim) {
      toast.error("Please enter a question");
      return;
    }
    generateResponseFn({
      userQuery: questionTextTrim,
      projectId: selectedProject!.id,
    });
    //setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, text: "" } : q)));
  };

  const OutlineQuestion = () => {
    const questionTextTrim = questionText.trim();
    if (!questionTextTrim) {
      toast.error("Please enter a question");
      return;
    }
    generateOutlineFn({
      userQuery: questionTextTrim,
      projectId: selectedProject!.id,
    });
    //setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, text: "" } : q)));
  };

  const AiDraftQuestion = () => {
    const questionTextTrim = questionText.trim();
    if (!questionTextTrim) {
      toast.error("Please enter a question");
      return;
    }
    generateAiFn({
      userQuery: questionTextTrim,
      projectId: selectedProject!.id,
    });
    //setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, text: "" } : q)));
  };

  // Handlers for History Questions (unchanged)
  const toggleHistoryQuestion = (index: number) => {
    setHistoryQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, isOpen: !q.isOpen } : q))
    );
  };

  const toggleEditHistoryQuestion = (index: number) => {
    setHistoryQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, isEditing: true, editedMessage: q.message } : q))
    );
  };

  const cancelEditHistoryQuestion = (index: number) => {
    setHistoryQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, isEditing: false, editedMessage: q.message } : q))
    );
  };

  const updateEditedMessage = (index: number, text: string) => {
    setHistoryQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, editedMessage: text } : q))
    );
  };

  const finalizeHistoryQuestion = (index: number) => {
    const question = historyQuestions[index];
    const editedText = question.editedMessage.trim();
    if (!editedText) {
      toast.error("Please enter a question");
      return;
    }
    generateResponseHistory({
      userQuery: editedText,
      projectId: selectedProject!.id,
      chatId: question.id.toString(),
    });
    setHistoryQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, message: editedText, editedMessage: editedText, isEditing: false } : q
      )
    );
  };

  const outlineHistoryQuestion = (index: number) => {
    const question = historyQuestions[index];
    const editedText = question.editedMessage.trim();
    if (!editedText) {
      toast.error("Please enter a question");
      return;
    }
    generateOutlineHistory({
      userQuery: editedText,
      projectId: selectedProject!.id,
      chatId: question.id.toString(),
    });
    setHistoryQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, message: editedText, editedMessage: editedText, isEditing: false } : q
      )
    );
  };

  const AiDraftHistoryQuestion = (index: number) => {
    const question = historyQuestions[index];
    const editedText = question.editedMessage.trim();
    if (!editedText) {
      toast.error("Please enter a question");
      return;
    }
    generateAIDraftHistory({
      userQuery: editedText,
      projectId: selectedProject!.id,
      chatId: question.id.toString(),
    });
    setHistoryQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, message: editedText, editedMessage: editedText, isEditing: false } : q
      )
    );
  };

  // Render Components (unchanged except for ReactMarkdown)
  const renderQuestionActions = () => (
    <div className="flex flex-wrap gap-2 my-4">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        onClick={() => OutlineQuestion()}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Plan & Outline</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        onClick={() => AiDraftQuestion()}
      >
        <Sparkles className="h-4 w-4" />
        <span>AI Draft</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        disabled={true}
      >
        <FileText className="h-4 w-4" />
        <span>Extract Insights</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        onClick={() => finalizeQuestion()}
        disabled={generatePending}
      >
        <Pencil className="h-4 w-4" />
        <span>{generatePending ? "Generating..." : "Finalize"}</span>
      </Button>
    </div>
  );

  const renderHistoryQuestionActions = (index: number) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* {historyQuestions[index].isEditing ? ( */}
        <>
        <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        onClick={() => outlineHistoryQuestion(index)}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Plan & Outline</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        onClick={() => AiDraftHistoryQuestion(index)}
      >
        <Sparkles className="h-4 w-4" />
        <span>AI Draft</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        disabled={true}
      >
        <FileText className="h-4 w-4" />
        <span>Extract Insights</span>
      </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white hover:bg-gray-50"
            onClick={() => finalizeHistoryQuestion(index)}
            disabled={generateHistoryPending}
          >
            <Pencil className="h-4 w-4" />
            <span>{generateHistoryPending ? "Generating..." : "Finalize"}</span>
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white hover:bg-gray-50"
            onClick={() => cancelEditHistoryQuestion(index)}
            disabled={generateHistoryPending}
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button> */}
        </>
      {/* // ) : (
      //   <Button
      //     variant="outline"
      //     size="sm"
      //     className="flex items-center gap-2 bg-white hover:bg-gray-50"
      //     onClick={() => toggleEditHistoryQuestion(index)}
      //   >
      //     <Edit className="h-4 w-4" />
      //     <span>Edit</span>
      //   </Button>
      // )} */}
    </div>
  );

  // Sanitize HTML to prevent XSS
  const sanitizeMarkdown = (markdown: string) => {
    // First, let ReactMarkdown parse the Markdown to HTML
    // Then sanitize the output
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
        code: ["class"], // Allow class for syntax highlighting
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="flex-1 overflow-auto w-full">
        <div className="mx-auto bg-white min-h-full shadow-sm">
          <Header title="Prepare Response" setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <div className="p-6 space-y-6">
            {!selectedProject ? (
              <div className="text-center text-gray-500 text-lg">No project selected</div>
            ) : (
              <>
                <div className="flex items-center justify-start gap-3">
                  <div className="font-medium">{selectedProject.name}</div>
                </div>

                {/* Current Questions */}
                <h2 className="text-lg font-semibold">Add Question</h2>
                {/* {questions.map((question, index) => ( */}
                  <div  className="border rounded-md">
                    <div
                      className="flex justify-between items-center p-4 border-b cursor-pointer"
                      onClick={() => toggleQuestion()}
                    >
                      <h2 className="font-medium">Ask your question here</h2>
                      <div className="flex items-center gap-2">
                        {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(index);
                          }}
                          className="text-red-500"
                        >
                          <Trash2 size={20} />
                        </button> */}
                        {/* {question.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />} */}
                      </div>
                    </div>
                    {/* {question.isOpen && ( */}
                      <div className="p-4">
                        <Textarea
                          placeholder="Enter your question here..."
                          className="min-h-[100px] border-gray-200"
                          value={questionText}
                          onChange={(e) => updateQuestionText(e.target.value)}
                          disabled={generatePending}
                        />
                        {renderQuestionActions()}
                      </div>
                    {/* // )} */}
                  </div>
                {/* ))} */}
                {/* <Button
                  variant="secondary"
                  className="bg-[#111827] text-white hover:bg-[#1a2234]"
                  onClick={addQuestion}
                  disabled={generatePending}
                >
                  Add Another Question
                </Button> */}

                {/* History Section */}
                <div className="">
                  <h2 className="text-lg font-semibold mb-4">Previouly Asked Questions</h2>
                  {historyLoading ? (
                    <div className="text-center text-gray-500">Loading history...</div>
                  ) : historyQuestions.length === 0 ? (
                    <div className="text-center text-gray-500">No previous questions found</div>
                  ) : (
                    historyQuestions.map((question, index) => (
                      // <div key={question.id} className="border rounded-md mt-5">
                      //   <div className="flex justify-between items-center p-4">
                      //     <h2 className="font-medium text-gray-700">
                      //       {question.isEditing ? (
                      //         <Textarea
                      //           value={question.editedMessage}
                      //           onChange={(e) => updateEditedMessage(index, e.target.value)}
                      //           className="min-h-[40px] border-gray-200"
                      //           disabled={generateHistoryPending}
                      //         />
                      //       ) : (
                      //         question.message
                      //       )}
                      //     </h2>
                      //     <div className="flex items-center gap-2">
                      //       <button
                      //         onClick={() => toggleHistoryQuestion(index)}
                      //         className="text-gray-500"
                      //       >
                      //         {question.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      //       </button>
                      //     </div>
                      //   </div>
                      //   <div className="px-4">{renderHistoryQuestionActions(index)}</div>
                      //   {question.isOpen && (
                      //     <div className="p-4 border-t">
                      //       <div className="prose prose-sm max-w-none text-gray-700">
                      //         <ReactMarkdown
                      //           remarkPlugins={[remarkGfm]}
                      //           rehypePlugins={[rehypeRaw]}
                      //           components={{
                      //             code({ node, inline, className, children, ...props }) {
                      //               const match = /language-(\w+)/.exec(className || "");
                      //               return !inline && match ? (
                      //                 <pre className="bg-gray-100 p-4 rounded-md">
                      //                   <code
                      //                     className={className}
                      //                     {...props}
                      //                     dangerouslySetInnerHTML={{
                      //                       __html: hljs.highlight(String(children), {
                      //                         language: match[1],
                      //                       }).value,
                      //                     }}
                      //                   />
                      //                 </pre>
                      //               ) : (
                      //                 <code className={className} {...props}>
                      //                   {children}
                      //                 </code>
                      //               );
                      //             },
                      //             table({ children }) {
                      //               return (
                      //                 <table className="border-collapse border border-gray-300">
                      //                   {children}
                      //                 </table>
                      //               );
                      //             },
                      //             th({ children }) {
                      //               return (
                      //                 <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                      //                   {children}
                      //                 </th>
                      //               );
                      //             },
                      //             td({ children }) {
                      //               return (
                      //                 <td className="border border-gray-300 px-4 py-2">
                      //                   {children}
                      //                 </td>
                      //               );
                      //             },
                      //           }}
                      //         >
                      //           {sanitizeMarkdown(question.response)}
                      //         </ReactMarkdown>
                      //       </div>
                      //     </div>
                      //   )}
                      // </div>

                      <div key={index} className="border rounded-md mb-5" >
                      <div
                        className="flex justify-between items-center p-4 border-b cursor-pointer"
                       // onClick={() => toggleQuestion(index)}
                      >
                        <h2 className="font-medium">Q{index + 1}</h2>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(question.id);
                            }}
                            className="text-red-500"
                          >
                            {deleteChatPending? "Deleting...":<Trash2 size={20} />}
                            
                          </button>
                          {/* {question.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />} */}
                        </div>
                      </div>
                      {/* {question.isOpen && ( */}
                        <div className="p-4">
                          <Textarea
                            placeholder="Enter your question here..."
                            className="min-h-[100px] border-gray-200"
                                value={question.editedMessage}
                               onChange={(e) => updateEditedMessage(index, e.target.value)}
                            disabled={generatePending}
                          />
                          <div className="pt-4">{renderHistoryQuestionActions(index)}</div>

                        </div>
                        <div
                        className="flex justify-between items-center p-4 border-t cursor-pointer"
                       // onClick={() => toggleQuestion(index)}
                          onClick={() => toggleHistoryQuestion(index)}
                      >
                        <h2 className="font-medium">Response</h2>
                        <div className="flex items-center gap-2"
                       // onClick={() => toggleHistoryQuestion(index)}
                        >
                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(index);
                            }}
                            className="text-red-500"
                          >
                            <Trash2 size={20} />
                          </button> */}
                          {question.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {/* // )} */}
                       {question.isOpen && (
                          <div className="p-4 border-t">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                  code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                      <pre className="bg-gray-100 p-4 rounded-md">
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
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  table({ children }) {
                                    return (
                                      <table className="border-collapse border border-gray-300">
                                        {children}
                                      </table>
                                    );
                                  },
                                  th({ children }) {
                                    return (
                                      <th className="border border-gray-300 px-4 py-2 bg-gray-100">
                                        {children}
                                      </th>
                                    );
                                  },
                                  td({ children }) {
                                    return (
                                      <td className="border border-gray-300 px-4 py-2">
                                        {children}
                                      </td>
                                    );
                                  },
                                }}
                              >
                                {sanitizeMarkdown(question.response)}
                              </ReactMarkdown>
                            </div>
                          </div>
                         )}
                    </div>

                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-90 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}