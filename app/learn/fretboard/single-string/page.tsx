/**
 * Single-String Chromatic Training Method
 * Master notes on one string at a time
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CHROMATIC_SCALE, NOTE_COLORS, OPEN_STRINGS, NATURAL_NOTES } from '@/lib/fretboard-learning/constants';
import { getNoteAtPosition } from '@/lib/fretboard-learning/utils';
import TrainingControlBar from '@/components/fretboard-learning/TrainingControlBar';
import FeedbackOverlay from '@/components/fretboard-learning/FeedbackOverlay';
import SessionSummaryModal from '@/components/fretboard-learning/SessionSummaryModal';
import { FeedbackEvent, SessionStats } from '@/lib/fretboard-learning/types';
import { DifficultyLevel } from '@/lib/fretboard-learning/constants';
import Fretboard from '@/components/Fretboard';
import { NotePosition, NOTES, TUNINGS } from '@/lib/musicTheory';
import { themes } from '@/lib/themes';

type Phase = 'learn' | 'practice' | 'quiz';

const STRING_NAMES = ['High E (1st)', 'B (2nd)', 'G (3rd)', 'D (4th)', 'A (5th)', 'Low E (6th)'];

export default function SingleStringPage() {
  const router = useRouter();
  
  // Training state
  const [currentString, setCurrentString] = useState<number>(1); // 1-6
  const [currentPhase, setCurrentPhase] = useState<Phase>('learn');
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [showHints, setShowHints] = useState(true);
  const [fretRange, setFretRange] = useState<[number, number]>([0, 12]);
  const [showNaturalOnly, setShowNaturalOnly] = useState(false);

  // Phase-specific state
  const [currentFretIndex, setCurrentFretIndex] = useState(0);
  const [quizFret, setQuizFret] = useState<number | null>(null);
  const [quizTimeLeft, setQuizTimeLeft] = useState(30);
  const [practiceProgress, setPracticeProgress] = useState(0);

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

  // Get notes on current string
  const notesOnString = useMemo(() => {
    const notes: Array<{ fret: number; note: string }> = [];
    // Convert from guitar string numbering (1=high E, 6=low E) to array index (0=low E, 5=high E)
    const stringIndex = 6 - currentString;

    for (let fret = fretRange[0]; fret <= fretRange[1]; fret++) {
      const note = NOTES[(NOTES.indexOf(tuning[stringIndex]) + fret) % 12];

      // Filter for natural notes only if enabled
      if (!showNaturalOnly || NATURAL_NOTES.includes(note)) {
        notes.push({ fret, note });
      }
    }
    return notes;
  }, [currentString, fretRange, showNaturalOnly, tuning]);

  // Calculate note positions for fretboard visualization
  const notePositions = useMemo(() => {
    const positions: NotePosition[] = [];
    // Convert from guitar string numbering (1=high E, 6=low E) to array index (0=low E, 5=high E)
    const stringIndex = 6 - currentString;

    notesOnString.forEach(({ fret, note }) => {
      positions.push({
        stringIndex: stringIndex,
        fretNumber: fret,
        note: note,
        isRoot: fret === 0,
      });
    });

    return positions;
  }, [notesOnString, currentString]);

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
    setCurrentPhase('learn');
  };

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    // Adjust fret range based on difficulty
    if (newDifficulty === 'Easy') {
      setFretRange([0, 12]);
    } else if (newDifficulty === 'Medium') {
      setFretRange([0, 17]);
    } else {
      setFretRange([0, 22]);
    }
  };

  const handleToggleHints = () => {
    setShowHints(!showHints);
  };

  const handleStringChange = (stringNum: number) => {
    setCurrentString(stringNum);
    setCurrentPhase('learn');
    setCurrentFretIndex(0);
    setPracticeProgress(0);
    setScore(0);
    setStreak(0);
  };

  const handlePhaseChange = (phase: Phase) => {
    setCurrentPhase(phase);
    setCurrentFretIndex(0);
    setPracticeProgress(0);
    setQuizFret(null);
    setQuizTimeLeft(30);

    if (phase === 'quiz') {
      setTimeout(() => generateQuizQuestion(), 500);
    }
  };

  // Practice Phase: Fill in the blanks
  const handlePracticeClick = (stringIndex: number, fretNumber: number) => {
    const expectedStringIndex = 6 - currentString;
    if (stringIndex !== expectedStringIndex) return;

    const expectedNote = notesOnString[currentFretIndex];
    if (!expectedNote) return;

    if (fretNumber === expectedNote.fret) {
      setFeedback({ type: 'correct', message: `Correct! ${expectedNote.note} at fret ${expectedNote.fret}` });
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setPracticeProgress((prev) => prev + 1);

      setTimeout(() => {
        if (currentFretIndex < notesOnString.length - 1) {
          setCurrentFretIndex((prev) => prev + 1);
        } else {
          setFeedback({ type: 'success', message: 'String completed! Moving to quiz...' });
          setTimeout(() => handlePhaseChange('quiz'), 2000);
        }
        setFeedback(null);
      }, 1000);
    } else {
      const clickedNote = NOTES[(NOTES.indexOf(tuning[stringIndex]) + fretNumber) % 12];
      setFeedback({ type: 'incorrect', message: `Incorrect. That's ${clickedNote}. Try again!` });
      setStreak(0);
    }
  };

  // Quiz Phase: Generate random question
  const generateQuizQuestion = () => {
    if (notesOnString.length === 0) return;
    const randomIndex = Math.floor(Math.random() * notesOnString.length);
    setQuizFret(notesOnString[randomIndex].fret);
  };

  // Quiz Phase: Handle answer
  const handleQuizAnswer = (stringIndex: number, fretNumber: number) => {
    const expectedStringIndex = 6 - currentString;
    if (stringIndex !== expectedStringIndex || quizFret === null) return;

    if (fretNumber === quizFret) {
      const note = notesOnString.find(n => n.fret === quizFret)?.note || '';
      setFeedback({ type: 'correct', message: `Correct! ${note}` });
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);

      setTimeout(() => {
        generateQuizQuestion();
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: 'incorrect', message: 'Incorrect. Try again!' });
      setStreak(0);
    }
  };

  // Quiz Timer
  useEffect(() => {
    if (currentPhase === 'quiz' && isPlaying && quizTimeLeft > 0) {
      const interval = setInterval(() => {
        setQuizTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPhase, isPlaying, quizTimeLeft]);

  // Handle fretboard clicks
  const handleFretboardClick = (stringIndex: number, fretNumber: number) => {
    if (!isPlaying) return;

    switch (currentPhase) {
      case 'practice':
        handlePracticeClick(stringIndex, fretNumber);
        break;
      case 'quiz':
        handleQuizAnswer(stringIndex, fretNumber);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#111111]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Single-String Chromatic</h1>
              <p className="text-sm text-gray-400">Master notes one string at a time</p>
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
        {/* Left Sidebar - String Selector */}
        <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-4">
          <h3 className="text-lg font-bold mb-4">Select String</h3>
          <div className="space-y-2">
            {STRING_NAMES.map((name, index) => {
              const stringNum = index + 1;
              const openNote = OPEN_STRINGS[6 - stringNum];
              return (
                <button
                  key={stringNum}
                  onClick={() => handleStringChange(stringNum)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    currentString === stringNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{name}</div>
                      <div className="text-xs opacity-70">Open: {openNote}</div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: NOTE_COLORS[openNote] }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Phase Selector */}
          <div className="mt-6">
            <h3 className="text-sm font-bold mb-2 text-gray-400">Training Phase</h3>
            <div className="space-y-1">
              {(['learn', 'practice', 'quiz'] as Phase[]).map((phase) => (
                <button
                  key={phase}
                  onClick={() => handlePhaseChange(phase)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                    currentPhase === phase
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Natural Notes Toggle */}
          <div className="mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showNaturalOnly}
                onChange={(e) => setShowNaturalOnly(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-400">Natural Notes Only</span>
            </label>
          </div>
        </div>

        {/* Center - Training Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Phase Instructions */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
              {currentPhase === 'learn' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Chromatic Walkthrough (Learn)</h3>
                  <p className="text-gray-400">
                    Study all notes on <span className="font-bold">{STRING_NAMES[currentString - 1]}</span> from fret {fretRange[0]} to {fretRange[1]}.
                    {showNaturalOnly && <span className="text-yellow-400 ml-2">Showing natural notes only (no sharps/flats)</span>}
                  </p>
                </div>
              )}
              {currentPhase === 'practice' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Fill in the Blanks (Practice)</h3>
                  <p className="text-gray-400">
                    Find each note in sequence. Current target:
                    {notesOnString[currentFretIndex] && (
                      <span className="font-bold ml-2" style={{ color: NOTE_COLORS[notesOnString[currentFretIndex].note] }}>
                        {notesOnString[currentFretIndex].note} at fret {notesOnString[currentFretIndex].fret}
                      </span>
                    )}
                    <br />
                    <span className="text-sm">Progress: {practiceProgress} / {notesOnString.length}</span>
                  </p>
                </div>
              )}
              {currentPhase === 'quiz' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Speed Naming (Quiz)</h3>
                  <p className="text-gray-400">
                    Name the highlighted note as fast as you can! Time left: <span className="font-bold">{quizTimeLeft}s</span>
                    {quizFret !== null && (
                      <span className="block mt-2">
                        What note is at fret <span className="font-bold">{quizFret}</span>?
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* String Info */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">{STRING_NAMES[currentString - 1]}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Open Note</div>
                  <div className="text-lg font-bold">{OPEN_STRINGS[6 - currentString]}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Fret Range</div>
                  <div className="text-lg font-bold">{fretRange[0]}-{fretRange[1]}</div>
                </div>
              </div>
            </div>

            {/* Notes Preview - Only in Learn phase */}
            {currentPhase === 'learn' && (
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                <h3 className="text-sm font-bold mb-3 text-gray-400">Notes on this string:</h3>
                <div className="flex flex-wrap gap-2">
                  {notesOnString.map(({ fret, note }) => (
                    <div
                      key={fret}
                      className="px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: NOTE_COLORS[note] + '40',
                        border: `2px solid ${NOTE_COLORS[note]}`,
                      }}
                    >
                      <div className="text-xs text-gray-400">Fret {fret}</div>
                      <div className="font-bold" style={{ color: NOTE_COLORS[note] }}>
                        {note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Fretboard */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-bold mb-4">Fretboard</h3>
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <Fretboard
                  notePositions={notePositions}
                  tuning={tuning}
                  stringCount={6}
                  theme={theme}
                />
              </div>
            </div>

            {/* Quiz Results */}
            {currentPhase === 'quiz' && !isPlaying && quizTimeLeft === 0 && (
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-4">Quiz Complete!</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{score}</div>
                  <div className="text-gray-400 mb-4">Notes Identified</div>
                  <button
                    onClick={() => handlePhaseChange('learn')}
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

