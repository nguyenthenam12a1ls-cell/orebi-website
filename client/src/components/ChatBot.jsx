import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { serverUrl } from "../../config"; // Đảm bảo đường dẫn config đúng

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Tin nhắn khởi đầu (Greeting) luôn ở vị trí index 0
  const [messages, setMessages] = useState([
    { role: "model", text: "Xin chào! Tôi là trợ lý ảo của Orebi. Tôi có thể giúp gì cho bạn hôm nay?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    
    // Cập nhật giao diện ngay lập tức
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 🔥 FIX LỖI QUAN TRỌNG TẠI ĐÂY:
      // Google Gemini bắt buộc lịch sử phải bắt đầu bằng "user".
      // Ta dùng .filter để LOẠI BỎ tin nhắn đầu tiên (câu chào của Model) ra khỏi history gửi đi.
      const history = messages
        .filter((_, index) => index !== 0) // Bỏ qua tin nhắn chào mừng (index 0)
        .map((msg) => ({
          role: msg.role === "admin" ? "model" : msg.role, // map lại role nếu cần
          parts: [{ text: msg.text }],
        }));

      const response = await fetch(`${serverUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text, // Tin nhắn hiện tại của user
          history: history,          // Lịch sử đã được làm sạch (không có câu chào)
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "model", text: "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối." }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "model", text: "Lỗi mạng. Vui lòng thử lại sau." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[450px] bg-white shadow-2xl rounded-xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-[#1D262D] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-full text-[#1D262D]">
                <FaRobot size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Orebi Support AI</h3>
                <span className="text-xs text-gray-300 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition">
              <FaTimes size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#1D262D] text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-100 text-gray-800 text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1D262D]/20 transition"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-[#1D262D] text-white p-3 rounded-full hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-[#1D262D] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black hover:scale-110 transition-all duration-300 ease-in-out"
        style={{ marginBottom: "10px" }} // Tinh chỉnh khoảng cách nếu cần
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
        
        {/* Tooltip text (Optional) */}
        {!isOpen && (
          <span className="absolute right-16 bg-white text-gray-800 text-xs font-bold py-1 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat với AI
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatBot;