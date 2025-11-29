// lib/api.ts

// --------------------
// 메인 페이지
// --------------------
export type MainData = {
  welcomeMessage: string;
  searchBar?: {
    isShow: boolean;
    placeholder: string;
  };
  banners: { id: number; text: string; color: string }[];
  shortcuts: string[];
};

export async function fetchMainData(): Promise<MainData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/main`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("메인 데이터 불러오기 실패");
  }

  return res.json();
}

// --------------------
// 견적 페이지
// --------------------
export type QuoteInitData = {
  message: string;
  models: string[];
  trims: string[];
};

export type QuoteSaveResponse = {
  success: boolean;
  message: string;
  id: string;
};

export async function fetchQuoteInitData(): Promise<QuoteInitData> {
  const baseUrl = process.env.NEXT_PUBLIC_QUOTE_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_QUOTE_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/quote`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("견적 초기 데이터 불러오기 실패");
  }

  return res.json();
}

export async function saveQuote(data: any): Promise<QuoteSaveResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_QUOTE_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_QUOTE_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/quote/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("견적 저장 실패");
  }

  return res.json();
}

// --------------------
// 드라이브 코스
// --------------------
export type DriveCoursesData = {
  message: string;
  courses: {
    id: number;
    title: string;
    distance: string;
    time: string;
  }[];
};

export type DriveCourseDetail = {
  id: string;
  title: string;
  description: string;
  mapUrl: string;
};

export async function fetchDriveCourses(): Promise<DriveCoursesData> {
  const baseUrl = process.env.NEXT_PUBLIC_DRIVE_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_DRIVE_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/drive`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("드라이브 코스 목록 불러오기 실패");
  }

  return res.json();
}

export async function fetchDriveCourseDetail(
  id: number | string
): Promise<DriveCourseDetail> {
  const baseUrl = process.env.NEXT_PUBLIC_DRIVE_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_DRIVE_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/drive/${id}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("드라이브 코스 상세 불러오기 실패");
  }

  return res.json();
}

// --------------------
// 커뮤니티
// --------------------
export type CommunityPost = {
  id: number;
  category: string;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
};

export type CommunityListResponse = {
  message: string;
  posts: CommunityPost[];
};

export type CommunityWriteResponse = {
  success: boolean;
  message: string;
};

export async function fetchCommunityPosts(): Promise<CommunityListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_COMMUNITY_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_COMMUNITY_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/community`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("커뮤니티 목록 불러오기 실패");
  }

  return res.json();
}

export async function createCommunityPost(
  data: Partial<CommunityPost>
): Promise<CommunityWriteResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_COMMUNITY_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_COMMUNITY_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/community/write`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("커뮤니티 글 등록 실패");
  }

  return res.json();
}

// --------------------
// 마이페이지
// --------------------
export type MypageInfoResponse = {
  isLoggedIn: boolean;
  message: string;
  user: any | null;
};

export type NonMemberQuoteCheckResponse = {
  success: boolean;
  status?: string;
  model?: string;
  message?: string;
};

export async function fetchMypageInfo(): Promise<MypageInfoResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_MYPAGE_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_MYPAGE_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/mypage`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("마이페이지 정보 불러오기 실패");
  }

  return res.json();
}

export async function checkNonMemberQuote(
  quoteId: string
): Promise<NonMemberQuoteCheckResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_MYPAGE_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_MYPAGE_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const res = await fetch(`${baseUrl}/mypage/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quoteId }),
  });

  if (!res.ok) {
    throw new Error("비회원 견적 조회 실패");
  }

  return res.json();
}

// --------------------
// 검색(Search)
// --------------------
export type SearchCarTrim = {
  id: number;
  name: string;
  price: number;
};

export type SearchCar = {
  id: number;
  name: string;
  image: string;
  priceRange: string;
  trims: SearchCarTrim[];
};

export type SearchResult = {
  success: boolean;
  keyword: string;
  result: {
    cars: SearchCar[];
    community: any[];
  };
};

export async function fetchSearch(keyword: string): Promise<SearchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_SEARCH_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SEARCH_API_URL 환경변수가 없습니다.");
  }

  const res = await fetch(
    `${baseUrl}/search?keyword=${encodeURIComponent(keyword)}`,
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    throw new Error("검색 API 호출 실패");
  }

  return res.json();
}

