'use client';

/**
 * Save Nearby Chord Progression Dialog
 */

import { useState, useEffect } from 'react';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import { saveNearbyProgression, updateNearbyProgression } from '@/lib/chord-progression/nearby-progressions-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaveProgressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chords: NearbyChord[];
  currentProgressionId?: string;
  currentProgressionName?: string;
  currentProgressionDescription?: string;
  onSaveSuccess?: (progressionId: string, progressionName: string, progressionDescription: string) => void;
}

export default function SaveProgressionDialog({
  open,
  onOpenChange,
  chords,
  currentProgressionId,
  currentProgressionName,
  currentProgressionDescription,
  onSaveSuccess,
}: SaveProgressionDialogProps) {
  const [name, setName] = useState(currentProgressionName || '');
  const [description, setDescription] = useState(currentProgressionDescription || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(currentProgressionName || '');
      setDescription(currentProgressionDescription || '');
    }
  }, [open, currentProgressionName, currentProgressionDescription]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a progression name',
        variant: 'destructive',
      });
      return;
    }

    if (chords.length === 0) {
      toast({
        title: 'Error',
        description: 'No chords to save',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      let result: { success: boolean; progressionId?: string; error?: string };

      if (currentProgressionId) {
        // Update existing progression
        const updateResult = await updateNearbyProgression(currentProgressionId, name, description, chords);
        result = { ...updateResult, progressionId: currentProgressionId };
      } else {
        // Create new progression
        result = await saveNearbyProgression(name, description, chords);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: currentProgressionId ? 'Progression updated successfully' : 'Progression saved successfully',
        });
        onSaveSuccess?.(result.progressionId || '', name, description);
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save progression',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#333333] shadow-2xl max-w-lg">
        <DialogHeader className="pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
            <Save className="w-6 h-6 text-[#3b82f6]" />
            {currentProgressionId ? 'Update Progression' : 'Save Chord Progression'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-200">
              Progression Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Chord Progression"
              className="bg-[#0a0a0a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all h-11"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-200">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your progression..."
              className="bg-[#0a0a0a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all min-h-[100px] resize-none"
              disabled={isSaving}
            />
          </div>

          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-300 mb-2">Progression Summary</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                <span>{chords.length} chord{chords.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                <span>
                  {chords.filter(c => (c as any).selectedVoicingIndex !== undefined).length} custom voicing
                  {chords.filter(c => (c as any).selectedVoicingIndex !== undefined).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-[#2a2a2a] gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex-1 h-11 font-semibold bg-transparent border-[#3a3a3a] hover:bg-[#2a2a2a] hover:border-[#4a4a4a] transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex-1 h-11 font-semibold bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] shadow-lg shadow-[#3b82f6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {currentProgressionId ? 'Update' : 'Save'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

