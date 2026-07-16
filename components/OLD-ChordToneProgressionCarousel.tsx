'use client';

import React, { useState, useCallback, useLayoutEffect, useRef, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { CHORD_TONE_COLORS } from '@/lib/musicTheory';

type ToneStep =
  | { type: 'tone'; degree: '1' | '3' | '5' | '7' }
  | { type: 'other' };

export interface ProgressionPattern {
  id: string;
  genre: string;
  genreColor: string;
  title: string;
  subtitle: string;
  steps: ToneStep[];
}

const TONE_COLORS: Record<string, string> = {
  '1': CHORD_TONE_COLORS.root,
  '3': CHORD_TONE_COLORS.third,
  '5': CHORD_TONE_COLORS.fifth,
  '7': CHORD_TONE_COLORS.seventh,
};

const PROGRESSIONS: ProgressionPattern[] = [
  // ── Blues ───────────────────────────────────────────────────────────────
  {
    id: 'blues-1',
    genre: 'Blues',
    genreColor: '#3b82f6',
    title: 'Classic Blues Lick',
    subtitle: 'Start on root, slide to bluesy 7th, resolve down through 5th and 3rd. The backbone of blues vocabulary — feel every note.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'blues-2',
    genre: 'Blues',
    genreColor: '#3b82f6',
    title: 'Turnaround Tension',
    subtitle: 'Rise with passing notes to the 7th, drop to 5th, push hard into root. Great for ending a 12-bar phrase with authority.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'blues-3',
    genre: 'Blues',
    genreColor: '#3b82f6',
    title: 'Call & Response',
    subtitle: 'Call up to the 7th, respond down to 5th, call again to root, answer with the warm 3rd. The conversational backbone of all blues phrasing.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'blues-4',
    genre: 'Blues',
    genreColor: '#3b82f6',
    title: 'Bend & Release',
    subtitle: 'Start on 5th, bend into the blue 7th, use a chromatic slide, land on 3rd and resolve home. The signature blues string-bend mapped to chord tones.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'blues-5',
    genre: 'Blues',
    genreColor: '#3b82f6',
    title: 'Slow Burn Resolution',
    subtitle: 'Linger on the tritone tension between 7th and 3rd, chroma-walk through, land on 5th before resolving home. Deep, smoldering blues expression.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Rock ────────────────────────────────────────────────────────────────
  {
    id: 'rock-1',
    genre: 'Rock',
    genreColor: '#ef4444',
    title: 'Power Riff Framework',
    subtitle: 'Root-to-5th backbone with passing fills. Hits hard in rhythm parts and gives solos a stable foundation to orbit around.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'rock-2',
    genre: 'Rock',
    genreColor: '#ef4444',
    title: 'Solo Peak & Descent',
    subtitle: 'Launch from the tense 7th, use scale runs between chord tones, cascade through 5th and 3rd to land home. Classic rock solo shape.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'rock-3',
    genre: 'Rock',
    genreColor: '#ef4444',
    title: 'Pentatonic Charge',
    subtitle: 'Charge upward through root-3rd-5th to the peak 7th, rip back down through passing runs. The universal rock lead shape in chord-tone form.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'rock-4',
    genre: 'Rock',
    genreColor: '#ef4444',
    title: 'Anthemic Climb',
    subtitle: 'Rise from 3rd through 5th and 7th to the peak root octave — the emotional arc of every rock anthem chorus and stadium solo.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'rock-5',
    genre: 'Rock',
    genreColor: '#ef4444',
    title: 'Minor Gallop',
    subtitle: 'Root-5th-root ostinato with a spike to the dark 7th. Maps the galloping eighth-note feel of hard rock rhythm riffs to chord tones.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Jazz ────────────────────────────────────────────────────────────────
  {
    id: 'jazz-1',
    genre: 'Jazz',
    genreColor: '#f59e0b',
    title: 'Guide Tone Line',
    subtitle: 'Alternate 3rd and 7th — these are the guide tones that define chord quality. The DNA of jazz improvisation across chord changes.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
    ],
  },
  {
    id: 'jazz-2',
    genre: 'Jazz',
    genreColor: '#f59e0b',
    title: 'Bebop Resolution',
    subtitle: '7th creates harmonic tension, chromatic passing notes add bebop flavor, 3rd gives color, resolves to root. Essential jazz cadence.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'jazz-3',
    genre: 'Jazz',
    genreColor: '#f59e0b',
    title: 'Shell Voicing Walk',
    subtitle: 'Walk through shell tones (3rd and 7th) with chromatic approaches between them — the voice-leading technique that defines jazz harmony.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'jazz-4',
    genre: 'Jazz',
    genreColor: '#f59e0b',
    title: 'Enclosure Approach',
    subtitle: 'Approach each chord tone from a half-step above and below (enclosure). The quintessential bebop technique for targeting strong-beat chord tones.',
    steps: [
      { type: 'other' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
    ],
  },
  {
    id: 'jazz-5',
    genre: 'Jazz',
    genreColor: '#f59e0b',
    title: 'ii–V–I Arc',
    subtitle: 'Rise from 5th through 7th (ii chord), arc to 3rd via chromatics (V chord), resolve to root (I chord). The harmonic foundation of all jazz.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── R&B / Soul ──────────────────────────────────────────────────────────
  {
    id: 'rnb-1',
    genre: 'R&B / Soul',
    genreColor: '#ec4899',
    title: 'Soulful Chord Tone Climb',
    subtitle: 'Start on the warm 3rd, rise through 5th to the rich 7th, gently descend back. Great for adding soulful runs between chord hits.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
    ],
  },
  {
    id: 'rnb-2',
    genre: 'R&B / Soul',
    genreColor: '#ec4899',
    title: 'Groove Weave',
    subtitle: 'Weave chord tones through a pentatonic-style line. Adds harmonic color while keeping the groove — hit these on strong beats.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'rnb-3',
    genre: 'R&B / Soul',
    genreColor: '#ec4899',
    title: 'Melismatic Run',
    subtitle: 'Ornamental circling between chord tones with chromatic fills — the gospel melisma pattern used by Whitney, Mariah, and every soul singer.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
    ],
  },
  {
    id: 'rnb-4',
    genre: 'R&B / Soul',
    genreColor: '#ec4899',
    title: 'Gospel Resolution',
    subtitle: 'Open on the tense 7th, push through a chromatic walk, let the 3rd sing, resolve tenderly home. Church-influenced soul cadence.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'rnb-5',
    genre: 'R&B / Soul',
    genreColor: '#ec4899',
    title: 'Pocket Root Lock',
    subtitle: 'Anchor to root, pop up to 5th groove, kiss the 7th for color, return home. Super locked-in pocket feel for rhythm and background vocal lines.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Pop ─────────────────────────────────────────────────────────────────
  {
    id: 'pop-1',
    genre: 'Pop',
    genreColor: '#06b6d4',
    title: 'Melodic Hook',
    subtitle: 'Descend from 5th through 3rd to root — an instantly recognizable melodic shape. Loop for verse/chorus hooks over most pop progressions.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'pop-2',
    genre: 'Pop',
    genreColor: '#06b6d4',
    title: 'Clean Arpeggio Loop',
    subtitle: 'Ascend the arpeggio up and back. Sing-able and radio-friendly — works over almost any pop chord progression as a melodic solo or riff.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'pop-3',
    genre: 'Pop',
    genreColor: '#06b6d4',
    title: 'Chorus Lift',
    subtitle: 'Step upward through chord tones to the emotive 7th — creates the emotional payoff lift that makes a chorus feel like it breaks open.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'pop-4',
    genre: 'Pop',
    genreColor: '#06b6d4',
    title: 'Suspended Resolve',
    subtitle: 'Hover on the 5th (sus4 feel), weave a passing note, resolve warmly through 3rd to root. The suspended longing that modern pop and ballads crave.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'pop-5',
    genre: 'Pop',
    genreColor: '#06b6d4',
    title: 'Synth Lead Bounce',
    subtitle: 'Bounce root-to-3rd with 5th as pivot point. Simple, catchy, and ear-worm ready — the building block of modern pop and EDM lead lines.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Country ─────────────────────────────────────────────────────────────
  {
    id: 'country-1',
    genre: 'Country',
    genreColor: '#84cc16',
    title: 'Chicken Pickin\' Line',
    subtitle: 'Alternate chord tones with passing notes — snap between them for the signature chicken-pickin\' attack. Works great with hybrid picking.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'country-2',
    genre: 'Country',
    genreColor: '#84cc16',
    title: 'Steel Guitar Cry',
    subtitle: 'Rising chord tone figure peaking at the 7th. Mimics the crying pedal steel sound — slide or bend between these tones for max feel.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'country-3',
    genre: 'Country',
    genreColor: '#84cc16',
    title: 'Telecaster Twang',
    subtitle: 'Root-to-3rd snap with double-back passing tones, pedal on 5th. The stinging attack of a Telecaster in country lead form.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'country-4',
    genre: 'Country',
    genreColor: '#84cc16',
    title: 'Train Beat Rhythm',
    subtitle: 'Repeating 1-5 pulse with rhythmic punches on 3rd and 7th. Mirrors the locomotive train-rhythm feel of classic country shuffles.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'country-5',
    genre: 'Country',
    genreColor: '#84cc16',
    title: 'Dobro Slide',
    subtitle: 'Rise through 3rd and 5th to an emotive 7th, slide back down in classic open-tuning style. Perfect for dobro or slide guitar flourishes.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Modal / Progressive ─────────────────────────────────────────────────
  {
    id: 'modal-1',
    genre: 'Modal / Progressive',
    genreColor: '#a855f7',
    title: 'Dorian Arpeggio',
    subtitle: 'Full ascending/descending arpeggio over a static chord. Creates a floating modal atmosphere — great over drone-based or modal jazz sections.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'modal-2',
    genre: 'Modal / Progressive',
    genreColor: '#a855f7',
    title: 'Hovering Resolution',
    subtitle: 'Start on 5th, peak at 7th and root, return to 5th. Creates an unresolved, hovering quality — use over pedal tones or ambient sections.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'modal-3',
    genre: 'Modal / Progressive',
    genreColor: '#a855f7',
    title: 'Lydian Float',
    subtitle: 'Root-3rd-5th climb with a chromatic passing tone hinting at the raised 4th — the bright, ethereal Lydian color over static major chords.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
    ],
  },
  {
    id: 'modal-4',
    genre: 'Modal / Progressive',
    genreColor: '#a855f7',
    title: 'Phrygian Descent',
    subtitle: 'Open on the 3rd, descend through chromatics toward root — the dark, Spanish-flavored Phrygian sound used in prog and metal passages.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'modal-5',
    genre: 'Modal / Progressive',
    genreColor: '#a855f7',
    title: 'Symmetrical Pattern',
    subtitle: 'Alternating 1-5-3-7 creates a symmetrical arpeggio shape favored in progressive rock and neo-classical music for its mathematical elegance.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Funk ────────────────────────────────────────────────────────────────
  {
    id: 'funk-1',
    genre: 'Funk',
    genreColor: '#f97316',
    title: 'Land on the One',
    subtitle: 'Nail the root hard on beat 1, bounce to 5th and 3rd, ghost notes between. The most fundamental funk bass/guitar rule: the "one" is everything.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'funk-2',
    genre: 'Funk',
    genreColor: '#f97316',
    title: 'Slap & Pop Pattern',
    subtitle: 'Root slap on beat 1, pop to 3rd on the "and", climb to 7th, resolve back. Classic slap bass chord-tone foundation of funk bass playing.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'funk-3',
    genre: 'Funk',
    genreColor: '#f97316',
    title: 'Syncopated 7th Chop',
    subtitle: '5th–7th syncopated bounce with root resolution — that signature off-beat funk guitar chop pattern. Plant the 7th on the "and" for maximum groove.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'funk-4',
    genre: 'Funk',
    genreColor: '#f97316',
    title: 'Root-7th Pocket',
    subtitle: 'Root to 7th with 5th as the groove anchor — all over the pocket. The Meters-style rhythmic chord-tone stab used in every classic funk record.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'funk-5',
    genre: 'Funk',
    genreColor: '#f97316',
    title: 'Curtis Mayfield Rise',
    subtitle: 'Sweet, clean rise from 3rd through 5th to 7th, silky descent back through passing tones to root. Sophisticated chord-tone funk melody pattern.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Latin / Bossa Nova ──────────────────────────────────────────────────
  {
    id: 'latin-1',
    genre: 'Latin / Bossa Nova',
    genreColor: '#10b981',
    title: 'Bossa Chord Weave',
    subtitle: 'Alternate 3rd and 7th following the bossa nova clave rhythm. These guide tones define the sophisticated harmony of Brazilian music.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
    ],
  },
  {
    id: 'latin-2',
    genre: 'Latin / Bossa Nova',
    genreColor: '#10b981',
    title: 'Clave Root Lock',
    subtitle: 'Syncopated root-5th pattern following the 3-2 son clave. The rhythmic foundation of Afro-Cuban music mapped to chord tones.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'latin-3',
    genre: 'Latin / Bossa Nova',
    genreColor: '#10b981',
    title: 'Montuno Figure',
    subtitle: 'Rising chord-tone figure in the salsa montuno style — root through 3rd-5th-7th then back, repeated rhythmically over I–V changes.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'latin-4',
    genre: 'Latin / Bossa Nova',
    genreColor: '#10b981',
    title: 'Samba Groove',
    subtitle: 'Alternating 5th and 3rd with root accents — follows the samba rhythmic emphasis pattern. The pulse of Rio in chord-tone form.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'latin-5',
    genre: 'Latin / Bossa Nova',
    genreColor: '#10b981',
    title: 'Flamenco Resolution',
    subtitle: 'Rise through 3rd and 5th, reach for the 7th tension, resolve home via chromatic descent. The Phrygian flair of Flamenco phrasing.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Metal / Shred ────────────────────────────────────────────────────────
  {
    id: 'metal-1',
    genre: 'Metal / Shred',
    genreColor: '#6b7280',
    title: 'Sweep Arpeggio',
    subtitle: 'Full ascending sweep: root-3rd-5th-7th, descend with passing runs between chord tones. Speed and precision — the neoclassical shred signature.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'metal-2',
    genre: 'Metal / Shred',
    genreColor: '#6b7280',
    title: 'Harmonic Minor Climb',
    subtitle: 'Rise from the leading 7th through root and 3rd to 5th — the harmonic minor sound that defines neoclassical metal and Yngwie-style phrasing.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'metal-3',
    genre: 'Metal / Shred',
    genreColor: '#6b7280',
    title: 'Diminished Tension',
    subtitle: 'Alternate between 5th and 7th (tritone zone), use chromatic passing tones, crash to 3rd and root. Dark, diminished-flavored metal tension.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'metal-4',
    genre: 'Metal / Shred',
    genreColor: '#6b7280',
    title: 'Gallop Riff Pattern',
    subtitle: 'Root-5th-root with syncopated 7th accent — the galloping triplet feel of NWOBHM and thrash metal rhythm guitar mapped to chord tones.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'metal-5',
    genre: 'Metal / Shred',
    genreColor: '#6b7280',
    title: 'Shred Descent',
    subtitle: 'From peak 7th, shred through chromatic runs to 5th, 3rd, root. The explosive descending run that every shred solo finishes on.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Neo-Soul ─────────────────────────────────────────────────────────────
  {
    id: 'neosoul-1',
    genre: 'Neo-Soul',
    genreColor: '#c026d3',
    title: 'D\'Angelo Oscillation',
    subtitle: 'Soulful 7th–3rd oscillation with chromatic approach to root — the warm, breathy hookline of neo-soul vocals and guitar à la D\'Angelo.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'neosoul-2',
    genre: 'Neo-Soul',
    genreColor: '#c026d3',
    title: 'Gospel Chord Climb',
    subtitle: 'Sacred-style rise through 1-3-5-7 with chromatic fills — the church-influenced resolution used by Lauryn Hill, Alicia Keys, and Jill Scott.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'neosoul-3',
    genre: 'Neo-Soul',
    genreColor: '#c026d3',
    title: 'Suspended Soul Lick',
    subtitle: 'Linger on the 5th (suspended feel), resolve down through 3rd with melismatic fills. The emotional arc of Erykah Badu and Jill Scott phrasing.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'neosoul-4',
    genre: 'Neo-Soul',
    genreColor: '#c026d3',
    title: 'Rhythmic Chord Stab',
    subtitle: 'Sharp root stab, 7th–5th groove hook, return to root. The syncopated keyboard/guitar stab pattern underneath every neo-soul groove.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'neosoul-5',
    genre: 'Neo-Soul',
    genreColor: '#c026d3',
    title: 'Extended Harmony Run',
    subtitle: 'Navigate through 3rd-5th-7th lush extended harmony, reach the root, ornament back down. Neo-soul\'s love of rich chord-tone voice leading.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
    ],
  },

  // ── Classical / Romantic ─────────────────────────────────────────────────
  {
    id: 'classical-1',
    genre: 'Classical / Romantic',
    genreColor: '#ca8a04',
    title: 'Alberti Bass Figure',
    subtitle: 'Root-5th-3rd-5th repeated — the Classical Alberti bass pattern. The backbone of Mozart and Haydn keyboard accompaniment over two centuries.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'classical-2',
    genre: 'Classical / Romantic',
    genreColor: '#ca8a04',
    title: 'Appoggiatura Resolution',
    subtitle: 'Lean on the dissonant 7th (appoggiatura), resolve gracefully through 5th then 3rd, home to root — the core Classical phrase-ending ornament.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'classical-3',
    genre: 'Classical / Romantic',
    genreColor: '#ca8a04',
    title: 'Romantic Soaring Line',
    subtitle: 'Sweep from 3rd up through 5th to the climactic 7th and root — the broad soaring melodic arc of Chopin, Brahms, and Romantic-era melody.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'classical-4',
    genre: 'Classical / Romantic',
    genreColor: '#ca8a04',
    title: 'Baroque Descent',
    subtitle: 'Step down 7th-5th-3rd-root with chromatic passing tones between each — the sequential descending chord-tone pattern in Baroque counterpoint.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'classical-5',
    genre: 'Classical / Romantic',
    genreColor: '#ca8a04',
    title: 'Voice Exchange',
    subtitle: '3rd and 7th exchange roles with the root as anchor (classical voice exchange). Creates rich two-voice implied harmony in a single melodic line.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  // ── Fusion ───────────────────────────────────────────────────────────────
  {
    id: 'fusion-1',
    genre: 'Fusion',
    genreColor: '#0ea5e9',
    title: 'Outside-In Resolution',
    subtitle: 'Launch from the dissonant 7th, orbit outward with chromatic passing tones, snap back through 3rd to root. The "outside-in" approach central to fusion jazz.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'fusion-2',
    genre: 'Fusion',
    genreColor: '#0ea5e9',
    title: 'Polytonal Weave',
    subtitle: 'Alternate chord tones from two harmonic centers — 5th and 3rd anchor one key, 7th and 1 the other. Creates the layered polytonal texture of Weather Report and Mahavishnu.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'fusion-3',
    genre: 'Fusion',
    genreColor: '#0ea5e9',
    title: 'Coltrane Changes Arc',
    subtitle: 'Navigate chord tones across major-third root motion (Coltrane changes): 1-3-5, step up a third, repeat. The harmonic engine behind "Giant Steps"-style fusion.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'fusion-4',
    genre: 'Fusion',
    genreColor: '#0ea5e9',
    title: 'Odd-Meter Groove',
    subtitle: '7th-5th-1-3 phrase designed to breathe across a 7/8 or 5/4 feel. Chord tones land on unexpected metric positions — quintessential fusion rhythmic complexity.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
    ],
  },
  {
    id: 'fusion-5',
    genre: 'Fusion',
    genreColor: '#0ea5e9',
    title: 'Lydian Dominant Stretch',
    subtitle: 'Root-3rd-5th climb with a chromatic push past the 7th — implying the Lydian dominant (#4, b7) sound that Miles Davis and Herbie Hancock built fusion on.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },

  // ── Prog Rock ─────────────────────────────────────────────────────────────
  {
    id: 'progrock-1',
    genre: 'Prog Rock',
    genreColor: '#7c3aed',
    title: 'Asymmetric Arpeggio',
    subtitle: 'Full 1-3-5-7 arpeggio with an asymmetric return — the uneven phrase length creates rhythmic displacement that defines prog rock\'s anti-commercial feel.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
    ],
  },
  {
    id: 'progrock-2',
    genre: 'Prog Rock',
    genreColor: '#7c3aed',
    title: 'Mellotron Swell',
    subtitle: 'Slowly build from root through 5th to 7th and back — like a Mellotron string section swelling in. Use long sustain on chord tones for the classic prog orchestral texture.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'progrock-3',
    genre: 'Prog Rock',
    genreColor: '#7c3aed',
    title: 'Time Signature Shift',
    subtitle: '7th–3rd guide tone pair with root anchors phrased across a changing meter. The deliberate metric ambiguity creates prog\'s cerebral, through-composed feeling.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '7' },
    ],
  },
  {
    id: 'progrock-4',
    genre: 'Prog Rock',
    genreColor: '#7c3aed',
    title: 'Epic Crescendo',
    subtitle: 'Start on the 5th, build through chromatics to the climactic root — the grand crescendo arc of Yes, Genesis, and ELP\'s extended suite movements.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'progrock-5',
    genre: 'Prog Rock',
    genreColor: '#7c3aed',
    title: 'Neo-Classical Sequence',
    subtitle: 'Descending 7th-5th-3rd-1 sequence with chromatic passing notes between each step — prog rock\'s fusion of classical counterpoint and rock energy.',
    steps: [
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
    ],
  },

  // ── Salsa ─────────────────────────────────────────────────────────────────
  {
    id: 'salsa-1',
    genre: 'Salsa',
    genreColor: '#f43f5e',
    title: 'Clave Root Pulse',
    subtitle: 'Root-5th pattern locked to the 2-3 son clave — the heartbeat of every salsa rhythm section. Land chord tones precisely on the clave\'s strong beats.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'salsa-2',
    genre: 'Salsa',
    genreColor: '#f43f5e',
    title: 'Montuno Tumbao',
    subtitle: 'Interlocking 3rd-5th-7th figure following the tumbao bass pattern. This is the repetitive rhythmic cell that drives the salsa groove forward relentlessly.',
    steps: [
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
    ],
  },
  {
    id: 'salsa-3',
    genre: 'Salsa',
    genreColor: '#f43f5e',
    title: 'Mambo Break',
    subtitle: 'Sharp 1-7-5 stab pattern landing on the mambo break section. The punchy chord-tone hits that mark the horn section\'s signature call in classic big-band salsa.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '1' },
    ],
  },
  {
    id: 'salsa-4',
    genre: 'Salsa',
    genreColor: '#f43f5e',
    title: 'Guajeo Piano Figure',
    subtitle: 'Ascending 1-3-5-7 guajeo figure with syncopated offbeat return — the iconic salsa piano montuno pattern that locks with the conga and bongo.',
    steps: [
      { type: 'tone', degree: '1' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '5' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
    ],
  },
  {
    id: 'salsa-5',
    genre: 'Salsa',
    genreColor: '#f43f5e',
    title: 'Descarga Improvisation',
    subtitle: 'Free-flowing 5th-3rd-7th exploration over a vamp — the descarga (jam session) style where soloists navigate chord tones expressively over a locked groove.',
    steps: [
      { type: 'tone', degree: '5' },
      { type: 'tone', degree: '3' },
      { type: 'other' },
      { type: 'tone', degree: '7' },
      { type: 'other' },
      { type: 'tone', degree: '3' },
      { type: 'tone', degree: '1' },
    ],
  },
];

// Genre color map derived from progression data
const GENRE_COLORS: Record<string, string> = {
  'Blues': '#3b82f6',
  'Rock': '#ef4444',
  'Jazz': '#f59e0b',
  'R&B / Soul': '#ec4899',
  'Pop': '#06b6d4',
  'Country': '#84cc16',
  'Modal / Progressive': '#a855f7',
  'Funk': '#f97316',
  'Latin / Bossa Nova': '#10b981',
  'Metal / Shred': '#6b7280',
  'Neo-Soul': '#c026d3',
  'Classical / Romantic': '#ca8a04',
  'Fusion': '#0ea5e9',
  'Prog Rock': '#7c3aed',
  'Salsa': '#f43f5e',
};

// Card constants
const CARD_WIDTH = 200;
const CARD_GAP = 8;
const ARROWS_WIDTH = 80; // two arrow buttons + surrounding padding

function ProgressionCard({
  pattern,
  theme,
  showGenreBadge,
  isSelected,
  onClick,
}: {
  pattern: ProgressionPattern;
  theme: ThemeConfig;
  showGenreBadge: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative flex-shrink-0 rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all duration-200"
      style={{
        width: `${CARD_WIDTH}px`,
        background: isSelected
          ? `linear-gradient(135deg, ${pattern.genreColor}22, ${theme.bgTertiary} 70%)`
          : theme.bgTertiary,
        borderRight: `2px solid ${isSelected ? pattern.genreColor : theme.border}`,
        borderBottom: `2px solid ${isSelected ? pattern.genreColor : theme.border}`,
        borderLeft: `2px solid ${isSelected ? pattern.genreColor : theme.border}`,
        borderTop: `3px solid ${pattern.genreColor}`,
        boxShadow: isSelected
          ? `0 0 0 3px ${pattern.genreColor}40, 0 4px 20px ${pattern.genreColor}35`
          : 'none',
      }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ background: pattern.genreColor, boxShadow: `0 0 6px ${pattern.genreColor}` }}
        />
      )}

      {/* Genre Badge — hide when a genre is already filtered */}
      {showGenreBadge && (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full self-start"
          style={{ background: `${pattern.genreColor}25`, color: pattern.genreColor }}
        >
          {pattern.genre}
        </span>
      )}

      {/* Title */}
      <p className="text-xs font-bold leading-tight" style={{ color: theme.textPrimary }}>
        {pattern.title}
      </p>

      {/* Subtitle */}
      <p className="leading-snug flex-1" style={{ color: theme.textSecondary, fontSize: '10px' }}>
        {pattern.subtitle}
      </p>

      {/* Progression Steps */}
      <div className="flex items-center gap-1 flex-wrap mt-auto">
        {pattern.steps.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className="text-xs" style={{ color: theme.textSecondary }}>→</span>
            )}
            {step.type === 'tone' ? (
              <span
                className="inline-flex items-center justify-center rounded-md font-bold text-white"
                style={{
                  background: TONE_COLORS[step.degree],
                  boxShadow: isSelected
                    ? `0 0 10px ${TONE_COLORS[step.degree]}99, 0 0 4px ${TONE_COLORS[step.degree]}`
                    : `0 0 6px ${TONE_COLORS[step.degree]}66`,
                  minWidth: '22px',
                  height: '22px',
                  fontSize: '11px',
                  padding: '0 4px',
                }}
              >
                {step.degree}
              </span>
            ) : (
              <span
                className="inline-flex items-center justify-center rounded-md font-medium"
                style={{
                  background: theme.bgSecondary,
                  border: `1px solid ${theme.border}`,
                  color: theme.textSecondary,
                  minWidth: '36px',
                  height: '22px',
                  fontSize: '9px',
                  padding: '0 4px',
                  whiteSpace: 'nowrap',
                }}
              >
                Other
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Click hint when not selected */}
      {!isSelected && (
        <div className="text-[9px] font-medium opacity-0 group-hover:opacity-40 mt-0.5"
          style={{ color: theme.textSecondary }}>
          Click to highlight on fretboard
        </div>
      )}
    </div>
  );
}

interface ChordToneProgressionCarouselProps {
  theme: ThemeConfig;
  selectedPatternId?: string | null;
  onPatternSelect?: (pattern: ProgressionPattern | null) => void;
  glowBrightness?: number;
  onGlowBrightnessChange?: (v: number) => void;
}

export default function ChordToneProgressionCarousel({
  theme,
  selectedPatternId = null,
  onPatternSelect,
  glowBrightness = 100,
  onGlowBrightnessChange,
}: ChordToneProgressionCarouselProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the currently selected pattern for color reference
  const selectedPattern = useMemo(
    () => PROGRESSIONS.find(p => p.id === selectedPatternId) ?? null,
    [selectedPatternId]
  );

  // Unique genres in order of first appearance
  const genres = useMemo(() => {
    const seen = new Set<string>();
    return PROGRESSIONS.reduce<string[]>((acc, p) => {
      if (!seen.has(p.genre)) { seen.add(p.genre); acc.push(p.genre); }
      return acc;
    }, []);
  }, []);

  // Filter progressions by selected genre
  const filtered = useMemo(() =>
    selectedGenre ? PROGRESSIONS.filter((p) => p.genre === selectedGenre) : PROGRESSIONS,
  [selectedGenre]);

  // Reset carousel position when genre changes
  useEffect(() => { setStartIndex(0); }, [selectedGenre]);

  // Responsive: measure container width and compute how many cards fit
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      const available = Math.max(CARD_WIDTH, w - ARROWS_WIDTH);
      setVisibleCount(Math.max(1, Math.floor(available / (CARD_WIDTH + CARD_GAP))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const canPrev = startIndex > 0;
  const canNext = startIndex + visibleCount < filtered.length;
  const visible = filtered.slice(startIndex, startIndex + visibleCount);
  const totalPages = Math.max(1, filtered.length - visibleCount + 1);

  const handlePrev = useCallback(() => {
    setStartIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setStartIndex((i) => Math.min(filtered.length - visibleCount, i + 1));
  }, [filtered.length, visibleCount]);

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      {/* Genre Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedGenre(null)}
          className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
          style={{
            background: !selectedGenre ? theme.accentPrimary : theme.bgTertiary,
            color: !selectedGenre ? '#fff' : theme.textSecondary,
            border: `1px solid ${!selectedGenre ? theme.accentPrimary : theme.border}`,
          }}
        >
          All
        </button>
        {genres.map((genre) => {
          const color = GENRE_COLORS[genre] ?? '#6b7280';
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(isActive ? null : genre)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: isActive ? color : `${color}18`,
                color: isActive ? '#fff' : color,
                border: `1px solid ${isActive ? color : `${color}50`}`,
              }}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Carousel Row — pt-2 ensures selected card's translateY + dot indicator aren't clipped */}
      <div className="flex items-stretch gap-2 pt-2">
        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          className="flex-shrink-0 self-center p-1.5 rounded-lg transition-all"
          style={{
            background: canPrev ? theme.bgSecondary : 'transparent',
            color: canPrev ? theme.textPrimary : theme.textSecondary,
            border: `1px solid ${canPrev ? theme.border : 'transparent'}`,
            opacity: canPrev ? 1 : 0.3,
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Cards — overflow-visible so selected card's border/glow/transform isn't clipped */}
        <div className="flex gap-2 overflow-visible flex-1">
          {visible.map((p) => (
            <ProgressionCard
              key={p.id}
              pattern={p}
              theme={theme}
              showGenreBadge={!selectedGenre}
              isSelected={selectedPatternId === p.id}
              onClick={() => onPatternSelect?.(selectedPatternId === p.id ? null : p)}
            />
          ))}
          {/* Empty state */}
          {visible.length === 0 && (
            <div className="flex-1 flex items-center justify-center rounded-xl py-6" style={{ background: theme.bgTertiary, border: `1px solid ${theme.border}` }}>
              <p className="text-xs" style={{ color: theme.textSecondary }}>No progressions for this genre.</p>
            </div>
          )}
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="flex-shrink-0 self-center p-1.5 rounded-lg transition-all"
          style={{
            background: canNext ? theme.bgSecondary : 'transparent',
            color: canNext ? theme.textPrimary : theme.textSecondary,
            border: `1px solid ${canNext ? theme.border : 'transparent'}`,
            opacity: canNext ? 1 : 0.3,
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStartIndex(i)}
              className="rounded-full transition-all"
              style={{
                width: i === startIndex ? '16px' : '6px',
                height: '6px',
                background: i === startIndex ? theme.accentPrimary : theme.border,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
