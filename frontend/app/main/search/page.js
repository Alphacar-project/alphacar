"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchSearch } from "../../../lib/api";

export default function SearchPage() {
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 실제 검색을 수행하는 함수
  const doSearch = async (kw) => {
    const trimmed = kw.trim();
    if (!trimmed) {
      alert("검색어를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetchSearch(trimmed);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 페이지 처음 들어올 때, URL의 keyword로 자동 검색
  useEffect(() => {
    const initialKeyword = searchParams.get("keyword") || "";
    setKeyword(initialKeyword);

    if (initialKeyword) {
      doSearch(initialKeyword);
    }
    // searchParams가 바뀔 때마다 다시 실행
  }, [searchParams]);

  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "32px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h1
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        차량 검색
      </h1>

      {/* 검색창 */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="차량명을 입력하세요 (예: 아반떼)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />
        <button
          onClick={() => doSearch(keyword)}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            backgroundColor: "#111827",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          검색
        </button>
      </div>

      {/* 로딩 표시 */}
      {loading && <p>검색 중...</p>}

      {/* 검색 결과 */}
      {result && (
        <section style={{ marginTop: "12px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
            }}
          >
            검색 결과 ({result.result.cars.length}개)
          </h2>

          {result.result.cars.length === 0 && (
            <p style={{ fontSize: "14px", color: "#666" }}>
              검색 결과가 없습니다.
            </p>
          )}

          {result.result.cars.map((car) => (
            <div
              key={car.id}
              style={{
                padding: "16px",
                marginBottom: "12px",
                border: "1px solid #eee",
                borderRadius: "10px",
                backgroundColor: "#fafafa",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginBottom: "4px",
                }}
              >
                {car.name}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                가격대: {car.priceRange}
              </div>

              {car.image && (
                <img
                  src={car.image}
                  alt={car.name}
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                />
              )}

              <div style={{ fontSize: "14px" }}>
                <b>트림 선택</b>
                <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                  {car.trims.map((trim) => (
                    <li key={trim.id}>
                      {trim.name} — {trim.price.toLocaleString()}원
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

