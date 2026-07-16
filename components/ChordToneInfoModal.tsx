'use client';

import { X } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface ChordToneInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

export default function ChordToneInfoModal({ isOpen, onClose, theme }: ChordToneInfoModalProps) {
  if (!isOpen) return null;

  const chordToneInfo = [
    {
      name: 'Root',
      color: '#E85555',
      description: 'The root is the most stable and grounded—it\'s home base. Landing here feels conclusive, sometimes almost too safe if overused.',
    },
    {
      name: 'Third',
      color: '#F5BC3C',
      description: 'The third is arguably the most expressive chord tone because it defines the chord\'s quality (major or minor). Emphasizing the third makes your solo sound harmonically aware and emotionally connected.',
    },
    {
      name: 'Fifth',
      color: '#5DB572',
      description: 'The fifth is stable but neutral—it doesn\'t add much color, though it\'s a safe landing spot.',
    },
    {
      name: 'Seventh',
      color: '#A07ED4',
      description: 'The seventh adds sophistication and a bit of tension that wants to resolve. It\'s particularly effective in jazz and blues contexts.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{
          background: theme.bgSecondary,
          border: `2px solid ${theme.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ 
            borderColor: theme.border,
            background: `linear-gradient(135deg, ${theme.bgTertiary} 0%, ${theme.bgSecondary} 100%)`,
          }}
        >
          <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            The Hierarchy of Chord Tones
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-70 transition-all hover:scale-110"
            style={{ color: theme.textSecondary }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          <p className="text-base mb-6 leading-relaxed" style={{ color: theme.textSecondary }}>
            Not all chord tones are equal in terms of their effect:
          </p>

          <div className="space-y-5">
            {chordToneInfo.map((tone, index) => (
              <div
                key={tone.name}
                className="rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: theme.bgTertiary,
                  border: `2px solid ${tone.color}`,
                  boxShadow: `0 4px 20px ${tone.color}33`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Color indicator */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                    style={{
                      background: tone.color,
                      boxShadow: `0 0 20px ${tone.color}66`,
                    }}
                  >
                    {index + 1}
                  </div>
                  
                  {/* Tone name */}
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: tone.color }}
                  >
                    {tone.name}
                  </h3>
                </div>

                {/* Description */}
                <p 
                  className="text-base leading-relaxed pl-11"
                  style={{ color: theme.textPrimary }}
                >
                  {tone.description}
                </p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div
            className="mt-6 p-4 rounded-lg"
            style={{
              background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
              💡 <strong style={{ color: theme.textPrimary }}>Tip:</strong> Enable the "Color Guide" toggle to see these colors on the fretboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

