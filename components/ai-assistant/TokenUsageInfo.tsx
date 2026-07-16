'use client';

import { X } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { TokenUsage } from '@/lib/ai-assistant/types';

interface TokenUsageInfoProps {
  usage: TokenUsage;
  theme: ThemeConfig;
  onClose: () => void;
}

export default function TokenUsageInfo({ usage, theme, onClose }: TokenUsageInfoProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md rounded-lg shadow-2xl z-50 p-6"
        style={{ background: theme.bgSecondary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
            API Usage Information
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-10 hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: theme.textPrimary }} />
          </button>
        </div>

        {/* Usage Details */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ background: theme.bgTertiary }}>
            <div className="space-y-3">
              {/* Prompt Tokens */}
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: theme.textSecondary }}>
                  Input Tokens:
                </span>
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {usage.promptTokens.toLocaleString()}
                </span>
              </div>

              {/* Completion Tokens */}
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: theme.textSecondary }}>
                  Output Tokens:
                </span>
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {usage.completionTokens.toLocaleString()}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t" style={{ borderColor: theme.border }} />

              {/* Total Tokens */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  Total Tokens:
                </span>
                <span className="text-sm font-bold" style={{ color: theme.accentPrimary }}>
                  {usage.totalTokens.toLocaleString()}
                </span>
              </div>

              {/* Estimated Cost */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  Estimated Cost:
                </span>
                <span className="text-lg font-bold" style={{ color: theme.accentPrimary }}>
                  ${usage.estimatedCost.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <div className="text-xs" style={{ color: theme.textSecondary }}>
            <p className="mb-2">
              <strong>Model:</strong> GPT-4o-mini
            </p>
            <p className="mb-2">
              <strong>Pricing:</strong> $0.150 per 1M input tokens, $0.600 per 1M output tokens
            </p>
            <p>
              This shows the token usage and estimated cost for the last AI response only.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg font-medium transition-all"
            style={{
              background: theme.accentPrimary,
              color: '#ffffff',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

