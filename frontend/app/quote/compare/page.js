// frontend/app/quote/compare/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 백엔드 API 주소
const API_BASE = "http://192.168.0.160:3003/quote";

// ---------------- 공통 컴포넌트: 차량 선택 박스 ----------------
function CarSelector({ title, onSearch, onReset, resetSignal }) {
  const [makerId, setMakerId] = useState("");
  const [modelId, setModelId] = useState("");
  const [trimId, setTrimId] = useState("");

  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);

  const [makerName, setMakerName] = useState("");
  const [modelName, setModelName] = useState("");
  const [trimName, setTrimName] = useState("");

  // 1. 초기 로딩
  useEffect(() => {
    fetch(`${API_BASE}/makers`)
      .then((res) => res.json())
      .then((data) => setMakers(data))
      .catch((err) => console.error("제조사 로딩 실패:", err));
  }, []);

  // 2. 전체 초기화
  useEffect(() => {
    handleReset();
  }, [resetSignal]);

  const handleReset = () => {
    setMakerId("");
    setModelId("");
    setTrimId("");
    setMakerName("");
    setModelName("");
    setTrimName("");
    setModels([]);
    setTrims([]);
    if (onReset) onReset();
  };

  // 3. 핸들러들
  const handleMakerChange = (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const name = e.target.options[index].text;

    setMakerId(id);
    setMakerName(name);
    setModelId("");
    setModelName("");
    setTrimId("");
    setTrimName("");
    setTrims([]);

    if (id) {
      fetch(`${API_BASE}/models?makerId=${id}`)
        .then((res) => res.json())
        .then((data) => setModels(data));
    } else {
      setModels([]);
    }
  };

  const handleModelChange = (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const name = e.target.options[index].text;

    setModelId(id);
    setModelName(name);
    setTrimId("");
    setTrimName("");

    if (id) {
      fetch(`${API_BASE}/trims?modelId=${id}`)
        .then((res) => res.json())
        .then((data) => setTrims(data));
    } else {
      setTrims([]);
    }
  };

  const handleTrimChange = (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const name = e.target.options[index].text;

    setTrimId(id);
    setTrimName(name);
  };

  const handleSearchClick = () => {
    if (!trimId) {
      alert("트림까지 모두 선택해주세요.");
      return;
    }
    if (onSearch) {
      onSearch(trimId);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "24px 28px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        minHeight: "420px",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>
        제조사 → 모델 → 트림 순서로 차량을 선택해주세요.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 1.1fr", gap: "16px" }}>
        {/* 제조사 */}
        <div>
          <div style={{ fontSize: "13px", color: "#777", marginBottom: "6px" }}>
            제조사
          </div>
          <select
            size={10}
            value={makerId}
            onChange={handleMakerChange}
            style={selectStyle}
          >
            <option value="" disabled>제조사 선택</option>
            {makers.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* 모델 */}
        <div>
          <div style={{ fontSize: "13px", color: "#777", marginBottom: "6px" }}>
            모델
          </div>
          <select
            size={10}
            value={modelId}
            onChange={handleModelChange}
            style={selectStyle}
          >
            <option value="" disabled>
              {models.length === 0 ? "제조사를 선택하세요" : "모델을 선택하세요"}
            </option>
            {models.map((m) => (
              <option key={m._id} value={m._id}>{m.model_name}</option>
            ))}
          </select>
        </div>

        {/* 트림 */}
        <div>
          <div style={{ fontSize: "13px", color: "#777", marginBottom: "6px" }}>
            트림
          </div>
          <select
            size={10}
            value={trimId}
            onChange={handleTrimChange}
            style={selectStyle}
          >
            <option value="" disabled>
              {trims.length === 0 ? "모델을 선택하세요" : "트림을 선택하세요"}
            </option>
            {trims.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 선택 결과 & 버튼 */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "13px", color: "#555" }}>
          선택차량:&nbsp;
          <span style={{ fontWeight: 600 }}>
            {makerName || "-"} &gt; {modelName || "-"} &gt; {trimName || "-"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            초기화
          </button>
          <button
            type="button"
            onClick={handleSearchClick}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#000",
              color: "#fff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            조회하기
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- 공통 컴포넌트: 아래 결과 카드 (수정됨: 옵션 상태 외부 주입) ----------------
function CarResultCard({ data, selectedOptions, onToggleOption }) {
  // 가격 계산
  const basePrice = data.base_price || 0;
  const optionsTotal = (data.options || []).reduce((sum, opt, idx) => {
    const safeId = opt._id || idx;
    if (selectedOptions.has(safeId)) {
      return sum + (opt.price || 0);
    }
    return sum;
  }, 0);
  const finalPrice = basePrice + optionsTotal;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "28px 32px 24px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            width: "200px",
            height: "110px",
            margin: "0 auto 16px",
            borderRadius: "16px",
            backgroundColor: data.image_url ? "transparent" : "#f3f3f3",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data.image_url ? (
            <img
              src={data.image_url}
              alt={data.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <span style={{ color: "#ccc", fontSize: "12px" }}>이미지 없음</span>
          )}
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            marginBottom: "4px",
          }}
        >
          {data.name}
        </div>
        <div style={{ fontSize: "13px", color: "#777" }}>
          {data.description || "상세 설명 없음"}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fafafa",
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "14px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>기본 가격</span>
        <span style={{ fontWeight: 700, color: "#1d4ed8" }}>
          {basePrice.toLocaleString()}원
        </span>
      </div>

      <div style={{ fontSize: "14px", marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, marginBottom: "10px" }}>옵션</div>
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #eee",
            padding: "10px 0",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {(!data.options || data.options.length === 0) && (
            <div
              style={{
                padding: "12px",
                textAlign: "center",
                color: "#999",
                fontSize: "13px",
              }}
            >
              선택 가능한 옵션이 없습니다.
            </div>
          )}
          {data.options &&
            data.options.map((opt, idx) => {
              const safeId = opt._id || idx;
              return (
                <label
                  key={safeId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 18px",
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.has(safeId)}
                    onChange={() => onToggleOption(safeId)}
                    style={{ marginRight: "12px", cursor: "pointer" }}
                  />
                  <span style={{ flex: 1 }}>{opt.name}</span>
                  <span style={{ fontSize: "13px", color: "#555" }}>
                    +{opt.price ? opt.price.toLocaleString() : 0}원
                  </span>
                </label>
              );
            })}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff3ee",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "15px",
          fontWeight: 700,
          marginBottom: "6px",
        }}
      >
        <span>최종 차량가</span>
        <span style={{ color: "#e11d48" }}>
          {finalPrice.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}

