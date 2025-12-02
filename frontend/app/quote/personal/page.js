// app/quote/personal/page.js
"use client";

import { useState } from "react";

const carData = {
  현대: {
    아반떼: ["스마트", "모던", "인스퍼레이션"],
    소나타: ["프리미엄", "프리미엄 플러스"],
  },
  기아: {
    모닝: ["베이직", "프레스티지"],
    K5: ["트렌디", "프레스티지", "시그니처"],
  },
  제네시스: {
    G70: ["슈프림", "스포츠"],
    G80: ["프리미엄 럭셔리", "스포츠 패키지"],
  },
};

export default function PersonalQuotePage() {
  const [selectedMaker, setSelectedMaker] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTrim, setSelectedTrim] = useState(null);

  const makers = Object.keys(carData);
  const models = selectedMaker ? Object.keys(carData[selectedMaker]) : [];
  const trims =
    selectedMaker && selectedModel
      ? carData[selectedMaker][selectedModel]
      : [];

  const handleReset = () => {
    setSelectedMaker(null);
    setSelectedModel(null);
    setSelectedTrim(null);
  };

  const handleSearch = () => {
    if (!selectedMaker || !selectedModel || !selectedTrim) {
      alert("제조사, 모델명, 트림을 모두 선택해 주세요.");
      return;
    }
    // 나중에 백엔드 연동하면 여기서 API 호출하면 됨
    alert(
      `검색: ${selectedMaker} / ${selectedModel} / ${selectedTrim} 차량을 조회합니다.`
    );
  };

  const columnBoxStyle = {
    background: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    maxHeight: "260px",
    overflowY: "auto",
  };

  const itemButtonStyle = {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
  };

  const selectedItemStyle = {
    ...itemButtonStyle,
    background: "#0070f3",
    color: "#ffffff",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        padding: "0 40px",
      }}
    >
      <section
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "32px 32px 40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* 상단 제목 + 버튼 영역 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "22px",
                marginBottom: "8px",
              }}
            >
              개별견적 페이지
            </h2>
            <p style={{ fontSize: "13px", color: "#666", maxWidth: "520px" }}>
              여기에서 특정 차량 1대의 제조사, 모델명, 트림을 선택해서
              상세 견적을 조회할 수 있습니다.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleReset}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1px solid #ccc",
                background: "#fff",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              선택 초기화
            </button>
            <button
              onClick={handleSearch}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: "#111",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              검색
            </button>
          </div>
        </div>

        {/* 선택 결과 한 줄 표시 */}
        <div
          style={{
            fontSize: "13px",
            color: "#555",
            marginBottom: "16px",
          }}
        >
          선택한 차량 :
          <span style={{ fontWeight: 600, marginLeft: "6px" }}>
            {selectedMaker || "제조사 미선택"} &gt;{" "}
            {selectedModel || "모델 미선택"} &gt;{" "}
            {selectedTrim || "트림 미선택"}
          </span>
        </div>

        {/* 3 컬럼 선택 영역 */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          {/* 제조사 컬럼 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                marginBottom: "6px",
                color: "#666",
              }}
            >
              제조사
            </div>
            <div style={columnBoxStyle}>
              {makers.map((maker) => (
                <button
                  key={maker}
                  style={
                    maker === selectedMaker ? selectedItemStyle : itemButtonStyle
                  }
                  onClick={() => {
                    setSelectedMaker(maker);
                    setSelectedModel(null);
                    setSelectedTrim(null);
                  }}
                >
                  {maker}
                </button>
              ))}
              {makers.length === 0 && (
                <div style={{ padding: "10px 12px", fontSize: "13px" }}>
                  제조사 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 모델명 컬럼 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                marginBottom: "6px",
                color: "#666",
              }}
            >
              모델명
            </div>
            <div style={columnBoxStyle}>
              {models.length > 0 ? (
                models.map((model) => (
                  <button
                    key={model}
                    style={
                      model === selectedModel
                        ? selectedItemStyle
                        : itemButtonStyle
                    }
                    onClick={() => {
                      setSelectedModel(model);
                      setSelectedTrim(null);
                    }}
                  >
                    {model}
                  </button>
                ))
              ) : (
                <div style={{ padding: "10px 12px", fontSize: "13px" }}>
                  먼저 제조사를 선택해 주세요.
                </div>
              )}
            </div>
          </div>

          {/* 트림 컬럼 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                marginBottom: "6px",
                color: "#666",
              }}
            >
              트림
            </div>
            <div style={columnBoxStyle}>
              {trims.length > 0 ? (
                trims.map((trim) => (
                  <button
                    key={trim}
                    style={
                      trim === selectedTrim
                        ? selectedItemStyle
                        : itemButtonStyle
                    }
                    onClick={() => setSelectedTrim(trim)}
                  >
                    {trim}
                  </button>
                ))
              ) : (
                <div style={{ padding: "10px 12px", fontSize: "13px" }}>
                  모델명을 선택하면 트림이 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

