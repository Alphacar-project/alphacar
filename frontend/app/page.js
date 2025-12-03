// kevin@devserver:~/alphacar/frontend/app/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchMainData } from "../lib/api";
import YouTubeSection from "./components/YouTubeSection";

// 유튜브 위젯을 보여줄 최소 화면 폭 (px)
const YOUTUBE_MIN_WIDTH = 1650;

    // 배너 데이터
// 배너 데이터
const bannerItems = [
  {
    id: 1,
    img: "/banners/banner1.png",
    link: "/cashback",   // ✅ 1번 배너: 기존 캐시백 표 페이지
  },
  {
    id: 2,
    img: "/banners/banner2.png",
    link: "/benefit",    // ✅ 2번 배너: 새로 만들 혜택 안내 페이지
  },
  {
    id: 3,
    img: "/banners/banner3.png",
    link: "/quote",      // ✅ 3번 배너: 기존 비교견적 페이지
  },
];

// TOP 10 이미지 (샘플)
const topCarImages = [
  {
    id: 1,
    name: "더 뉴 아이오닉 6 - E-LITE(롱레인지) 18인치",
    priceText: "50,640,843 원",
    img: "/topcars/new_ioniq6.png",
  },
  {
    id: 2,
    name: "넥쏘 수소 전기차",
    priceText: "70,000,000 원",
    img: "/topcars/new_nexo.png",
  },
  {
    id: 3,
    name: "아이오닉 6 (기본형)",
    priceText: "53,340,000 원",
    img: "/topcars/ioniq6.png",
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
  const [topCarIndex, setTopCarIndex] = useState(0);

  const safeBannerIndex =
    typeof window === "undefined" ? 0 : bannerIndex;
  const safeTopCarIndex =
    typeof window === "undefined" ? 0 : topCarIndex;

  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [selectedBrand, setSelectedBrand] = useState("전체");
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // ✅ 화면 폭에 따라 유튜브 보일지 말지 결정
  const [showYoutube, setShowYoutube] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      // 화면 폭이 충분히 넓을 때만 유튜브 보여줌
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

  // TOP10 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(
      () => setTopCarIndex((prev) => (prev + 1) % topCarImages.length),
      3000
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
      {/* 🟡 오른쪽 상단 고정 유튜브 카드 - 화면이 넓을 때만 보여줌 */}
      {showYoutube && (
        <div
          style={{
            position: "fixed",
            top: "170px", // 배너 안 가리게 살짝 아래
            right: "20px",
            zIndex: 1000,
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

      {/* TOP 10 */}
      <section className="topcar-section">
        <h3>ALPHACAR 추천 TOP 10</h3>

        {topCarImages.length > 0 && (
          <div
            className="topcar-slider"
            style={{
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "30px 40px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              minHeight: "260px",
            }}
          >
            <div
              className="topcar-image-wrap"
              style={{
                flex: 1.4,
                background: "#f2f2f2",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                height: "260px",
              }}
            >
              <img
                src={topCarImages[safeTopCarIndex].img}
                alt={topCarImages[safeTopCarIndex].name}
                className="topcar-image"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              className="topcar-info"
              style={{
                flex: 1,
                paddingLeft: "40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                className="topcar-name"
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                {topCarImages[safeTopCarIndex].name}
              </p>
              <p
                className="topcar-sub"
                style={{
                  fontSize: "14px",
                  color: "#888",
                  marginBottom: "16px",
                }}
              >
                ALPHACAR 데이터 기반 인기 차량
              </p>
              <p
                className="topcar-price-title"
                style={{
                  fontSize: "14px",
                  color: "#999",
                  marginBottom: "4px",
                }}
              >
                세제 혜택 적용 후 차량 가격
              </p>
              <p
                className="topcar-price"
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {topCarImages[safeTopCarIndex].priceText}
              </p>
            </div>
          </div>
        )}
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
              <div className="car-info">
                <p className="car-name">
                  [{car.manufacturer || "미분류"}]{" "}
                  {car.name || "이름 없음"}
                </p>
                <p className="car-price">
                  {formatPrice(car.minPrice)} ~
                </p>
                <button className="car-detail-btn">상세보기</button>
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

