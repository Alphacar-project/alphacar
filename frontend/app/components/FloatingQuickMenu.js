// app/components/FloatingQuickMenu.js
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FloatingQuickMenu() {
  const router = useRouter();
  const [hoverId, setHoverId] = useState(null);

  const showLabel = (id) => hoverId === id;

  return (
    <div
      style={{
        position: "fixed",
        top: "550px",
        right: "30px",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif",
      }}
    >
      {/* 세로 흰색 바 */}
      <div
        style={{
          width: "64px",
          padding: "16px 0",
          borderRadius: "32px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* TOP */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: "12px",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHoverId("top")}
          onMouseLeave={() => setHoverId(null)}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          {/* 위로 화살표 아이콘 */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            style={{ marginBottom: "2px" }}
          >
            <path
              d="M12 5l-5 5h10l-5-5z"
              fill="none"
              stroke="#222"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: "11px",
              color: "#222",
              fontWeight: 500,
              letterSpacing: "0.5px",
            }}
          >
            TOP
          </span>

          {/* hover 시 '위로' */}
          {showLabel("top") && <Tooltip text="위로" />}
        </div>

        {/* 구분선 */}
        <Divider />

        {/* 최근본차량 - 시계 아이콘 */}
        <div
          style={{
            width: "100%",
            padding: "10px 0",
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHoverId("recent")}
          onMouseLeave={() => setHoverId(null)}
          onClick={() => router.push("/recent")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="7.5"
              fill="none"
              stroke="#444"
              strokeWidth="1.5"
            />
            <path
              d="M12 8v4l2.5 1.5"
              fill="none"
              stroke="#444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 5.5L6.5 7"
              fill="none"
              stroke="#444"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>

          {showLabel("recent") && <Tooltip text="최근본차량" />}
        </div>

        <Divider />

        {/* 찜한 차량 - 하트 테두리 */}
        <div
          style={{
            width: "100%",
            padding: "10px 0",
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHoverId("favorite")}
          onMouseLeave={() => setHoverId(null)}
          onClick={() => router.push("/favorite")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M12.1 19.1l-0.1 0.1-0.1-0.1C7.14 15.24 4 12.39 4 9.25 4 7.21 5.5 5.7 7.5 5.7c1.23 0 2.41.59 3.1 1.52A3.9 3.9 0 0 1 13.7 5.7C15.7 5.7 17.2 7.21 17.2 9.25c0 3.14-3.14 5.99-5.1 9.85z"
              fill="none"
              stroke="#444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {showLabel("favorite") && <Tooltip text="찜한 차량" />}
        </div>

        <Divider />

        {/* 차량비교 - 폴더 + VS */}
        <div
          style={{
            width: "100%",
            padding: "10px 0 4px",
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHoverId("compare")}
          onMouseLeave={() => setHoverId(null)}
          onClick={() => router.push("/quote/compare")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <rect
              x="5"
              y="7"
              width="14"
              height="11"
              rx="2"
              ry="2"
              fill="none"
              stroke="#444"
              strokeWidth="1.5"
            />
            <path
              d="M9 7l1-2h4l1 2"
              fill="none"
              stroke="#444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="12"
              y="15"
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill="#444"
            >
              VS
            </text>
          </svg>

          {showLabel("compare") && <Tooltip text="차량비교" />}
        </div>
      </div>

      {/* 흰색 동그라미 (…) */}
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHoverId("more")}
        onMouseLeave={() => setHoverId(null)}
      >
        •••
        {showLabel("more") && <Tooltip text="더보기" />}
      </div>
    </div>
  );
}

/** 구분선 */
function Divider() {
  return (
    <div
      style={{
        width: "28px",
        height: "1px",
        backgroundColor: "#eeeeee",
        margin: "2px 0",
      }}
    />
  );
}

/** hover 라벨 컴포넌트 */
function Tooltip({ text }) {
  return (
    <div
      style={{
        position: "absolute",
        right: "72px",
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "#333",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
      }}
    >
      {text}
    </div>
  );
}

