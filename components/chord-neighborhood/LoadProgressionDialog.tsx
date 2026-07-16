'use client';

/**
 * Load Nearby Chord Progression Dialog
 */

import { useState, useEffect } from 'react';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import {
  getUserNearbyProgressions,
  loadNearbyProgression,
  deleteNearbyProgression,
  SavedNearbyProgression,
} from '@/lib/chord-progression/nearby-progressions-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { FolderOpen, Loader2, Trash2, Calendar, Music, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LoadProgressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadSuccess?: (progressionId: string, chords: NearbyChord[], progressionName: string, progressionDescription: string) => void;
}

export default function LoadProgressionDialog({
  open,
  onOpenChange,
  onLoadSuccess,
}: LoadProgressionDialogProps) {
  const [progressions, setProgressions] = useState<SavedNearbyProgression[]>([]);
  const [selectedProgression, setSelectedProgression] = useState<SavedNearbyProgression | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgressionId, setLoadingProgressionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [progressionToDelete, setProgressionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProgressions();
      setSelectedProgression(null);
      setSearchQuery('');
    }
  }, [open]);

  const fetchProgressions = async () => {
    setIsLoading(true);
    const result = await getUserNearbyProgressions();
    
    if (result.success && result.progressions) {
      setProgressions(result.progressions);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load progressions',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const handleLoadProgression = async () => {
    if (!selectedProgression) return;

    setLoadingProgressionId(selectedProgression.id);

    // Convert saved chord data back to NearbyChord format
    const chords: NearbyChord[] = selectedProgression.progression_data.chords.map(savedChord => ({
      rootNote: savedChord.rootNote,
      quality: savedChord.quality as any,
      degree: savedChord.degree,
      function: savedChord.function,
      distance: savedChord.distance,
      commonTones: savedChord.commonTones,
      commonToneNotes: savedChord.commonToneNotes,
      nearestVoicing: {
        rootNote: savedChord.rootNote,
        quality: savedChord.quality as any,
        stringSet: [1, 2, 3],
        inversion: 'root' as const,
        fretPosition: 0,
        frets: [],
        notes: savedChord.chordNotes || [],
      },
      allVoicings: [],
      selectedVoicingIndex: savedChord.selectedVoicingIndex,
      selectedVoicing: savedChord.voicingData,
      chordSymbol: savedChord.chordSymbol,
      chordNotes: savedChord.chordNotes,
    } as any));

    toast({
      title: 'Success',
      description: 'Progression loaded successfully',
    });
    
    onLoadSuccess?.(
      selectedProgression.id,
      chords,
      selectedProgression.name,
      selectedProgression.description || ''
    );
    onOpenChange(false);

    setLoadingProgressionId(null);
  };

  const handleDeleteProgression = async () => {
    if (!progressionToDelete) return;

    const result = await deleteNearbyProgression(progressionToDelete);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Progression deleted successfully',
      });
      setProgressions(progressions.filter(p => p.id !== progressionToDelete));
      if (selectedProgression?.id === progressionToDelete) {
        setSelectedProgression(null);
      }
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete progression',
        variant: 'destructive',
      });
    }
    
    setDeleteDialogOpen(false);
    setProgressionToDelete(null);
  };

  // Filter progressions based on search query
  const filteredProgressions = progressions.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#333333] shadow-2xl max-w-4xl h-[600px] flex flex-col">
          <DialogHeader className="pb-4 border-b border-[#2a2a2a]">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-[#3b82f6]" />
              Load Chord Progression
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex gap-4 overflow-hidden py-4">
            {/* Left Panel - Progression List */}
            <div className="w-1/2 flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search progressions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0a0a0a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                />
              </div>

              {/* Progression List */}
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
                </div>
              ) : filteredProgressions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <Music className="w-16 h-16 mb-4 text-gray-600" />
                  <p className="text-lg font-semibold text-gray-300 mb-2">
                    {searchQuery ? 'No matching progressions' : 'No saved progressions'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'Try a different search term' : 'Save a progression to see it here'}
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {filteredProgressions.map((progression, progIndex) => {
                      // Color palette for chord buttons (same as nearby diatonic chords)
                      const CHORD_COLORS = [
                        '#ef4444', '#f97316', '#eab308', '#22c55e',
                        '#06b6d4', '#3b82f6', '#8b5cf6'
                      ];

                      return (
                        <div
                          key={progression.id}
                          onClick={() => setSelectedProgression(progression)}
                          className={`group p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                            selectedProgression?.id === progression.id
                              ? 'border-[#3b82f6] bg-gradient-to-br from-[#3b82f6]/20 to-[#2563eb]/10 shadow-lg shadow-[#3b82f6]/20'
                              : 'border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] hover:border-[#3b82f6]/50 hover:shadow-md hover:shadow-[#3b82f6]/10'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`font-bold text-sm line-clamp-1 ${
                              selectedProgression?.id === progression.id ? 'text-white' : 'text-gray-200'
                            }`}>
                              {progression.name}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProgressionToDelete(progression.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>

                          {/* Colorful chord progression preview */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {progression.progression_data.chords.slice(0, 7).map((chord, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                                style={{
                                  backgroundColor: CHORD_COLORS[index % CHORD_COLORS.length],
                                  color: '#ffffff'
                                }}
                              >
                                <span className="opacity-70">{index + 1}</span>
                                <span>{chord.chordSymbol || `${chord.rootNote}${chord.quality === 'major' ? '' : chord.quality}`}</span>
                              </div>
                            ))}
                            {progression.progression_data.chords.length > 7 && (
                              <div className="px-2 py-1 text-xs text-gray-500">
                                +{progression.progression_data.chords.length - 7} more
                              </div>
                            )}
                          </div>

                          {progression.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                              {progression.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(progression.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="w-1/2 flex flex-col">
              {selectedProgression ? (
                <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4 min-h-0">
                  <h3 className="text-lg font-bold text-white mb-2">{selectedProgression.name}</h3>
                  {selectedProgression.description && (
                    <p className="text-sm text-gray-400 mb-4">{selectedProgression.description}</p>
                  )}

                  <div className="flex-1 overflow-y-auto min-h-0">
                    <p className="text-xs font-semibold text-gray-400 mb-2">CHORD PROGRESSION</p>
                    <div className="space-y-2 pb-2">
                      {selectedProgression.progression_data.chords.map((chord, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-xs font-bold text-[#3b82f6]">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white text-sm">
                              {chord.chordSymbol || `${chord.rootNote}${chord.quality === 'major' ? '' : chord.quality}`}
                            </div>
                            <div className="text-xs text-gray-500">{chord.degree} - {chord.function}</div>
                          </div>
                          {chord.selectedVoicingIndex !== undefined && (
                            <div className="text-xs text-[#3b82f6] font-semibold">Custom Voicing</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                    <Button
                      onClick={handleLoadProgression}
                      disabled={loadingProgressionId === selectedProgression.id}
                      className="w-full h-11 font-semibold bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] shadow-lg shadow-[#3b82f6]/20 transition-all"
                    >
                      {loadingProgressionId === selectedProgression.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Load Progression
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl">
                  <Music className="w-16 h-16 mb-4 text-gray-600" />
                  <p className="text-lg font-semibold text-gray-300 mb-2">No Progression Selected</p>
                  <p className="text-sm text-gray-500">Select a progression to preview</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333333]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Progression</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this progression? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#3a3a3a] hover:bg-[#2a2a2a] text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProgression}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

