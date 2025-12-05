// app/layout.js
import "./globals.css";
import AiChatButton from "./AICHAT/AiChatButton";
import LeftAdBanner from "./LeftAdBanner";
import Footer from "./components/Footer";
import RightSideBar from "./RightSideBar";
import GlobalHeader from "./components/GlobalHeader";

export const metadata = {
  title: "ALPHACAR",
  description: "ALPHACAR 차량 가격 비교 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          backgroundColor: "#ffffff",
        }}
      >
        {/* 🔹 새 GNB 헤더 (로그인 라인 + 메뉴 + 전체메뉴) */}
        <GlobalHeader />

        {/* 페이지 내용 */}
        <main
          style={{
            padding: "24px 32px",
            minHeight: "calc(100vh - 80px)",
            backgroundColor: "#ffffff",
          }}
        >
          {children}
        </main>

        {/* 오른쪽 사이드 퀵메뉴 */}
        <RightSideBar />

        {/* 오른쪽 하단 AI 챗봇 */}
        <AiChatButton />

        {/* 왼쪽 광고 배너 */}
        <LeftAdBanner />

        {/* 사이트 하단 Footer */}
        <Footer />
      </body>
    </html>
  );
}

