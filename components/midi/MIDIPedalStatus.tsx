'use client';

/**
 * MIDI Pedal Status Component
 * Displays MIDI pedal connection status in the AudioSidebar
 */

import React, { useState } from 'react';
import { Music2 } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { useMIDIPedal } from './MIDIContext';
import { countEnabledButtons } from '@/lib/midi/midiUtils';
import MIDIConfigModal from './MIDIConfigModal';

interface MIDIPedalStatusProps {
  theme: ThemeConfig;
}

export default function MIDIPedalStatus({ theme }: MIDIPedalStatusProps) {
  const { config, isConnected, selectedDevice } = useMIDIPedal();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const enabledButtonCount = countEnabledButtons(config);
  const deviceName = selectedDevice?.name || config.deviceName || 'No Device';
  const statusColor = isConnected ? '#4ade80' : '#ef4444'; // green-400 : red-500

  return (
    <>
      <div
        data-guide="midi-status"
        className="rounded-lg p-3"
        style={{
          background: theme.bgTertiary,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Music2 className="h-4 w-4" style={{ color: theme.textPrimary }} />
          <h3 className="text-sm font-bold" style={{ color: theme.textPrimary }}>
            MIDI Pedal
          </h3>
        </div>

        {/* Device Info - Compact Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2 text-xs">
          <div className="flex items-center justify-between col-span-2">
            <span style={{ color: theme.textSecondary }}>Device:</span>
            <span
              className="font-medium text-right ml-2 flex-1 truncate"
              style={{ color: theme.textPrimary }}
              title={deviceName}
            >
              {deviceName.length > 18 ? `${deviceName.substring(0, 18)}...` : deviceName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span style={{ color: theme.textSecondary }}>Buttons:</span>
            <span className="font-medium" style={{ color: theme.textPrimary }}>
              {enabledButtonCount}/{config.buttons.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span style={{ color: theme.textSecondary }}>Status:</span>
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: statusColor,
                  boxShadow: isConnected ? `0 0 3px ${statusColor}` : 'none',
                }}
              />
              <span className="font-medium text-xs" style={{ color: statusColor }}>
                {isConnected ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>

        {/* Configure Button - Compact */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full px-2 py-1.5 rounded text-xs font-medium transition-all hover:opacity-90"
          style={{
            background: '#22c55e', // green-500
            color: '#ffffff',
            border: 'none',
          }}
        >
          Configure
        </button>

        {/* Info Text - Only show when disconnected, more compact */}
        {!isConnected && (
          <p
            className="text-[10px] mt-1.5 text-center"
            style={{ color: theme.textSecondary }}
          >
            Connect MIDI pedal
          </p>
        )}
      </div>

      {/* Configuration Modal */}
      {isModalOpen && (
        <MIDIConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          theme={theme}
        />
      )}
    </>
  );
}

