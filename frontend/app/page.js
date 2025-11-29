"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function HomePage() {
  const [homeData, setHomeData] = useState(null);
  const [homeError, setHomeError] = useState("");
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  // 백엔드 /home에서 메인 데이터 가져오기
  useEffect(() => {
    async function fetchHome() {
      if (!API_BASE) {
        setHomeError("서버에서 홈 데이터를 불러오지 못했습니다.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/main`);
        if (!res.ok) {
          throw new Error("백엔드 응답 에러");
        }
        const json = await res.json();
        setHomeData(json);
      } catch (err) {
        console.error(err);
        setHomeError("서버에서 홈 데이터를 불러오지 못했습니다.");
      }
    }

    fetchHome();
  }, []);

  // 🔍 검색 실행
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchText.trim();
    if (!keyword) return;
    router.push(`/main/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div
      style={{
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "32px 24px 40px",
      }}
    >
      {/* 백엔드 메시지 / 에러 영역 */}
      <div
        style={{
          marginBottom: "16px",
          fontSize: "13px",
          color: homeError ? "#ff4d4f" : "#555",
        }}
      >
        {homeError
          ? homeError
          : homeData
          ? `서버에서 홈 데이터: ${homeData.message} (${homeData.type})`
          : "홈 데이터 불러오는 중..."}
      </div>

      {/* 메인 배너 */}
      <div
        style={{
          backgroundColor: "#ff4d4f",
          color: "white",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              opacity: 0.9,
              marginBottom: "4px",
            }}
          >
            11월의 핫딜 / 즉시 출고
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            인기 차량 한 눈에 보기
          </div>
          <div
            style={{
              fontSize: "12px",
              opacity: 0.9,
            }}
          >
            재고 한정, 선착순 안내
          </div>
        </div>
        <div style={{ fontSize: "34px" }}>🚗</div>
      </div>

      {/* 검색창 */}
      <form onSubmit={handleSearchSubmit}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "999px",
            border: "1px solid #e5e5e5",
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
          }}
        >
          <span style={{ marginRight: "8px", fontSize: "16px" }}>🔍</span>
          <input
            type="text"
            placeholder="찾는 차량을 검색해 주세요"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            style={{
              border: "none",
              background: "none",
              fontSize: "13px",
              color: "#1890ff",
              cursor: "pointer",
              paddingLeft: "8px",
            }}
          >
            검색
          </button>
        </div>
      </form>
    </div>
  );
}

