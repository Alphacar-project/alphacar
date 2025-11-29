"use client";

import { useState, useEffect } from "react";

export default function AiChatButton() {
  const [open, setOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  // 창 크기에 따라 반응형 처리
  useEffect(() => {
    function handleResize() {
      setIsNarrow(window.innerWidth < 1100); // 1100px 보다 작으면 "좁은 화면" 취급
    }

    handleResize(); // 처음 한 번 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 팝업 스타일(넓은 화면 / 좁은 화면 분기)
  const popupStyle = isNarrow
    ? {
        // 🔹 화면이 좁을 때 : 좌우 꽉 차게
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
        // 🔹 화면이 넓을 때 : 오른쪽에 640px 고정
        position: "fixed",
        right: "24px",
        top: "72px",
        bottom: "24px",
        width: "1860px",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
      };

  // 플로팅 버튼 위치 (좁을 때는 조금 안쪽으로)
  const floatButtonStyle = isNarrow
    ? {
        position: "fixed",
        right: "16px",
        bottom: "16px",
        borderRadius: "999px",
        padding: "10px 18px",
        backgroundColor: "#1e90ff",
        color: "white",
        border: "none",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        cursor: "pointer",
        fontSize: "14px",
        zIndex: 50,
      }
    : {
        position: "fixed",
        right: "24px",
        bottom: "24px",
        borderRadius: "999px",
        padding: "10px 18px",
        backgroundColor: "#1e90ff",
        color: "white",
        border: "none",
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        cursor: "pointer",
        fontSize: "14px",
        zIndex: 50,
      };

  return (
    <>
      {/* 오른쪽 하단 플로팅 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={floatButtonStyle}
      >
        AI 챗봇
      </button>

      {/* 큰 팝업 창 */}
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
            }}
          >
            ALPHACAR AI 챗봇
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* 상단: 차량 비교 영역 */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f2f2f2",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              AI 추천 차량 비교
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: isNarrow ? "column" : "row", // 좁을 때는 위/아래로 쌓기
                gap: "12px",
              }}
            >
              {/* 차량 카드 1 */}
              <div
                style={{
                  flex: 1,
                  borderRadius: "12px",
                  border: "1px solid #eee",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    height: "120px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  차량 이미지 1
                </div>
                <div style={{ fontSize: "12px", color: "#333" }}>
                  <b>차량 A</b> (예: 트렉스 RS)
                  <br />
                  대략 가격 / 연비 / 타입 정보가 들어갈 수 있어요.
                </div>
              </div>

              {/* 차량 카드 2 */}
              <div
                style={{
                  flex: 1,
                  borderRadius: "12px",
                  border: "1px solid #eee",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    height: "120px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  차량 이미지 2
                </div>
                <div style={{ fontSize: "12px", color: "#333" }}>
                  <b>차량 B</b> (예: 쏘렌토 하이브리드)
                  <br />
                  나중에 AI가 추천해 준 차량 정보가 들어갈 수 있어요.
                </div>
              </div>
            </div>
          </div>

          {/* 중앙: 설명/가이드 + 채팅영역 */}
          <div
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: "12px",
              color: "#555",
              overflowY: "auto",
            }}
          >
            <p style={{ marginBottom: "6px" }}>
              안녕하세요! ALPHACAR AI 챗봇입니다.
            </p>
            <p style={{ marginBottom: "6px" }}>
              현재는 <b>UI 데모</b> 상태이고, 나중에 실제 AI와 연동해서
              <br />
              위의 차량 카드에 <b>추천 차량 2개를 자동으로 채워 넣을 수</b>
              있어요.
            </p>

            <p style={{ marginTop: "10px", marginBottom: "4px" }}>
              예시로 이런 질문을 할 수 있어요:
            </p>
            <ul style={{ paddingLeft: "18px", marginBottom: "8px" }}>
              <li>“예산 3천만 원대, 패밀리 SUV 추천해줘”</li>
              <li>“트렉스랑 셀토스 중에 유지비 비교해줘”</li>
              <li>“서울 출퇴근용 전기차 추천해줘”</li>
            </ul>
          </div>

          {/* 하단: 입력박스 & 전송 버튼 */}
          <div
            style={{
              padding: "8px 12px 10px",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="차량 추천이나 가격 비교를 물어보세요. (데모)"
              style={{
                flex: 1,
                borderRadius: "20px",
                border: "1px solid #ddd",
                padding: "8px 12px",
                fontSize: "12px",
              }}
            />
            <button
              type="button"
              style={{
                borderRadius: "20px",
                border: "none",
                backgroundColor: "#1e90ff",
                color: "white",
                fontSize: "12px",
                padding: "8px 12px",
                cursor: "pointer",
              }}
              onClick={() => alert("AI 연동은 추후 구현 예정입니다.")}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}