// ---------------- 메인 페이지 ----------------
export default function CompareQuotePage() {
  const router = useRouter();
  const [car1Result, setCar1Result] = useState(null);
  const [car2Result, setCar2Result] = useState(null);
  const [resetAllSignal, setResetAllSignal] = useState(0);

  // [추가] 옵션 선택 상태를 부모에서 관리
  const [leftOpts, setLeftOpts] = useState(new Set());
  const [rightOpts, setRightOpts] = useState(new Set());

  // 데이터 변경 시 옵션 초기화
  useEffect(() => setLeftOpts(new Set()), [car1Result?._id]);
  useEffect(() => setRightOpts(new Set()), [car2Result?._id]);

  const toggleLeftOpt = (id) => {
    const newSet = new Set(leftOpts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setLeftOpts(newSet);
  };

  const toggleRightOpt = (id) => {
    const newSet = new Set(rightOpts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRightOpts(newSet);
  };

  const fetchCarDetail = async (trimId) => {
    try {
      const res = await fetch(`${API_BASE}/detail?trimId=${trimId}`);
      if (!res.ok) throw new Error("조회 실패");
      return await res.json();
    } catch (err) {
      console.error(err);
      alert("차량 정보를 불러오는데 실패했습니다.");
      return null;
    }
  };

  const handleSearchCar1 = async (trimId) => {
    const data = await fetchCarDetail(trimId);
    if (data) setCar1Result(data);
  };

  const handleSearchCar2 = async (trimId) => {
    const data = await fetchCarDetail(trimId);
    if (data) setCar2Result(data);
  };

  const handleResetAll = () => {
    setCar1Result(null);
    setCar2Result(null);
    setResetAllSignal((prev) => prev + 1);
  };

  // [핵심] 결과 보기 버튼 - 데이터를 쿼리스트링으로 넘김
  const handleViewResult = () => {
    if (!car1Result || !car2Result) {
      alert("비교할 차량을 모두 조회해 주세요.");
      return;
    }

    const params = new URLSearchParams();
    params.set("left", car1Result._id);
    params.set("right", car2Result._id);
    // 선택한 옵션 ID들을 콤마로 이어붙여서 전달
    params.set("lopts", Array.from(leftOpts).join(","));
    params.set("ropts", Array.from(rightOpts).join(","));

    router.push(`/quote/compare/vs?${params.toString()}`);
  };

  return (
    <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 40px 60px",
        }}
      >
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

        {/* 상단 타이틀 카드 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "24px 32px",
            marginBottom: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "6px",
                height: "60px",
                borderRadius: "4px",
                background:
                  "linear-gradient(180deg, #3b82f6, #1d4ed8)",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#1d4ed8",
                  marginBottom: "6px",
                }}
              >
                비교견적 페이지
              </div>
              <div style={{ fontSize: "15px", color: "#555" }}>
                여기에서 두 대의 차량을 동시에 선택해서 옵션과 가격을
                비교할 수 있습니다.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid #ddd",
              backgroundColor: "#f9fafb",
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            전체 초기화
          </button>
        </div>

        {/* 상단 선택 박스 2개 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "24px",
          }}
        >
          <CarSelector
            title="비교 차량 1"
            onSearch={handleSearchCar1}
            onReset={() => setCar1Result(null)}
            resetSignal={resetAllSignal}
          />
          <CarSelector
            title="비교 차량 2"
            onSearch={handleSearchCar2}
            onReset={() => setCar2Result(null)}
            resetSignal={resetAllSignal}
          />
        </div>

        {/* 아래 결과 영역 */}
        {(car1Result || car2Result) && (
          <div style={{ marginTop: "40px" }}>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              비교 견적 결과
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(380px, 1fr))",
                gap: "24px",
              }}
            >
              {car1Result && (
                <CarResultCard 
                  data={car1Result} 
                  selectedOptions={leftOpts} 
                  onToggleOption={toggleLeftOpt} 
                />
              )}
              {car2Result && (
                <CarResultCard 
                  data={car2Result} 
                  selectedOptions={rightOpts} 
                  onToggleOption={toggleRightOpt} 
                />
              )}
            </div>

            {/* 하단 결과 보기 버튼 */}
            {car1Result && car2Result && (
              <div style={{ marginTop: "28px" }}>
                <button
                  type="button"
                  onClick={handleViewResult}
                  style={{
                    width: "100%",
                    padding: "16px 0",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#111",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  결과 보기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const selectStyle = {
  width: "100%",
  borderRadius: "8px",
  border: "1px solid #ddd",
  padding: "6px",
  fontSize: "14px",
};
