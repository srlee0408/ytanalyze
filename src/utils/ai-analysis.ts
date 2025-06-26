import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI 분석이 가능한지 확인하는 함수
export function isAIAnalysisAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// 영상 데이터 타입 정의 (Apify 데이터 구조 지원)
export interface VideoData {
  id: string;
  title: string;
  description: string;
  view_count: number;
  like_count?: number;
  comment_count?: number;
  published_at: string;
  transcript?: string;
  
  // Apify 원본 필드 지원
  channelName?: string;
  numberOfSubscribers?: number;
  channelTotalVideos?: number;
  channelDescription?: string;
  viewCount?: number;
  likes?: number;
  commentsCount?: number;
  date?: string;
  text?: string;
}

// 단순한 텍스트 분석 결과 타입 정의
export interface SimpleAnalysisResult {
  report_text: string;
}

// 채널 정보 타입 정의
export interface ChannelInfo {
  name: string;
  subscriber_count?: number;
  video_count?: number;
  description?: string;
}

// AI 분석 결과 타입 정의 - 보고서 형태
export interface AIAnalysisResult {
  // 채널 개요 보고서
  channel_overview: {
    summary: string;
    key_metrics: {
      avg_views: number;
      total_views: number;
      top_performing_video: string;
      content_consistency: string;
    };
  };
  
  // 제목 분석 보고서
  title_analysis: {
    common_patterns: string[];
    successful_title_formats: string[];
    keyword_usage: string[];
    title_length_analysis: string;
    emotional_triggers: string[];
  };
  
  // 조회수 패턴 보고서
  performance_analysis: {
    high_performers: {
      title: string;
      views: number;
      success_factors: string;
    }[];
    low_performers: {
      title: string;
      views: number;
      improvement_suggestions: string;
    }[];
    performance_insights: string;
  };
  
  // 콘텐츠 전략 보고서
  content_strategy_report: {
    trending_topics: string[];
    content_gaps: string[];
    optimization_recommendations: string[];
    future_content_ideas: string[];
  };
  
  // 종합 결론 및 제안
  executive_summary: {
    key_findings: string[];
    immediate_actions: string[];
    long_term_strategies: string[];
    expected_outcomes: string[];
  };
}

// GPT 프롬프트 생성 함수 - 단순한 텍스트 보고서
function createSimpleAnalysisPrompt(
  channelInfo: ChannelInfo,
  videos: VideoData[]
): string {
  // 기본 통계 계산
  const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || video.view_count || 0), 0);
  const avgViews = Math.round(totalViews / videos.length);
  
  return `당신은 YouTube 채널 분석 전문가입니다. 다음 데이터를 바탕으로 단순하고 명확한 텍스트 보고서를 작성해주세요.

**채널 기본 정보:**
- 채널명: ${channelInfo.name}
- 구독자 수: ${channelInfo.subscriber_count?.toLocaleString() || '정보 없음'}
- 분석 영상 수: ${videos.length}개
- 총 조회수: ${totalViews.toLocaleString()}
- 평균 조회수: ${avgViews.toLocaleString()}

**전체 영상 목록 (조회수 순):**
${videos.map((video, index) => `
${index + 1}. "${video.title}"
   조회수: ${(video.viewCount || video.view_count || 0).toLocaleString()}
   발행일: ${video.date || video.published_at}
