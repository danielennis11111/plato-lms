'use client';
import React, { useState } from 'react';
import { Clock, BookOpen, ExternalLink, Play, ChevronDown, ChevronUp } from 'lucide-react';

interface YouTubeVideo {
  title: string;
  videoId: string;
  description: string;
  duration: string;
}

interface ReadingDetails {
  source: string;
  estimated_time: number;
  type: 'enhanced_reading' | 'textbook' | 'article' | 'website' | 'video' | 'research_paper';
  youtube_videos?: YouTubeVideo[];
  key_points?: string[];
  further_reading?: string[];
}

interface EnhancedReadingViewerProps {
  title: string;
  content: string;
  reading_details?: ReadingDetails;
}

export default function EnhancedReadingViewer({ title, content, reading_details }: EnhancedReadingViewerProps) {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [showKeyPoints, setShowKeyPoints] = useState(true);
  const [showFurtherReading, setShowFurtherReading] = useState(false);

  const formatContent = (content: string) => {
    // Convert markdown-style content to JSX
    const lines = content.split('\n');
    const jsx = lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-4">{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{line.slice(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-medium text-gray-700 mb-2 mt-4">{line.slice(4)}</h3>;
      } else if (line.startsWith('- **') && line.includes('**:')) {
        const parts = line.slice(2).split('**:');
        if (parts.length === 2) {
          return (
            <div key={index} className="mb-2">
              <span className="font-semibold text-gray-800">{parts[0].slice(2)}</span>
              <span className="text-gray-600">: {parts[1]}</span>
            </div>
          );
        }
      } else if (line.startsWith('- ')) {
        return <li key={index} className="text-gray-700 mb-1">{line.slice(2)}</li>;
      } else if (line.startsWith('• ')) {
        return <li key={index} className="text-gray-700 mb-1">{line.slice(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.trim() !== '') {
        return <p key={index} className="text-gray-700 mb-3 leading-relaxed">{line}</p>;
      }
      return null;
    }).filter(Boolean);

    return jsx;
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        
        {reading_details && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>Source: {reading_details.source}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Est. Time: {reading_details.estimated_time} minutes</span>
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              {reading_details.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
          </div>
        )}
      </div>

      {/* Key Points Section */}
      {reading_details?.key_points && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <button
            onClick={() => setShowKeyPoints(!showKeyPoints)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-blue-900">Key Learning Points</h3>
            {showKeyPoints ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showKeyPoints && (
            <ul className="mt-3 space-y-2">
              {reading_details.key_points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-blue-800">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Video Resources */}
      {reading_details?.youtube_videos && reading_details.youtube_videos.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Supplementary Video Resources</h3>
          <div className="grid gap-4">
            {reading_details.youtube_videos.map((video, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{video.title}</h4>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {video.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                  <button
                    onClick={() => setExpandedVideo(expandedVideo === video.videoId ? null : video.videoId)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {expandedVideo === video.videoId ? 'Hide Video' : 'Watch Video'}
                  </button>
                </div>
                {expandedVideo === video.videoId && (
                  <div className="aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(video.videoId)}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-lg max-w-none mb-8">
        {formatContent(content)}
      </div>

      {/* Further Reading */}
      {reading_details?.further_reading && reading_details.further_reading.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <button
            onClick={() => setShowFurtherReading(!showFurtherReading)}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <h3 className="text-lg font-semibold text-gray-800">Further Reading</h3>
            {showFurtherReading ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showFurtherReading && (
            <ul className="space-y-2">
              {reading_details.further_reading.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 