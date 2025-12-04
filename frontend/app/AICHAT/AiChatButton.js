"use client";

import { useState, useEffect, useRef } from "react";

export default function AiChatButton() {
  const [open, setOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  // 초기 메시지 상수
  const INITIAL_MESSAGE = {
    role: "system",
    content: "안녕하세요! ALPHACAR AI 챗봇입니다. 무엇을 도와드릴까요?",
  };

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // 창 크기에 따라 반응형 처리
  useEffect(() => {
    function handleResize() {
      setIsNarrow(window.innerWidth < 1100);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 스크롤 자동 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // 채팅 초기화 함수
  const handleReset = () => {
    if (window.confirm("대화 내용을 모두 지우고 처음부터 다시 시작하시겠습니까?")) {
      setMessages([INITIAL_MESSAGE]); 
      setInput(""); 
      setLoading(false); 
    }
  };

  // 메시지 전송 함수
  const handleSendMessage = async (customMessage) => {
    const msgToSend = customMessage || input;
    if (!msgToSend.trim() || loading) return;

    const userMsg = { role: "user", content: msgToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.response },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "죄송합니다. 서버 연결에 실패했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ 마크다운 이미지 및 링크 렌더러 (기능 개선됨)
  const renderContent = (text) => {
    // 정규식 설명:
    // 1. 링크된 이미지: [![alt](src)](href)
    // 2. 일반 이미지: ![alt](src)
    const regex = /\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)|!\[(.*?)\]\((.*?)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // 매칭된 부분 앞의 일반 텍스트 추가
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // match[1], match[2], match[3] -> 링크된 이미지 (alt, src, href)
      // match[4], match[5] -> 일반 이미지 (alt, src)
      
      if (match[1] && match[3]) {
        // [CASE 1] 링크가 걸린 이미지 (클릭 시 이동)
        parts.push(
          <div key={match.index} style={{ margin: "10px 0", borderRadius: "8px", overflow: "hidden" }}>
            <a 
              href={match[3]} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'block', cursor: 'pointer', textDecoration: 'none' }}
            >
              <img
                src={match[2]}
                alt={match[1]}
                style={{ maxWidth: "100%", height: "auto", display: "block", transition: "transform 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{ 
                padding: "8px", 
                backgroundColor: "purple", 
                color: "#1e90ff", 
                fontSize: "12px", 
                fontWeight: "bold", 
                textAlign: "center" 
              }}>
                👆 클릭하여 상세 견적 확인하기
              </div>
            </a>
          </div>
        );
      } else {
        // [CASE 2] 일반 이미지 (기존 로직)
        parts.push(
          <div key={match.index} style={{ margin: "10px 0", borderRadius: "8px", overflow: "hidden" }}>
            <img
              src={match[5]}
              alt={match[4]}
              style={{ maxWidth: "100%", height: "auto", display: "block" }}
            />
          </div>
        );
      }
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  // 팝업 스타일
  const popupStyle = isNarrow
    ? {
        position: "fixed",
        left: "16px",
        right: "16px",
        top: "72px",
        bottom: "16px",
        width: "auto",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
      }
    : {
        position: "fixed",
        right: "120px",
        bottom: "80px",
        width: "400px",
        height: "600px", 
        maxHeight: "calc(100vh - 120px)",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
      };

  const floatButtonStyle = {
    position: "fixed",
    right: isNarrow ? "16px" : "120px",
    bottom: "24px",
    borderRadius: "999px",
    padding: "10px 24px",
    backgroundColor: "#1e90ff",
    color: "white",
    border: "none",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 50,
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={floatButtonStyle}
      >
        {open ? "닫기" : "AI 챗봇 상담"}
      </button>

      {open && (
        <div style={popupStyle}>
          {/* 상단 바 */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            <span>ALPHACAR AI 챗봇</span>
            
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleReset}
                title="대화 초기화"
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#666",
                  padding: "4px",
                }}
              >
                ↺
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#333",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* 중앙: 채팅 영역 */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              minHeight: 0,
              padding: "16px",
              fontSize: "13px",
              color: "#333",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              backgroundColor: "#f9f9f9",
              scrollBehavior: "smooth",
            }}
          >
            {messages.length === 1 && (
              <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#eef6ff", borderRadius: "8px" }}>
                <p style={{ fontWeight: "bold", marginBottom: "8px", color: "#1e90ff" }}>💡 추천 질문</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, cursor: "pointer" }}>
                  {[
                    "3천만 원대 사회초년생 첫 차 추천해줘",
                    "쏘나타랑 K5 가격이랑 옵션 비교해줘",
                    "4인 가족이 탈 만한 차박용 SUV 추천해줘",
                    "연비 좋은 하이브리드 차량 뭐 있어?",
                    "제네시스 G80 사진이랑 견적 보여줘"
                  ].map((text, i) => (
                    <li 
                      key={i} 
                      onClick={() => handleSendMessage(text)}
                      style={{ 
                        padding: "6px 10px", 
                        marginBottom: "6px", 
                        backgroundColor: "white", 
                        borderRadius: "20px", 
                        border: "1px solid #ddd",
                        fontSize: "12px",
                        color: "#555",
                        display: "inline-block", 
                        marginRight: "6px"
                      }}
                    >
                      {text}
                    </li>
                  ))}
                </ul>
                <p style={{ marginTop: "12px", fontSize: "11px", color: "#888" }}>
                  ⚠️ 금융, 정치, 날씨 등 자동차와 무관한 질문은 답변하지 않습니다.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  backgroundColor: msg.role === "user" ? "#1e90ff" : "white",
                  color: msg.role === "user" ? "white" : "black",
                  border: msg.role === "user" ? "none" : "1px solid #eee",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                }}
              >
                {renderContent(msg.content)}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", color: "#888", fontSize: "12px", marginLeft: "8px" }}>
                답변 생성 중... 🚗
              </div>
            )}
          </div>

          {/* 하단: 입력박스 */}
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: "0 0 16px 16px",
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 차량 정보를 물어보세요..."
              disabled={loading}
              style={{
                flex: 1,
                borderRadius: "20px",
                border: "1px solid #ddd",
                padding: "10px 14px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={loading}
              style={{
                borderRadius: "20px",
                border: "none",
                backgroundColor: loading ? "#ccc" : "#1e90ff",
                color: "white",
                fontSize: "13px",
                padding: "10px 18px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
