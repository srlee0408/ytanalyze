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

// GPT 프롬프트 생성 함수 - 제목과 조회수 중심 분석
function createAnalysisPrompt(
  channelInfo: ChannelInfo,
  videos: VideoData[]
): string {
  // 조회수 기준으로 정렬
  const sortedVideos = videos.sort((a, b) => (b.viewCount || b.view_count || 0) - (a.viewCount || a.view_count || 0));
  const highPerformers = sortedVideos.slice(0, Math.ceil(videos.length / 3));
  const lowPerformers = sortedVideos.slice(-Math.ceil(videos.length / 3));
  
  const totalViews = videos.reduce((sum, video) => sum + (video.viewCount || video.view_count || 0), 0);
  const avgViews = Math.round(totalViews / videos.length);
  
  return `당신은 YouTube 채널 분석 전문가입니다. 다음 데이터를 바탕으로 상세한 분석 보고서를 작성해주세요.

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
   좋아요: ${(video.likes || video.like_count)?.toLocaleString() || '정보 없음'}
   발행일: ${video.date || video.published_at}
`).join('')}

**고성과 영상 (상위 ${highPerformers.length}개):**
${highPerformers.map((video, index) => `
${index + 1}. "${video.title}" - ${(video.viewCount || video.view_count || 0).toLocaleString()}회
`).join('')}

**저성과 영상 (하위 ${lowPerformers.length}개):**
${lowPerformers.map((video, index) => `
${index + 1}. "${video.title}" - ${(video.viewCount || video.view_count || 0).toLocaleString()}회
`).join('')}

다음 형식으로 **상세한 분석 보고서**를 JSON 형태로 작성해주세요:

{
  "channel_overview": {
    "summary": "채널의 전반적인 특징과 콘텐츠 성향에 대한 종합적 분석 (3-4문장)",
    "key_metrics": {
      "avg_views": ${avgViews},
      "total_views": ${totalViews},
      "top_performing_video": "가장 높은 조회수를 기록한 영상 제목",
      "content_consistency": "콘텐츠 일관성 및 업로드 패턴 분석"
    }
  },
  "title_analysis": {
    "common_patterns": ["제목에서 자주 사용되는 패턴1", "패턴2", "패턴3"],
    "successful_title_formats": ["고조회수 영상의 제목 형식1", "형식2", "형식3"],
    "keyword_usage": ["자주 사용되는 키워드1", "키워드2", "키워드3"],
    "title_length_analysis": "제목 길이와 성과의 상관관계 분석",
    "emotional_triggers": ["감정적 어필 요소1", "요소2", "요소3"]
  },
  "performance_analysis": {
    "high_performers": [
      {
        "title": "고성과 영상 제목1",
        "views": 조회수,
        "success_factors": "성공 요인 분석"
      },
      {
        "title": "고성과 영상 제목2", 
        "views": 조회수,
        "success_factors": "성공 요인 분석"
      }
    ],
    "low_performers": [
      {
        "title": "저성과 영상 제목1",
        "views": 조회수,
        "improvement_suggestions": "개선 제안"
      },
      {
        "title": "저성과 영상 제목2",
        "views": 조회수,
        "improvement_suggestions": "개선 제안"
      }
    ],
    "performance_insights": "조회수 패턴에 대한 종합적 인사이트"
  },
  "content_strategy_report": {
    "trending_topics": ["인기 주제1", "주제2", "주제3"],
    "content_gaps": ["부족한 콘텐츠 영역1", "영역2"],
    "optimization_recommendations": ["최적화 권장사항1", "권장사항2", "권장사항3"],
    "future_content_ideas": ["향후 콘텐츠 아이디어1", "아이디어2", "아이디어3"]
  },
  "executive_summary": {
    "key_findings": ["핵심 발견사항1", "발견사항2", "발견사항3"],
    "immediate_actions": ["즉시 실행 가능한 액션1", "액션2", "액션3"],
    "long_term_strategies": ["장기 전략1", "전략2", "전략3"],
    "expected_outcomes": ["예상 결과1", "결과2", "결과3"]
  }
}

**분석 요구사항:**
1. 실제 데이터에 기반한 구체적이고 실용적인 분석
2. 제목과 조회수의 상관관계에 특히 집중
3. 한국어로 명확하고 이해하기 쉽게 작성
4. 모든 제안사항은 실행 가능해야 함
5. JSON 형식을 정확히 준수
6. 숫자는 정확한 값 사용`;
}

// YouTube 채널 AI 분석 메인 함수
export async function analyzeChannelWithAI(
  channelInfo: ChannelInfo,
  videos: VideoData[]
): Promise<AIAnalysisResult> {
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
    const prompt = createAnalysisPrompt(channelInfo, videos);

    console.log(`📝 프롬프트 길이: ${prompt.length} 글자`);

    // OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 또는 'gpt-3.5-turbo'로 비용 절약 가능
      messages: [
        {
          role: 'system',
          content: '당신은 YouTube 트렌드 분석 전문가입니다. 데이터를 기반으로 정확하고 실용적인 인사이트를 제공합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: 'json_object' } // JSON 응답 강제
    });

    // 응답 데이터 파싱
    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('AI 분석 응답을 받을 수 없습니다.');
    }

    console.log(`✅ AI 분석 완료 (토큰 사용량: ${response.usage?.total_tokens})`);

    // JSON 파싱 및 타입 검증
    let analysisResult: AIAnalysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      throw new Error('AI 분석 결과를 파싱할 수 없습니다.');
    }

    // 기본값 설정 (필수 필드가 누락된 경우)
    const defaultResult: AIAnalysisResult = {
      channel_overview: {
        summary: '데이터 부족으로 분석 불가',
        key_metrics: {
          avg_views: 0,
          total_views: 0,
          top_performing_video: '분석 데이터 부족',
          content_consistency: '데이터 부족으로 분석 불가'
        }
      },
      title_analysis: {
        common_patterns: ['분석 데이터 부족'],
        successful_title_formats: ['분석 데이터 부족'],
        keyword_usage: ['분석 데이터 부족'],
        title_length_analysis: '데이터 부족으로 분석 불가',
        emotional_triggers: ['분석 데이터 부족']
      },
      performance_analysis: {
        high_performers: [],
        low_performers: [],
        performance_insights: '데이터 부족으로 분석 불가'
      },
      content_strategy_report: {
        trending_topics: ['분석 데이터 부족'],
        content_gaps: ['분석 데이터 부족'],
        optimization_recommendations: ['분석 데이터 부족'],
        future_content_ideas: ['분석 데이터 부족']
      },
      executive_summary: {
        key_findings: ['분석 데이터 부족'],
        immediate_actions: ['분석 데이터 부족'],
        long_term_strategies: ['분석 데이터 부족'],
        expected_outcomes: ['분석 데이터 부족']
      }
    };

    // 결과 병합 (AI 결과 우선, 누락된 필드는 기본값 사용)
    return {
      channel_overview: { ...defaultResult.channel_overview, ...analysisResult.channel_overview },
      title_analysis: { ...defaultResult.title_analysis, ...analysisResult.title_analysis },
      performance_analysis: { ...defaultResult.performance_analysis, ...analysisResult.performance_analysis },
      content_strategy_report: { ...defaultResult.content_strategy_report, ...analysisResult.content_strategy_report },
      executive_summary: { ...defaultResult.executive_summary, ...analysisResult.executive_summary }
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