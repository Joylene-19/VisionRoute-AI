import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  SparklesIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import api from "../services/api";
import useAuthStore from "../store/authStore";

const CareerChatbot = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [hasAssessment, setHasAssessment] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load active session and suggested questions on mount
  useEffect(() => {
    loadActiveSession();
    loadSuggestedQuestions();
  }, []);

  const loadActiveSession = async () => {
    try {
      const response = await api.get("/api/ai/session");
      if (response.session) {
        setSessionId(response.session.sessionId);
        setMessages(response.session.messages || []);
        setHasAssessment(!!response.session.context?.assessmentResults);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  const loadSuggestedQuestions = async () => {
    try {
      const response = await api.get("/api/ai/suggestions");
      setSuggestedQuestions(response.suggestions || []);
      setHasAssessment(response.hasAssessment);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/ai/chat", {
        message: messageText,
        sessionId,
      });

      const aiMessage = {
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSessionId(response.sessionId);
      setHasAssessment(response.hasContext);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    handleSendMessage(question);
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to start a new chat session?")) return;

    try {
      const response = await api.delete("/api/ai/history", {
        data: { sessionId },
      });
      setMessages([]);
      setSessionId(response.sessionId);
      loadSuggestedQuestions();
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-dark-background dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI Career Counselor
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Get personalized career guidance powered by AI
                </p>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Start new chat"
            >
              <TrashIcon className="h-5 w-5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Assessment status banner */}
          {!hasAssessment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg"
            >
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                💡 <strong>Tip:</strong> Complete your career assessment to get
                more personalized recommendations!
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <SparklesIcon className="h-16 w-16 text-indigo-400 dark:text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome, {user?.fullName?.split(" ")[0]}! 👋
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  I'm your AI career counselor. Ask me anything about careers,
                  colleges, entrance exams, or your assessment results!
                </p>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-indigo-200"
                          : "text-gray-500 dark:text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && suggestedQuestions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about careers, colleges, or your assessment results..."
                className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-6 w-6 animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="h-6 w-6" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerChatbot;
