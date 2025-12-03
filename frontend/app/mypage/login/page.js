// app/mypage/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 눈 아이콘 (비밀번호 보기)
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2 12C3.8 8.7 7.6 6 12 6C16.4 6 20.2 8.7 22 12C20.2 15.3 16.4 18 12 18C7.6 18 3.8 15.3 2 12Z"
        fill="none"
        stroke="#888"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="#888"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// 🔸 카카오톡 아이콘
function KakaoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ marginRight: 12 }}
    >
      <circle cx="12" cy="12" r="12" fill="transparent" />
      <path
        d="M12 5C8.7 5 6 7.1 6 9.7C6 11.5 7.2 13.0 9.2 13.8L8.7 16.2C8.6 16.6 9.0 16.9 9.4 16.7L12.3 14.9C12.5 14.9 12.7 15 13 15C16.3 15 19 12.9 19 10.3C19 7.1 16.1 5 12 5Z"
        fill="#000000"
      />
    </svg>
  );
}

// 🔸 구글 아이콘
function GoogleIcon() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#4285F4",
        }}
      >
        G
      </span>
    </div>
  );
}

export default function MyPageLogin() {
  const router = useRouter();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePassword = () => {
    setPasswordVisible((prev) => !prev);
  };
  // 🔵 구글 로그인
  const handleGoogleLogin = () => {
    const CLIENT_ID = "1030657487130-g7891k55pfhijc8gh1kedccnkf75v2qf.apps.googleusercontent.com";
    // 👇 [수정] nip.io 도메인 사용
    const REDIRECT_URI = "https://192.168.0.160.nip.io:8000/mypage";

    const googleURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile&state=google`;
    window.location.href = googleURL;
  };

  // ✅ [수정완료] 카카오 로그인 (백엔드 거치지 않고 바로 카카오로 이동)
  const handleKakaoLogin = () => {
    const REST_API_KEY = "342d0463be260fc289926a0c63c4badc"; // 고객님 키 적용
    // 로그인 끝나면 다시 /mypage로 돌아와서 처리를 맡김 (8000번 포트 확인)
    const REDIRECT_URI = "https://192.168.0.160.nip.io:8000/mypage"; 
    
    // 카카오 인증 페이지 URL 생성
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    
    // 이동!
    window.location.href = kakaoURL;
  };

  // [수정] 이메일 로그인 처리 + 유저정보 저장
  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("http://192.168.0.160:3006/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || "로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
        return;
      }

      const data = await res.json();

      if (data.access_token && data.user) {
        alert("로그인 성공!");

        // 1) 토큰 저장 (필요하면 나중에 API 호출할 때 사용)
        localStorage.setItem("alphacarToken", data.access_token);

        // 2) 마이페이지에서 쓸 유저 정보 저장
        const userForMyPage = {
          nickname: data.user.nickname,
          email: data.user.email,
          provider: data.user.provider || "email",
          point: data.user.point ?? 0,
          quoteCount: data.user.quoteCount ?? 0,
        };
        localStorage.setItem("alphacarUser", JSON.stringify(userForMyPage));

        // 3) 마이페이지로 이동
        router.push("/mypage");
      } else {
        alert("로그인 응답 형식이 예상과 다릅니다. 백엔드 응답을 확인해주세요.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 연결에 실패했습니다. 백엔드가 켜져있는지 확인해주세요.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "520px",
        margin: "0 auto",
        padding: "60px 16px 80px",
      }}
    >
      {/* 상단 로고 텍스트 */}
      <div
        style={{
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "2px",
          marginBottom: "32px",
        }}
      >
        ALPHACAR
      </div>

      {/* 입력 폼 */}
      <div style={{ marginBottom: "32px" }}>
        {/* 이메일 */}
        <div
          style={{
            fontSize: "14px",
            marginBottom: "4px",
          }}
        >
          이메일 주소
        </div>
        <div
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            marginBottom: "16px",
          }}
        >
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>

        {/* 비밀번호 */}
        <div
          style={{
            fontSize: "14px",
            marginBottom: "4px",
          }}
        >
          비밀번호
        </div>
        <div
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "0 6px 0 10px",
          }}
        >
          <input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
            }}
          />
          <button
            type="button"
            onClick={togglePassword}
            aria-label={passwordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EyeIcon />
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="button"
          onClick={handleEmailLogin}
          style={{
            marginTop: "32px",
            width: "100%",
            height: "52px",
            borderRadius: "999px",
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          로그인
        </button>

        <div
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#555",
          }}
        >
          <input type="checkbox" id="saveId" />
          <label htmlFor="saveId">아이디 저장</label>
        </div>
      </div>

      {/* 아이디/비번 찾기 + 회원가입 */}
      <div
        style={{
          marginBottom: "24px",
          fontSize: "13px",
          color: "#555",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <button
          type="button"
          style={{
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: "13px",
            color: "#555",
          }}
        >
          아이디/비밀번호 찾기
        </button>
        <span>|</span>
        <button
          type="button"
          style={{
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: "13px",
            color: "#555",
          }}
        >
          회원가입
        </button>
      </div>

      {/* 소셜 로그인 버튼들 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* 카카오 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#FEE500",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <KakaoIcon />
            <span>카카오로 로그인</span>
          </div>
        </button>

        {/* 구글 */}
        <button
          type="button"
	  onClick={handleGoogleLogin}
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#1877F2",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GoogleIcon />
            <span>Google로 로그인</span>
          </div>
        </button>
      </div>

      <p
        style={{
          marginTop: "24px",
          fontSize: "12px",
          color: "#777",
          textAlign: "center",
        }}
      >
        (회원가입 안되어 있으시면 회원가입해 주세요.)
      </p>
    </div>
  );
}
