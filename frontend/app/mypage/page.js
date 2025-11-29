"use client";

import { useEffect, useState } from "react";
import {
  fetchMypageInfo,
  checkNonMemberQuote,
} from "../../lib/api";

export default function MypagePage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quoteId, setQuoteId] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);

  // 마이페이지 기본 정보 불러오기
  useEffect(() => {
    fetchMypageInfo()
      .then((res) => setInfo(res))
      .catch((err) => {
        console.error(err);
        setError("마이페이지 정보를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCheckQuote = async () => {
    if (!quoteId.trim()) {
      alert("견적번호를 입력해 주세요.");
      return;
    }

    setChecking(true);
    setCheckResult(null);
    try {
      const res = await checkNonMemberQuote(quoteId.trim());
      setCheckResult(res);
    } catch (err) {
      console.error(err);
      alert("견적 조회 중 오류가 발생했습니다.");
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "32px" }}>불러오는 중...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "32px", color: "red" }}>
        {error}
      </div>
    );
  }

  if (!info) {
    return <div style={{ padding: "32px" }}>데이터가 없습니다.</div>;
  }

  return (
    <main
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "32px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        마이페이지
      </h1>

      {/* 로그인 안내 */}
      <section style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
          {info.message}
        </p>
        {!info.isLoggedIn && (
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #eee",
              backgroundColor: "#fafafa",
              fontSize: "14px",
            }}
          >
            현재는 로그인 기능이 준비 중입니다.  
            아래에서 비회원 견적 조회를 먼저 이용해 보실 수 있습니다.
          </div>
        )}
      </section>

      {/* 비회원 견적 조회 */}
      <section>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          비회원 견적 조회
        </h2>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
          받은 견적번호를 입력하면 현재 진행 상태를 확인할 수 있습니다.
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <input
            type="text"
            placeholder="견적번호를 입력하세요 (예: 12345)"
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
            }}
          />
          <button
            onClick={handleCheckQuote}
            disabled={checking}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#111827",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              opacity: checking ? 0.7 : 1,
            }}
          >
            {checking ? "조회 중..." : "조회"}
          </button>
        </div>

        {checkResult && (
          <div
            style={{
              marginTop: "8px",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #eee",
              backgroundColor: "#f9fafb",
              fontSize: "14px",
            }}
          >
            {checkResult.success ? (
              <>
                <div style={{ marginBottom: "4px" }}>
                  견적번호 <b>{quoteId}</b> 의 상태:
                </div>
                <div>· 상태: {checkResult.status}</div>
                <div>· 차량: {checkResult.model}</div>
              </>
            ) : (
              <div style={{ color: "#b91c1c" }}>
                {checkResult.message ?? "조회 결과가 없습니다."}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

