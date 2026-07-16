'use client';

/**
 * Fixed track sidebar with track headers and controls
 * Displays track names, icons, and Add/Mute/Solo buttons
 */

import { Music, Music2, Plus, Sparkles, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface Track {
  id: string;
  name: string;
  type: 'chord' | 'scale';
  isMuted: boolean;
  isSolo: boolean;
}

interface TrackSidebarProps {
  tracks: Track[];
  onAddClick: (trackId: string) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
  onAIInsightsClick?: (trackId: string) => void;
  currentKey?: string;
  onKeyChange?: () => void;
  isTimelineCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function TrackSidebar({
  tracks,
  onAddClick,
  onMuteToggle,
  onSoloToggle,
  onAIInsightsClick,
  currentKey,
  onKeyChange,
  isTimelineCollapsed = false,
  onToggleCollapse,
}: TrackSidebarProps) {
  const { getNoteDisplayName } = useNoteDisplay();

  return (
    <div className="w-[200px] flex-shrink-0 bg-[#0f0f0f] border-r border-[#2a2a2a] flex flex-col">
      {/* Spacer for time ruler with Collapse button and Change Key button */}
      <div className="h-6 border-b border-[#2a2a2a] bg-gradient-to-b from-[#0f0f0f] to-[#141414] flex items-center justify-center px-2 gap-2">
        {/* Collapse Button */}
        {onToggleCollapse && (
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-[#2a2a2a] transition-all flex-shrink-0"
            title={isTimelineCollapsed ? "Expand Timeline" : "Collapse Timeline"}
          >
            <ChevronUp className={`w-3 h-3 transition-transform ${isTimelineCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        )}

        {/* Change Key Button */}
        {currentKey && onKeyChange && (
          <Button
            onClick={onKeyChange}
            variant="outline"
            size="sm"
            className="flex-1 h-5 font-semibold border text-[9px] px-1 leading-none"
            style={{
              borderColor: NOTE_COLORS[currentKey] || '#3a3a3a',
              backgroundColor: `${NOTE_COLORS[currentKey] || '#3a3a3a'}15`,
              color: NOTE_COLORS[currentKey] || '#ffffff',
            }}
          >
            <span className="opacity-80 mr-0.5">Key:</span>
            {getNoteDisplayName(currentKey)}
          </Button>
        )}
      </div>
      
      {tracks.map((track) => (
        <div
          key={track.id}
          className="h-[88px] border-b border-[#2a2a2a] px-3 py-2 flex flex-col gap-2 justify-start bg-gradient-to-br from-[#141414] to-[#1a1a1a]"
        >
          {/* Track Name with AI Insights Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {track.type === 'chord' ? (
                <Music className="w-4 h-4 text-[#3b82f6]" />
              ) : (
                <Music2 className="w-4 h-4 text-[#8b5cf6]" />
              )}
              <span className="text-sm font-medium text-white">{track.name}</span>
            </div>

            {/* AI Insights Button */}
            {onAIInsightsClick && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#2a2a2a] transition-all duration-200"
                onClick={() => onAIInsightsClick(track.id)}
                title="AI Insights"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
              </Button>
            )}
          </div>

          {/* Track Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 bg-[#1e1e1e] border-[#3a3a3a] hover:bg-[#2a2a2a] hover:border-[#3b82f6] transition-all duration-200"
              onClick={() => onAddClick(track.id)}
              title="Add chord/scale"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`h-7 w-7 p-0 border-[#3a3a3a] transition-all duration-200 ${
                track.isMuted
                  ? 'bg-[#3b82f6] border-[#60a5fa] shadow-[0_0_12px_rgba(59,130,246,0.4)] text-white'
                  : 'bg-[#1e1e1e] hover:bg-[#2a2a2a] hover:border-[#3b82f6]'
              }`}
              onClick={() => onMuteToggle(track.id)}
              title="Mute track"
            >
              <span className="text-xs font-bold">M</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={`h-7 w-7 p-0 border-[#3a3a3a] transition-all duration-200 ${
                track.isSolo
                  ? 'bg-[#f59e0b] border-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.4)] text-white'
                  : 'bg-[#1e1e1e] hover:bg-[#2a2a2a] hover:border-[#f59e0b]'
              }`}
              onClick={() => onSoloToggle(track.id)}
              title="Solo track"
            >
              <span className="text-xs font-bold">S</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

