"use client";

import { useEffect, useState } from "react";

// 견적 서비스 백엔드 주소 (3003 포트)
const API_BASE = process.env.NEXT_PUBLIC_QUOTE_API_URL;

export default function QuotePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // 페이지 처음 들어올 때 백엔드 /quote 호출
  useEffect(() => {
    async function fetchQuote() {
      try {
        if (!API_BASE) {
          throw new Error("NEXT_PUBLIC_QUOTE_API_URL 환경변수가 없습니다.");
        }

        const res = await fetch(`${API_BASE}/quote`);
        if (!res.ok) {
          throw new Error("백엔드 응답 에러");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("견적 데이터를 불러오지 못했습니다.");
      }
    }

    fetchQuote();
  }, []);

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
        견적 비교 페이지
      </h2>

      {/* 상태 표시 */}
      {error && (
        <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>
      )}

      {!error && !data && (
        <p style={{ fontSize: "14px", color: "#666" }}>불러오는 중...</p>
      )}

      {/* 백엔드에서 온 데이터 표시 */}
      {data && (
        <div>
          {/* message */}
          <p style={{ marginBottom: "12px", fontSize: "14px", color: "#555" }}>
            {data.message}
          </p>

          {/* 차량 모델 목록 */}
          <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>차량 모델</h3>
          <ul style={{ paddingLeft: "18px", fontSize: "14px", marginBottom: "16px" }}>
            {data.models?.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>

          {/* 트림 목록 */}
          <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>트림</h3>
          <ul style={{ paddingLeft: "18px", fontSize: "14px" }}>
            {data.trims?.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          {/* 디버깅용 전체 JSON 보기 */}
          <pre
            style={{
              marginTop: "16px",
              fontSize: "12px",
              backgroundColor: "#f7f7f7",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

