import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, AlertTriangle, Database, FileEdit, Loader2, MessageSquare, Send, User, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "sonner";

const API = "http://localhost:8000/api";

const AISuggestionsPanel = ({ analysis, plan, query, isLoading, collapsed, onToggleCollapse }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollRef = useRef(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !plan) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API}/pg/chat`, {
        message: userMessage,
        plan: plan,
        query: query,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: "ai", content: response.data.reply }]);
      } else {
        toast.error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Error sending message");
    } finally {
      setIsChatLoading(false);
    }
  };

  if (collapsed) {
    return (
      <div className="h-[800px] bg-white border rounded-lg shadow-sm flex flex-col items-center justify-start pt-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-4"
          data-testid="expand-ai-panel-button"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="writing-mode-vertical text-sm font-medium text-gray-600">
          AI Suggestions
        </div>
      </div>
    );
  }

  return (
    <Card className="h-[800px] flex flex-col" data-testid="ai-suggestions-panel">
      <CardHeader className="flex-shrink-0 border-b py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">AI Optimization Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            data-testid="collapse-ai-panel-button"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section: Suggestions (Scrollable) */}
        <div className="flex-1 overflow-hidden border-b flex flex-col">
          <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
            Analysis Report
          </div>
          <ScrollArea className="flex-1 px-4 py-4">
            {isLoading && !analysis ? (
              <div className="flex items-center justify-center h-full pt-10" data-testid="ai-loading">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-gray-500">Analyzing query plan...</p>
                </div>
              </div>
            ) : !analysis ? (
              <div className="flex items-center justify-center h-full pt-10" data-testid="ai-no-analysis">
                <div className="text-center space-y-3">
                  <Lightbulb className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="text-sm text-gray-500">
                    Execute a query to get AI-powered optimization suggestions
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {/* Overall Assessment */}
                {analysis.overall_assessment && (
                  <div className="space-y-2" data-testid="overall-assessment">
                    <h3 className="font-semibold text-sm text-gray-900">Overall Assessment</h3>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-100">
                      {analysis.overall_assessment}
                    </p>
                  </div>
                )}

                {/* Bottlenecks */}
                {analysis.bottlenecks && analysis.bottlenecks.length > 0 && (
                  <div className="space-y-3" data-testid="bottlenecks-section">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <h3 className="font-semibold text-sm text-gray-900">Performance Bottlenecks</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.bottlenecks.map((bottleneck, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-md border ${bottleneck.impact === "high"
                              ? "bg-red-50 border-red-200"
                              : bottleneck.impact === "medium"
                                ? "bg-orange-50 border-orange-200"
                                : "bg-yellow-50 border-yellow-200"
                            }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-sm">{bottleneck.node_type}</span>
                            <Badge
                              variant={bottleneck.impact === "high" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {bottleneck.impact}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-700">{bottleneck.issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Index Recommendations */}
                {analysis.index_recommendations && analysis.index_recommendations.length > 0 && (
                  <div className="space-y-3" data-testid="index-recommendations-section">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-sm text-gray-900">Index Recommendations</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.index_recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="p-3 bg-green-50 rounded-md border border-green-200"
                        >
                          <div className="font-medium text-sm mb-1">
                            CREATE INDEX ON {rec.table} ({rec.columns?.join(", ") || "columns"})
                          </div>
                          <p className="text-xs text-gray-700">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Query Rewrites */}
                {analysis.query_rewrites && analysis.query_rewrites.length > 0 && (
                  <div className="space-y-3" data-testid="query-rewrites-section">
                    <div className="flex items-center space-x-2">
                      <FileEdit className="h-4 w-4 text-purple-600" />
                      <h3 className="font-semibold text-sm text-gray-900">Query Optimization Suggestions</h3>
                    </div>
                    <div className="space-y-2">
                      {analysis.query_rewrites.map((rewrite, index) => (
                        <div
                          key={index}
                          className="p-3 bg-purple-50 rounded-md border border-purple-200"
                        >
                          <p className="text-sm font-medium mb-1">{rewrite.suggestion}</p>
                          <p className="text-xs text-gray-700">{rewrite.benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Bottom Section: Chat (Fixed Height) */}
        <div className="h-[300px] flex flex-col bg-white">
          <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b flex items-center gap-2">
            <MessageSquare className="h-3 w-3" />
            AI Chat
          </div>

          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm space-y-2">
                <MessageSquare className="h-8 w-8 opacity-20" />
                <p>Ask follow-up questions about the plan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      }`}>
                      {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className={`p-3 rounded-lg text-sm max-w-[85%] ${msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about specific nodes, cost, or indexes..."
                disabled={isChatLoading || !plan}
                className="flex-1 bg-white"
              />
              <Button type="submit" size="icon" disabled={isChatLoading || !plan || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AISuggestionsPanel;
