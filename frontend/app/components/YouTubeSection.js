// kevin@devserver:~/alphacar/frontend/app/components/YouTubeSection.js
"use client";

import { useState, useEffect } from "react";

export default function YouTubeSection() {
  const videos = [
    {
      id: "4kDcpiwbCzs",
      title: "자동차 추천 영상 1",
      channel: "ALPHACAR 추천",
      thumbnail: "https://img.youtube.com/vi/4kDcpiwbCzs/maxresdefault.jpg",
    },
    {
      id: "KLHeBwP0G3U",
      title: "자동차 추천 영상 2",
      channel: "ALPHACAR 추천",
      thumbnail: "https://img.youtube.com/vi/KLHeBwP0G3U/maxresdefault.jpg",
    },
    {
      id: "rK6309nVBpI",
      title: "자동차 추천 영상 3",
      channel: "ALPHACAR 추천",
      thumbnail: "https://img.youtube.com/vi/rK6309nVBpI/maxresdefault.jpg",
    },
    {
      id: "g8_ug3SyDrc",
      title: "자동차 추천 영상 4",
      channel: "ALPHACAR 추천",
      thumbnail: "https://img.youtube.com/vi/g8_ug3SyDrc/maxresdefault.jpg",
    },
  ];

  const [index, setIndex] = useState(0);

  // 5초마다 자동으로 다음 영상
  useEffect(() => {
    if (videos.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % videos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [videos.length]);

  const current = videos[index];

  const handleNext = () => {
    if (videos.length <= 1) return;
    setIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div
      // 🔒 고정 크기 (반응형 X)
      style={{
        width: 340,
        height: 230,
      }}
    >
      {/* 상단 타이틀 + 다른 영상 보기 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 13,
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
            cursor: videos.length > 1 ? "pointer" : "default",
          }}
        >
          다른 영상 보기 &gt;
        </button>
      </div>

      {/* 🔴 유튜브 TV 프레임 (영상 밑 글씨 없음!) */}
      <a
        href={`https://www.youtube.com/watch?v=${current.id}`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          width: 340,
          textDecoration: "none",
          color: "#000",
        }}
      >
        {/* TV 몸통 */}
        <div
          style={{
            width: 320,
            height: 190,
            backgroundColor: "#FF0000",
            borderRadius: 24,
            padding: 8,
            boxSizing: "border-box",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            margin: "0 auto",
          }}
        >
          {/* 검은 화면 안에 썸네일 */}
          <div
            style={{
              width: "100%",
              height: 160,
              backgroundColor: "#000",
              borderRadius: 18,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={current.thumbnail}
              alt={current.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* TV 다리(발) */}
          <div
            style={{
              marginTop: 6,
              display: "flex",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 6,
                borderRadius: 999,
                backgroundColor: "#B00000",
              }}
            />
            <div
              style={{
                width: 28,
                height: 6,
                borderRadius: 999,
                backgroundColor: "#B00000",
              }}
            />
          </div>
        </div>
      </a>
    </div>
  );
}

