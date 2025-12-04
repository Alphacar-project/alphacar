// kevin@devserver:~/alphacar/frontend/app/components/YouTubeSection.js
"use client";

import { useState } from "react";

export default function YouTubeSection() {
  // 🔻 유튜브 영상 목록 (ID만 있으면 됨)
  const videos = [
    {
      id: "4kDcpiwbCzs",
      title: "자동차 추천 영상 1",
    },
    {
      id: "KLHeBwP0G3U",
      title: "자동차 추천 영상 2",
    },
    {
      id: "rK6309nVBpI",
      title: "자동차 추천 영상 3",
    },
    {
      id: "g8_ug3SyDrc",
      title: "자동차 추천 영상 4",
    },
  ];

  const [index, setIndex] = useState(0);
  const current = videos[index];

  // 버튼 눌렀을 때만 다음 영상으로 이동 (자동 슬라이드는 X)
  const handleNext = () => {
    setIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div
      style={{
        width: 340,   // 고정 크기 (반응형 X)
        height: 230,
      }}
    >
      {/* 상단 타이틀 + 다른 영상 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 16,    // 🔺 글씨 조금 크게
            fontWeight: 700,
          }}
        >
          ALPHACAR 오늘의 추천 영상
        </span>
        <button
          onClick={handleNext}
          style={{
            border: "none",
            background: "none",
            color: "#777",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          다른 영상 보기 &gt;
        </button>
      </div>

      {/* ▶️ 유튜브 인베드 플레이어 */}
      <div
        style={{
          width: "100%",
          height: 190,
          backgroundColor: "#000",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${current.id}?rel=0`}
          title={current.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            border: "none",
            borderRadius: 16,
          }}
        />
      </div>
    </div>
  );
}

