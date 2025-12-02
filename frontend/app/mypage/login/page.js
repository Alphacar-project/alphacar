// app/mypage/login/page.js
"use client";

import { useState } from "react";

// 눈 아이콘 (비밀번호 보기)
function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
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
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // [추가] 이메일과 비밀번호 입력값을 저장할 변수
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePassword = () => {
    setPasswordVisible((prev) => !prev);
  };

  // [기존] 카카오 로그인
  const handleKakaoLogin = () => {
    window.location.href = "http://192.168.0.160:3006/auth/kakao";
  };

  // [추가] 이메일 로그인 처리 함수
  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 백엔드로 로그인 요청 전송
      const res = await fetch("http://192.168.0.160:3006/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.access_token) {
        alert("로그인 성공!");
        // 여기서 받은 토큰(access_token)을 저장하고 메인으로 이동해야 합니다.
        // 예: localStorage.setItem('token', data.access_token);
        window.location.href = "/mypage";
      } else {
        alert(data.message || "로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
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
          {/* [수정] 이메일 입력 바인딩 */}
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
          {/* [수정] 비밀번호 입력 바인딩 */}
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

        {/* [수정] 로그인 버튼에 클릭 이벤트 추가 */}
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
