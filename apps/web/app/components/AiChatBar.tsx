"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { generateUUID } from "../lib/generateUUID"
type Chat = { text: string; isYou: boolean }
import type { ElementsType } from "@repo/common"
type Props = {
  SetElements: React.Dispatch<React.SetStateAction<ElementsType[]>>
}
export const AiChatBar = ({SetElements}: Props) => {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([
    { text: "Hey! Describe a diagram and I'll generate it for you.", isYou: false },
  ])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats])

  const handleSubmit = async () => {
    const text = prompt.trim()
    if (!text || loading) return

    setChats((prev) => [...prev, { text, isYou: true }])
    setPrompt("")
    setLoading(true)

    try {
      const response = await axios.post("/api/ai-diagram", { prompt: text })
      
       const data=  JSON.parse(response.data.message) ; 
       console.log(data.message);
       console.log(data.elements);
       if(data.elements > 0 ){
          const newElements = data.elements.map(( each: any)=>({
            ...each , 
            id : generateUUID()
          }))
          SetElements((prevs)=> [...prevs , ...newElements]) ; 
       }
       setChats((prev) => [...prev, { text: data.message , isYou : false }])
    } catch {
      setChats((prev) => [...prev, { text: "Something went wrong. Try again.", isYou: false }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .ai-messages::-webkit-scrollbar { width: 4px; }
        .ai-messages::-webkit-scrollbar-track { background: transparent; }
        .ai-messages::-webkit-scrollbar-thumb { background: #3a3a42; border-radius: 4px; }
        .ai-messages::-webkit-scrollbar-thumb:hover { background: #7c78e8; }
      `}</style>

      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="flex flex-col"
        style={{
          width: 300,
          height: "100%",
          background: "#26262c",
          borderLeft: "1px solid #3a3a42",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #3a3a42",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#7c78e8",
              boxShadow: "0 0 6px #7c78e8",
            }}
          />
          <span style={{ color: "#e2e2e8", fontWeight: 600, fontSize: 14, letterSpacing: "0.02em" }}>
            AI Assistant
          </span>
        </div>

        {/* Messages */}
        <div
          className="ai-messages"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 12px 4px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <AnimatePresence initial={false}>
            {chats.map((chat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", justifyContent: chat.isYou ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "8px 12px",
                    borderRadius: chat.isYou ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: chat.isYou ? "#7c78e8" : "#1b1b1f",
                    color: chat.isYou ? "#fff" : "#c9c9d4",
                    fontSize: 13,
                    lineHeight: 1.5,
                    border: chat.isYou ? "none" : "1px solid #3a3a42",
                  }}
                >
                  {chat.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", gap: 4, padding: "4px 2px" }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c78e8" }}
                />
              ))}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid #3a3a42",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Describe a diagram..."
            style={{
              flex: 1,
              background: "#1b1b1f",
              border: "1px solid #3a3a42",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#e2e2e8",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            style={{
              background: prompt.trim() && !loading ? "#7c78e8" : "#3a3a42",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              color: "#fff",
              fontSize: 13,
              cursor: prompt.trim() && !loading ? "pointer" : "not-allowed",
              transition: "background 0.2s",
              fontWeight: 500,
            }}
          >
            ↑
          </button>
        </div>
      </motion.div>
    </>
  )
}