'use client';

/**
 * Professional scale/mode selector modal
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, List, Sparkles } from 'lucide-react';
import { getDisplayScaleNames, ScaleCompatibilityRating } from '@/lib/musicalCompatibility';
import { ScaleModeInstance } from '@/lib/chord-progression/types';
import { getCompatibleScalesFromDatabase } from '@/lib/music-theory-database/compatibility-service';
import CompatibleScalesSection from '@/components/audio/CompatibleScalesSection';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface AddScaleModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string;
  onScaleModeSelect: (scaleName: string, duration: number) => void;
  editingScaleMode?: ScaleModeInstance | null;
}

export default function AddScaleModeModal({
  open,
  onOpenChange,
  currentKey,
  onScaleModeSelect,
  editingScaleMode,
}: AddScaleModeModalProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [showBasicOnly, setShowBasicOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScale, setSelectedScale] = useState<string | null>(null);
  const [duration, setDuration] = useState('4');
  const [viewMode, setViewMode] = useState<'list' | 'recommendations'>('list');
  const [compatibleScales, setCompatibleScales] = useState<ScaleCompatibilityRating[]>([]);
  const [selectedCompatibleScale, setSelectedCompatibleScale] = useState<ScaleCompatibilityRating | null>(null);
  const [isLoadingScales, setIsLoadingScales] = useState(false);

  // Initialize with editing scale mode data
  useEffect(() => {
    if (editingScaleMode) {
      setDuration(editingScaleMode.duration.toString());
      setSelectedScale(editingScaleMode.scaleName);
    } else {
      setDuration('4');
      setSelectedScale(null);
    }
  }, [editingScaleMode, open]);

  // Load compatible scales when switching to recommendations view
  useEffect(() => {
    const loadCompatibleScales = async () => {
      if (viewMode === 'recommendations' && open) {
        setIsLoadingScales(true);
        try {
          const scales = await getCompatibleScalesFromDatabase(currentKey, 'Ionian', 12, 4);
          setCompatibleScales(scales);
        } catch (error) {
          console.error('Error loading compatible scales:', error);
          setCompatibleScales([]);
        } finally {
          setIsLoadingScales(false);
        }
      }
    };

    loadCompatibleScales();
  }, [viewMode, currentKey, open]);

  // Get scale names based on Basic/Advanced selection
  const allScales = getDisplayScaleNames(showBasicOnly);

  // Filter scales based on search query
  const displayedScales = searchQuery
    ? allScales.filter(scale => 
        scale.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allScales;

  const handleScaleClick = (scale: string) => {
    setSelectedScale(scale);
  };

  const handleAddScale = () => {
    if (viewMode === 'list' && selectedScale) {
      onScaleModeSelect(selectedScale, parseFloat(duration));
      onOpenChange(false);
      setSelectedScale(null);
      setSearchQuery('');
    } else if (viewMode === 'recommendations' && selectedCompatibleScale) {
      // Use the scale name from the compatible scale
      onScaleModeSelect(selectedCompatibleScale.scaleName, parseFloat(duration));
      onOpenChange(false);
      setSelectedCompatibleScale(null);
    }
  };

  const handleCompatibleScaleSelect = (scale: ScaleCompatibilityRating) => {
    setSelectedCompatibleScale(scale);
  };

  // Get modern color for scale card (purple/violet theme)
  const getScaleColor = (isSelected: boolean) => {
    if (isSelected) {
      return {
        gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
        border: '#a78bfa',
        shadow: '0 4px 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        textColor: '#ffffff',
      };
    }
    return {
      gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      border: '#4b5563',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      textColor: '#e5e7eb',
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] max-h-[900px] bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] border-[#374151] shadow-2xl text-white overflow-hidden flex flex-col">
        <DialogHeader className="pb-5 pt-2 border-b-2 border-[#374151] flex-shrink-0 bg-gradient-to-r from-[#1f2937] to-[#111827]">
          <div className="flex items-center justify-between min-h-[60px]">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#a78bfa] via-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent flex items-center">
              {editingScaleMode ? 'Update Scale/Mode' : 'Add Scale/Mode to Progression'}
            </DialogTitle>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-[#1f2937] p-1 rounded-xl border-2 border-[#374151]">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] text-white shadow-lg'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode('recommendations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'recommendations'
                    ? 'bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] text-white shadow-lg'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Recommendations
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-5 flex-1 pt-4 overflow-hidden">
          {/* Basic/Advanced Toggle Sidebar - Only show in list view */}
          {viewMode === 'list' && (
            <div className="w-56 border-r-2 border-[#374151] pr-5 flex-shrink-0">
              <h3 className="text-xs font-bold text-[#9ca3af] mb-3 tracking-widest uppercase">Scale Type</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowBasicOnly(true);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    showBasicOnly
                      ? 'bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30 scale-105'
                      : 'text-[#9ca3af] bg-[#1f2937] hover:bg-[#374151] hover:text-white border border-[#374151]'
                  }`}
                >
                  ✨ Basic Scales
                </button>
                <button
                  onClick={() => {
                    setShowBasicOnly(false);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    !showBasicOnly
                      ? 'bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30 scale-105'
                      : 'text-[#9ca3af] bg-[#1f2937] hover:bg-[#374151] hover:text-white border border-[#374151]'
                  }`}
                >
                  🎵 Advanced Scales
                </button>
              </div>

              {/* Current Key Display */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#1f2937] to-[#111827] border-2 border-[#374151] shadow-lg">
                <div className="text-xs text-[#9ca3af] mb-2 font-semibold uppercase tracking-wide">Current Key</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent">{getNoteDisplayName(currentKey)}</div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'list' ? (
              <>
                {/* Search */}
                <div className="mb-5 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b5cf6]" />
                    <Input
                      placeholder="Search scales/modes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-[#1f2937] border-2 border-[#374151] text-white placeholder:text-[#6b7280] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#8b5cf6]/30 transition-all rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Scale Grid */}
                <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                  <div className="grid grid-cols-4 gap-3 pb-4">
                    {displayedScales.map((scale) => {
                      const isSelected = selectedScale === scale;
                      const scaleColor = getScaleColor(isSelected);

                      return (
                        <button
                          key={scale}
                          onClick={() => handleScaleClick(scale)}
                          className="h-14 rounded-xl transition-all duration-300 flex items-center justify-center relative group px-4 py-3 hover:scale-105"
                          style={{
                            background: scaleColor.gradient,
                            border: `2px solid ${scaleColor.border}`,
                            boxShadow: scaleColor.shadow,
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          <span
                            className="text-sm font-bold text-center leading-tight tracking-wide"
                            style={{ color: scaleColor.textColor }}
                          >
                            {scale}
                          </span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] border-2 border-white shadow-lg"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {displayedScales.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No scales found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Recommendations View */
              <div className="flex-1 overflow-y-auto">
                {isLoadingScales ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[#9ca3af]">Loading recommendations...</p>
                    </div>
                  </div>
                ) : (
                  <CompatibleScalesSection
                    detectedKey={currentKey}
                    compatibleScales={compatibleScales}
                    selectedScale={selectedCompatibleScale}
                    onScaleSelect={handleCompatibleScaleSelect}
                    theme="dark"
                    confidence={1}
                    isManualMode={true}
                  />
                )}
              </div>
            )}

            {/* Controls */}
            <div className="mt-5 pt-5 border-t-2 border-[#374151] flex items-center justify-between bg-gradient-to-r from-[#1f2937] to-[#111827] -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
              <div className="flex gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-[#e5e7eb]">Duration:</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="w-36 h-11 bg-[#1f2937] border-2 border-[#374151] text-white focus:border-[#a78bfa] focus:ring-2 focus:ring-[#8b5cf6]/30 rounded-xl font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f2937] border-2 border-[#374151] text-white z-[100] rounded-xl">
                      <SelectItem value="1" className="text-white hover:bg-[#374151] focus:bg-[#374151] cursor-pointer rounded-lg">1 beat</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-[#374151] focus:bg-[#374151] cursor-pointer rounded-lg">2 beats</SelectItem>
                      <SelectItem value="4" className="text-white hover:bg-[#374151] focus:bg-[#374151] cursor-pointer rounded-lg">4 beats</SelectItem>
                      <SelectItem value="8" className="text-white hover:bg-[#374151] focus:bg-[#374151] cursor-pointer rounded-lg">8 beats</SelectItem>
                      <SelectItem value="16" className="text-white hover:bg-[#374151] focus:bg-[#374151] cursor-pointer rounded-lg">16 beats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="px-6 h-11 border-2 border-[#374151] bg-[#1f2937] hover:bg-[#374151] hover:border-[#4b5563] text-white font-semibold rounded-xl transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddScale}
                  disabled={viewMode === 'list' ? !selectedScale : !selectedCompatibleScale}
                  className="px-6 h-11 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: (viewMode === 'list' ? selectedScale : selectedCompatibleScale)
                      ? 'linear-gradient(to right, #a78bfa, #8b5cf6)'
                      : 'linear-gradient(to right, #6b7280, #4b5563)',
                    boxShadow: (viewMode === 'list' ? selectedScale : selectedCompatibleScale)
                      ? '0 4px 16px rgba(139, 92, 246, 0.4)'
                      : 'none',
                  }}
                >
                  {editingScaleMode ? '✓ Update' : '+ Add to Timeline'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

