'use client';

/**
 * Genre-based progression selector
 */

import { useState } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import {
  getAvailableGenres,
  getProgressionsByGenre,
  convertProgressionToChords,
  GenreProgression,
} from '@/lib/chord-progression/genre-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Music, Star, TrendingUp } from 'lucide-react';
import { NOTE_COLORS } from '@/lib/musicTheory';

interface GenreProgressionSelectorProps {
  currentKey: string;
  pixelsPerBeat: number;
  onProgressionLoad: (chords: ChordInstance[]) => void;
}

export default function GenreProgressionSelector({
  currentKey,
  pixelsPerBeat,
  onProgressionLoad,
}: GenreProgressionSelectorProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('Rock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgression, setSelectedProgression] = useState<GenreProgression | null>(null);

  const genres = getAvailableGenres();
  const progressions = getProgressionsByGenre(selectedGenre);

  const filteredProgressions = searchQuery
    ? progressions.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.musicalCharacter?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    : progressions;

  const handleLoadProgression = (progression: GenreProgression) => {
    const chords = convertProgressionToChords(progression, currentKey, pixelsPerBeat, 4);
    onProgressionLoad(chords);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return 'bg-green-500';
    if (difficulty === 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 1) return 'Easy';
    if (difficulty === 2) return 'Medium';
    return 'Hard';
  };

  // Extract root note from chord symbol
  const getRootNoteColor = (chordSymbol: string) => {
    const rootNote = chordSymbol.replace(/[^A-G#b]/g, '');
    return NOTE_COLORS[rootNote] || '#3b82f6';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Genre Tabs */}
      <div className="flex gap-2 p-4 border-b border-[#333333] overflow-x-auto">
        {genres.map(genre => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGenre(genre)}
            className="whitespace-nowrap"
          >
            {genre}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#333333]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <Input
            placeholder="Search progressions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#2a2a2a] border-[#333333]"
          />
        </div>
      </div>

      {/* Progressions List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProgressions.map(progression => (
              <div
                key={progression.id}
                className={`
                  p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${selectedProgression?.id === progression.id
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                    : 'border-[#333333] hover:border-[#555555] bg-[#1a1a1a]'
                  }
                `}
                onClick={() => setSelectedProgression(progression)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{progression.name}</h3>
                    <p className="text-sm text-[#a0a0a0]">{progression.description}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(progression.difficulty)}`} />
                </div>

                {/* Chord Progression with Root Note Colors */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {progression.chords.map((chord, idx) => {
                    const rootColor = getRootNoteColor(chord);
                    return (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-white font-semibold"
                        style={{
                          backgroundColor: rootColor,
                          borderColor: rootColor,
                        }}
                      >
                        {chord}
                      </Badge>
                    );
                  })}
                </div>

                {/* Character */}
                <p className="text-sm text-[#a0a0a0] mb-2 italic">
                  {progression.musicalCharacter}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getDifficultyColor(progression.difficulty)} text-white flex-shrink-0`}>
                    {getDifficultyLabel(progression.difficulty)}
                  </Badge>
                  {progression.genre.map(g => (
                    <Badge
                      key={g}
                      variant="outline"
                      className="text-xs border-[#555555] text-[#d0d0d0] bg-[#2a2a2a] flex-shrink-0 whitespace-nowrap"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>

                {/* Load Button */}
                {selectedProgression?.id === progression.id && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadProgression(progression);
                    }}
                    className="w-auto mt-3 bg-[#3b82f6] hover:bg-[#2563eb] px-6"
                    size="sm"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Load Progression
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

