// app/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMainData } from "../lib/api";
import YouTubeSection from "./components/YouTubeSection";

// 유튜브 위젯을 보여줄 최소 화면 폭 (px)
const YOUTUBE_MIN_WIDTH = 1650;

// 배너 데이터
const bannerItems = [
  {
    id: 1,
    img: "/banners/banner1.png",
    link: "/cashback", // 1번 배너: 캐시백 페이지
  },
  {
    id: 2,
    img: "/banners/banner2.png",
    link: "/benefit", // 2번 배너: 내차 구매 혜택 안내 페이지
  },
  {
    id: 3,
    img: "/banners/banner3.png",
    link: "/quote", // 3번 배너: 비교 견적 페이지
  },
];

// 국내 자동차 판매 순위 TOP 5 (샘플 데이터)
const domesticTop5 = [
  {
    rank: 1,
    name: "쏘렌토",
    sales: "10,047",
    share: "8.6%",
    prev: "6,788",
    total: "10,434",
  },
  {
    rank: 2,
    name: "스포티지",
    sales: "6,868",
    share: "5.9%",
    prev: "4,055",
    total: "4,100",
  },
  {
    rank: 3,
    name: "그랜저",
    sales: "6,499",
    share: "5.6%",
    prev: "5,074",
    total: "5,047",
  },
  {
    rank: 4,
    name: "쏘나타 더 엣지",
    sales: "5,897",
    share: "5.1%",
    prev: "4,603",
    total: "6,658",
  },
  {
    rank: 5,
    name: "투싼",
    sales: "5,384",
    share: "4.6%",
    prev: "3,909",
    total: "5,583",
  },
];

// 외제 자동차 판매 순위 TOP 5 (샘플 데이터)
const foreignTop5 = [
  {
    rank: 1,
    name: "Model Y",
    sales: "3,712",
    share: "15.4%",
    prev: "8,361",
    total: "3,712",
  },
  {
    rank: 2,
    name: "E-Class",
    sales: "2,489",
    share: "10.3%",
    prev: "3,273",
    total: "2,543",
  },
  {
    rank: 3,
    name: "5 Series",
    sales: "1,783",
    share: "7.4%",
    prev: "2,196",
    total: "2,073",
  },
  {
    rank: 4,
    name: "GLE-Class",
    sales: "758",
    share: "3.2%",
    prev: "692",
    total: "343",
  },
  {
    rank: 5,
    name: "GLC-Class",
    sales: "752",
    share: "3.1%",
    prev: "900",
    total: "771",
  },
];

// 브랜드 탭
const brands = [
  "전체",
  "현대",
  "기아",
  "제네시스",
  "르노코리아",
  "KGM",
  "쉐보레",
  "벤츠",
  "BMW",
  "아우디",
  "폭스바겐",
  "볼보",
  "렉서스",
  "토요타",
  "테슬라",
  "랜드로버",
  "포르쉐",
  "미니",
  "포드",
  "링컨",
  "지프",
  "푸조",
  "캐딜락",
  "폴스타",
  "마세라티",
  "혼다",
  "BYD",
];

