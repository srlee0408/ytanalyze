import { marked } from 'marked';

interface AIAnalysis {
  channel_overview?: {
    summary?: string;
    key_metrics?: {
      avg_views?: number;
      total_views?: number;
      top_performing_video?: string;
      content_consistency?: string;
    };
  };
  keyword_insights?: {
    trending_keywords?: string[];
    analysis?: string;
    recommended_keywords?: string[];
  };
  content_strategy?: {
    recommended_topics?: string[];
    content_formats?: string[];
    strategy_analysis?: string;
  };
  engagement_patterns?: {
    high_performance_characteristics?: string[];
    analysis?: string;
  };
  growth_strategy?: {
    short_term?: string[];
    long_term?: string[];
    analysis?: string;
  };
  [key: string]: unknown;
}

export function convertAIAnalysisToMarkdown(aiAnalysis: AIAnalysis): string {
  const sections: string[] = [];
  
  sections.push('# 📊 AI 분석 보고서\n');
  
  // 채널 개요
  if (aiAnalysis.channel_overview) {
    sections.push('## 🏢 채널 개요\n');
    
    if (aiAnalysis.channel_overview.summary) {
      sections.push(`${aiAnalysis.channel_overview.summary}\n`);
    }
    
    if (aiAnalysis.channel_overview.key_metrics) {
      const metrics = aiAnalysis.channel_overview.key_metrics;
      sections.push('### 주요 지표\n');
      
      if (metrics.avg_views) {
        sections.push(`- **평균 조회수**: ${metrics.avg_views.toLocaleString()}`);
      }
      if (metrics.total_views) {
        sections.push(`- **총 조회수**: ${metrics.total_views.toLocaleString()}`);
      }
      if (metrics.top_performing_video) {
        sections.push(`- **최고 성과**: ${metrics.top_performing_video}`);
      }
      
      if (metrics.content_consistency) {
        sections.push(`\n**콘텐츠 일관성**\n${metrics.content_consistency}\n`);
      }
    }
  }
  
  // 키워드 인사이트
  if (aiAnalysis.keyword_insights) {
    sections.push('## 🔤 키워드 인사이트\n');
    
    if (aiAnalysis.keyword_insights.trending_keywords && aiAnalysis.keyword_insights.trending_keywords.length > 0) {
      sections.push('### 트렌딩 키워드\n');
      const keywords = aiAnalysis.keyword_insights.trending_keywords.map(k => `\`${k}\``).join(', ');
      sections.push(`${keywords}\n`);
    }
    
    if (aiAnalysis.keyword_insights.analysis) {
      sections.push('### 키워드 분석\n');
      sections.push(`${aiAnalysis.keyword_insights.analysis}\n`);
    }
    
    if (aiAnalysis.keyword_insights.recommended_keywords && aiAnalysis.keyword_insights.recommended_keywords.length > 0) {
      sections.push('### 추천 키워드\n');
      const recommended = aiAnalysis.keyword_insights.recommended_keywords.map(k => `\`${k}\``).join(', ');
      sections.push(`${recommended}\n`);
    }
  }
  
  // 콘텐츠 전략
  if (aiAnalysis.content_strategy) {
    sections.push('## 📝 콘텐츠 전략\n');
    
    if (aiAnalysis.content_strategy.recommended_topics && aiAnalysis.content_strategy.recommended_topics.length > 0) {
      sections.push('### 추천 주제\n');
      aiAnalysis.content_strategy.recommended_topics.forEach(topic => {
        sections.push(`- ${topic}`);
      });
      sections.push('');
    }
    
    if (aiAnalysis.content_strategy.content_formats && aiAnalysis.content_strategy.content_formats.length > 0) {
      sections.push('### 콘텐츠 형식\n');
      aiAnalysis.content_strategy.content_formats.forEach(format => {
        sections.push(`- ${format}`);
      });
      sections.push('');
    }
    
    if (aiAnalysis.content_strategy.strategy_analysis) {
      sections.push('### 전략 분석\n');
      sections.push(`${aiAnalysis.content_strategy.strategy_analysis}\n`);
    }
  }
  
  // 참여 패턴
  if (aiAnalysis.engagement_patterns) {
    sections.push('## 📈 참여 패턴\n');
    
    if (aiAnalysis.engagement_patterns.high_performance_characteristics && aiAnalysis.engagement_patterns.high_performance_characteristics.length > 0) {
      sections.push('### 고성과 특성\n');
      aiAnalysis.engagement_patterns.high_performance_characteristics.forEach(char => {
        sections.push(`- ${char}`);
      });
      sections.push('');
    }
    
    if (aiAnalysis.engagement_patterns.analysis) {
      sections.push('### 참여 분석\n');
      sections.push(`${aiAnalysis.engagement_patterns.analysis}\n`);
    }
  }
  
  // 성장 전략
  if (aiAnalysis.growth_strategy) {
    sections.push('## 🚀 성장 전략\n');
    
    if (aiAnalysis.growth_strategy.short_term && aiAnalysis.growth_strategy.short_term.length > 0) {
      sections.push('### 단기 전략\n');
      aiAnalysis.growth_strategy.short_term.forEach(strategy => {
        sections.push(`- ${strategy}`);
      });
      sections.push('');
    }
    
    if (aiAnalysis.growth_strategy.long_term && aiAnalysis.growth_strategy.long_term.length > 0) {
      sections.push('### 장기 전략\n');
      aiAnalysis.growth_strategy.long_term.forEach(strategy => {
        sections.push(`- ${strategy}`);
      });
      sections.push('');
    }
    
    if (aiAnalysis.growth_strategy.analysis) {
      sections.push('### 성장 분석\n');
      sections.push(`${aiAnalysis.growth_strategy.analysis}\n`);
    }
  }
  
  return sections.join('\n');
}

export async function convertMarkdownToHTML(markdown: string): Promise<string> {
  // Configure marked for better output
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
  
  return await marked(markdown);
}