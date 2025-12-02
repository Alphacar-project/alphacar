// app/RightSideBar.js
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RightSideBar() {
  const [isSmall, setIsSmall] = useState(false);

  // 화면 크기에 따라 반응형 설정
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsSmall(window.innerWidth < 1024); // 1024px 미만이면 작게
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTopClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComingSoon = (msg) => {
    alert(`${msg} 기능은 준비 중입니다.`);
  };

  // 반응형 사이즈 값
  const sidebarRight = isSmall ? 16 : 32;
  const sidebarBottom = isSmall ? 100 : 140;
  const mainButtonSize = isSmall ? 60 : 76;
  const barWidth = isSmall ? 70 : 88;
  const topButtonSize = isSmall ? 60 : 72;

  return (
    <div
      style={{
        position: "fixed",
        right: `${sidebarRight}px`,
        bottom: `${sidebarBottom}px`,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: isSmall ? 10 : 14,
      }}
    >
      {/* 🔴 상담 신청 버튼 */}
      <button
        onClick={() => handleComingSoon("상담 신청")}
        style={{
          width: `${mainButtonSize}px`,
          height: `${mainButtonSize}px`,
          borderRadius: "50%",
          border: "none",
          background: "#ff4b4b",
          color: "#fff",
          fontSize: isSmall ? "13px" : "15px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          lineHeight: 1.2,
        }}
      >
        상담
        <br />
        신청
      </button>

      {/* 흰색 세로 바 */}
      <div
        style={{
          width: `${barWidth}px`,
          borderRadius: `${barWidth / 2}px`,
          background: "#ffffff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          padding: isSmall ? "14px 0" : "18px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isSmall ? 14 : 18,
        }}
      >
        {/* 최근 본 차량 (그대로 유지 + 2 뱃지) */}
        <button
          onClick={() => handleComingSoon("최근 본 차량")}
          style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: isSmall ? "10px" : "11px",
            color: "#333",
          }}
        >
          <div
            style={{
              width: isSmall ? "28px" : "30px",
              height: isSmall ? "28px" : "30px",
              borderRadius: "50%",
              border: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontSize: isSmall ? "16px" : "18px" }}>🚗</span>
          </div>

          {/* 빨간 뱃지 2 */}
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "10px",
              width: isSmall ? "16px" : "18px",
              height: isSmall ? "16px" : "18px",
              borderRadius: "50%",
              background: "#ff4b4b",
              color: "#fff",
              fontSize: isSmall ? "10px" : "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            2
          </div>

          <span>최근본차량</span>
        </button>

        {/* 관심 차량 – 숫자 X, 동그라미 X, 빨간 하트만 */}
        <button
          onClick={() => handleComingSoon("관심 차량")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: isSmall ? "10px" : "11px",
            color: "#333",
          }}
        >
          <span
            style={{
              fontSize: isSmall ? "20px" : "22px",
              marginBottom: "4px",
              color: "#ff4b4b",
            }}
          >
            ❤️
          </span>
          <span>관심차량</span>
        </button>

        {/* 견적비교 – 계산기 아이콘 + /quote 이동 */}
        <Link
          href="/quote"
          style={{
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: isSmall ? "10px" : "11px",
            color: "#333",
          }}
        >
          <div
            style={{
              width: isSmall ? "28px" : "30px",
              height: isSmall ? "28px" : "30px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "4px",
              fontSize: isSmall ? "18px" : "20px",
            }}
          >
            🧮
          </div>
          <span>견적비교</span>
        </Link>
      </div>

      {/* TOP 버튼 */}
      <button
        onClick={handleTopClick}
        style={{
          width: `${topButtonSize}px`,
          height: `${topButtonSize}px`,
          borderRadius: "50%",
          border: "none",
          background: "#ffffff",
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isSmall ? "10px" : "11px",
          color: "#333",
          marginTop: isSmall ? "6px" : "8px",
        }}
      >
        <span
          style={{
            fontSize: isSmall ? "18px" : "20px",
            marginBottom: "2px",
          }}
        >
          ▲
        </span>
        <span>TOP</span>
      </button>
    </div>
  );
}

