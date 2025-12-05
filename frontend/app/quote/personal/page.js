// app/quote/personal/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// [수정] 프록시 경로 사용 (http://... 지움)
// next.config.mjs 설정에 따라 /api/makers, /api/models, /api/trims 로 연결됩니다.
const API_BASE = "/api";

export default function PersonalQuotePage() {
  const router = useRouter();

  // 선택된 데이터
  const [selectedMaker, setSelectedMaker] = useState(null); // { _id, name }
  const [selectedModel, setSelectedModel] = useState(null); // { _id, model_name }
  const [selectedTrim, setSelectedTrim] = useState(null);   // { _id, name, price }

  // 목록 데이터
  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);

  // 1. 처음 로딩 시 제조사 목록 가져오기
  useEffect(() => {
    fetch(`${API_BASE}/makers`)
      .then((res) => res.json())
      .then((data) => {
        // [안전장치] 배열인지 확인
        if (Array.isArray(data)) {
          setMakers(data);
        } else {
          console.error("제조사 데이터 오류:", data);
          setMakers([]);
        }
      })
      .catch((err) => {
        console.error("제조사 로딩 실패:", err);
        setMakers([]);
      });
  }, []);

  // 2. 제조사 선택 시 -> 모델 목록 가져오기
  const handleMakerClick = (maker) => {
    setSelectedMaker(maker);
    setSelectedModel(null);
    setSelectedTrim(null);
    setModels([]);
    setTrims([]);

    // [수정] 프록시 경로 사용 & 안전장치 추가
    fetch(`${API_BASE}/models?makerId=${maker._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // [추가] 모델명 중복 제거 (Unique Key 에러 방지 및 깔끔한 UI)
          const uniqueModels = Array.from(
            new Map(data.map((m) => [m.model_name, m])).values()
          );
          setModels(uniqueModels);
        } else {
          console.error("모델 데이터 오류(배열 아님):", data);
          setModels([]);
        }
      })
      .catch((err) => {
        console.error("모델 로딩 실패:", err);
        setModels([]);
      });
  };

  // 3. 모델 선택 시 -> 트림 목록 가져오기
  const handleModelClick = (model) => {
    setSelectedModel(model);
    setSelectedTrim(null);
    setTrims([]);

    // [수정] 프록시 경로 사용 & 안전장치 추가
    fetch(`${API_BASE}/trims?modelId=${model._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTrims(data);
        } else {
          console.error("트림 데이터 오류(배열 아님):", data);
          setTrims([]);
        }
      })
      .catch((err) => {
        console.error("트림 로딩 실패:", err);
        setTrims([]);
      });
  };

  // 4. 트림 선택
  const handleTrimClick = (trim) => {
    setSelectedTrim(trim);
  };

  const handleSearch = () => {
    if (!selectedMaker || !selectedModel || !selectedTrim) {
      alert("모든 항목을 선택해주세요.");
      return;
    }
    // 결과 페이지로 이동 (트림 ID를 넘김)
    router.push(`/quote/personal/result?trimId=${selectedTrim._id}`);
  };

  const handleReset = () => {
    setSelectedMaker(null);
    setSelectedModel(null);
    setSelectedTrim(null);
    setModels([]);
    setTrims([]);
  };

  // 스타일 (기존 유지)
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
    <main
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 40px 60px",
        }}
      >
        {/* 뒤로 가기 버튼 */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            marginBottom: "12px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#555",
          }}
        >
          ← 뒤로 가기
        </button>

        {/* 🔵 개별견적 상단 설명 카드 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "24px 32px",
            marginBottom: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* 왼쪽 파란 포인트 바 */}
          <div
            style={{
              width: "6px",
              height: "60px",
              borderRadius: "4px",
              background: "linear-gradient(180deg, #3b82f6, #1d4ed8)",
            }}
          />

          {/* 텍스트 영역 */}
          <div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#1d4ed8",
                marginBottom: "6px",
              }}
            >
              개별견적 페이지
            </div>

            <div
              style={{
                fontSize: "15px",
                color: "#555",
              }}
            >
              한 대의 차량을 선택해서 옵션과 가격을 자세하게 확인할 수 있습니다.
            </div>
          </div>
        </div>

        {/* 🚗 차량 상세 견적 메인 카드 */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "32px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ fontSize: "22px" }}>차량 상세 견적</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleReset}
                style={{
                  padding: "8px 16px",
                  borderRadius: "99px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                초기화
              </button>
              <button
                onClick={handleSearch}
                style={{
                  padding: "8px 20px",
                  borderRadius: "99px",
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                조회하기
              </button>
            </div>
          </div>

          {/* 선택 현황 */}
          <div
            style={{
              marginBottom: "16px",
              fontSize: "14px",
              color: "#555",
            }}
          >
            선택차량:
            <b style={{ marginLeft: "8px" }}>
              {selectedMaker?.name || "-"}
            </b>{" "}
            &gt;
            <b style={{ marginLeft: "4px" }}>
              {selectedModel?.model_name || "-"}
            </b>{" "}
            &gt;
            <b style={{ marginLeft: "4px" }}>
              {selectedTrim?.name || "-"}
            </b>
          </div>

          {/* 3단 선택 박스 */}
          <div style={{ display: "flex", gap: "16px" }}>
            {/* 제조사 */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  marginBottom: "6px",
                  color: "#666",
                  fontSize: "13px",
                }}
              >
                제조사
              </div>
              <div style={columnBoxStyle}>
                {makers.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => handleMakerClick(m)}
                    style={
                      selectedMaker?._id === m._id
                        ? selectedItemStyle
                        : itemButtonStyle
                    }
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 모델 */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  marginBottom: "6px",
                  color: "#666",
                  fontSize: "13px",
                }}
              >
                모델
              </div>
              <div style={columnBoxStyle}>
                {models.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => handleModelClick(m)}
                    style={
                      selectedModel?._id === m._id
                        ? selectedItemStyle
                        : itemButtonStyle
                    }
                  >
                    {m.model_name}
                  </button>
                ))}
              </div>
            </div>

            {/* 트림 */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  marginBottom: "6px",
                  color: "#666",
                  fontSize: "13px",
                }}
              >
                트림
              </div>
              <div style={columnBoxStyle}>
                {trims.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => handleTrimClick(t)}
                    style={
                      selectedTrim?._id === t._id
                        ? selectedItemStyle
                        : itemButtonStyle
                    }
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
