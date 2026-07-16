/**
 * Note-a-Day Training Method
 * Focus on one note at a time across the entire fretboard
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { NOTE_A_DAY_CYCLE, NOTE_COLORS } from '@/lib/fretboard-learning/constants';
import { getAllPositionsOfNote } from '@/lib/fretboard-learning/utils';
import TrainingControlBar from '@/components/fretboard-learning/TrainingControlBar';
import FeedbackOverlay from '@/components/fretboard-learning/FeedbackOverlay';
import SessionSummaryModal from '@/components/fretboard-learning/SessionSummaryModal';
import { FeedbackEvent, SessionStats } from '@/lib/fretboard-learning/types';
import { DifficultyLevel } from '@/lib/fretboard-learning/constants';
import Fretboard from '@/components/Fretboard';
import { NotePosition, NOTES, TUNINGS } from '@/lib/musicTheory';
import { themes } from '@/lib/themes';

type Phase = 'discovery' | 'guided' | 'speed' | 'recall';

export default function NoteADayPage() {
  const router = useRouter();

  // Training state
  const [currentNote, setCurrentNote] = useState<string>('C');
  const [currentPhase, setCurrentPhase] = useState<Phase>('discovery');
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [showHints, setShowHints] = useState(true);

  // Phase-specific state
  const [currentStringIndex, setCurrentStringIndex] = useState(0); // For guided practice
  const [discoveryProgress, setDiscoveryProgress] = useState(0); // For discovery animation
  const [speedQuestionPosition, setSpeedQuestionPosition] = useState<{string: number; fret: number} | null>(null);
  const [speedIsTarget, setSpeedIsTarget] = useState(false);
  const [recallFoundPositions, setRecallFoundPositions] = useState<Set<string>>(new Set());
  const [recallTimeLeft, setRecallTimeLeft] = useState(60);

  // Session tracking
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackEvent | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Fretboard settings
  const tuning = TUNINGS[6]['Standard'];
  const theme = themes.dark;

  // Get all positions of the current note on the fretboard (like Individual Notes mode)
  const notePositions = useMemo((): NotePosition[] => {
    const positions: NotePosition[] = [];
    const targetNoteIndex = NOTES.indexOf(currentNote);

    // Find all positions of the target note across all strings and frets
    tuning.forEach((openNote, stringIndex) => {
      const openNoteIndex = NOTES.indexOf(openNote);

      for (let fret = 0; fret <= 24; fret++) {
        const noteIndex = (openNoteIndex + fret) % 12;

        if (noteIndex === targetNoteIndex) {
          positions.push({
            stringIndex,
            fretNumber: fret,
            note: currentNote,
            isRoot: true, // All instances are the target note
          });
        }
      }
    });

    return positions;
  }, [currentNote, tuning]);

  // Load compatible scales when note changes
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setScore(0);
    setStreak(0);
    setCurrentPhase('discovery');
  };

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
  };

  const handleToggleHints = () => {
    setShowHints(!showHints);
  };

  const handleNoteChange = (note: string) => {
    setCurrentNote(note);
    setCurrentPhase('discovery');
    setScore(0);
    setStreak(0);
  };

  const handlePhaseChange = (phase: Phase) => {
    setCurrentPhase(phase);
    // Reset phase-specific state
    setCurrentStringIndex(0);
    setDiscoveryProgress(0);
    setSpeedQuestionPosition(null);
    setRecallFoundPositions(new Set());
    setRecallTimeLeft(60);

    // Initialize Speed Drill
    if (phase === 'speed') {
      setTimeout(() => generateSpeedQuestion(), 500);
    }
  };

  // Discovery Phase: Cascade animation
  useEffect(() => {
    if (currentPhase === 'discovery' && isPlaying) {
      const interval = setInterval(() => {
        setDiscoveryProgress((prev) => {
          if (prev >= notePositions.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 500); // 500ms delay between each note reveal
      return () => clearInterval(interval);
    }
  }, [currentPhase, isPlaying, notePositions.length]);

  // Guided Practice: Handle fretboard clicks
  const handleGuidedPracticeClick = (stringIndex: number, fretNumber: number) => {
    const targetNote = NOTES[(NOTES.indexOf(tuning[stringIndex]) + fretNumber) % 12];

    if (targetNote === currentNote) {
      // Correct!
      setFeedback({ type: 'correct', message: `Correct! ${currentNote} on string ${stringIndex + 1}` });
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);

      // Move to next string
      if (currentStringIndex < 5) {
        setTimeout(() => {
          setCurrentStringIndex((prev) => prev + 1);
          setFeedback(null);
        }, 1000);
      } else {
        // Completed all strings
        setTimeout(() => {
          setFeedback({ type: 'success', message: 'All strings completed! Moving to Speed Drill...' });
          setTimeout(() => {
            handlePhaseChange('speed');
            setFeedback(null);
          }, 2000);
        }, 1000);
      }
    } else {
      // Incorrect
      setFeedback({ type: 'incorrect', message: `Incorrect. That's ${targetNote}. Try again!` });
      setStreak(0);
    }
  };

  // Speed Drill: Generate random question
  const generateSpeedQuestion = () => {
    const randomString = Math.floor(Math.random() * 6);
    const randomFret = Math.floor(Math.random() * (difficulty === 'Easy' ? 13 : difficulty === 'Medium' ? 18 : 23));
    const noteAtPosition = NOTES[(NOTES.indexOf(tuning[randomString]) + randomFret) % 12];

    setSpeedQuestionPosition({ string: randomString, fret: randomFret });
    setSpeedIsTarget(noteAtPosition === currentNote);
  };

  const handleSpeedAnswer = (answer: boolean) => {
    if (answer === speedIsTarget) {
      setFeedback({ type: 'correct', message: 'Correct!' });
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setFeedback({ type: 'incorrect', message: 'Incorrect!' });
      setStreak(0);
    }

    setTimeout(() => {
      generateSpeedQuestion();
      setFeedback(null);
    }, 1000);
  };

  // Recall Phase: Handle fretboard clicks
  const handleRecallClick = (stringIndex: number, fretNumber: number) => {
    const positionKey = `${stringIndex}-${fretNumber}`;
    const targetNote = NOTES[(NOTES.indexOf(tuning[stringIndex]) + fretNumber) % 12];

    if (targetNote === currentNote) {
      if (!recallFoundPositions.has(positionKey)) {
        setRecallFoundPositions((prev) => new Set(prev).add(positionKey));
        setFeedback({ type: 'correct', message: `Found ${currentNote}!` });
        setScore((prev) => prev + 1);
        setTimeout(() => setFeedback(null), 500);
      }
    } else {
      setFeedback({ type: 'incorrect', message: `That's ${targetNote}, not ${currentNote}` });
      setTimeout(() => setFeedback(null), 800);
    }
  };

  // Recall Phase: Timer
  useEffect(() => {
    if (currentPhase === 'recall' && isPlaying && recallTimeLeft > 0) {
      const interval = setInterval(() => {
        setRecallTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            handleEndSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPhase, isPlaying, recallTimeLeft]);

  // Handle fretboard clicks based on current phase
  const handleFretboardClick = (stringIndex: number, fretNumber: number) => {
    if (!isPlaying) return;

    switch (currentPhase) {
      case 'guided':
        if (stringIndex === currentStringIndex) {
          handleGuidedPracticeClick(stringIndex, fretNumber);
        }
        break;
      case 'recall':
        handleRecallClick(stringIndex, fretNumber);
        break;
      default:
        break;
    }
  };

  const handleEndSession = () => {
    setIsPlaying(false);
    const stats: SessionStats = {
      methodId: 'note-a-day',
      startTime: Date.now() - elapsedTime * 1000,
      endTime: Date.now(),
      questionsAttempted: score + 10, // Placeholder
      correctAnswers: score,
      incorrectAnswers: 10,
      hintsUsed: showHints ? 5 : 0,
      currentStreak: streak,
      longestStreak: streak,
      averageResponseTime: 2500,
      weakNotes: [],
    };
    setSessionStats(stats);
    setShowSummary(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#111111]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Note-a-Day Training</h1>
              <p className="text-sm text-gray-400">Master one note at a time</p>
            </div>
            <button
              onClick={() => router.push('/learn/fretboard')}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <TrainingControlBar
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        elapsedTime={elapsedTime}
        score={score}
        streak={streak}
        showHints={showHints}
        onToggleHints={handleToggleHints}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Note Selector */}
        <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-4">
          <h3 className="text-lg font-bold mb-4">12-Day Cycle</h3>
          <div className="space-y-2">
            {NOTE_A_DAY_CYCLE.map((note, index) => (
              <button
                key={note}
                onClick={() => handleNoteChange(note)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  currentNote === note
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: NOTE_COLORS[note] }}
                    />
                    <span className="font-semibold">Day {index + 1}: {note}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Training Area with Fretboard */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Phase Selector */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
              <div className="flex gap-2">
                {[
                  { id: 'discovery', label: 'Discovery', desc: '2 min' },
                  { id: 'guided', label: 'Guided Practice', desc: '3 min' },
                  { id: 'speed', label: 'Speed Drill', desc: '3 min' },
                  { id: 'recall', label: 'Full Recall', desc: '2 min' },
                ].map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => handlePhaseChange(phase.id as Phase)}
                    className={`flex-1 p-3 rounded-lg transition-all ${
                      currentPhase === phase.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-semibold">{phase.label}</div>
                    <div className="text-xs opacity-75">{phase.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Phase-Specific Instructions */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
              {currentPhase === 'discovery' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Phase 1: Discovery</h3>
                  <p className="text-gray-400">
                    Observe all positions of <span style={{ color: NOTE_COLORS[currentNote] }}>{currentNote}</span> on the fretboard.
                    Notice the diagonal pattern. Press Play to see them cascade in.
                  </p>
                </div>
              )}
              {currentPhase === 'guided' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Phase 2: Guided Practice</h3>
                  <p className="text-gray-400">
                    Find <span style={{ color: NOTE_COLORS[currentNote] }}>{currentNote}</span> on each string, one at a time.
                    Currently finding on: <span className="font-bold">String {currentStringIndex + 1}</span>
                  </p>
                </div>
              )}
              {currentPhase === 'speed' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Phase 3: Speed Drill</h3>
                  <p className="text-gray-400">
                    Is the highlighted position <span style={{ color: NOTE_COLORS[currentNote] }}>{currentNote}</span>?
                    Answer Yes or No as fast as you can!
                  </p>
                </div>
              )}
              {currentPhase === 'recall' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Phase 4: Full Recall</h3>
                  <p className="text-gray-400">
                    Tap every <span style={{ color: NOTE_COLORS[currentNote] }}>{currentNote}</span> you can find in {recallTimeLeft} seconds!
                    Found: {recallFoundPositions.size} / {notePositions.length}
                  </p>
                </div>
              )}
            </div>

            {/* Fretboard Section */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">
                Current Note: <span style={{ color: NOTE_COLORS[currentNote] }}>{currentNote}</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Found in {notePositions.length} positions on the fretboard
              </p>

              {/* Fretboard Component */}
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <Fretboard
                  notePositions={notePositions}
                  tuning={tuning}
                  stringCount={6}
                  theme={theme}
                />
              </div>

              {/* Speed Drill Answer Buttons */}
              {currentPhase === 'speed' && isPlaying && (
                <div className="mt-6 flex gap-4 justify-center">
                  <button
                    onClick={() => handleSpeedAnswer(true)}
                    className="px-8 py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-lg transition-all"
                  >
                    ✓ Yes — That's {currentNote}
                  </button>
                  <button
                    onClick={() => handleSpeedAnswer(false)}
                    className="px-8 py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-lg transition-all"
                  >
                    ✗ No — That's not {currentNote}
                  </button>
                </div>
              )}
            </div>
            {/* Recall Phase Results */}
            {currentPhase === 'recall' && !isPlaying && recallTimeLeft === 0 && (
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Recall Results</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {recallFoundPositions.size} / {notePositions.length}
                  </div>
                  <div className="text-gray-400 mb-4">
                    {Math.round((recallFoundPositions.size / notePositions.length) * 100)}% Accuracy
                  </div>
                  <button
                    onClick={() => handlePhaseChange('discovery')}
                    className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Overlay */}
      <FeedbackOverlay feedback={feedback} onComplete={() => setFeedback(null)} />

      {/* Session Summary Modal */}
      <SessionSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        stats={sessionStats}
        onContinue={() => {
          setShowSummary(false);
          handleReset();
        }}
      />
    </div>
  );
}
