"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchDriveCourses } from "../../lib/api";

export default function DriveListPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDriveCourses();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("드라이브 코스 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "32px" }}>
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px", color: "red" }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "32px" }}>
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "16px" }}>
        추천 드라이브 코스
      </h2>

      <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
        {data.message}
      </p>

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {data.courses.map((course) => (
          <li key={course.id} style={{ marginBottom: "12px" }}>
            <Link
              href={`/drive/${course.id}`}
              style={{
                display: "block",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid #eee",
                backgroundColor: "#fafafa",
                textDecoration: "none",
                color: "#222",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#888",
                  marginBottom: "4px",
                }}
              >
                {course.id}. {course.title}
              </div>
              <div style={{ fontSize: "13px", color: "#555" }}>
                거리: {course.distance} · 예상 시간: {course.time}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

