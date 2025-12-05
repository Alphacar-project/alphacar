// app/quote/personal/result/page.js
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_BASE = "/api";

export default function QuoteResultPage() {
  const searchParams = useSearchParams();
  const trimId = searchParams.get("trimId");
  const router = useRouter();

  const [carDetail, setCarDetail] = useState(null);
  const [options, setOptions] = useState([]); // 옵션 리스트
  const [loading, setLoading] = useState(true);

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  // 데이터 불러오기
  useEffect(() => {
    if (!trimId) return;

    fetch(`${API_BASE}/detail?trimId=${trimId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("받은 데이터:", data);
        setCarDetail(data);

        // --- 옵션 리스트 초기화 ---
        const rawOptions = data.options || data.selected_options || [];

        const mapped = rawOptions.map((opt, idx) => ({
          id: opt._id || idx,
          name: opt.name || opt.option_name || "옵션",
          price:
            typeof opt.price === "number"
              ? opt.price
              : typeof opt.additional_price === "number"
              ? opt.additional_price
              : 0,
          isSelected:
            typeof opt.is_selected === "boolean" ? opt.is_selected : false,
        }));

        setOptions(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [trimId]);

  // 옵션 선택 토글
  const toggleOption = (id) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, isSelected: !opt.isSelected } : opt
      )
    );
  };

  // 금액 계산
  const { basePrice, optionsTotal, finalPrice } = useMemo(() => {
    const base = Number(carDetail?.base_price || 0);
    const optTotal = options
      .filter((o) => o.isSelected)
      .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    return {
      basePrice: base,
      optionsTotal: optTotal,
      finalPrice: base + optTotal,
    };
  }, [carDetail, options]);

  // 견적 저장 핸들러
  const handleSaveQuote = async () => {
    if (!carDetail || isSaving) return;

    // 1. 로컬 스토리지에서 user_social_id 가져오기
    const userSocialId = localStorage.getItem("user_social_id");

    if (!userSocialId) {
      alert("로그인이 필요한 서비스입니다.");
      return;
    }

    // 2. 저장할 데이터 구성
    const payload = {
      userId: userSocialId,
      type: "single",
      totalPrice: finalPrice,
      cars: [
        {
          manufacturer: carDetail.manufacturer || "제조사",
          model: carDetail.model_name || carDetail.name, // 모델명 (없으면 트림명 대체)
          trim: carDetail.name, // 트림명
          price: finalPrice,
          image: carDetail.image_url,
          options: options.filter((o) => o.isSelected).map((o) => o.name),
        },
      ],
    };

    try {
      setIsSaving(true);

      const res = await fetch(`${API_BASE}/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.setItem("quote_saved", "1");
        router.push("/mypage/quotes");
      } else {
        alert("저장 실패");
      }
    } catch (e) {
      console.error(e);
      alert("에러 발생");
    } finally {
      setIsSaving(false);
    }
  };

  // 비교 견적 핸들러
  const handleCompareClick = () => {
    const selectedOptionIds = options
      .filter((o) => o.isSelected)
      .map((o) => o.id);

    const queryString = new URLSearchParams({
      car1_trimId: trimId,
      car1_options: selectedOptionIds.join(","),
    }).toString();

    router.push(`/quote/compare?${queryString}`);
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>
    );
  if (!carDetail)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        차량 정보를 찾을 수 없습니다.
      </div>
    );

  return (
    <>
      {/* 저장 중일 때 전체 화면 오버레이 + 스피너 */}
      {isSaving && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px 28px",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              minWidth: "180px",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 50 50"
              aria-hidden="true"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="#0066ff"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="31.4 188.4"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <span style={{ fontSize: "14px", color: "#333" }}>
              견적을 저장하는 중입니다...
            </span>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: "1100px",
          margin: "40px auto 60px",
          padding: "0 20px",
        }}
      >
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: "16px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "14px",
            color: "#666",
          }}
        >
          ← 뒤로 가기
        </button>

        {/* 메인 카드 */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "40px 48px 36px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          {/* 차량 이미지 */}
          {carDetail.image_url && (
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <img
                src={carDetail.image_url}
                alt={carDetail.name}
                style={{
                  maxWidth: "280px",
                  maxHeight: "220px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          {/* ✅ [수정된 부분] 차량 이름 표시 영역 */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            {/* 모델명: 크고 진하게 */}
            <h1
              style={{
                fontSize: "32px",
                marginBottom: "8px",
                fontWeight: "800",
                color: "#000",
              }}
            >
              {carDetail.model_name || "모델명 없음"}
            </h1>
            {/* 트림명 | 제조사: 작고 연하게 */}
            <p
              style={{
                fontSize: "16px",
                color: "#666",
                fontWeight: "500",
              }}
            >
              {carDetail.name} {/* 트림명 */}
              <span style={{ margin: "0 8px", color: "#ddd" }}>|</span>
              {carDetail.manufacturer || "제조사 없음"}
            </p>
          </div>

          {/* 기본 가격 영역 */}
          <div
            style={{
              background: "#f9f9f9",
              padding: "18px 24px",
              borderRadius: "16px",
              marginBottom: "28px",
            }}
          >
            <span style={{ fontSize: "16px", color: "#555" }}>기본 가격: </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#0066ff",
              }}
            >
              {basePrice > 0 ? `${basePrice.toLocaleString()}원` : "가격 미정"}
            </span>
          </div>

          {/* 옵션 영역 */}
          <div style={{ marginBottom: "28px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              옵션
            </h2>

            {options.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#777" }}>
                선택된 옵션이 없습니다.
              </p>
            ) : (
              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: "14px",
                  padding: "12px 0",
                }}
              >
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 18px",
                      cursor: "pointer",
                      background: opt.isSelected ? "#fff" : "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          border: opt.isSelected
                            ? "0px solid transparent"
                            : "1px solid #ccc",
                          background: opt.isSelected ? "#ff4b4b" : "#fff",
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "14px",
                          boxShadow: opt.isSelected
                            ? "0 0 0 1px rgba(255,75,75,0.3)"
                            : "none",
                        }}
                      >
                        {opt.isSelected ? "✓" : ""}
                      </span>
                      <span style={{ fontSize: "14px", color: "#333" }}>
                        {opt.name}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#333",
                        fontWeight: 500,
                      }}
                    >
                      {opt.price > 0
                        ? `${opt.price.toLocaleString()}원`
                        : "포함"}
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    marginTop: "4px",
                    padding: "10px 18px 4px",
                    textAlign: "right",
                    fontSize: "13px",
                    color: "#777",
                  }}
                >
                  옵션가 합계:{" "}
                  <span style={{ fontWeight: 600, color: "#333" }}>
                    {optionsTotal.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 최종 차량가 영역 */}
          <div
            style={{
              background: "#fff5f2",
              padding: "18px 24px",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            <span
              style={{ fontSize: "15px", fontWeight: "600", color: "#444" }}
            >
              최종 차량가
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#ff4b4b",
              }}
            >
              {finalPrice.toLocaleString()}원
            </span>
          </div>

          {/* 버튼 영역 */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={handleSaveQuote}
              style={{
                flex: 1,
                maxWidth: "220px",
                height: "52px",
                borderRadius: "10px",
                border: "none",
                background: "#222",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              견적 저장
            </button>
            <button
              type="button"
              onClick={handleCompareClick}
              style={{
                flex: 1,
                maxWidth: "220px",
                height: "52px",
                borderRadius: "10px",
                border: "none",
                background: "#0066ff",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              비교 견적
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
