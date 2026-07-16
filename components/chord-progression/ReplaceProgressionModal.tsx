'use client';

import { useState } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReplaceProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave: (name: string) => void;
  currentProgression: ChordInstance[];
}

export default function ReplaceProgressionModal({
  isOpen,
  onClose,
  onConfirm,
  onSave,
  currentProgression,
}: ReplaceProgressionModalProps) {
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndReplace = async () => {
    if (!saveName.trim()) {
      return;
    }
    
    setIsSaving(true);
    await onSave(saveName.trim());
    setIsSaving(false);
    setSaveName('');
    onConfirm();
  };

  const handleReplaceWithoutSaving = () => {
    setSaveName('');
    onConfirm();
  };

  const handleCancel = () => {
    setSaveName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="bg-[#1a1a1a] border-[#444444] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            Replace Existing Progression?
          </DialogTitle>
          <DialogDescription className="text-[#b0b0b0]">
            You currently have a chord progression in the timeline. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        {/* Current Progression Display */}
        <div className="py-4 space-y-3">
          <p className="text-sm text-[#a0a0a0]">Current Progression:</p>
          <div className="flex gap-2 flex-wrap p-3 rounded-lg bg-[#2a2a2a] border border-[#444444]">
            {currentProgression.map((chord, idx) => (
              <Badge key={idx} variant="outline" className="border-[#3b82f6] text-[#3b82f6]">
                {chord.chordSymbol}
              </Badge>
            ))}
          </div>
        </div>

        {/* Save Option */}
        <div className="space-y-3 p-4 rounded-lg bg-[#2a2a2a] border border-[#444444]">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-[#3b82f6]" />
            <Label className="text-[#e0e0e0]">Save current progression first</Label>
          </div>
          <Input
            placeholder="Enter progression name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="bg-[#1a1a1a] border-[#444444] text-white placeholder:text-[#666666]"
          />
          <Button
            onClick={handleSaveAndReplace}
            disabled={!saveName.trim() || isSaving}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
          >
            {isSaving ? 'Saving...' : 'Save & Replace'}
          </Button>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-[#444444] hover:border-[#666666]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReplaceWithoutSaving}
            className="flex-1"
          >
            Replace Without Saving
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

