// frontend/app/quote/personal/result/page.js
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 백엔드 포트 확인 (3003 또는 4000)
const API_BASE = "http://192.168.0.160:3003/quote";

export default function QuoteResultPage() {
  const searchParams = useSearchParams();
  const trimId = searchParams.get("trimId");
  const router = useRouter();

  const [carDetail, setCarDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trimId) return;

    fetch(`${API_BASE}/detail?trimId=${trimId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("받은 데이터:", data);
        setCarDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [trimId]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>;
  if (!carDetail) return <div style={{ padding: "40px", textAlign: "center" }}>차량 정보를 찾을 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
      <button 
        onClick={() => router.back()} 
        style={{ marginBottom: "20px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#666" }}
      >
        ← 뒤로 가기
      </button>

      <section style={{ background: "#fff", borderRadius: "20px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        {/* 차량 이미지 (있을 경우에만 표시) */}
        {carDetail.image_url && (
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <img 
              src={carDetail.image_url} 
              alt={carDetail.name} 
              style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "10px" }}
            />
          </div>
        )}

        <h1 style={{ fontSize: "28px", marginBottom: "10px", fontWeight: "bold" }}>
          {carDetail.name}
        </h1>
        
        {/* 설명 표시 */}
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "30px", lineHeight: "1.6" }}>
           {carDetail.description || "상세 설명이 없습니다."}
        </p>

        {/* 가격 정보 */}
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px" }}>
            <div style={{ fontSize: "18px", color: "#333" }}>
                <strong>기본 가격: </strong> 
                <span style={{ color: "#0070f3", fontWeight: "bold" }}>
                  {carDetail.base_price ? `${carDetail.base_price.toLocaleString()}원` : "가격 미정"}
                </span>
            </div>
        </div>
      </section>
    </div>
  );
}
