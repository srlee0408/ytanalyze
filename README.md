# YouTube Trend Analyzer

유튜브 채널의 최신 영상 트렌드를 분석하는 웹 서비스입니다. 

## 🚀 주요 기능

- YouTube 채널 URL 입력으로 최신 영상 분석 (3-20개 선택 가능)
- 영상별 자막/스크립트 자동 추출 (Apify 기반)
- 🤖 **AI 기반 트렌드 패턴 분석** (OpenAI GPT-4)
- 키워드 트렌드 및 콘텐츠 전략 인사이트 제공
- 반응형 웹 디자인 (데스크톱/모바일)

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **YouTube 데이터**: Apify YouTube Scraper (YouTube API 대신)
- **AI 분석**: OpenAI GPT API
- **배포**: Vercel

## 📋 환경 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone [repository-url]
cd yt-analyze
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```env
# Apify API Token (필수)
# https://console.apify.com/account/integrations에서 발급
APIFY_API_TOKEN=your_apify_api_token_here

# OpenAI API Key (AI 분석용, 선택)
# https://platform.openai.com/api-keys에서 발급
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Environment
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Apify API 토큰 발급 방법

1. [Apify Console](https://console.apify.com/)에 회원가입/로그인
2. 우측 상단 프로필 → **Integrations** 클릭
3. **API tokens** 섹션에서 **Create new token** 클릭
4. 토큰명 입력 후 생성
5. 생성된 토큰을 `.env.local`에 복사

### 4. OpenAI API 키 발급 방법 (AI 분석용)

1. [OpenAI Platform](https://platform.openai.com/)에 회원가입/로그인
2. 상단 메뉴에서 **API keys** 클릭
3. **+ Create new secret key** 클릭
4. 키 이름 입력 후 생성
5. 생성된 키를 즉시 복사하여 `.env.local`에 저장 (다시 볼 수 없음)

**💰 비용 안내:**
- GPT-4 사용 시 분석당 약 $0.05-0.15
- 무료 크레딧 $5 제공 (신규 가입 시)
- 사용량은 [OpenAI Usage](https://platform.openai.com/usage)에서 확인 가능

## 🧪 테스트

### Apify API 연결 테스트

```bash
# 기본 테스트 (lazy4achiever 채널)
npm run test-apify

# 특정 채널 테스트
npm run test-apify "https://www.youtube.com/@channelname"

### AI 분석 기능 테스트

```bash
# AI 분석 테스트 (OpenAI API 키 필요)
npx ts-node scripts/test-ai-analysis.ts
```
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
yt-analyze/
├── src/
│   ├── app/
│   │   ├── api/analyze/           # 분석 API 엔드포인트
│   │   ├── page.tsx               # 메인 페이지
│   │   └── layout.tsx             # 레이아웃
│   └── utils/
│       └── youtube.ts             # YouTube 데이터 추출 유틸리티 (Apify 통합)
├── scripts/
│   └── test-apify.ts              # Apify API 테스트 스크립트
├── docs/                          # 프로젝트 문서
└── README.md
```

## 🔧 API 사용법

### 채널 분석 API

```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://www.youtube.com/@channelname",
  "maxVideos": 5,
  "includeAIAnalysis": true
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "videoId": "abc123",
        "title": "영상 제목",
        "description": "영상 설명",
        "transcript": "자막 내용...",
        "viewCount": 12345,
        "publishedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total_count": 10,
    "subtitles_count": 8,
    "data_source": "Apify YouTube Scraper"
  }
}
```

## 📊 지원하는 YouTube URL 형식

- 채널 URL: `https://www.youtube.com/@channelname`
- 채널 ID: `https://www.youtube.com/channel/UCxxxxx`
- 사용자명: `https://www.youtube.com/c/username`

## 🚨 주의사항

1. **Apify API 요금**: 무료 플랜에서는 월 사용량 제한이 있습니다
2. **요청 속도**: 과도한 요청시 API 제한이 걸릴 수 있습니다
3. **자막 가용성**: 모든 영상에 자막이 있지는 않습니다

## 🐛 문제 해결

### "API 토큰이 설정되지 않았습니다" 오류
- `.env.local` 파일에 `APIFY_API_TOKEN`이 올바르게 설정되었는지 확인
- 토큰 값에 공백이나 따옴표가 없는지 확인

### "채널을 찾을 수 없습니다" 오류
- YouTube URL 형식이 올바른지 확인
- 채널이 공개되어 있는지 확인

### 자막 추출 실패
- 해당 영상에 자막이 없을 수 있음
- Apify Actor가 일시적으로 불안정할 수 있음

## 📞 지원

문제가 발생하면 다음을 확인해보세요:

1. API 토큰이 올바르게 설정되었는지
2. 네트워크 연결이 안정적인지
3. YouTube URL이 유효한지

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 사용합니다.
