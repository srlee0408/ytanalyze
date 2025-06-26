import { NextRequest, NextResponse } from 'next/server';
import { analyzeYouTubeChannel, isApifyAvailable } from '@/utils/youtube';
import { 
  analyzeChannelWithAI, 
  isAIAnalysisAvailable, 
  estimateAICost,
  type VideoData,
  type ChannelInfo 
} from '@/utils/ai-analysis';

// POST 요청 처리 함수 - Apify 기반 YouTube 채널 분석
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 URL과 영상 개수, AI 분석 옵션 추출
    const { url, maxVideos = 5, includeAIAnalysis = false } = await request.json();

    // URL 유효성 검사
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '유효한 YouTube URL을 제공해주세요.' },
        { status: 400 }
      );
    }

    // YouTube URL 형식 확인
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return NextResponse.json(
        { error: '올바른 YouTube URL을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 영상 개수 유효성 검사
    if (maxVideos < 1 || maxVideos > 50) {
      return NextResponse.json(
        { error: '영상 개수는 1~50개 사이로 설정해주세요.' },
        { status: 400 }
      );
    }

    // Apify API 사용 가능 여부 확인
    if (!isApifyAvailable()) {
      return NextResponse.json(
        { 
          error: 'Apify API 토큰이 설정되지 않았습니다.',
          debug: process.env.NODE_ENV === 'development' 
            ? '.env.local 파일에 APIFY_API_TOKEN을 설정해주세요.' 
            : undefined
        },
        { status: 500 }
      );
    }

    console.log(`🔍 Apify 기반 YouTube 분석 시작: ${url} (최대 ${maxVideos}개 영상)`);

    // 🎯 Apify를 사용한 채널 분석 실행
    const analysisResult = await analyzeYouTubeChannel(url, maxVideos);

    // 📊 자막 분석 강화
    const videosWithTranscripts = analysisResult.videos.filter(
      video => video.transcript && video.transcript.length > 100
    );

    // 🔤 키워드 분석 (자막이 있는 영상들로부터)
    const allTranscripts = videosWithTranscripts
      .map(video => video.transcript)
      .filter(Boolean)
      .join(' ');

    let keywordAnalysis = null;
    if (allTranscripts.length > 500) {
      const words = allTranscripts
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.replace(/[^\w가-힣]/g, ''))
        .filter(word => word.length > 2);

      const wordFrequency = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      keywordAnalysis = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([word, count]) => ({
          word,
          count,
          percentage: ((count / words.length) * 100).toFixed(2)
        }));
    }

    // 📈 참여도 분석
    const engagementAnalysis = {
      avg_views: Math.round(analysisResult.analysis_summary.total_views / analysisResult.videos.length),
      most_viewed: analysisResult.videos.reduce((max, video) => 
        video.view_count > max.view_count ? video : max
      ),
      least_viewed: analysisResult.videos.reduce((min, video) => 
        video.view_count < min.view_count ? video : min
      ),
      view_distribution: {
        over_1m: analysisResult.videos.filter(v => v.view_count >= 1000000).length,
        over_100k: analysisResult.videos.filter(v => v.view_count >= 100000).length,
        over_10k: analysisResult.videos.filter(v => v.view_count >= 10000).length,
        under_10k: analysisResult.videos.filter(v => v.view_count < 10000).length
      }
    };

    // 🎬 자막 상세 정보
    const subtitleDetails = videosWithTranscripts.map(video => ({
      video_id: video.id,
      title: video.title.substring(0, 50) + '...',
      transcript_length: video.transcript?.length || 0,
      word_count: video.transcript?.split(/\s+/).length || 0,
      estimated_reading_time: Math.ceil((video.transcript?.split(/\s+/).length || 0) / 200),
      preview: video.transcript?.substring(0, 200) + '...' || ''
    }));

    console.log(`✅ 분석 완료: ${analysisResult.videos.length}개 영상, ${videosWithTranscripts.length}개 자막`);

    // 🤖 AI 분석 실행 (옵션)
    let aiAnalysisResult = null;
    let aiAnalysisMetadata = null;
    let aiCostEstimate = null;

    if (includeAIAnalysis && isAIAnalysisAvailable()) {
      try {
        console.log(`🤖 AI 분석 시작 (옵션 활성화)`);
        
        // 채널 정보 변환 (Apify 실제 구조에 맞춤)
        const firstVideo = analysisResult.videos[0];
        const channelInfo: ChannelInfo = {
          name: firstVideo?.channelName || 'Unknown Channel',
          subscriber_count: firstVideo?.numberOfSubscribers,
          video_count: firstVideo?.channelTotalVideos || analysisResult.videos.length,
          description: firstVideo?.channelDescription
        };

        // 영상 데이터 변환 (Apify 실제 구조에 맞춤)
        const videoData: VideoData[] = analysisResult.videos.map(video => ({
          id: video.id,
          title: video.title,
          description: video.text || '', // Apify에서는 'text' 필드가 설명
          view_count: video.viewCount || 0,
          like_count: video.likes,
          comment_count: video.commentsCount,
          published_at: video.date || new Date().toISOString(),
          transcript: video.subtitles?.[0]?.plaintext || video.transcript // 자막 데이터 추출
        }));

        // AI 분석 실행
        aiCostEstimate = estimateAICost(videoData);
        console.log(`💰 AI 분석 예상 비용: $${aiCostEstimate.estimated_cost_usd} (${aiCostEstimate.estimated_cost_krw}원)`);
        
        const aiStartTime = Date.now();
        aiAnalysisResult = await analyzeChannelWithAI(channelInfo, videoData);
        const aiEndTime = Date.now();
        
        aiAnalysisMetadata = {
          analysis_duration_ms: aiEndTime - aiStartTime,
          cost_estimate: aiCostEstimate,
          ai_model_used: 'gpt-4',
          transcript_coverage_rate: Math.round((videosWithTranscripts.length / analysisResult.videos.length) * 100)
        };

        console.log(`✅ AI 분석 완료 (소요시간: ${aiEndTime - aiStartTime}ms)`);
      } catch (aiError) {
        console.error('❌ AI 분석 실패:', aiError);
        // AI 분석 실패 시에도 기본 분석 결과는 반환
        aiAnalysisResult = { error: 'AI 분석 중 오류가 발생했습니다.' };
      }
    } else if (includeAIAnalysis && !isAIAnalysisAvailable()) {
      console.warn('⚠️ AI 분석이 요청되었지만 OpenAI API 키가 설정되지 않았습니다.');
      aiAnalysisResult = { error: 'OpenAI API 키가 설정되지 않아 AI 분석을 수행할 수 없습니다.' };
    }

    // 성공 응답 - 풍부한 분석 데이터 반환
    return NextResponse.json({
      success: true,
      data: {
        // 기본 채널 정보
        channel_info: analysisResult.channel_info,
        
        // 영상 목록 (자막 포함)
        videos: analysisResult.videos,
        
        // 분석 요약
        analysis_summary: {
          ...analysisResult.analysis_summary,
          subtitle_coverage_rate: Math.round((videosWithTranscripts.length / analysisResult.videos.length) * 100)
        },
        
        // 🔤 키워드 분석
        keyword_analysis: keywordAnalysis,
        
        // 📈 참여도 분석
        engagement_analysis: engagementAnalysis,
        
        // 📝 자막 상세 정보
        subtitle_details: subtitleDetails,

        // 🤖 AI 분석 결과 (옵션)
        ...(aiAnalysisResult && { ai_analysis: aiAnalysisResult }),
        ...(aiAnalysisMetadata && { ai_analysis_metadata: aiAnalysisMetadata }),
        
        // 메타 정보
        meta: {
          analyzed_at: new Date().toISOString(),
          data_source: 'Apify YouTube Scraper',
          api_version: '2.0',
          analysis_type: includeAIAnalysis ? 'comprehensive_with_ai' : 'comprehensive',
          ai_analysis_enabled: includeAIAnalysis,
          ai_analysis_available: isAIAnalysisAvailable()
        }
      }
    });

  } catch (error) {
    console.error('❌ Apify 분석 API 에러:', error);
    
    let errorMessage = '채널 분석 중 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('올바른 YouTube URL')) {
        errorMessage = error.message;
        statusCode = 400;
      } else if (error.message.includes('채널에서 영상을 찾을 수 없습니다')) {
        errorMessage = '해당 채널에서 영상을 찾을 수 없습니다. 채널 URL을 확인해주세요.';
        statusCode = 404;
      } else if (error.message.includes('Apify API 토큰')) {
        errorMessage = 'API 서비스 오류입니다. 관리자에게 문의하세요.';
        statusCode = 500;
      } else if (error.message.includes('채널 분석 실패')) {
        errorMessage = 'YouTube 데이터 수집 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 503;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        data_source: 'Apify YouTube Scraper',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// GET 요청에 대한 API 정보
export async function GET() {
  return NextResponse.json({
    name: 'YouTube Channel Analyzer API',
    description: 'Apify 기반 YouTube 채널 트렌드 분석 API',
    version: '2.0',
    features: [
      '🎯 채널 영상 목록 수집',
      '📝 자막/스크립트 추출',
      '🔤 키워드 분석',
      '📊 참여도 분석',
      '📈 트렌드 인사이트',
      '🤖 AI 기반 심화 분석 (옵션)'
    ],
    usage: {
      method: 'POST',
      endpoint: '/api/analyze',
      body: {
        url: 'YouTube 채널 또는 영상 URL',
        maxVideos: '분석할 영상 개수 (1-50, 기본값: 5)',
        includeAIAnalysis: 'AI 분석 포함 여부 (선택, 기본값: false)'
      },
      example: {
        url: 'https://www.youtube.com/@channelname',
        maxVideos: 5,
        includeAIAnalysis: true
      }
    },
    response_format: {
      channel_info: '채널 기본 정보',
      videos: '영상 목록 (자막 포함)',
      analysis_summary: '분석 요약',
      keyword_analysis: '키워드 분석 결과',
      engagement_analysis: '참여도 분석',
      subtitle_details: '자막 상세 정보'
    },
    requirements: {
      env_variables: ['APIFY_API_TOKEN'],
      rate_limits: '요청당 최대 50개 영상',
      supported_urls: [
        'https://www.youtube.com/@handle',
        'https://www.youtube.com/c/channelname',
        'https://www.youtube.com/channel/UC...',
        'https://www.youtube.com/watch?v=...'
      ]
    }
  });
} 