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
    subtitle: 'Aching, expressive, and soaked in late-night grit. It sounds like a weary sigh turning into a confident statement. Musically, you start on the root, slide to the bluesy 7th, then resolve down through the 5th and 3rd. The backbone of blues vocabulary.',
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
    subtitle: 'Restless and building, like a held breath before the next line lands. It creates suspense that begs for release. Musically, you rise with passing notes to the 7th, drop to the 5th, then push hard into the root. Great for ending a 12-bar phrase with authority.',
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
    subtitle: 'Conversational and soulful, like two voices trading lines across a smoky room. It feels warm, human, and back-and-forth. Musically, you call up to the 7th, respond down to the 5th, call again to the root, then answer with the warm 3rd. The conversational backbone of all blues phrasing.',
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
    subtitle: 'Yearning and vocal, with that crying, pleading quality of a bent string. It feels like tension melting into relief. Musically, you start on the 5th, bend into the blue 7th, use a chromatic slide, then land on the 3rd and resolve home. The signature blues string-bend mapped to chord tones.',
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
    subtitle: 'Smoldering, moody, and deeply emotional, like heartbreak simmering under the surface. It aches before it settles. Musically, you linger on the tritone tension between the 7th and 3rd, chromatically walk through, then land on the 5th before resolving home. Deep, smoldering blues expression.',
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
    subtitle: 'Bold, driving, and rock-solid, the sound of a riff you can plant your feet on. It feels powerful and grounded. Musically, it\'s a root-to-5th backbone with passing fills. Hits hard in rhythm parts and gives solos a stable foundation to orbit around.',
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
    subtitle: 'Triumphant and cathartic, like a guitar hero\'s spotlight moment cooling back down. It soars then lands. Musically, you launch from the tense 7th, use scale runs between chord tones, then cascade through the 5th and 3rd to land home. Classic rock solo shape.',
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
    subtitle: 'Energetic and fist-pumping, pure adrenaline that begs for a crowd. It feels fast, confident, and alive. Musically, you charge upward through root-3rd-5th to the peak 7th, then rip back down through passing runs. The universal rock lead shape in chord-tone form.',
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
    subtitle: 'Uplifting and stadium-sized, the sound of a chorus lifting the whole room to its feet. It swells with hope and momentum. Musically, you rise from the 3rd through the 5th and 7th to the peak root octave. The emotional arc of every rock anthem chorus and stadium solo.',
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
    subtitle: 'Dark, urgent, and relentless, like a chase scene set to distorted guitars. It feels tense and propulsive. Musically, it\'s a root-5th-root ostinato with a spike to the dark 7th. Maps the galloping eighth-note feel of hard rock rhythm riffs to chord tones.',
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
    subtitle: 'Smooth, sophisticated, and effortlessly cool, the sound of a player who knows exactly where the chord lives. It feels sleek and knowing. Musically, you alternate the 3rd and 7th, the guide tones that define chord quality. The DNA of jazz improvisation across chord changes.',
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
    subtitle: 'Playful, clever, and quick-witted, like a phrase that winks before it lands. It feels curious and satisfying. Musically, the 7th creates tension, chromatic passing notes add bebop flavor, the 3rd gives color, then it resolves to the root. Essential jazz cadence.',
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
    subtitle: 'Elegant and understated, the refined sound of a pianist comping behind a soloist. It feels graceful and unhurried. Musically, you walk through the shell tones (3rd and 7th) with chromatic approaches between them. The voice-leading technique that defines jazz harmony.',
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
    subtitle: 'Slippery and suspenseful, teasing the ear before each note snaps into focus. It feels sly and precise. Musically, you approach each chord tone from a half-step above and below, an enclosure. The quintessential bebop technique for targeting strong-beat chord tones.',
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
    subtitle: 'Resolved and deeply satisfying, like a sentence landing perfectly on its final word. It feels complete and warm. Musically, you rise from the 5th through the 7th (ii chord), arc to the 3rd via chromatics (V chord), then resolve to the root (I chord). The harmonic foundation of all jazz.',
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
    subtitle: 'Warm, tender, and heartfelt, like a singer pouring feeling into every phrase. It feels intimate and rich. Musically, you start on the warm 3rd, rise through the 5th to the rich 7th, then gently descend back. Great for adding soulful runs between chord hits.',
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
    subtitle: 'Smooth, laid-back, and in the pocket, the kind of line that makes heads nod. It feels effortless and cool. Musically, you weave chord tones through a pentatonic-style line, adding harmonic color while keeping the groove. Hit these on strong beats.',
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
    subtitle: 'Show-stopping and emotionally soaring, that goosebump vocal-run moment. It feels expressive and free. Musically, it\'s ornamental circling between chord tones with chromatic fills. The gospel melisma pattern used by Whitney, Mariah, and every soul singer.',
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
    subtitle: 'Uplifting and reverent, the sound of a church choir carrying you home. It feels emotional and redemptive. Musically, you open on the tense 7th, push through a chromatic walk, let the 3rd sing, then resolve tenderly home. Church-influenced soul cadence.',
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
    subtitle: 'Tight, grounded, and irresistibly groovy, so locked in it feels magnetic. It feels steady and confident. Musically, you anchor to the root, pop up to the 5th groove, kiss the 7th for color, then return home. Super locked-in pocket feel for rhythm and background vocal lines.',
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
    subtitle: 'Catchy and instantly memorable, the kind of melody you hum without meaning to. It feels bright and friendly. Musically, you descend from the 5th through the 3rd to the root, an instantly recognizable shape. Loop it for verse and chorus hooks over most pop progressions.',
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
    subtitle: 'Clear, pretty, and radio-ready, sweet and easy on the ears. It feels clean and singable. Musically, you ascend the arpeggio up and back. Works over almost any pop chord progression as a melodic solo or riff.',
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
    subtitle: 'Exhilarating and hopeful, the rush of a chorus breaking wide open. It feels like the emotional high point of a song. Musically, you step upward through chord tones to the emotive 7th, creating the payoff lift that makes a chorus feel like it opens up.',
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
    subtitle: 'Wistful and longing, that bittersweet ache pop ballads live for. It feels tender and yearning. Musically, you hover on the 5th for a sus4 feel, weave a passing note, then resolve warmly through the 3rd to the root. The suspended longing modern pop and ballads crave.',
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
    subtitle: 'Fun, bouncy, and upbeat, an earworm built for dancefloors. It feels light and infectious. Musically, you bounce from the root to the 3rd with the 5th as a pivot point. The building block of modern pop and EDM lead lines.',
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
    subtitle: 'Snappy, spirited, and playful, the sound of a back-porch pick-up in full swing. It feels lively and fun. Musically, you alternate chord tones with passing notes, snapping between them for the signature chicken-pickin\' attack. Works great with hybrid picking.',
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
    subtitle: 'Aching and nostalgic, the tearful sound of heartbreak on a country road. It feels wistful and sweet. Musically, it\'s a rising chord-tone figure peaking at the 7th, mimicking the crying pedal steel sound. Slide or bend between these tones for max feel.',
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
    subtitle: 'Bright, punchy, and cheerful, that sparkling honky-tonk brightness. It feels crisp and toe-tapping. Musically, it\'s a root-to-3rd snap with double-back passing tones and a pedal on the 5th. The stinging attack of a Telecaster in country lead form.',
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
    subtitle: 'Rolling and steady, like a locomotive chugging down the tracks. It feels driving and hypnotic. Musically, it\'s a repeating 1-5 pulse with rhythmic punches on the 3rd and 7th. Mirrors the locomotive train-rhythm feel of classic country shuffles.',
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
    subtitle: 'Warm, lonesome, and soulful, the sliding cry of front-porch Americana. It feels heartfelt and earthy. Musically, you rise through the 3rd and 5th to an emotive 7th, then slide back down in classic open-tuning style. Perfect for dobro or slide guitar flourishes.',
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
    subtitle: 'Floating, hypnotic, and atmospheric, like drifting through open space. It feels dreamy and suspended. Musically, it\'s a full ascending and descending arpeggio over a static chord, creating a floating modal mood. Great over drone-based or modal jazz sections.',
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
    subtitle: 'Unsettled and mysterious, hanging in the air without ever fully landing. It feels open-ended and intriguing. Musically, you start on the 5th, peak at the 7th and root, then return to the 5th, creating an unresolved, hovering quality. Use over pedal tones or ambient sections.',
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
    subtitle: 'Bright, wondrous, and cinematic, that wide-eyed sense of awe. It feels shimmering and magical. Musically, it\'s a root-3rd-5th climb with a chromatic passing tone hinting at the raised 4th. The ethereal Lydian color over static major chords.',
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
    subtitle: 'Dark, exotic, and brooding, with a Spanish, shadowy edge. It feels tense and dramatic. Musically, you open on the 3rd and descend through chromatics toward the root. The Phrygian sound used in prog and metal passages.',
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
    subtitle: 'Cerebral and elegant, with a clockwork sense of order. It feels precise and mesmerizing. Musically, an alternating 1-5-3-7 creates a symmetrical arpeggio shape favored in progressive rock and neoclassical music for its mathematical elegance.',
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
    subtitle: 'Punchy, confident, and impossible to sit still to, pure rhythmic swagger. It feels tight and commanding. Musically, you nail the root hard on beat 1, bounce to the 5th and 3rd, with ghost notes between. The most fundamental funk rule: the \'one\' is everything.',
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
    subtitle: 'Springy, percussive, and full of attitude, that irresistible slap-bass bounce. It feels playful and dynamic. Musically, you slap the root on beat 1, pop to the 3rd on the \'and\', climb to the 7th, then resolve back. Classic slap bass chord-tone foundation of funk.',
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
    subtitle: 'Sharp, jittery, and hypnotically groovy, all offbeat swagger. It feels edgy and danceable. Musically, it\'s a 5th-7th syncopated bounce with root resolution, that signature offbeat funk guitar chop. Plant the 7th on the \'and\' for maximum groove.',
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
    subtitle: 'Deep, greasy, and locked in, so in the pocket it feels like a heartbeat. It feels raw and hypnotic. Musically, you move from the root to the 7th with the 5th as the groove anchor. The Meters-style rhythmic chord-tone stab used on classic funk records.',
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
    subtitle: 'Sweet, silky, and uplifting, smooth soul with a hopeful glow. It feels refined and warm. Musically, you rise cleanly from the 3rd through the 5th to the 7th, then descend silkily through passing tones to the root. Sophisticated chord-tone funk melody.',
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
    subtitle: 'Warm, breezy, and romantic, like a sunset on a Rio beach. It feels smooth and sophisticated. Musically, you alternate the 3rd and 7th following the bossa nova clave rhythm. These guide tones define the sophisticated harmony of Brazilian music.',
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
    subtitle: 'Infectious and celebratory, the pulse that gets a whole room dancing. It feels rhythmic and joyful. Musically, it\'s a syncopated root-5th pattern following the 3-2 son clave. The rhythmic foundation of Afro-Cuban music mapped to chord tones.',
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
    subtitle: 'Energetic and spinning, a whirl of tropical momentum. It feels festive and driving. Musically, it\'s a rising chord-tone figure in the salsa montuno style, root through 3rd-5th-7th then back, repeated over I-V changes.',
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
    subtitle: 'Vibrant, playful, and full of swing, the carnival spirit in motion. It feels bright and bouncing. Musically, you alternate the 5th and 3rd with root accents, following the samba rhythmic emphasis. The pulse of Rio in chord-tone form.',
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
    subtitle: 'Passionate, fiery, and dramatic, the intensity of a flamenco dancer\'s stomp. It feels bold and emotional. Musically, you rise through the 3rd and 5th, reach for the 7th tension, then resolve home via a chromatic descent. The Phrygian flair of flamenco phrasing.',
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
    subtitle: 'Blazing, virtuosic, and jaw-dropping, sheer technical fireworks. It feels intense and explosive. Musically, it\'s a full ascending sweep of root-3rd-5th-7th, descending with passing runs between chord tones. Speed and precision, the neoclassical shred signature.',
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
    subtitle: 'Dark, majestic, and menacing, with an exotic, villainous grandeur. It feels dramatic and powerful. Musically, you rise from the leading 7th through the root and 3rd to the 5th. The harmonic minor sound that defines neoclassical metal and Yngwie-style phrasing.',
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
    subtitle: 'Ominous, unstable, and nightmarish, dread you can feel building. It feels tense and sinister. Musically, you alternate between the 5th and 7th (the tritone zone), use chromatic passing tones, then crash to the 3rd and root. Dark, diminished-flavored metal tension.',
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
    subtitle: 'Aggressive, pounding, and relentless, the charge of a war march. It feels urgent and heavy. Musically, it\'s a root-5th-root with a syncopated 7th accent. The galloping triplet feel of NWOBHM and thrash metal rhythm guitar mapped to chord tones.',
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
    subtitle: 'Explosive and cathartic, the screaming finale of a guitar solo. It feels triumphant and ferocious. Musically, from the peak 7th you shred through chromatic runs to the 5th, 3rd, then root. The explosive descending run that every shred solo finishes on.',
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
    subtitle: 'Warm, breathy, and intimate, hazy late-night bedroom soul. It feels sensual and relaxed. Musically, it\'s a soulful 7th-3rd oscillation with a chromatic approach to the root. The warm hookline of neo-soul vocals and guitar a la D\'Angelo.',
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
    subtitle: 'Soulful, spiritual, and heartfelt, a sacred glow lifting the mood. It feels tender and uplifting. Musically, it\'s a sacred-style rise through 1-3-5-7 with chromatic fills. The church-influenced resolution used by Lauryn Hill, Alicia Keys, and Jill Scott.',
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
    subtitle: 'Yearning and emotional, the ache of a heartfelt confession. It feels vulnerable and rich. Musically, you linger on the 5th for a suspended feel, then resolve down through the 3rd with melismatic fills. The emotional arc of Erykah Badu and Jill Scott phrasing.',
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
    subtitle: 'Cool, syncopated, and effortlessly hip, that head-nod pocket groove. It feels crisp and confident. Musically, it\'s a sharp root stab, a 7th-5th groove hook, then a return to the root. The syncopated stab pattern underneath every neo-soul groove.',
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
    subtitle: 'Lush, dreamy, and sophisticated, a velvety wash of rich color. It feels smooth and immersive. Musically, you navigate the lush 3rd-5th-7th extended harmony, reach the root, then ornament back down. Neo-soul\'s love of rich chord-tone voice leading.',
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
    subtitle: 'Graceful, poised, and gently flowing, the elegance of a candlelit salon. It feels refined and steady. Musically, it\'s a root-5th-3rd-5th repeated pattern, the Classical Alberti bass. The backbone of Mozart and Haydn keyboard accompaniment for two centuries.',
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
    subtitle: 'Tender and sighing, an aching, expressive lean into sweetness. It feels delicate and emotional. Musically, you lean on the dissonant 7th (an appoggiatura), then resolve gracefully through the 5th and 3rd home to the root. The core Classical phrase-ending ornament.',
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
    subtitle: 'Sweeping, passionate, and grand, the swell of a Romantic love theme. It feels expansive and stirring. Musically, you sweep from the 3rd up through the 5th to the climactic 7th and root. The broad soaring arc of Chopin, Brahms, and Romantic-era melody.',
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
    subtitle: 'Stately, intricate, and contemplative, ornate clockwork beauty. It feels measured and dignified. Musically, you step down 7th-5th-3rd-root with chromatic passing tones between each. The sequential descending pattern of Baroque counterpoint.',
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
    subtitle: 'Rich, interwoven, and quietly clever, two voices dancing as one. It feels full and elegant. Musically, the 3rd and 7th exchange roles with the root as anchor, a classical voice exchange. Creates rich two-voice implied harmony in a single melodic line.',
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
    subtitle: 'Daring, angular, and adventurous, tension that thrills before it satisfies. It feels edgy and modern. Musically, you launch from the dissonant 7th, orbit outward with chromatic passing tones, then snap back through the 3rd to the root. The \'outside-in\' approach central to fusion jazz.',
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
    subtitle: 'Complex, shimmering, and otherworldly, like two colors blending into a new one. It feels layered and hypnotic. Musically, you alternate chord tones from two harmonic centers, the 5th and 3rd anchoring one key, the 7th and root the other. The polytonal texture of Weather Report and Mahavishnu.',
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
    subtitle: 'Restless, brilliant, and dazzling, a harmonic maze that keeps you leaning in. It feels cerebral and exhilarating. Musically, you navigate chord tones across major-third root motion (Coltrane changes): 1-3-5, step up a third, repeat. The engine behind \'Giant Steps\'-style fusion.',
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
    subtitle: 'Off-kilter, hypnotic, and intriguing, a groove that trips your expectations in the best way. It feels playful and unpredictable. Musically, it\'s a 7th-5th-1-3 phrase designed to breathe across a 7/8 or 5/4 feel, landing chord tones on unexpected metric positions. Quintessential fusion rhythmic complexity.',
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
    subtitle: 'Bright, tense, and cinematic, a hovering, unresolved shimmer. It feels sleek and mysterious. Musically, it\'s a root-3rd-5th climb with a chromatic push past the 7th, implying the Lydian dominant (sharp 4, flat 7) sound Miles Davis and Herbie Hancock built fusion on.',
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
    subtitle: 'Quirky, cerebral, and off-balance in a captivating way. It feels intricate and unpredictable. Musically, it\'s a full 1-3-5-7 arpeggio with an asymmetric return, the uneven phrase length creating rhythmic displacement that defines prog rock\'s anti-commercial feel.',
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
    subtitle: 'Lush, cinematic, and nostalgic, a warm orchestral tide rolling in. It feels dreamy and grand. Musically, you slowly build from the root through the 5th to the 7th and back, like a Mellotron string section swelling in. Use long sustain for the classic prog orchestral texture.',
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
    subtitle: 'Puzzling and hypnotic, a groove that keeps you guessing where \'one\' is. It feels heady and immersive. Musically, it\'s a 7th-3rd guide tone pair with root anchors phrased across a changing meter. The metric ambiguity creates prog\'s cerebral, through-composed feeling.',
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
    subtitle: 'Towering and triumphant, the climax of a sprawling musical journey. It feels dramatic and euphoric. Musically, you start on the 5th and build through chromatics to the climactic root. The grand crescendo arc of Yes, Genesis, and ELP\'s extended suites.',
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
    subtitle: 'Ornate, dramatic, and virtuosic, classical grandeur charged with rock energy. It feels regal and intense. Musically, it\'s a descending 7th-5th-3rd-1 sequence with chromatic passing notes between each step. Prog rock\'s fusion of classical counterpoint and rock power.',
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
    subtitle: 'Hot, rhythmic, and irresistible, the beat that pulls you onto the dancefloor. It feels vibrant and alive. Musically, it\'s a root-5th pattern locked to the 2-3 son clave. Land chord tones precisely on the clave\'s strong beats for the salsa heartbeat.',
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
    subtitle: 'Driving, hypnotic, and relentless, a groove that never lets up. It feels propulsive and joyful. Musically, it\'s an interlocking 3rd-5th-7th figure following the tumbao bass pattern. The repetitive rhythmic cell that drives salsa forward.',
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
    subtitle: 'Punchy, explosive, and electrifying, the horn-section hit that makes a crowd roar. It feels bold and exciting. Musically, it\'s a sharp 1-7-5 stab pattern landing on the mambo break. The punchy chord-tone hits marking the horn call in classic big-band salsa.',
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
    subtitle: 'Sparkling, bouncy, and infectious, the shimmering engine of the dance. It feels bright and locked-in. Musically, it\'s an ascending 1-3-5-7 guajeo figure with a syncopated offbeat return. The iconic salsa piano montuno that locks with the conga and bongo.',
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
    subtitle: 'Loose, spontaneous, and exhilarating, the freedom of a live jam catching fire. It feels expressive and adventurous. Musically, it\'s a free-flowing 5th-3rd-7th exploration over a vamp. The descarga (jam session) style where soloists navigate chord tones over a locked groove.',
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
