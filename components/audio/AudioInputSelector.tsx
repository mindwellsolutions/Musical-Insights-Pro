'use client';

/**
 * Audio Input Selector Component
 * Allows users to select audio input device and start/stop key detection
 */

import React, { useState, useEffect } from 'react';
import { AudioDevice } from '@/lib/audio/audioDeviceManager';
import { Theme } from '@/lib/themes';

interface AudioInputSelectorProps {
  devices: AudioDevice[];
  selectedDeviceId: string | null;
  isDetecting: boolean;
  bufferDuration: number;
  onDeviceSelect: (deviceId: string) => void;
  onStartDetection: () => void;
  onStopDetection: () => void;
  onRefreshDevices: () => void;
  onBufferDurationChange: (duration: number) => void;
  theme: Theme;
}

export default function AudioInputSelector({
  devices,
  selectedDeviceId,
  isDetecting,
  bufferDuration,
  onDeviceSelect,
  onStartDetection,
  onStopDetection,
  onRefreshDevices,
  onBufferDurationChange,
  theme,
}: AudioInputSelectorProps) {
  const isDark = theme === 'dark';

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    border: `2px solid ${isDark ? '#333' : '#e0e0e0'}`,
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '16px',
  };

  const titleStyle: React.CSSProperties = {
    color: isDark ? '#ffffff' : '#000000',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 12px',
    backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
    color: isDark ? '#ffffff' : '#000000',
    border: `1px solid ${isDark ? '#444' : '#ccc'}`,
    borderRadius: '6px',
    fontSize: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginRight: '8px',
  };

  const startButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: isDetecting ? '#dc3545' : '#28a745',
    color: '#ffffff',
  };

  const refreshButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: isDark ? '#444' : '#e0e0e0',
    color: isDark ? '#ffffff' : '#000000',
  };

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    fontSize: '12px',
    color: isDark ? '#aaa' : '#666',
  };

  const statusDotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isDetecting ? '#28a745' : '#dc3545',
    animation: isDetecting ? 'pulse 2s infinite' : 'none',
  };
  
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>🎤</span>
          <span>Audio Input</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={statusDotStyle}></div>
          <span style={{ fontSize: '11px', color: isDark ? '#aaa' : '#666' }}>
            {isDetecting ? 'Detecting...' : 'Stopped'}
          </span>
        </div>
      </div>
      
      <select
        style={selectStyle}
        value={selectedDeviceId || ''}
        onChange={(e) => onDeviceSelect(e.target.value)}
        disabled={isDetecting}
      >
        <option value="">Select audio input device...</option>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <button
          style={startButtonStyle}
          onClick={isDetecting ? onStopDetection : onStartDetection}
          disabled={!selectedDeviceId && !isDetecting}
        >
          {isDetecting ? 'Stop' : 'Start'}
        </button>

        <button
          style={refreshButtonStyle}
          onClick={onRefreshDevices}
          disabled={isDetecting}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', color: isDark ? '#aaa' : '#666', whiteSpace: 'nowrap' }}>
          Buffer Duration:
        </label>
        <input
          type="number"
          min="2"
          max="30"
          step="1"
          value={bufferDuration}
          onChange={(e) => onBufferDurationChange(Number(e.target.value))}
          disabled={isDetecting}
          style={{
            width: '60px',
            padding: '6px',
            backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
            color: isDark ? '#ffffff' : '#000000',
            border: `1px solid ${isDark ? '#444' : '#ccc'}`,
            borderRadius: '6px',
            fontSize: '12px',
            textAlign: 'center',
          }}
        />
        <span style={{ fontSize: '12px', color: isDark ? '#aaa' : '#666' }}>seconds</span>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

