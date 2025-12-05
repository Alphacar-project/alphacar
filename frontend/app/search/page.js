"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    if (!price) return "가격 미정";
    return (Number(price) / 10000).toLocaleString() + "만원";
  };

  useEffect(() => {
    if (!keyword) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // [수정] 백엔드 포트 및 엔드포인트 수정 (3007 포트, /search 경로)
    // 환경변수가 있으면 사용하고, 없으면 하드코딩된 주소 사용
    const baseUrl = "/api";

    fetch(
      `${baseUrl}/search?keyword=${encodeURIComponent(keyword)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("검색 요청 실패");
        return res.json();
      })
      .then((data) => {
        console.log("DB 데이터 확인:", data);

        // [핵심 수정] 백엔드의 간소화된 데이터를 UI가 기대하는 기존 DB 구조로 변환 (Adapter)
        // 백엔드 응답: { id, name, image, priceRange }
        // UI 기대값: { _id, vehicle_name, manufacturer, photos..., specifications... }
        if (data.result && Array.isArray(data.result.cars)) {
          const adaptedCars = data.result.cars.map((item) => {
            // 가격 문자열("3,712만원")을 숫자(37120000)로 변환하여 formatPrice 함수가 작동하도록 함
            let priceNum = 0;
            if (item.priceRange) {
              const numStr = item.priceRange.replace(/[^0-9]/g, ""); // 숫자만 추출
              priceNum = numStr ? parseInt(numStr, 10) * 10000 : 0;
            }

            return {
              _id: item.id,
              vehicle_name: item.name, // 예: "[현대] 그랜저"
              manufacturer: "검색결과", // 제조사 정보가 이름에 포함되어 있으므로 임시 처리
              model_year: "-", // 연식 정보 없음
              fuel_type: "정보없음", // 연료 정보 없음
              photos: {
                representative_image: {
                  url: item.image, // 이미지 연결
                },
              },
              summary: {
                category: "검색",
                price_range: {
                  min: priceNum, // 변환된 가격 숫자
                },
              },
              // 상세 제원 정보가 없으므로 빈 객체로 처리하여 에러 방지 ("-"로 표시됨)
              specifications: {
                fuel_efficiency: { combined: "-" },
                engine: { type: "-", displacement: "-", max_power: "-" },
              },
            };
          });
          setCars(adaptedCars);
        } else {
          setCars([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("에러:", err);
        setCars([]);
        setLoading(false);
      });
  }, [keyword]);

  return (
    <div className="page-wrapper">
      {/* 🔵 기존 검색 결과 영역 (DB 연동 그대로 유지) */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 20px",
          minHeight: "80vh",
        }}
      >
        {/* 상단 타이틀 */}
        <div
          style={{
            marginBottom: "40px",
            borderBottom: "2px solid #222",
            paddingBottom: "20px",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
            '
            <span style={{ color: "#0070f3" }}>
              {keyword || "검색어 없음"}
            </span>
            ' 검색 결과
          </h1>
          <p style={{ marginTop: "10px", color: "#666" }}>
            DB에서 총{" "}
            <span style={{ fontWeight: "bold", color: "#333" }}>
              {cars.length}
            </span>
            대의 차량을 찾았습니다.
          </p>
        </div>

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              fontSize: "18px",
            }}
          >
            데이터를 불러오는 중입니다...
          </div>
        )}

        {!loading && cars.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "100px 0",
              color: "#888",
            }}
          >
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>
              검색 결과가 없습니다.
            </p>
            <p style={{ marginTop: "10px" }}>
              정확한 차량 이름으로 다시 검색해보세요.
            </p>
          </div>
        )}

        {/* 차량 리스트 (상세 제원 포함) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          {cars.map((car) => (
            <div
              key={car._id}
              style={{
                display: "flex",
                flexDirection: "row",
                border: "1px solid #e0e0e0",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                backgroundColor: "#fff",
                minHeight: "220px",
              }}
            >
              {/* 1. 차량 이미지 영역 (왼쪽) */}
              <div
                style={{
                  width: "35%",
                  background: "#f8f9fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                {car.photos?.representative_image?.url ? (
                  <img
                    src={car.photos.representative_image.url}
                    alt={car.vehicle_name}
                    style={{
                      width: "100%",
                      maxHeight: "180px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div style={{ color: "#aaa" }}>이미지 없음</div>
                )}
              </div>

              {/* 2. 상세 정보 영역 (오른쪽) */}
              <div
                style={{
                  width: "65%",
                  padding: "25px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* 브랜드 & 차급 배지 */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#fff",
                        background: "#333",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {car.manufacturer}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#555",
                        background: "#eee",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {car.summary?.category}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#0070f3",
                        background: "#e6f7ff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {car.fuel_type || "연료 정보 없음"}
                    </span>
                  </div>

                  {/* 차량 이름 & 가격 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        margin: "0",
                        color: "#222",
                      }}
                    >
                      {car.vehicle_name}{" "}
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "normal",
                          color: "#888",
                        }}
                      >
                        ({car.model_year}년형)
                      </span>
                    </h2>
                    <p
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: "#0070f3",
                        margin: "0",
                      }}
                    >
                      {formatPrice(car.summary?.price_range?.min)} ~
                    </p>
                  </div>

                  {/* 상세 제원 그리드 */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "20px",
                      backgroundColor: "#f9f9f9",
                      padding: "15px",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ fontSize: "14px", color: "#555" }}>
                      <span
                        style={{
                          color: "#888",
                          marginRight: "8px",
                        }}
                      >
                        복합연비
                      </span>
                      {car.specifications?.fuel_efficiency?.combined || "-"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#555" }}>
                      <span
                        style={{
                          color: "#888",
                          marginRight: "8px",
                        }}
                      >
                        엔진형식
                      </span>
                      {car.specifications?.engine?.type || "-"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#555" }}>
                      <span
                        style={{
                          color: "#888",
                          marginRight: "8px",
                        }}
                      >
                        배기량
                      </span>
                      {car.specifications?.engine?.displacement || "-"}
                    </div>
                    <div style={{ fontSize: "14px", color: "#555" }}>
                      <span
                        style={{
                          color: "#888",
                          marginRight: "8px",
                        }}
                      >
                        최고출력
                      </span>
                      {car.specifications?.engine?.max_power || "-"}
                    </div>
                  </div>
                </div>

                {/* 하단 버튼 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "15px",
                  }}
                >
                  <button
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#222",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    상세 견적 보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 메인으로 돌아가기 */}
        <div style={{ marginTop: "50px", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              padding: "12px 30px",
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "30px",
              textDecoration: "none",
              color: "#333",
            }}
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
