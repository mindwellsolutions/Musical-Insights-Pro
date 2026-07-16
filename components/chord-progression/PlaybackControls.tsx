'use client';

/**
 * Playback controls component
 */

import { useState } from 'react';
import { InstrumentType } from '@/lib/chord-progression/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkipBack, Play, Pause, RotateCcw, Minus, Plus, Volume2, VolumeX, Speaker } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface PlaybackControlsProps {
  isPlaying: boolean;
  bpm: number;
  currentKey: string;
  selectedInstrument: InstrumentType;
  volume?: number;
  midiEnabled?: boolean;
  audioOutputDevice?: string;
  availableDevices?: MediaDeviceInfo[];
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onReplay: () => void;
  onBPMChange: (bpm: number) => void;
  onInstrumentChange: (instrument: InstrumentType) => void;
  onVolumeChange?: (volume: number) => void;
  onMidiToggle?: (enabled: boolean) => void;
  onAudioOutputChange?: (deviceId: string) => void;
}

export default function PlaybackControls({
  isPlaying,
  bpm,
  currentKey,
  selectedInstrument,
  volume = 80,
  midiEnabled = true,
  audioOutputDevice = 'default',
  availableDevices = [],
  onPlay,
  onPause,
  onStop,
  onReplay,
  onBPMChange,
  onInstrumentChange,
  onVolumeChange,
  onMidiToggle,
  onAudioOutputChange,
}: PlaybackControlsProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [showInstrumentSelector, setShowInstrumentSelector] = useState(false);

  const handleBPMChange = (delta: number) => {
    const newBPM = Math.max(60, Math.min(240, bpm + delta));
    onBPMChange(newBPM);
  };

  const handleVolumeChange = (value: number[]) => {
    if (onVolumeChange) {
      onVolumeChange(value[0]);
    }
  };

  return (
    <>
      <div className="h-12 border-t-2 border-[#2a2a2a] bg-gradient-to-b from-[#1a1a1a] to-[#141414] flex items-center px-4 shadow-lg gap-4">
        {/* Left Section - BPM Control */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-semibold text-[#b0b0b0]">BPM:</span>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 hover:border-[#3b82f6] border-2 border-transparent transition-all"
            onClick={() => handleBPMChange(-5)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            type="number"
            value={bpm}
            onChange={(e) => onBPMChange(parseInt(e.target.value) || 120)}
            className="w-20 h-7 text-center text-sm bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] border-2 border-[#3a3a3a] text-white font-bold focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
            min={60}
            max={240}
          />
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 hover:border-[#3b82f6] border-2 border-transparent transition-all"
            onClick={() => handleBPMChange(5)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {/* Center Section - Playback Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={onStop}
            title="Go to start"
            className="h-8 w-8 hover:border-[#3b82f6] transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
            className="w-10 h-10 bg-gradient-to-b from-[#3b82f6] to-[#2563eb] hover:from-[#60a5fa] hover:to-[#3b82f6] shadow-xl shadow-[#3b82f6]/30 hover:shadow-2xl hover:shadow-[#3b82f6]/40 hover:scale-105 transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onReplay}
            title="Replay from start"
            className="h-8 w-8 hover:border-[#3b82f6] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Right Section - Audio Controls */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* MIDI Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#b0b0b0]">MIDI:</span>
            <Switch
              checked={midiEnabled}
              onCheckedChange={onMidiToggle}
              className="data-[state=checked]:bg-[#3b82f6] scale-75"
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 min-w-[140px]">
            {midiEnabled ? (
              volume === 0 ? <VolumeX className="w-4 h-4 text-[#b0b0b0]" /> : <Volume2 className="w-4 h-4 text-[#b0b0b0]" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-600" />
            )}
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              disabled={!midiEnabled}
              className="w-24"
            />
            <span className="text-xs font-semibold text-[#b0b0b0] w-8">{volume}%</span>
          </div>

          {/* Instrument Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInstrumentSelector(true)}
              disabled={!midiEnabled}
              className="gap-1.5 font-semibold h-8 text-xs px-3"
            >
              <span className="text-base">
                {selectedInstrument === 'piano' ? '🎹' :
                 selectedInstrument === 'guitar' ? '🎸' :
                 selectedInstrument === 'strings' ? '🎻' :
                 selectedInstrument === 'brass' ? '🎺' : '🎹'}
              </span>
              <span className="capitalize">{selectedInstrument}</span>
            </Button>
          </div>

          {/* Key Display */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#b0b0b0]">Key:</span>
            <div className="px-3 py-1 rounded-lg bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] border-2 border-[#3a3a3a] text-xs font-bold shadow-md">
              {getNoteDisplayName(currentKey)} Major
            </div>
          </div>
        </div>
      </div>

      {/* Instrument Selector Dialog */}
      <Dialog open={showInstrumentSelector} onOpenChange={setShowInstrumentSelector}>
        <DialogContent className="bg-gradient-to-b from-[#1e1e1e] to-[#141414] border-2 border-[#3a3a3a] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Select Instrument</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {/* Piano */}
            <button
              onClick={() => {
                onInstrumentChange('piano');
                setShowInstrumentSelector(false);
              }}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
                ${selectedInstrument === 'piano'
                  ? 'border-[#3b82f6] bg-gradient-to-b from-[#3b82f6]/20 to-[#3b82f6]/10 shadow-lg shadow-[#3b82f6]/20'
                  : 'border-[#3a3a3a] bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] hover:border-[#3b82f6]/50 hover:shadow-md'
                }
              `}
            >
              <div className="text-5xl mb-3">🎹</div>
              <div className="font-bold text-lg text-white">Piano</div>
              <div className="text-sm text-[#b0b0b0] mt-1">Rich, warm sound</div>
            </button>

            {/* Guitar */}
            <button
              onClick={() => {
                onInstrumentChange('guitar');
                setShowInstrumentSelector(false);
              }}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
                ${selectedInstrument === 'guitar'
                  ? 'border-[#3b82f6] bg-gradient-to-b from-[#3b82f6]/20 to-[#3b82f6]/10 shadow-lg shadow-[#3b82f6]/20'
                  : 'border-[#3a3a3a] bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] hover:border-[#3b82f6]/50 hover:shadow-md'
                }
              `}
            >
              <div className="text-5xl mb-3">🎸</div>
              <div className="font-bold text-lg text-white">Guitar</div>
              <div className="text-sm text-[#b0b0b0] mt-1">Nylon strings</div>
            </button>

            {/* Strings */}
            <button
              onClick={() => {
                onInstrumentChange('strings');
                setShowInstrumentSelector(false);
              }}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
                ${selectedInstrument === 'strings'
                  ? 'border-[#3b82f6] bg-gradient-to-b from-[#3b82f6]/20 to-[#3b82f6]/10 shadow-lg shadow-[#3b82f6]/20'
                  : 'border-[#3a3a3a] bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] hover:border-[#3b82f6]/50 hover:shadow-md'
                }
              `}
            >
              <div className="text-5xl mb-3">🎻</div>
              <div className="font-bold text-lg text-white">Strings</div>
              <div className="text-sm text-[#b0b0b0] mt-1">Orchestral pad</div>
            </button>

            {/* Brass */}
            <button
              onClick={() => {
                onInstrumentChange('brass');
                setShowInstrumentSelector(false);
              }}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
                ${selectedInstrument === 'brass'
                  ? 'border-[#3b82f6] bg-gradient-to-b from-[#3b82f6]/20 to-[#3b82f6]/10 shadow-lg shadow-[#3b82f6]/20'
                  : 'border-[#3a3a3a] bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] hover:border-[#3b82f6]/50 hover:shadow-md'
                }
              `}
            >
              <div className="text-5xl mb-3">🎺</div>
              <div className="font-bold text-lg text-white">Brass</div>
              <div className="text-sm text-[#b0b0b0] mt-1">Bright trumpet</div>
            </button>

            {/* Synth */}
            <button
              onClick={() => {
                onInstrumentChange('synth');
                setShowInstrumentSelector(false);
              }}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
                ${selectedInstrument === 'synth'
                  ? 'border-[#3b82f6] bg-gradient-to-b from-[#3b82f6]/20 to-[#3b82f6]/10 shadow-lg shadow-[#3b82f6]/20'
                  : 'border-[#3a3a3a] bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] hover:border-[#3b82f6]/50 hover:shadow-md'
                }
              `}
            >
              <div className="text-5xl mb-3">🎹</div>
              <div className="font-bold text-lg text-white">Synth</div>
              <div className="text-sm text-[#b0b0b0] mt-1">Electronic pad</div>
            </button>
          </div>

          {/* Audio Output Device Selector */}
          <div className="border-t-2 border-[#3a3a3a] pt-6 mt-4">
            <div className="flex items-center gap-3 mb-3">
              <Speaker className="w-5 h-5 text-[#b0b0b0]" />
              <h3 className="text-lg font-semibold">Audio Output Device</h3>
            </div>
            <Select
              value={audioOutputDevice}
              onValueChange={onAudioOutputChange}
            >
              <SelectTrigger className="w-full bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] border-2 border-[#3a3a3a] text-white hover:bg-[#2a2a2a]">
                <SelectValue placeholder="Select audio output device" />
              </SelectTrigger>
              <SelectContent
                className="!z-[10000] bg-gradient-to-b from-[#1e1e1e] to-[#141414] border-2 border-[#3a3a3a]"
                position="popper"
                sideOffset={5}
              >
                <SelectItem
                  value="default"
                  className="text-white hover:bg-[#3b82f6]/20 focus:bg-[#3b82f6]/20 cursor-pointer"
                >
                  Default System Output
                </SelectItem>
                {availableDevices.map((device) => (
                  <SelectItem
                    key={device.deviceId}
                    value={device.deviceId}
                    className="text-white hover:bg-[#3b82f6]/20 focus:bg-[#3b82f6]/20 cursor-pointer"
                  >
                    {device.label || `Audio Output ${device.deviceId.slice(0, 8)}...`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#b0b0b0] mt-2">
              Select which speaker or audio device to play MIDI through
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

