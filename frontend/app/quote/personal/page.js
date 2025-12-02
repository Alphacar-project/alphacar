"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 페이지 이동을 위해 필요

// 백엔드 주소 (포트 3003 또는 4000 등 설정하신 포트 사용)
const API_BASE = "http://192.168.0.160:3003/quote"; 

export default function PersonalQuotePage() {
  const router = useRouter();

  // 선택된 데이터 (ID와 이름 모두 저장)
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
      .then((data) => setMakers(data))
      .catch((err) => console.error("제조사 로딩 실패:", err));
  }, []);

  // 2. 제조사 선택 시 -> 모델 목록 가져오기
  const handleMakerClick = (maker) => {
    setSelectedMaker(maker);
    setSelectedModel(null);
    setSelectedTrim(null);
    setModels([]);
    setTrims([]);

    fetch(`${API_BASE}/models?makerId=${maker._id}`)
      .then((res) => res.json())
      .then((data) => setModels(data));
  };

  // 3. 모델 선택 시 -> 트림 목록 가져오기
  const handleModelClick = (model) => {
    setSelectedModel(model);
    setSelectedTrim(null);
    setTrims([]);

    fetch(`${API_BASE}/trims?modelId=${model._id}`)
      .then((res) => res.json())
      .then((data) => setTrims(data));
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
  };

  // 스타일 (생략 없이 그대로 사용)
  const columnBoxStyle = { background: "#ffffff", border: "1px solid #ddd", borderRadius: "10px", maxHeight: "260px", overflowY: "auto" };
  const itemButtonStyle = { width: "100%", textAlign: "left", padding: "10px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px" };
  const selectedItemStyle = { ...itemButtonStyle, background: "#0070f3", color: "#ffffff", fontWeight: 600 };

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 40px" }}>
      <section style={{ background: "#ffffff", borderRadius: "18px", padding: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px" }}>차량 상세 견적</h2>
          <div style={{ display: "flex", gap: "8px" }}>
             <button onClick={handleReset} style={{ padding: "8px 16px", borderRadius: "99px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>초기화</button>
             <button onClick={handleSearch} style={{ padding: "8px 20px", borderRadius: "99px", border: "none", background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer" }}>조회하기</button>
          </div>
        </div>

        {/* 선택 현황 */}
        <div style={{ marginBottom: "16px", fontSize: "14px", color: "#555" }}>
           선택차량: 
           <b style={{ marginLeft: "8px" }}>{selectedMaker?.name || "-"}</b> &gt; 
           <b style={{ marginLeft: "4px" }}>{selectedModel?.model_name || "-"}</b> &gt; 
           <b style={{ marginLeft: "4px" }}>{selectedTrim?.name || "-"}</b>
        </div>

        {/* 3단 선택 박스 */}
        <div style={{ display: "flex", gap: "16px" }}>
          {/* 제조사 */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "6px", color: "#666", fontSize: "13px" }}>제조사</div>
            <div style={columnBoxStyle}>
              {makers.map((m) => (
                <button key={m._id} onClick={() => handleMakerClick(m)} style={selectedMaker?._id === m._id ? selectedItemStyle : itemButtonStyle}>
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          {/* 모델 */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "6px", color: "#666", fontSize: "13px" }}>모델</div>
            <div style={columnBoxStyle}>
              {models.map((m) => (
                <button key={m._id} onClick={() => handleModelClick(m)} style={selectedModel?._id === m._id ? selectedItemStyle : itemButtonStyle}>
                  {m.model_name}
                </button>
              ))}
            </div>
          </div>
          {/* 트림 */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "6px", color: "#666", fontSize: "13px" }}>트림</div>
            <div style={columnBoxStyle}>
              {trims.map((t) => (
                <button key={t._id} onClick={() => handleTrimClick(t)} style={selectedTrim?._id === t._id ? selectedItemStyle : itemButtonStyle}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
