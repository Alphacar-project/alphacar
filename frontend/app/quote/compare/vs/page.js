// frontend/app/quote/compare/vs/page.js
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = "http://192.168.0.160:3003/quote";

// ---------------- 옵션 리스트 렌더링 컴포넌트 ----------------
function OptionsList({ car, optSet }) {
    const selectedOptions = (car.options || []).filter(opt => {
        const id = opt._id || String(car.options.indexOf(opt));
        return optSet.has(String(id));
    });

    if (selectedOptions.length === 0) {
        return <div style={{ color: "#999", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>선택된 옵션 없음</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedOptions.map(opt => (
                <div 
                    key={opt._id || opt.name} 
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}
                >
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#10b981' }}>{opt.name}</span>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#10b981' }}>+{opt.price.toLocaleString()}원</span>
                </div>
            ))}
            <div style={{ borderTop: "1px dashed #eee", margin: "5px 0" }} />
             <span style={{ fontSize: '13px', color: '#777', textAlign: 'right' }}>총 {selectedOptions.length}개 선택</span>
        </div>
    );
}

// ---------------- 가격표 Row 컴포넌트 ----------------
function PriceCompareRow({ label, leftValue, rightValue, isMain }) {
    
    const isMonthly = label.includes("월 납입금");
    let leftRaw = leftValue;
    let rightRaw = rightValue;

    if (isMonthly) {
        leftRaw = Math.floor(leftValue / 600000) * 10000; 
        rightRaw = Math.floor(rightValue / 600000) * 10000;
    }

    const diff = leftRaw - rightRaw;
    const absDiff = Math.abs(diff);

    const formatter = (value) => {
        if (value === 0) return "-";
        
        if (isMonthly) {
            return `월 ${(value / 10000).toLocaleString()}만원`;
        }
        return value.toLocaleString() + '원';
    };

    const leftIsHigher = diff > 0;
    const rightIsHigher = diff < 0;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 1fr",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
                fontSize: "13px",
            }}
        >
            {/* 1. 좌측 가격 (우측 정렬) */}
            <div style={{ textAlign: "right", paddingRight: '20px' }}>
                <span style={leftIsHigher ? { color: '#d32f2f', fontWeight: 700 } : {}}>
                    {formatter(leftRaw)}
                </span>
                {diff > 0 && 
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#d32f2f', fontWeight: 700 }}>
                        ▲ {absDiff.toLocaleString()}원
                    </span>
                }
            </div>

            {/* 2. 라벨 (중앙 정렬) */}
            <div style={{ textAlign: "center", color: "#777", fontWeight: 600 }}>
                {label}
            </div>

            {/* 3. 우측 가격 (좌측 정렬) */}
            <div style={{ textAlign: "left", paddingLeft: '20px' }}>
                <span style={rightIsHigher ? { color: '#d32f2f', fontWeight: 700 } : {}}>
                    {formatter(rightRaw)}
                </span>
                {diff < 0 && 
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#d32f2f', fontWeight: 700 }}>
                        ▲ {absDiff.toLocaleString()}원
                    </span>
                }
            </div>
        </div>
    );
}
// ---------------- 메인 컴포넌트 ----------------
export default function CompareVsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const leftId = searchParams.get("left");
  const rightId = searchParams.get("right");
  const lOptsStr = searchParams.get("lopts") || "";
  const rOptsStr = searchParams.get("ropts") || "";

  const leftOptSet = new Set(lOptsStr ? lOptsStr.split(",") : []);
  const rightOptSet = new Set(rOptsStr ? rOptsStr.split(",") : []);

  const [leftCar, setLeftCar] = useState(null);
  const [rightCar, setRightCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leftId || !rightId) return;

    const fetchData = async () => {
      try {
        const [lData, rData] = await Promise.all([
          fetch(`${API_BASE}/detail?trimId=${leftId}`).then((res) => res.json()),
          fetch(`${API_BASE}/detail?trimId=${rightId}`).then((res) => res.json()),
        ]);
        setLeftCar(lData);
        setRightCar(rData);
      } catch (err) {
        console.error(err);
        alert("데이터 로딩 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leftId, rightId]);

  const calculatePrice = (car, optsStr) => {
    if (!car) return 0;
    const base = car.base_price || 0;
    const optSet = new Set(optsStr.split(","));
    
    const optionTotal = (car.options || []).reduce((sum, opt, idx) => {
      const id = opt._id || String(idx);
      if (optSet.has(String(id))) {
        return sum + (opt.price || 0);
      }
      return sum;
    }, 0);
    return base + optionTotal;
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>데이터 불러오는 중...</div>;
  if (!leftCar || !rightCar) return <div style={{ padding: "100px", textAlign: "center" }}>잘못된 접근입니다.</div>;

  const leftTotal = calculatePrice(leftCar, lOptsStr);
  const rightTotal = calculatePrice(rightCar, rOptsStr);

  return (
    <main
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          // [수정] 바닥 패딩을 80px에서 40px로 줄여서 아래 버튼과의 간격을 줄임
          padding: "24px 20px 40px", 
        }}
      >
        {/* 상단 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          {/* 뒤로가기 */}
          <button
            onClick={() => router.back()}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ←
          </button>

          <div style={{ fontSize: "16px", fontWeight: 700 }}>VS 차량 비교</div>

          {/* 공유 아이콘 */}
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
            onClick={() => alert("공유 기능은 준비 중입니다.")}
          >
            ⤴
          </button>
        </div>

        {/* 상단 차량 카드 두 개 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {/* 왼쪽 차량 */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}
          >
            <div style={{ width: "100%", maxWidth: "200px", margin: "0 auto 10px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                src={leftCar.image_url || "/no-image.png"}
                alt={leftCar.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
            </div>
            
            <div style={{ fontSize: "14px", marginBottom: "4px" }}>차량 1</div>
            <div
              style={{
                fontSize: "13px",
                color: "#555",
                marginBottom: "8px",
                height: "40px", 
                overflow: "hidden"
              }}
            >
              {leftCar.name}
              <br/>
              <span style={{fontSize: "11px", color: "#888"}}>{leftCar.description}</span>
            </div>

            <div style={{ color: "#d32f2f", fontWeight: 700, fontSize: "16px" }}>
              {leftTotal.toLocaleString()}원
            </div>
          </div>

          {/* 오른쪽 차량 */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}
          >
            <div style={{ width: "100%", maxWidth: "200px", margin: "0 auto 10px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                src={rightCar.image_url || "/no-image.png"}
                alt={rightCar.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
            </div>

            <div style={{ fontSize: "14px", marginBottom: "4px" }}>차량 2</div>
            <div
              style={{
                fontSize: "13px",
                color: "#555",
                marginBottom: "8px",
                height: "40px",
                overflow: "hidden"
              }}
            >
              {rightCar.name}
              <br/>
              <span style={{fontSize: "11px", color: "#888"}}>{rightCar.description}</span>
            </div>

            <div style={{ color: "#d32f2f", fontWeight: 700, fontSize: "16px" }}>
              {rightTotal.toLocaleString()}원
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* [옵션 상세 비교 영역 - 1순위] */}
        {/* ========================================================= */}
        <div style={{ marginTop: "24px", marginBottom: "30px" }}>
            <div style={{ padding: "16px 20px", fontSize: "16px", fontWeight: "bold", background: "#fff", borderBottom: "1px solid #eee", borderRadius: "16px 16px 0 0" }}>
                선택 옵션 목록
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #eee", borderTop: "none", borderRadius: "0 0 16px 16px", background: "#fff" }}>
                
                {/* 왼쪽 옵션 목록 */}
                <div style={{ padding: "20px", borderRight: "1px solid #eee" }}>
                    <OptionsList car={leftCar} optSet={leftOptSet} />
                </div>
                
                {/* 오른쪽 옵션 목록 */}
                <div style={{ padding: "20px" }}>
                    <OptionsList car={rightCar} optSet={rightOptSet} />
                </div>
            </div>
        </div>
        
        {/* 가격 비교 제목 */}
        <div
          style={{
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          가격 비교
        </div>

        {/* 가격 비교 표 (2순위) */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "16px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            marginBottom: "24px" // 버튼과의 간격을 24px로 줄임
          }}
        >
          {/* 1. 출고가 (최종 견적가) */}
          <PriceCompareRow 
            label="출고가 (옵션포함)" 
            leftValue={leftTotal} 
            rightValue={rightTotal} 
            isMain={true} 
          />

          {/* 2. 할인가 (데이터 없음 -> 기본값 표시) */}
          <PriceCompareRow 
            label="할인가" 
            leftValue={leftTotal * 0.95} 
            rightValue={rightTotal * 0.98}
          />

          {/* 3. 월 납입금 (단순 계산 예시: 60개월 무이자 가정) */}
          <PriceCompareRow 
            label="월 납입금 (60개월)" 
            leftValue={leftTotal} 
            rightValue={rightTotal} 
          />
          
        </div>

      {/* [수정] 견적 저장 버튼 (고정 해제 및 중앙 배치) */}
      <div style={{ padding: "0 40px", maxWidth: "960px", margin: "0 auto" }}>
          <button
            onClick={() => alert("견적이 저장되었습니다!")}
            style={{
              width: "100%", 
              padding: "16px 0", 
              borderRadius: "999px", 
              background: "#111",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            견적 저장
          </button>
      </div>

      </div>
    </main>
  );
}