export default function HomePage() {
  const router = useRouter();

  const [bannerIndex, setBannerIndex] = useState(0);
  const safeBannerIndex =
    typeof window === "undefined" ? 0 : bannerIndex;

  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // 화면 폭에 따라 유튜브 보일지 말지 결정
  const [showYoutube, setShowYoutube] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setShowYoutube(window.innerWidth >= YOUTUBE_MIN_WIDTH);
    };

    handleResize(); // 처음 진입 시 한 번 체크
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 배너 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(
      () => setBannerIndex((prev) => (prev + 1) % bannerItems.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  // DB에서 차량 목록 가져오기
  useEffect(() => {
    fetchMainData()
      .then((data) => {
        let cars = [];
        if (data.carList && Array.isArray(data.carList)) cars = data.carList;
        else if (data.cars && Array.isArray(data.cars)) cars = data.cars;
        else if (Array.isArray(data)) cars = data;

        setCarList(cars);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch:", err);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        setErrorMsg(
          `서버와 연결할 수 없습니다. (백엔드 연결 주소: ${baseUrl}/main)`
        );
        setCarList([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = searchText.trim();
    if (!keyword) return;
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const formatPrice = (price) => {
    if (!price) return "가격 정보 없음";
    return (Number(price) / 10000).toLocaleString() + "만원";
  };

  const filteredCars = carList.filter((car) => {
    if (!car) return false;
    const carBrand = car.manufacturer || car.brand || "기타";
    return selectedBrand === "전체" ? true : carBrand === selectedBrand;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCars.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCars = filteredCars.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleBannerClick = () => {
    const current = bannerItems[bannerIndex];
    if (current.link) router.push(current.link);
  };

  return (
    <div className="page-wrapper">
      {/* 오른쪽 상단 고정 유튜브 카드 - 화면이 넓을 때만 보여줌 */}
      {showYoutube && (
        <div
          style={{
            position: "fixed",
            top: "130px", // 필요하면 숫자 조금씩 조절
            right: "2px",
            zIndex: 10,
          }}
        >
          <YouTubeSection />
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: "#fff2f0",
            border: "1px solid #ffccc7",
            padding: "10px",
            textAlign: "center",
            color: "#ff4d4f",
            margin: "10px",
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 배너 */}
      <section className="banner-section">
        <div
          className="banner-slide"
          style={{
            backgroundImage: `url(${bannerItems[safeBannerIndex].img})`,
          }}
          onClick={handleBannerClick}
        />
        <div className="banner-dots">
          {bannerItems.map((item, idx) => (
            <button
              key={item.id}
              className={idx === safeBannerIndex ? "dot active" : "dot"}
              onClick={() => setBannerIndex(idx)}
            />
          ))}
        </div>
      </section>

      {/* 검색창 */}
      <section
        style={{
          margin: "30px auto",
          padding: "0 40px",
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: "999px",
            border: "2px solid #0070f3",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            boxSizing: "border-box",
          }}
        >
          <span style={{ marginRight: "10px", fontSize: "18px" }}>🔍</span>
          <input
            type="text"
            placeholder="찾는 차량을 검색해 주세요 (예: 그랜저)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: "16px",
            }}
          />
          <button
            type="submit"
            style={{
              border: "none",
              background: "#0070f3",
              color: "white",
              borderRadius: "20px",
              padding: "8px 16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            검색
          </button>
        </form>
      </section>

      {/* 판매 순위 TOP 5 (국내 / 외제) */}
      <section
        style={{
          margin: "30px auto 0",
          padding: "0 40px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "18px",
          }}
        >
          ALPHACAR 판매 순위 TOP 5
        </h3>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "24px 28px 28px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {/* 국내 자동차 TOP 5 */}
          <div style={{ flex: 1, minWidth: "320px" }}>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              국내 자동차 판매 순위 TOP 5
            </h4>

            {/* 헤더 라인 */}
            <div
              style={{
                display: "flex",
                fontSize: "12px",
                color: "#999",
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ width: "32px" }}>순위</div>
              <div style={{ flex: 1 }}>차량명</div>
              <div style={{ width: "80px", textAlign: "right" }}>판매량</div>
              <div style={{ width: "60px", textAlign: "right" }}>점유율</div>
              <div style={{ width: "80px", textAlign: "right" }}>전월</div>
              <div style={{ width: "80px", textAlign: "right" }}>누적</div>
            </div>

            {domesticTop5.map((car) => (
              <div
                key={car.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f5f5f5",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#0070f3",
                      color: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {car.rank}
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {/* 썸네일 자리 */}
                  <div
                    style={{
                      width: "56px",
                      height: "32px",
                      borderRadius: "6px",
                      background: "#f3f3f3",
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{car.name}</span>
                  <span style={{ fontSize: "12px", color: "#bbb" }}>📊</span>
                </div>

                <div style={{ width: "80px", textAlign: "right" }}>
                  {car.sales}
                </div>
                <div style={{ width: "60px", textAlign: "right" }}>
                  {car.share}
                </div>
                <div style={{ width: "80px", textAlign: "right" }}>
                  {car.prev}
                </div>
                <div style={{ width: "80px", textAlign: "right" }}>
                  {car.total}
                </div>
              </div>
            ))}
          </div>

          {/* 외제 자동차 TOP 5 */}
          <div style={{ flex: 1, minWidth: "320px" }}>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              외제 자동차 판매 순위 TOP 5
            </h4>

            {/* 헤더 라인 */}
            <div
              style={{
                display: "flex",
                fontSize: "12px",
                color: "#999",
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div style={{ width: "32px" }}>순위</div>
              <div style={{ flex: 1 }}>차량명</div>
              <div style={{ width: "80px", textAlign: "right" }}>판매량</div>
              <div style={{ width: "60px", textAlign: "right" }}>점유율</div>
              <div style={{ width: "80px", textAlign: "right" }}>전월</div>
              <div style={{ width: "80px", textAlign: "right" }}>누적</div>
            </div>

            {foreignTop5.map((car) => (
              <div
                key={car.rank}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f5f5f5",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#ff4d4f",
                      color: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {car.rank}
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {/* 썸네일 자리 */}
                  <div
                    style={{
                      width: "56px",
                      height: "32px",
                      borderRadius: "6px",
                      background: "#f3f3f3",
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{car.name}</span>
                  <span style={{ fontSize: "12px", color: "#bbb" }}>📊</span>
                </div>

                <div style={{ width: "80px", textAlign: "right" }}>
                  {car.sales}
                </div>
                <div style={{ width: "60px", textAlign: "right" }}>
                  {car.share}
                </div>
                <div style={{ width: "80px", textAlign: "right" }}>
                  {car.prev}
                </div>
                <div style={{ width: "80px", textAlign: "right" }}>
                  {car.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 브랜드 탭 + 차량 리스트 */}
      <section className="brand-section">
        <div className="brand-tabs">
          {brands.map((brand) => (
            <button
              key={brand}
              className={
                brand === selectedBrand
                  ? "brand-btn brand-btn-active"
                  : "brand-btn"
              }
              onClick={() => setSelectedBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>

        <div className="car-list">
          {loading && !errorMsg && (
            <p style={{ textAlign: "center", width: "100%" }}>
              데이터 로딩 중...
            </p>
          )}

          {!loading && filteredCars.length === 0 && (
            <p className="empty-text">
              {errorMsg
                ? "데이터를 불러올 수 없습니다."
                : "해당 브랜드의 차량이 없습니다."}
            </p>
          )}

          {paginatedCars.map((car, idx) => (
            <div
              key={car._id || car.name || idx}
              className="car-card"
            >
              <div
                className="car-image-placeholder"
                style={{ overflow: "hidden", background: "#fff" }}
              >
                {car.imageUrl ? (
                  <img
                    src={car.imageUrl}
                    alt={car.name || "차량"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ color: "#ccc" }}>이미지 없음</span>
                )}
              </div>

              <div
                className="car-info"
                style={{ alignItems: "center", textAlign: "center" }}
              >
                <p className="car-name">
                  [{car.manufacturer || "미분류"}]{" "}
                  {car.name || "이름 없음"}
                </p>
                <p className="car-price">
                  {formatPrice(car.minPrice)} ~
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredCars.length > 0 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "page-btn page-btn-active"
                      : "page-btn"
                  }
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

