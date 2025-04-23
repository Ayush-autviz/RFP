'use client'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import sanitizeHtml from "sanitize-html";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { fetchCriticalDependencies, fetchSynopsis } from "@/lib/APIservice";

// Mock fetch function (replace with actual API call)


export default function RFPSynopsis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch synopsis data using useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ["CriticalDependencie"],
    queryFn: fetchCriticalDependencies,
  });

  // Sanitize Markdown to prevent XSS
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
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="flex-1 overflow-auto w-full">
        <div className="mx-auto bg-white min-h-full shadow-sm">
          <Header title="Critical Dependencies" setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Critical Dependencies</h1>

            {isLoading ? (
              <div className="text-center text-gray-500">Loading Critical Dependencies...</div>
            ) : error ? (
              <div className="text-center text-red-500">
                Failed to load synopsis: {(error as Error).message}
              </div>
            ) : !data?.result ? (
              <div className="text-center text-gray-500">No Critical Dependencies data available</div>
            ) : (
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
                        <td className="border border-gray-300 px-4 py-2">{children}</td>
                      );
                    },
                    h2({ children }) {
                      return <h2 className="text-xl font-semibold mt-6 mb-4">{children}</h2>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-6">{children}</ul>;
                    },
                    li({ children }) {
                      return <li className="mb-2">{children}</li>;
                    },
                  }}
                >
                  {sanitizeMarkdown(data.result)}
                </ReactMarkdown>
              </div>
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