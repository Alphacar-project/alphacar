"use client";

import { useEffect, useState } from "react";
import {
  fetchCommunityPosts,
  createCommunityPost,
} from "../../lib/api";

const CATEGORIES = ["전체", "구매 고민", "오너 리뷰"];

export default function CommunityPage() {
  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 글쓰기 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("구매 고민");

  useEffect(() => {
    fetchCommunityPosts()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error(err);
        setError("커뮤니티 글 목록을 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts =
    selectedCategory === "전체"
      ? data?.posts ?? []
      : (data?.posts ?? []).filter(
          (p) => p.category === selectedCategory
        );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해 주세요.");
      return;
    }

    try {
      const res = await createCommunityPost({
        title,
        content,
        category,
        author: "익명",
      });
      alert(res.message);

      // 프론트에서만 임시로 목록에 추가 (실제로는 다시 fetch 하는 게 좋음)
      const newPost = {
        id: Date.now(),
        category,
        title,
        content,
        author: "익명",
        date: new Date().toISOString().slice(0, 10),
        views: 0,
      };

      setData((prev) => ({
        ...(prev ?? { message: "", posts: [] }),
        posts: [newPost, ...(prev?.posts ?? [])],
      }));

      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      alert("글 등록 중 오류가 발생했습니다.");
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

  if (!data) {
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
        커뮤니티
      </h1>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
        {data.message}
      </p>

      {/* 카테고리 탭 */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border:
                selectedCategory === cat
                  ? "2px solid #111827"
                  : "1px solid #ddd",
              backgroundColor:
                selectedCategory === cat ? "#f3f4f6" : "#fff",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 글 목록 */}
      <section style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          게시글 목록
        </h2>

        {filteredPosts.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#777" }}>
            아직 게시글이 없습니다.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {filteredPosts.map((post) => (
              <li
                key={post.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "4px",
                  }}
                >
                  [{post.category}] · {post.author} · {post.date} · 조회{" "}
                  {post.views}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {post.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.content}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 글쓰기 폼 */}
      <section>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          글쓰기
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "13px",
              maxWidth: "200px",
            }}
          >
            <option value="구매 고민">구매 고민</option>
            <option value="오너 리뷰">오너 리뷰</option>
          </select>

          <input
            type="text"
            placeholder="제목을 입력해 주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
            }}
          />

          <textarea
            placeholder="내용을 입력해 주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: "4px",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#111827",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            글 등록
          </button>
        </form>
      </section>
    </main>
  );
}

