// app/quote/personal/result/page.js
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://192.168.0.160:3003/quote";

export default function QuoteResultPage() {
  const searchParams = useSearchParams();
  const trimId = searchParams.get("trimId");
  const router = useRouter();

  const [carDetail, setCarDetail] = useState(null);
  const [options, setOptions] = useState([]); // 옵션 리스트
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trimId) return;

    fetch(`${API_BASE}/detail?trimId=${trimId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("받은 데이터:", data);
        setCarDetail(data);

        // --- 옵션 리스트 초기화 ---
        // 백엔드에서 내려오는 옵션 배열 이름에 맞춰서 사용하면 됨
        // 여기서는 data.options 또는 data.selected_options 중 있는 걸 사용
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

  // ✅ [기능 추가] 비교 견적 페이지 이동 핸들러
  // UI에는 영향을 주지 않고 로직만 수행합니다.
  const handleCompareClick = () => {
    // --- 디버깅용 로그 추가 ---
    console.log("현재 trimId:", trimId);
    console.log("전체 옵션 목록:", options);
    // 1. 현재 선택된 옵션 ID 추출
    const selectedOptionIds = options
      .filter((o) => o.isSelected)
      .map((o) => o.id);

    // 2. 쿼리 파라미터 생성 (car1_trimId, car1_options)
    const queryString = new URLSearchParams({
      car1_trimId: trimId,
      car1_options: selectedOptionIds.join(","),
    }).toString();

    console.log("생성된 쿼리 스트링:", queryString); // 이 로그가 빈칸으로 나오는지 확인

    // 3. 페이지 이동
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

        {/* 차량 이름 */}
        <h1
          style={{
            fontSize: "32px",
            textAlign: "center",
            marginBottom: "4px",
            fontWeight: "700",
          }}
        >
          {carDetail.name}
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: "15px",
            color: "#777",
            marginBottom: "28px",
          }}
        >
          {carDetail.trim_name || carDetail.description || ""}
        </p>

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
                    {/* 체크박스 스타일 */}
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

              {/* 옵션가 합계 */}
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
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#444" }}>
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
            onClick={handleCompareClick} // ✅ 여기에만 기능 연결 (UI 변경 없음)
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
  );
}
