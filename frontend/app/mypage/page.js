// app/mypage/page.js
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MyPage() {
  const router = useRouter();
  const [guestCode, setGuestCode] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  const handleLoginClick = () => {
    router.push("/mypage/login");
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestCode.trim()) {
      alert("견적번호를 입력해주세요.");
      return;
    }

    // TODO: 비회원 견적 조회 페이지 연결 시 여기 수정
    alert(`비회원 견적 조회 준비 중입니다. (입력값: ${guestCode})`);
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "60px 16px 80px",
        display: "flex",
        gap: "40px",
        alignItems: "flex-start",
      }}
    >
      {/* 왼쪽 배너 */}
      <aside style={{ width: "220px", flexShrink: 0 }}>
        {showBanner && (
          <img
            src="/banners/alphacar-space.png"
            alt=""
            onError={() => setShowBanner(false)} // 깨지면 배너 숨김
            style={{
              width: "100%",
              display: "block",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
        )}
      </aside>

      {/* 오른쪽 메인 영역 (왼쪽 정렬) */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // 🔹 가운데가 아니라 왼쪽 정렬
        }}
      >
        {/* 히어로 영역 */}
        <section
          style={{
            textAlign: "center",
            marginBottom: "40px",
            width: "100%",
            maxWidth: "520px", // 🔹 폭 고정해서 배너 바로 옆에 위치
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            신차 살 땐,{" "}
            <span style={{ color: "#0052FF" }}>ALPHACAR</span>
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#555",
              marginBottom: "28px",
            }}
          >
            알파카 회원가입하면 1억포인트를 드려요
          </p>

          <button
            type="button"
            onClick={handleLoginClick}
            style={{
              width: "340px",
              height: "56px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#111",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            로그인/회원가입
          </button>

          <div
            style={{
              marginTop: "24px",
              width: "100%",
              height: "2px",
              backgroundColor: "#111",
            }}
          />
        </section>

        {/* 비회원 견적함 */}
        <section style={{ width: "100%", maxWidth: "520px" }}>
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid #eee",
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              padding: "18px 22px",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              비회원 견적함
            </div>
            <form
              onSubmit={handleGuestSubmit}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                placeholder="견적번호를 입력하세요 (예: 12345)"
                value={guestCode}
                onChange={(e) => setGuestCode(e.target.value)}
                style={{
                  flex: 1,
                  height: "44px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  padding: "0 12px",
                  fontSize: "14px",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "72px",
                  height: "44px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#111827",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                조회
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

