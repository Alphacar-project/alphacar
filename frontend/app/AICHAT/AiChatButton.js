"use client";

import { useState, useEffect, useRef } from "react";
import MascotLoader from "./MascotLoader"; 

export default function AiChatButton() {
  const [open, setOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // 👇 [드래그/리사이즈 상태]
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false); 
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const [size, setSize] = useState({ width: 720, height: 800 }); // ✅ 최종 확정 크기
  
  const dragRef = useRef({ x: 0, y: 0 });
  const initialSizeRef = useRef({ width: 0, height: 0 });

  // 초기 메시지 상수
  const INITIAL_MESSAGE = {
    role: "system",
    content: "안녕하세요! ALPHACAR AI 챗봇입니다. 차량 사진을 올리시거나 궁금한 점을 물어보세요!",
  };

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미지 관련 상태
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null); 
  const scrollRef = useRef(null);

  const INITIAL_RIGHT_OFFSET = 120; // 초기 위치 우측 여백
  const INITIAL_BOTTOM_OFFSET = 80; // 초기 위치 하단 여백
  const MIN_WIDTH = 400; // 최소 너비
  const MIN_HEIGHT = 300; // 최소 높이

  // 마우스 오버 핸들러
  const handleMouseOver = () => setIsHovering(true);
  const handleMouseOut = () => setIsHovering(false);

  // 👇 [추가] 초기 위치 계산 및 다시 고정 기능
  const handleReCenter = () => {
    if (typeof window !== 'undefined') {
        const initialX = window.innerWidth - size.width - INITIAL_RIGHT_OFFSET;
        const initialY = window.innerHeight - size.height - INITIAL_BOTTOM_OFFSET;
        setPosition({ x: initialX, y: initialY });
    }
  };
  
  // 초기 위치 설정 (컴포넌트 마운트 시 한 번 실행)
  useEffect(() => {
    handleReCenter();
    // 창 크기 변경 시 위치 재설정 로직 (선택 사항)
    const handleWindowResize = () => handleReCenter();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []); 

  // 드래그 시작 함수 (Header에서 호출)
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    setIsDragging(true);
    dragRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // 리사이즈 시작 함수 (핸들에서 호출)
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    dragRef.current = { x: e.clientX, y: e.clientY };
    initialSizeRef.current = { width: size.width, height: size.height };
  };

  // 👇 [핵심 로직] 드래그 및 리사이즈 추적
  useEffect(() => {
    if (!open) return;

    const handleWindowMouseMove = (e) => {
      if (isDragging) {
        // --- 드래그 로직 ---
        const newX = e.clientX - dragRef.current.x;
        const newY = e.clientY - dragRef.current.y;
        const maxX = window.innerWidth - size.width;
        const maxY = window.innerHeight - 50; 

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
        });
      } else if (isResizing) {
        // --- 리사이즈 로직 ---
        const deltaX = e.clientX - dragRef.current.x;
        const deltaY = e.clientY - dragRef.current.y;

        const newWidth = Math.max(MIN_WIDTH, initialSizeRef.current.width + deltaX);
        const newHeight = Math.max(MIN_HEIGHT, initialSizeRef.current.height + deltaY);

        setSize({ width: newWidth, height: newHeight });
        // 리사이즈 시 위치도 조정하여 창이 좌상단으로 확장되도록 합니다.
        setPosition(prev => ({
          x: Math.max(0, prev.x), // 좌측 경계 유지
          y: Math.max(0, prev.y) // 상단 경계 유지
        }));
      }
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, isResizing, open, size, position]);
  // ------------------------------------

  // 창 크기에 따라 반응형 처리 (기존 유지)
  useEffect(() => {
    function handleResize() {
      setIsNarrow(window.innerWidth < 1100);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 스크롤 자동 이동 (기존 유지)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, previewUrl]);

  // 채팅 초기화 함수 (기존 유지)
  const handleReset = () => {
    if (window.confirm("대화 내용을 모두 지우고 처음부터 다시 시작하시겠습니까?")) {
      setMessages([INITIAL_MESSAGE]);
      setInput("");
      setLoading(false);
      clearImageSelection();
    }
  };

  // 이미지 선택/전송 로직 (기존 유지)
  const clearImageSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSendMessage = async (customMessage) => {
    const msgToSend = customMessage || input;
    if ((!msgToSend.trim() && !selectedFile) || loading) return;
    const userMsg = { role: "user", content: msgToSend, image: previewUrl };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      let data;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/chat/image", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Image upload failed");
        data = await res.json();
        clearImageSelection();
      } else {
        const res = await fetch("/api/chat/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg.content }),
        });
        if (!res.ok) throw new Error("Network error");
        data = await res.json();
      }
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

  // 👇 [수정됨] 마크다운 이미지/링크 렌더러 (비교 시 수평 정렬 기능 추가)
  const renderContent = (text) => {
    const regex = /\[!\[(.*?)\]\((.*?)\)\]\((.*?)\)|!\[(.*?)\]\((.*?)\)/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    // --- 1차 Pass: 텍스트를 이미지 데이터와 일반 텍스트로 분리 ---
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      const isLinked = match[3] !== undefined;
      segments.push({
        type: 'image',
        src: isLinked ? match[2] : match[5],
        alt: isLinked ? match[1] : match[4],
        href: isLinked ? match[3] : null,
        key: match.index,
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      segments.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    const finalElements = [];
    let i = 0;

    // --- 2차 Pass: 연속된 이미지를 Horizontal Flex 컨테이너로 묶기 ---
    while (i < segments.length) {
      const part = segments[i];

      if (part.type === 'image') {
        const imageGroup = [];
        let j = i;
        
        // 연속된 이미지를 그룹핑 (이미지이거나, 내용 없는 공백 텍스트인 경우)
        while (j < segments.length) {
          const current = segments[j];
          if (current.type === 'image') {
            imageGroup.push(current);
            j++;
          } else if (current.type === 'text' && current.content.trim() === '') {
            j++;
          } else {
            break;
          }
        }
        
        // 2개 이상의 이미지가 연속적으로 발견되면 수평 비교 모드 발동
        if (imageGroup.length >= 2) {
          finalElements.push(
            <div key={`group-${i}`} style={{ 
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'space-around', 
                margin: '10px 0', 
                flexWrap: 'wrap'
            }}>
              {imageGroup.map((imgData, index) => {
                const imageContent = (
                  <div style={{ flex: 1, minWidth: imageGroup.length === 2 ? '45%' : '30%' }}>
                    <img
                      src={imgData.src}
                      alt={imgData.alt}
                      style={{ maxWidth: "100%", height: "auto", display: "block", transition: "transform 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                    />
                     <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                        {imgData.alt || `차량 ${index + 1}`}
                     </div>
                  </div>
                );

                if (imgData.href) {
                  return (
                    <a key={`link-${index}`} href={imgData.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: imageGroup.length === 2 ? '45%' : '30%' }}>
                      {imageContent}
                    </a>
                  );
                }
                return imageContent;
              })}
            </div>
          );
          i = j;
        } else {
          // 1개의 이미지는 기존 방식대로 수직으로 렌더링
          i = renderSingleSegment(finalElements, part, i);
        }
      } else {
        // 일반 텍스트는 그대로 수직으로 렌더링
        i = renderSingleSegment(finalElements, part, i);
      }
    }

    // Helper 함수 (단일 텍스트/이미지 세그먼트를 렌더링하고 인덱스를 반환)
    function renderSingleSegment(finalElements, part, index) {
        if (part.type === 'text') {
            finalElements.push(part.content);
        } else if (part.type === 'image') {
            const imageContent = (
                <div key={part.key} style={{ margin: "10px 0", borderRadius: "8px", overflow: "hidden" }}>
                    <img src={part.src} alt={part.alt} style={{ maxWidth: "100%", height: "auto", display: "block" }} />
                    {part.href && (
                        <div style={{ padding: "8px", backgroundColor: "#f0f8ff", color: "#1e90ff", fontSize: "12px", fontWeight: "bold", textAlign: "center" }}>
                            <a href={part.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1e90ff' }}>
                                👆 클릭하여 상세 견적 확인하기
                            </a>
                        </div>
                    )}
                </div>
            );
            if (part.href) {
                finalElements.push(<a key={`single-link-${part.key}`} href={part.href} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>{imageContent}</a>);
            } else {
                finalElements.push(imageContent);
            }
        }
        return index + 1;
    }

    return finalElements.length > 0 ? finalElements : text;
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
        left: `${position.x}px`,
        top: `${position.y}px`, 
        width: `${size.width}px`, // ✅ 상태 크기 사용
        height: `${size.height}px`, // ✅ 상태 크기 사용
        maxHeight: "calc(100vh - 120px)",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
        cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'default', // 드래그/리사이즈 커서
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

  const HEADER_HEIGHT = '52px';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        style={floatButtonStyle}
      >
        {/* 호버 기능 */}
        {open ? "닫기" : isHovering ? "챗봇 상담" : "💬"} 
      </button>

      {open && (
        <div 
          style={popupStyle} 
          onMouseUp={() => {setIsDragging(false); setIsResizing(false);}}
        >
          {/* 상단 바 (Header) */}
          <div
            style={{
              padding: "10px 16px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", 
              alignItems: "center", fontSize: "13px", fontWeight: "bold", flexShrink: 0,
              height: HEADER_HEIGHT, cursor: 'grab', 
            }}
            onMouseDown={handleMouseDown}
          >
            <span>ALPHACAR AI 챗봇</span>
            
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* 위치 초기화 버튼 */}
              <button
                type="button"
                onClick={handleReCenter} 
                title="창 위치 초기화"
                style={{
                  border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: "#666", padding: "4px",
                }}
              >
                📌
              </button>

              {/* 대화 초기화 버튼 */}
              <button
                type="button"
                onClick={handleReset}
                title="대화 초기화"
                style={{
                  border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: "#666", padding: "4px",
                }}
              >
                ↺
              </button>

              {/* 닫기 버튼 */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  border: "none", background: "none", cursor: "pointer", fontSize: "20px", color: "#333", padding: "4px",
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* 👇 로딩 오버레이 레이어 */}
          {loading && (
              <div
                  style={{
                      position: 'absolute', top: HEADER_HEIGHT, bottom: '0', left: '0', right: '0',
                      backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 70, display: 'flex', justifyContent: 'center', 
                      alignItems: 'center', flexDirection: 'column', color: 'white', paddingBottom: '80px',
                      textAlign: 'center'
                  }}
              >
                  <MascotLoader isOverlay={true} />

                  <p style={{ marginTop: '20px', fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                      잠시만 기다려주세요... AI가 최적의 정보를 찾는 중입니다.
                  </p>
              </div>
          )}

          {/* 중앙: 채팅 영역 */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, minHeight: 0, padding: "16px", fontSize: "13px", color: "#333", overflowY: "auto",
              display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f9f9f9",
              scrollBehavior: "smooth", position: 'relative'
            }}
          >
            {/* 추천 질문 영역 (기존과 동일) */}
            {messages.length === 1 && (
              <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#eef6ff", borderRadius: "8px" }}>
                <p style={{ fontWeight: "bold", marginBottom: "8px", color: "#1e90ff" }}>💡 추천 질문</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, cursor: "pointer" }}>
                  {["3천만 원대 사회초년생 첫 차 추천해줘", "쏘나타랑 그랜저 가격이랑 옵션 비교해줘", "4인 가족이 탈 만한 차박용 SUV 추천해줘", "연비 좋은 하이브리드 차량 뭐 있어?", "제네시스 G80 사진이랑 견적 보여줘"].map((text, i) => (
                    <li
                      key={i}
                      onClick={() => handleSendMessage(text)}
                      style={{
                        padding: "6px 10px", marginBottom: "6px", backgroundColor: "white", borderRadius: "20px",
                        border: "1px solid #ddd", fontSize: "12px", color: "#555", display: "inline-block", marginRight: "6px"
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

            {/* 메시지 리스트 */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "10px 14px",
                  borderRadius: "12px", backgroundColor: msg.role === "user" ? "#1e90ff" : "white", color: msg.role === "user" ? "white" : "black",
                  border: msg.role === "user" ? "none" : "1px solid #eee", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  whiteSpace: "pre-wrap", lineHeight: "1.5",
                }}
              >
                {/* 사용자가 업로드한 이미지가 있으면 표시 */}
                {msg.image && (
                    <div style={{ marginBottom: "8px", borderRadius: "8px", overflow: "hidden" }}>
                        <img src={msg.image} alt="Upload" style={{ maxWidth: "100%", maxHeight: "200px", display: "block" }} />
                    </div>
                )}
                {/* 텍스트 렌더링 */}
                {msg.content && renderContent(msg.content)}
              </div>
            ))}
          </div>

          {/* 👇 [추가] 리사이즈 핸들 (우측 하단) */}
          <div
            style={{
              position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px',
              cursor: 'nwse-resize', zIndex: 999, 
            }}
            onMouseDown={handleResizeMouseDown}
          />

          {/* 하단: 입력박스 및 이미지 미리보기 */}
          <div
            style={{
              borderTop: "1px solid #eee", backgroundColor: "white", borderRadius: "0 0 16px 16px",
              display: "flex", flexDirection: "column", flexShrink: 0
            }}
          >
            {/* 이미지 선택 시 미리보기 영역 (기존과 동일) */}
            {previewUrl && (
                <div style={{
                    padding: "8px 12px", borderBottom: "1px solid #f0f0f0", display: "flex",
                    alignItems: "center", gap: "8px"
                }}>
                    <div style={{ position: "relative", width: "50px", height: "50px", borderRadius: "6px", overflow: "hidden", border: "1px solid #ddd" }}>
                        <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, fontSize: "12px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selectedFile?.name}
                    </div>
                    <button
                        onClick={clearImageSelection}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#999", fontSize: "16px" }}
                    >
                        ❌
                    </button>
                </div>
            )}

            {/* 입력 영역 */}
            <div style={{
              padding: "12px", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0,
            }}>
              {/* 파일 입력 (숨김) */}
              <input
                  type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }}
              />

              {/* 카메라 버튼 */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                style={{
                  border: "none", backgroundColor: "#f0f0f0", borderRadius: "50%", width: "36px", height: "36px",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "18px"
                }}
                title="사진 업로드"
              >
                📷
              </button>

              <input
                type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={selectedFile ? "사진과 함께 보낼 메시지 (선택)" : "궁금한 차량 정보를 물어보세요..."}
                disabled={loading}
                style={{
                  flex: 1, borderRadius: "20px", border: "1px solid #ddd", padding: "10px 14px", fontSize: "13px", outline: "none",
                }}
              />
              <button
                type="button" onClick={() => handleSendMessage()} disabled={loading || (!input.trim() && !selectedFile)}
                style={{
                  borderRadius: "20px", border: "none", backgroundColor: (loading || (!input.trim() && !selectedFile)) ? "#ccc" : "#1e90ff",
                  color: "white", fontSize: "13px", padding: "10px 18px", cursor: (loading || (!input.trim() && !selectedFile)) ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