`).join('')}

다음과 같은 순수 텍스트 형태의 분석 보고서를 작성해주세요. JSON이 아닌 읽기 쉬운 일반 텍스트로 작성하세요:

===== YouTube 채널 트렌드 분석 보고서 =====

1. 채널 개요
[채널의 전반적인 특징과 콘텐츠 성향 설명]

2. 주요 통계
- 평균 조회수: [숫자]
- 총 조회수: [숫자]  
- 최고 성과 영상: [제목]
- 콘텐츠 일관성: [분석 내용]

3. 제목 패턴 분석
[자주 사용되는 제목 패턴과 키워드 분석]

4. 성과 분석
고성과 영상:
[상위 영상들의 성공 요인 분석]

개선 필요 영상:
[하위 영상들의 개선 방향 제시]

5. 트렌드 키워드
[인기 주제와 키워드 목록]

6. 콘텐츠 전략 제안
[구체적이고 실행 가능한 전략 제안]

7. 결론 및 권장사항
[핵심 발견사항과 즉시 실행 가능한 액션 아이템]

**요구사항:**
- 노션 페이지처럼 깔끔한 텍스트 형태
- 실제 데이터 기반의 구체적 분석
- 한국어로 명확하게 작성
- 실행 가능한 제안사항 포함`;
}

// YouTube 채널 AI 분석 메인 함수 - 단순 텍스트 결과 반환
export async function analyzeChannelWithAI(
  channelInfo: ChannelInfo,
  videos: VideoData[]
): Promise<{ report_text: string }> {
  try {
    // OpenAI API 사용 가능 여부 확인
    if (!isAIAnalysisAvailable()) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    // 분석할 데이터가 충분한지 확인
    if (videos.length === 0) {
      throw new Error('분석할 영상 데이터가 없습니다.');
    }

    console.log(`🤖 AI 분석 시작: ${channelInfo.name} (${videos.length}개 영상)`);

    // GPT 프롬프트 생성
    const prompt = createSimpleAnalysisPrompt(channelInfo, videos);

    console.log(`📝 프롬프트 길이: ${prompt.length} 글자`);

    // OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 YouTube 트렌드 분석 전문가입니다. 단순하고 명확한 텍스트 보고서를 작성합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    // 응답 데이터 파싱
    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('AI 분석 응답을 받을 수 없습니다.');
    }

    console.log(`✅ AI 분석 완료 (토큰 사용량: ${response.usage?.total_tokens})`);

    return {
      report_text: aiResponse
    };

  } catch (error) {
    console.error('❌ AI 분석 오류:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API 키가 올바르지 않습니다.');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI API 사용량이 초과되었습니다.');
      } else if (error.message.includes('model')) {
        throw new Error('AI 모델에 접근할 수 없습니다.');
      }
    }
    
    throw new Error(`AI 분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// 간단한 키워드 분석 함수 (AI 분석 보조용)
export function extractBasicKeywords(videos: VideoData[]): string[] {
  const allText = videos
    .map(video => `${video.title} ${video.text || video.description || ''} ${video.transcript || ''}`)
    .join(' ')
    .toLowerCase();

  // 한글과 영문 단어 추출
  const words = allText
    .split(/\s+/)
    .map(word => word.replace(/[^\w가-힣]/g, ''))
    .filter(word => word.length > 2);

  // 빈도수 계산
  const wordFrequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 상위 키워드 반환
  return Object.entries(wordFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

// 비용 추정 함수
export function estimateAICost(videos: VideoData[]): {
  estimated_tokens: number;
  estimated_cost_usd: number;
  estimated_cost_krw: number;
} {
  // 대략적인 토큰 수 계산 (한글 1글자 ≈ 1.5토큰, 영문 1단어 ≈ 1.3토큰)
  const totalTextLength = videos.reduce((sum, video) => {
    const description = video.text || video.description || '';
    return sum + video.title.length + description.length + (video.transcript?.length || 0);
  }, 0);

  const estimatedTokens = Math.ceil(totalTextLength * 1.5) + 1000; // 프롬프트 + 응답 토큰
  
  // GPT-4 비용 계산 (입력: $0.03/1K 토큰, 출력: $0.06/1K 토큰)
  const estimatedCostUSD = (estimatedTokens / 1000) * 0.045; // 평균 비용
  const estimatedCostKRW = estimatedCostUSD * 1300; // 환율 적용

  return {
    estimated_tokens: estimatedTokens,
    estimated_cost_usd: Math.round(estimatedCostUSD * 1000) / 1000,
    estimated_cost_krw: Math.round(estimatedCostKRW)
  };
} 