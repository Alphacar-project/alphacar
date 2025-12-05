"use client";

import React from "react";

const formatPrice = (price) => {
  if (!price) return "가격 문의";
  const numPrice = Number(price);
  if (isNaN(numPrice)) return price; 
  return (numPrice / 10000).toLocaleString() + "만원";
};

export default function CarDetailModal({ car, onClose }) {
  if (!car) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff", width: "90%", maxWidth: "500px", // 폭을 살짝 줄여서 모바일 친화적으로
          borderRadius: "16px", padding: "40px 30px", position: "relative",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "15px", right: "15px",
            background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#888"
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: "center" }}>
          {/* 1. 제조사 및 차량명 */}
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "5px", color: "#333" }}>
            {car.name}
          </h2>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            {car.manufacturer}
          </p>
          
          {/* 2. 차량 이미지 */}
          <div style={{ margin: "20px 0", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {car.imageUrl ? (
              <img 
                src={car.imageUrl} 
                alt={car.name} 
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#f5f5f5", borderRadius: "10px", display:"flex", alignItems:"center", justifyContent:"center", color: "#aaa"}}>
                이미지 준비중
              </div>
            )}
          </div>

          {/* 3. 가격 정보 */}
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "5px" }}>예상 구매 가격</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#0070f3" }}>
              {formatPrice(car.minPrice || car.base_price || car.price)} ~
            </p>
          </div>

          {/* 4. 견적 버튼 (장식용) */}
          <button
            style={{
              marginTop: "25px", width: "100%", padding: "15px 0",
              backgroundColor: "#0070f3", color: "white", border: "none",
              borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer",
            }}
            onClick={() => alert("견적 페이지로 이동합니다.")}
          >
            상세 견적 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
