import React, { useState, useEffect, useRef } from "react";
import { messageApi } from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import { Send, User, ShieldCheck, Clock, CheckCheck, Lock } from "lucide-react";

export default function TicketChat({
  ticketId,
  currentUserId,
  isAgent = false,
  ticketStatus = "New",
}) {
  const { socket, isConnected, joinTicketRoom, leaveTicketRoom } = useSocket();
  const { error } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial message history
  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await messageApi.getMessages(ticketId, isAgent);
        if (isMounted) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (ticketId) {
      fetchMessages();
      joinTicketRoom(ticketId);
    }

    return () => {
      isMounted = false;
      leaveTicketRoom(ticketId);
    };
  }, [ticketId, isAgent]);

  // Listen to Socket.IO real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (newMsg.ticket === ticketId || (newMsg.ticket?._id && newMsg.ticket._id === ticketId)) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, ticketId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");

    try {
      setSending(true);
      const res = await messageApi.sendMessage(ticketId, textToSend, isAgent);
      // If socket didn't append it immediately, add to local state
      const createdMsg = res.data.data;
      if (createdMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === createdMsg._id)) return prev;
          return [...prev, createdMsg];
        });
      }
    } catch (err) {
      error(err.message || "Failed to send message");
      setInputText(textToSend); // Restore on error
    } finally {
      setSending(false);
    }
  };

  const isClosed = ticketStatus === "Resolved";

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[560px] overflow-hidden bg-slate-950/60">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
          <h4 className="font-semibold text-sm text-white">Live Conversation</h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{messages.length} messages</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className={isConnected ? "text-emerald-400" : "text-amber-400"}>
            {isConnected ? "Real-time connected" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading conversation history...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">No messages yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Start the conversation by sending a message below.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.sender === currentUserId ||
              (typeof msg.sender === "object" && msg.sender?._id === currentUserId) ||
              (isAgent && msg.senderRole === "agent") ||
              (!isAgent && msg.senderRole === "user");

            const isAgentMsg = msg.senderRole === "agent";

            const timeString = new Date(
              msg.createdAt || Date.now()
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {/* Sender Tag */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                  {isAgentMsg ? (
                    <span className="flex items-center gap-1 text-purple-400 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Support Agent
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-brand-400 font-semibold">
                      <User className="w-3 h-3" />
                      Customer
                    </span>
                  )}
                  <span>&bull;</span>
                  <span>{timeString}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                    isMe
                      ? "bg-brand-600 text-white rounded-tr-sm"
                      : isAgentMsg
                      ? "bg-purple-950/70 border border-purple-800/40 text-purple-100 rounded-tl-sm"
                      : "bg-slate-800 border border-slate-700/60 text-slate-100 rounded-tl-sm"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        {isClosed ? (
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-medium">
            <Lock className="w-4 h-4" />
            <span>This ticket is marked as Resolved. Conversation is closed.</span>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isAgent
                  ? "Reply to customer as support agent..."
                  : "Type your message or inquiry..."
              }
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="flex items-center justify-center p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all hover:scale-105 shadow-md shadow-brand-600/30 disabled:opacity-40 disabled:pointer-events-none"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
