/**
 * Timeline playback hook with enhanced Tone.js and smplr integration
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChordProgressionAudioEngineSmplr } from '@/lib/chord-progression/audio-engine-smplr';
import { MusicalTimeTracker } from '@/lib/chord-progression/musical-time-tracker';
import { PlayheadAnimator, PlayheadState } from '@/lib/chord-progression/playhead-animator';
import { BeatCounter } from '@/lib/chord-progression/beat-counter';
import { ChordInstance, InstrumentType, PlaybackState } from '@/lib/chord-progression/types';

export function useTimelinePlayback(
  chords: ChordInstance[],
  bpm: number,
  pixelsPerBeat: number
) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    playbackPosition: 0,
    loopEnabled: true,
    loopStart: 0,
    loopEnd: 0,
  });

  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(80);
  const [midiEnabled, setMidiEnabled] = useState(true);
  const [audioOutputDevice, setAudioOutputDevice] = useState<string | undefined>(undefined);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

  const audioEngineRef = useRef<ChordProgressionAudioEngineSmplr | null>(null);
  const timeTrackerRef = useRef<MusicalTimeTracker | null>(null);
  const playheadAnimatorRef = useRef<PlayheadAnimator | null>(null);
  const beatCounterRef = useRef<BeatCounter | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  // Initialize audio context and components
  useEffect(() => {
    if (typeof window === 'undefined') return;

    contextRef.current = new AudioContext();
    timeTrackerRef.current = new MusicalTimeTracker({ numerator: 4, denominator: 4 });
    playheadAnimatorRef.current = new PlayheadAnimator(pixelsPerBeat, bpm);
    beatCounterRef.current = new BeatCounter(timeTrackerRef.current);
    audioEngineRef.current = new ChordProgressionAudioEngineSmplr(contextRef.current, {
      instrument: selectedInstrument,
    });

    // Load available audio output devices
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        setAvailableDevices(audioOutputs);

        // Set default device if available
        if (audioOutputs.length > 0 && !audioOutputDevice) {
          setAudioOutputDevice('default');
        }
      } catch (error) {
        console.error('Failed to enumerate audio devices:', error);
      }
    };

    loadDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
      playheadAnimatorRef.current?.stop();
      beatCounterRef.current?.stop();
      audioEngineRef.current?.dispose();
      contextRef.current?.close();
    };
  }, []);

  // Update playhead animator when zoom or BPM changes
  useEffect(() => {
    playheadAnimatorRef.current?.setPixelsPerBeat(pixelsPerBeat);
    playheadAnimatorRef.current?.setBPM(bpm);
    timeTrackerRef.current?.setBPM(bpm);
    audioEngineRef.current?.setBPM(bpm);
  }, [pixelsPerBeat, bpm]);

  // Subscribe to playhead updates
  useEffect(() => {
    if (!playheadAnimatorRef.current) return;

    const unsubscribe = playheadAnimatorRef.current.onUpdate((state: PlayheadState) => {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: state.beats,
        playbackPosition: state.position,
        isPlaying: state.isPlaying,
      }));
    });

    return unsubscribe;
  }, []);

  // Load progression when chords change
  useEffect(() => {
    if (!audioEngineRef.current || !chords || chords.length === 0) return;

    const validChords = chords.filter(chord =>
      chord && chord.notes && Array.isArray(chord.notes) && chord.notes.length > 0
    );

    if (validChords.length > 0) {
      setIsLoading(true);
      audioEngineRef.current.loadProgression(validChords, bpm)
        .then(() => setIsLoading(false))
        .catch(err => {
          console.error('Failed to load progression:', err);
          setIsLoading(false);
        });
    }
  }, [chords, bpm]);

  // Update instrument
  useEffect(() => {
    if (!audioEngineRef.current) return;

    setIsLoading(true);
    audioEngineRef.current.setInstrument(selectedInstrument)
      .then(() => setIsLoading(false))
      .catch(err => {
        console.error('Failed to change instrument:', err);
        setIsLoading(false);
      });
  }, [selectedInstrument]);

  // Update volume
  useEffect(() => {
    if (!audioEngineRef.current) return;
    audioEngineRef.current.setVolume(volume / 100);
  }, [volume]);

  // Update MIDI enabled state
  useEffect(() => {
    if (!audioEngineRef.current) return;
    audioEngineRef.current.setMuted(!midiEnabled);
  }, [midiEnabled]);

  // Update audio output device
  useEffect(() => {
    if (!audioEngineRef.current || !audioOutputDevice) return;

    audioEngineRef.current.setOutputDevice(audioOutputDevice)
      .catch(err => {
        console.error('Failed to set output device:', err);
      });
  }, [audioOutputDevice]);

  // Playback controls
  const play = useCallback(async () => {
    if (!audioEngineRef.current || !playheadAnimatorRef.current || !contextRef.current) return;

    const validChords = chords.filter(chord =>
      chord && chord.notes && Array.isArray(chord.notes) && chord.notes.length > 0
    );

    if (validChords.length === 0) {
      console.warn('No chords to play');
      return;
    }

    try {
      // Resume audio context (required for browser autoplay policy)
      await contextRef.current.resume();

      // Calculate end of last chord
      const totalBeats = validChords[validChords.length - 1].startTime + validChords[validChords.length - 1].duration;

      // Set max beats so playhead stops at end of last chord
      playheadAnimatorRef.current.setMaxBeats(totalBeats);

      // Start audio engine
      await audioEngineRef.current.play();

      // Start playhead animation
      playheadAnimatorRef.current.start();

      // Start beat counter
      beatCounterRef.current?.start(totalBeats);

      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Failed to start playback:', error);
      alert('Unable to start audio. Please try again.');
    }
  }, [chords]);

  const pause = useCallback(() => {
    audioEngineRef.current?.pause();
    playheadAnimatorRef.current?.stop();
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    audioEngineRef.current?.stop();
    playheadAnimatorRef.current?.stop();
    beatCounterRef.current?.stop();
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      playbackPosition: 0,
    }));
  }, []);

  const seek = useCallback((beats: number) => {
    audioEngineRef.current?.seek(beats);
    playheadAnimatorRef.current?.seekToPixels(beats * pixelsPerBeat);
    setPlaybackState(prev => ({
      ...prev,
      currentTime: beats,
      playbackPosition: beats * pixelsPerBeat,
    }));
  }, [pixelsPerBeat]);

  const replay = useCallback(async () => {
    stop();
    setTimeout(() => play(), 100);
  }, [stop, play]);

  const setBPM = useCallback((newBPM: number) => {
    audioEngineRef.current?.setBPM(newBPM);
    playheadAnimatorRef.current?.setBPM(newBPM);
    timeTrackerRef.current?.setBPM(newBPM);
  }, []);

  return {
    playbackState,
    selectedInstrument,
    setSelectedInstrument,
    volume,
    setVolume,
    midiEnabled,
    setMidiEnabled,
    audioOutputDevice,
    setAudioOutputDevice,
    availableDevices,
    isLoading,
    play,
    pause,
    stop,
    seek,
    replay,
    setBPM,
  };
}

