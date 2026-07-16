/**
 * Octave Shapes Training Method
 * Learn geometric octave patterns across string pairs
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { OCTAVE_SHAPES, NOTE_COLORS, CHROMATIC_SCALE } from '@/lib/fretboard-learning/constants';
import { calculateOctavePosition, getNoteAtPosition } from '@/lib/fretboard-learning/utils';
import TrainingControlBar from '@/components/fretboard-learning/TrainingControlBar';
import FeedbackOverlay from '@/components/fretboard-learning/FeedbackOverlay';
import SessionSummaryModal from '@/components/fretboard-learning/SessionSummaryModal';
import { FeedbackEvent, SessionStats, OctaveShape } from '@/lib/fretboard-learning/types';
import { DifficultyLevel } from '@/lib/fretboard-learning/constants';
import Fretboard from '@/components/Fretboard';
import { NotePosition, NOTES, TUNINGS } from '@/lib/musicTheory';
import { themes } from '@/lib/themes';

type Phase = 'learn' | 'practice' | 'quiz';

export default function OctaveShapesPage() {
  const router = useRouter();
  
  // Training state
  const [currentShape, setCurrentShape] = useState<OctaveShape>(OCTAVE_SHAPES[0]);
  const [currentPhase, setCurrentPhase] = useState<Phase>('learn');
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [showHints, setShowHints] = useState(true);

  // Phase-specific state
  const [currentNote, setCurrentNote] = useState<string>('C');
  const [currentFret, setCurrentFret] = useState<number>(3);
  const [practiceAttempts, setPracticeAttempts] = useState(0);
  const [quizQuestion, setQuizQuestion] = useState<{rootString: number; rootFret: number; targetString: number} | null>(null);
  const [quizTimeLeft, setQuizTimeLeft] = useState(30);

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
  };

  const handleToggleHints = () => {
    setShowHints(!showHints);
  };

  const handleShapeChange = (shape: OctaveShape) => {
    setCurrentShape(shape);
    setCurrentPhase('learn');
    setPracticeAttempts(0);
    setScore(0);
    setStreak(0);
  };

  const handlePhaseChange = (phase: Phase) => {
    setCurrentPhase(phase);
    setPracticeAttempts(0);
    setQuizQuestion(null);
    setQuizTimeLeft(30);

    if (phase === 'quiz') {
      setTimeout(() => generateQuizQuestion(), 500);
    }
  };

  // Calculate octave positions for visualization
  const octavePositions = useMemo(() => {
    const positions: NotePosition[] = [];
    const maxFrets = difficulty === 'Easy' ? 12 : difficulty === 'Medium' ? 17 : 22;

    // Root note positions on the first string of the shape
    const rootString = currentShape.strings[0] - 1; // Convert to 0-indexed
    const targetString = currentShape.strings[1] - 1;

    if (currentPhase === 'learn') {
      // In learn phase, show ALL octave pairs for this shape
      for (let fret = 0; fret <= maxFrets; fret++) {
        const noteAtRoot = NOTES[(NOTES.indexOf(tuning[rootString]) + fret) % 12];

        // Root position
        positions.push({
          stringIndex: rootString,
          fretNumber: fret,
          note: noteAtRoot,
          isRoot: true,
        });

        // Octave position
        const octaveFret = fret + currentShape.fretOffset;
        if (octaveFret <= maxFrets) {
          const noteAtOctave = NOTES[(NOTES.indexOf(tuning[targetString]) + octaveFret) % 12];
          positions.push({
            stringIndex: targetString,
            fretNumber: octaveFret,
            note: noteAtOctave,
            isRoot: false,
          });
        }
      }
    } else if (currentPhase === 'practice') {
      // In practice phase, show only the current note's octave pair
      const noteAtRoot = NOTES[(NOTES.indexOf(tuning[rootString]) + currentFret) % 12];

      positions.push({
        stringIndex: rootString,
        fretNumber: currentFret,
        note: noteAtRoot,
        isRoot: true,
      });

      const octaveFret = currentFret + currentShape.fretOffset;
      if (octaveFret <= maxFrets) {
        const noteAtOctave = NOTES[(NOTES.indexOf(tuning[targetString]) + octaveFret) % 12];
        positions.push({
          stringIndex: targetString,
          fretNumber: octaveFret,
          note: noteAtOctave,
          isRoot: false,
        });
      }
    } else if (currentPhase === 'quiz' && quizQuestion) {
      // In quiz phase, show only the root position
      const noteAtRoot = NOTES[(NOTES.indexOf(tuning[quizQuestion.rootString]) + quizQuestion.rootFret) % 12];

      positions.push({
        stringIndex: quizQuestion.rootString,
        fretNumber: quizQuestion.rootFret,
        note: noteAtRoot,
        isRoot: true,
      });
    }

    return positions;
  }, [currentShape, currentNote, currentPhase, difficulty, tuning, currentFret, quizQuestion]);

  // Practice Phase: Handle fretboard clicks
  const handlePracticeClick = (stringIndex: number, fretNumber: number) => {
    const targetString = currentShape.strings[1] - 1;
    const expectedFret = currentFret + currentShape.fretOffset;

    if (stringIndex === targetString && fretNumber === expectedFret) {
      setFeedback({ type: 'correct', message: `Correct! Octave found at fret ${expectedFret}` });
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setPracticeAttempts((prev) => prev + 1);

      // Move to next position
      setTimeout(() => {
        setCurrentFret((prev) => (prev + 1) % 12);
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback({ type: 'incorrect', message: `Incorrect. Try again!` });
      setStreak(0);
    }
  };

  // Quiz Phase: Generate random question
  const generateQuizQuestion = () => {
    const maxFrets = difficulty === 'Easy' ? 12 : difficulty === 'Medium' ? 17 : 22;
    const rootString = currentShape.strings[0] - 1;
    const targetString = currentShape.strings[1] - 1;
    const rootFret = Math.floor(Math.random() * (maxFrets - currentShape.fretOffset));

    setQuizQuestion({ rootString, rootFret, targetString });
  };

  // Quiz Phase: Handle answer
  const handleQuizAnswer = (stringIndex: number, fretNumber: number) => {
    if (!quizQuestion) return;

    const expectedFret = quizQuestion.rootFret + currentShape.fretOffset;

    if (stringIndex === quizQuestion.targetString && fretNumber === expectedFret) {
      setFeedback({ type: 'correct', message: 'Correct octave!' });
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
              <h1 className="text-2xl font-bold">Octave Shapes Training</h1>
              <p className="text-sm text-gray-400">Master geometric octave patterns</p>
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
        {/* Left Sidebar - Shape Selector */}
        <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-4">
          <h3 className="text-lg font-bold mb-4">Octave Shapes</h3>
          <div className="space-y-2">
            {OCTAVE_SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleShapeChange(shape)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  currentShape.id === shape.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="font-semibold text-sm mb-1">{shape.name}</div>
                <div className="text-xs text-gray-400">
                  Fret offset: +{shape.fretOffset}
                </div>
              </button>
            ))}
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

          {/* Note Selector for Practice */}
          {currentPhase === 'practice' && (
            <div className="mt-6">
              <h3 className="text-sm font-bold mb-2 text-gray-400">Starting Note</h3>
              <select
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
              >
                {CHROMATIC_SCALE.map((note) => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center - Training Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Phase Instructions */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
              {currentPhase === 'learn' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Shape Gallery (Learn)</h3>
                  <p className="text-gray-400">
                    Study the <span className="font-bold">{currentShape.name}</span> pattern.
                    Notice how the octave is always <span className="font-bold">+{currentShape.fretOffset} frets</span> higher
                    on string {currentShape.strings[1]} compared to string {currentShape.strings[0]}.
                    {currentShape.name.includes('crosses B') && (
                      <span className="text-yellow-400 ml-2">⚠️ This shape crosses the B string!</span>
                    )}
                  </p>
                </div>
              )}
              {currentPhase === 'practice' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Shape Practice</h3>
                  <p className="text-gray-400">
                    Find the octave of <span style={{ color: NOTE_COLORS[currentNote] }}>{currentNote}</span> at fret {currentFret}
                    using the {currentShape.name} pattern. Click the correct octave position!
                    <br />
                    <span className="text-sm">Attempts: {practiceAttempts}</span>
                  </p>
                </div>
              )}
              {currentPhase === 'quiz' && (
                <div>
                  <h3 className="font-bold text-lg mb-2">Speed Navigation (Quiz)</h3>
                  <p className="text-gray-400">
                    Find the octave as fast as you can! Time left: <span className="font-bold">{quizTimeLeft}s</span>
                    {quizQuestion && (
                      <span className="block mt-2">
                        Root note is highlighted. Find its octave using {currentShape.name}!
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Shape Info Card */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">{currentShape.name}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">String Pair</div>
                  <div className="text-lg font-bold">
                    String {currentShape.strings[0]} → String {currentShape.strings[1]}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Fret Offset</div>
                  <div className="text-lg font-bold">+{currentShape.fretOffset} frets</div>
                </div>
              </div>
            </div>

            {/* Interactive Fretboard */}
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-bold mb-4">Fretboard</h3>
              <div className="bg-[#0a0a0a] rounded-lg p-4">
                <Fretboard
                  notePositions={octavePositions}
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
                  <div className="text-gray-400 mb-4">Octaves Found</div>
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

