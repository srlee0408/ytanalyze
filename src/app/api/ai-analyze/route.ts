import { NextRequest, NextResponse } from 'next/server';
import { 
  analyzeChannelWithAI, 
  isAIAnalysisAvailable, 
  estimateAICost,
  type VideoData,
  type ChannelInfo 
} from '@/utils/ai-analysis';

// POST 요청 처리 함수 - AI 기반 YouTube 채널 분석
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 채널 정보와 영상 데이터 추출
    const { channel_info, videos } = await request.json();

    // 데이터 유효성 검사
    if (!channel_info || !videos || !Array.isArray(videos)) {
      return NextResponse.json(
        { error: '유효한 채널 정보와 영상 데이터를 제공해주세요.' },
        { status: 400 }
      );
    }

    // 영상 데이터가 충분한지 확인
    if (videos.length === 0) {
      return NextResponse.json(
        { error: '분석할 영상 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 사용 가능 여부 확인
    if (!isAIAnalysisAvailable()) {
      return NextResponse.json(
        { 
          error: 'AI 분석 서비스를 사용할 수 없습니다.',
          debug: process.env.NODE_ENV === 'development' 
            ? '.env.local 파일에 OPENAI_API_KEY를 설정해주세요.' 
            : undefined
        },
        { status: 500 }
      );
    }

    // 타입 변환
    const channelInfo: ChannelInfo = {
      name: channel_info.name || 'Unknown Channel',
      subscriber_count: channel_info.subscriber_count,
      video_count: channel_info.video_count,
      description: channel_info.description
    };

    const videoData: VideoData[] = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description || '',
      view_count: video.view_count || 0,
      like_count: video.like_count,
      comment_count: video.comment_count,
      published_at: video.published_at,
      transcript: video.transcript
    }));

    console.log(`🤖 AI 분석 요청: ${channelInfo.name} (${videoData.length}개 영상)`);

    // 비용 추정
    const costEstimate = estimateAICost(videoData);
    console.log(`💰 예상 비용: $${costEstimate.estimated_cost_usd} (${costEstimate.estimated_cost_krw}원)`);

    // 자막이 있는 영상 수 확인
    const videosWithTranscripts = videoData.filter(
      video => video.transcript && video.transcript.length > 100
    );

    console.log(`📝 자막 분석 가능 영상: ${videosWithTranscripts.length}/${videoData.length}개`);

    // AI 분석 실행
    const analysisStartTime = Date.now();
    const aiAnalysisResult = await analyzeChannelWithAI(channelInfo, videoData);
    const analysisEndTime = Date.now();

    console.log(`✅ AI 분석 완료 (소요시간: ${analysisEndTime - analysisStartTime}ms)`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        // AI 분석 결과
        ai_analysis: aiAnalysisResult,
        
        // 분석 메타데이터
        analysis_metadata: {
          analyzed_videos_count: videoData.length,
          videos_with_transcripts: videosWithTranscripts.length,
          transcript_coverage_rate: Math.round((videosWithTranscripts.length / videoData.length) * 100),
          analysis_duration_ms: analysisEndTime - analysisStartTime,
          cost_estimate: costEstimate,
          ai_model_used: 'gpt-4'
        },
        
        // 채널 기본 정보
        channel_summary: {
          name: channelInfo.name,
          subscriber_count: channelInfo.subscriber_count,
          analyzed_period: {
            oldest_video: videoData.reduce((oldest, video) => 
              new Date(video.published_at) < new Date(oldest.published_at) ? video : oldest
            ).published_at,
            newest_video: videoData.reduce((newest, video) => 
              new Date(video.published_at) > new Date(newest.published_at) ? video : newest
            ).published_at
          }
        },
        
        // 메타 정보
        meta: {
          analyzed_at: new Date().toISOString(),
          api_version: '2.0',
          analysis_type: 'ai_comprehensive'
        }
      }
    });

  } catch (error) {
    console.error('❌ AI 분석 API 오류:', error);
    
    let errorMessage = 'AI 분석 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('OpenAI API 키')) {
        errorMessage = 'AI 분석 서비스 설정 오류입니다. 관리자에게 문의하세요.';
        statusCode = 500;
      } else if (error.message.includes('사용량이 초과')) {
        errorMessage = 'AI 분석 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 429;
      } else if (error.message.includes('분석할 영상 데이터가 없습니다')) {
        errorMessage = '분석할 영상 데이터가 충분하지 않습니다.';
        statusCode = 400;
      } else if (error.message.includes('AI 분석 응답을 받을 수 없습니다')) {
        errorMessage = 'AI 분석 서비스에서 응답을 받을 수 없습니다. 다시 시도해주세요.';
        statusCode = 503;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// GET 요청에 대한 API 정보
export async function GET() {
  return NextResponse.json({
    name: 'YouTube AI Analysis API',
    description: 'OpenAI GPT를 활용한 YouTube 채널 AI 분석 API',
    version: '2.0',
    features: [
      '🧠 AI 기반 트렌드 분석',
      '🎯 콘텐츠 전략 제안',
      '🔤 키워드 인사이트',
      '📊 참여도 패턴 분석',
      '🏆 경쟁력 분석',
      '🚀 성장 전략 추천'
    ],
    usage: {
      method: 'POST',
      endpoint: '/api/ai-analyze',
      body: {
        channel_info: {
          name: 'string',
          subscriber_count: 'number (optional)',
          video_count: 'number (optional)',
          description: 'string (optional)'
        },
        videos: [
          {
            id: 'string',
            title: 'string',
            description: 'string',
            view_count: 'number',
            like_count: 'number (optional)',
            comment_count: 'number (optional)',
            published_at: 'string (ISO date)',
            transcript: 'string (optional)'
          }
        ]
      }
    },
    response_structure: {
      ai_analysis: {
        overall_trends: '채널 전반적인 트렌드 분석',
        content_strategy: '콘텐츠 전략 분석',
        keyword_insights: '키워드 및 주제 분석',
        engagement_patterns: '참여도 패턴 분석',
        competitive_analysis: '경쟁력 분석',
        future_recommendations: '향후 방향성 제안'
      },
      analysis_metadata: '분석 메타데이터',
      channel_summary: '채널 요약 정보'
    },
    cost_estimate: {
      note: 'GPT-4 사용 시 분석당 약 $0.05-0.15 예상',
      factors: ['영상 수', '자막 길이', '분석 복잡도']
    },
    requirements: {
      openai_api_key: '환경 변수 OPENAI_API_KEY 필수',
      minimum_videos: '최소 1개 영상 필요',
      recommended_transcripts: '자막이 있는 영상 권장 (분석 품질 향상)'
    }
  });
} 