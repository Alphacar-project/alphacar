// app/mypage/page.js
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // URL 파라미터 가져오기
  const code = searchParams.get("code");  // ?code=... 값 추출

  const [guestCode, setGuestCode] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  // 🔹 로그인 유저 정보
  const [user, setUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // 로직 통합: (1) 카카오 로그인 처리 OR (2) 기존 로컬스토리지 확인
  useEffect(() => {
    const processAuth = async () => {
      // Case 1: 카카오 로그인 후 리다이렉트 된 경우 (URL에 코드가 있음)
      if (code) {
        try {
          console.log("🚀 [DEBUG] 백엔드로 로그인 요청 보냄 (3006번)");
          
          // ✅ [수정완료] HTTPS 주소로 변경! (백엔드와 보안 통신)
          const response = await axios.post("https://192.168.0.160:8000/auth/kakao-login", { code });
          const { access_token, user: loggedInUser } = response.data;

          // 정보 저장
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("alphacarUser", JSON.stringify(loggedInUser));

          // 상태 업데이트 및 환영 메시지
          setUser(loggedInUser);
          alert(`${loggedInUser.nickname}님 환영합니다!`);

          // URL에서 보기 싫은 ?code=... 제거 (새로고침 없이 주소만 변경)
          router.replace("/mypage");
        } catch (error) {
          console.error("로그인 처리 실패:", error);
          alert("로그인에 실패했습니다. 백엔드(3006번) 연결 상태를 확인해주세요.");
          router.push("/mypage"); // 실패 시에도 코드를 없애기 위해 이동
        } finally {
          setCheckedAuth(true); // 로딩 끝
        }
      } 
      // Case 2: 일반 접속 (저장된 정보 불러오기)
      else {
        try {
          const saved = typeof window !== "undefined" ? localStorage.getItem("alphacarUser") : null;
          if (saved) {
            setUser(JSON.parse(saved));
          }
        } catch (e) {
          console.error("유저정보 파싱 오류", e);
        } finally {
          setCheckedAuth(true); // 로딩 끝
        }
      }
    };

    processAuth();
  }, [code, router]);

  const handleLoginClick = () => {
    // ✅ 로그인 페이지로 이동 (여기서 카카오 로그인 버튼을 누르게 됨)
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

  // 아직 localStorage 검사 전이면 잠깐 로딩 화면
  if (!checkedAuth) {
    return (
      <div style={{ padding: "60px 16px" }}>마이페이지 불러오는 중...</div>
    );
  }

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
          alignItems: "flex-start",
        }}
      >
        {user ? (
          /* ===========================
             ✅ 로그인 후 마이페이지 화면
             =========================== */
          <div style={{ width: "100%", maxWidth: "520px" }}>
            {/* 프로필 영역 */}
            <section style={{ marginBottom: "32px" }}>
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                {user.nickname || "플렉스하는 알파카"}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                {/* 로그인 수단 뱃지 */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background:
                      user.provider === "kakao"
                        ? "#FEE500"
                        : user.provider === "google"
                        ? "#E8F0FE"
                        : "#f3f4f6",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {(user.provider || "email").toUpperCase()}
                </span>
                <span style={{ color: "#555" }}>
                  {user.email || "AlphaFlex123@naver.com"}
                </span>
              </div>
            </section>

            {/* 견적함 / 포인트 카드 */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderRadius: "18px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                overflow: "hidden",
                marginBottom: "24px",
                backgroundColor: "#fff",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderRight: "1px solid #f3f4f6",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#777",
                    marginBottom: "6px",
                  }}
                >
                  견적함
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  {user.quoteCount ?? 0}건
                </div>
              </div>
              <div style={{ padding: "20px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#777",
                    marginBottom: "6px",
                  }}
                >
                  포인트
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  {user.point ?? 0}P
                </div>
              </div>
            </section>

            {/* 메뉴 카드 */}
            <section
              style={{
                borderRadius: "18px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                backgroundColor: "#fff",
                overflow: "hidden",
              }}
            >
              {["결제내역", "잿챗 소식", "설정"].map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    border: "none",
                    background: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "14px",
                    cursor: "pointer",
                    borderTop: idx === 0 ? "none" : "1px solid #f3f4f6",
                  }}
                  onClick={() => alert(`${label} 준비 중입니다.`)} // TODO: 페이지 연결
                >
                  <span>{label}</span>
                  <span style={{ fontSize: "18px" }}>›</span>
                </button>
              ))}
            </section>
          </div>
        ) : (
          /* ===========================
             👤 로그인 전 (기존 화면 그대로)
             =========================== */
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
