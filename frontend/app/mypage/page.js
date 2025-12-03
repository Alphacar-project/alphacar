// frontend/app/mypage/page.js
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  
  // ✅ [추가] state 파라미터 가져오기 (누가 보냈는지 확인: kakao / google)
  const state = searchParams.get("state"); 

  const [guestCode, setGuestCode] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  // 🔹 로그인 유저 정보
  const [user, setUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // 로직 통합: (1) 소셜 로그인 처리 OR (2) 기존 로컬스토리지 확인
  useEffect(() => {
    const processAuth = async () => {
      // Case 1: 소셜 로그인 후 리다이렉트 된 경우 (URL에 코드가 있음)
      if (code) {
        try {
          let response;
          
          // 🔀 [분기 처리] state 값에 따라 요청할 백엔드 주소 변경
          if (state === "google") {
            console.log("🔵 [DEBUG] 구글 로그인 요청 (state=google)");
            // 구글 로그인 요청 (HTTPS & 8000번)
            response = await axios.post("https://192.168.0.160.nip.io:8000/auth/google-login", { code });
          } else {
            console.log("🟡 [DEBUG] 카카오 로그인 요청 (state=kakao 또는 없음)");
            // 카카오 로그인 요청 (기본값)
            response = await axios.post("https://192.168.0.160.nip.io:8000/auth/kakao-login", { code });
          }

          const { access_token, user: loggedInUser } = response.data;

          // 정보 저장
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("alphacarUser", JSON.stringify(loggedInUser));

          // 상태 업데이트 및 환영 메시지
          setUser(loggedInUser);
          alert(`${loggedInUser.nickname}님 환영합니다!`);

          // URL에서 보기 싫은 ?code=... 제거
          router.replace("/mypage");
        } catch (error) {
          console.error("로그인 실패:", error);
          alert("로그인에 실패했습니다. 백엔드 연결을 확인해주세요.");
          router.replace("/mypage"); // 실패 시에도 URL 정리
        } finally {
          setCheckedAuth(true);
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
  }, [code, router, state]); // state 의존성 추가

  // 로그아웃 기능
  const handleLogout = () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("alphacarUser");
      setUser(null);
      alert("로그아웃 되었습니다.");
    }
  };

  const handleLoginClick = () => {
    router.push("/mypage/login");
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestCode.trim()) {
      alert("견적번호를 입력해주세요.");
      return;
    }
    alert(`비회원 견적 조회 준비 중입니다. (입력값: ${guestCode})`);
  };

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
            onError={() => setShowBanner(false)}
            style={{
              width: "100%",
              display: "block",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
        )}
      </aside>

      {/* 오른쪽 메인 영역 */}
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

            {/* 프로필 영역 (Flex 적용하여 버튼 우측 배치) */}
            <section
              style={{
                marginBottom: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >
              {/* 왼쪽: 닉네임 및 정보 */}
              <div>
                <h1
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    lineHeight: "1.2",
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
              </div>

              {/* 오른쪽: 로그아웃 버튼 (검은색 박스) */}
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "#000", // 검은색 배경
                  color: "#fff",           // 흰색 글씨
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                로그아웃
              </button>
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
                <div style={{ fontSize: "14px", color: "#777", marginBottom: "6px" }}>
                  견적함
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>
                  {user.quoteCount ?? 0}건
                </div>
              </div>
              <div style={{ padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", color: "#777", marginBottom: "6px" }}>
                  포인트
                </div>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>
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
                  onClick={() => alert(`${label} 준비 중입니다.`)}
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
            <section
              style={{
                textAlign: "center",
                marginBottom: "40px",
                width: "100%",
                maxWidth: "520px",
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
