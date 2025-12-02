// app/quote/compare/page.js
export default function CompareQuotePage() {
  return (
    <main
      style={{
        background: "#f5f5f5",
        minHeight: "calc(100vh - 80px)",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "24px 20px 40px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
          비교견적 페이지
        </h2>
        <p style={{ fontSize: "14px", color: "#555" }}>
          여기에서 여러 딜러 / 여러 차량 견적을 한 번에 비교하는 화면을
          구성하면 됩니다.
        </p>
      </div>
    </main>
  );
}

