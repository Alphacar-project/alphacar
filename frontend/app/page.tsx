'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMainData, MainData } from '../lib/api';

export default function HomePage() {
  const [data, setData] = useState<MainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchMainData()
      .then((res) => setData(res))
      .catch((err) => {
        console.error(err);
        alert('메인 데이터 불러오기에 실패했습니다.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (!keyword.trim()) {
      alert('검색어를 입력해 주세요.');
      return;
    }

    // 너가 만든 페이지 위치가 app/main/search 이니까 → /main/search 로 이동
    router.push(`/main/search?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  if (loading) return <div style={{ padding: '24px' }}>불러오는 중...</div>;
  if (!data) return <div style={{ padding: '24px' }}>데이터가 없습니다.</div>;

  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        메인 페이지
      </h1>
      <p style={{ marginBottom: '16px', color: '#555' }}>
        {data.welcomeMessage}
      </p>

      {/* 검색창 영역 */}
      {data.searchBar?.isShow && (
        <section
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            maxWidth: '600px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={data.searchBar.placeholder}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '999px',
                border: '1px solid #ddd',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#111827',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              검색
            </button>
          </div>
        </section>
      )}

      {/* 배너 */}
      <section style={{ marginTop: '16px' }}>
        <h2>배너</h2>
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {data.banners.map((banner) => (
            <div
              key={banner.id}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#ffffff',
                backgroundColor: banner.color,
              }}
            >
              {banner.text}
            </div>
          ))}
        </div>
      </section>

      {/* 바로가기 */}
      <section style={{ marginTop: '24px' }}>
        <h2>바로가기</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {data.shortcuts.map((s) => (
            <button
              key={s}
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                border: '1px solid #ddd',
                cursor: 'pointer',
                background: '#fff',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

