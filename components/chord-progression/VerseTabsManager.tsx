'use client';

/**
 * Verse tabs manager with key selection
 */

import { useState } from 'react';
import { VerseData } from '@/lib/chord-progression/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Copy, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NOTES, NOTE_COLORS } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface VerseTabsManagerProps {
  verses: VerseData[];
  activeVerseId: string | null;
  onVerseSelect: (verseId: string) => void;
  onVerseAdd: (name?: string, key?: string) => void;
  onVerseUpdate: (verseId: string, updates: Partial<VerseData>) => void;
  onVerseDelete: (verseId: string) => void;
  onKeyChange: (newKey: string) => void;
}

export default function VerseTabsManager({
  verses,
  activeVerseId,
  onVerseSelect,
  onVerseAdd,
  onVerseUpdate,
  onVerseDelete,
  onKeyChange,
}: VerseTabsManagerProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameVerseId, setRenameVerseId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteVerseId, setDeleteVerseId] = useState<string | null>(null);

  const activeVerse = verses.find(v => v.id === activeVerseId);

  const handleRename = (verseId: string) => {
    const verse = verses.find(v => v.id === verseId);
    if (verse) {
      setRenameVerseId(verseId);
      setNewName(verse.name);
      setShowRenameDialog(true);
    }
  };

  const handleDoubleClick = (verseId: string) => {
    handleRename(verseId);
  };

  const handleRenameSubmit = () => {
    if (renameVerseId && newName.trim()) {
      onVerseUpdate(renameVerseId, { name: newName.trim() });
      setShowRenameDialog(false);
      setRenameVerseId(null);
      setNewName('');
    }
  };

  const handleDuplicate = (verseId: string) => {
    const verse = verses.find(v => v.id === verseId);
    if (verse) {
      onVerseAdd(`${verse.name} (Copy)`, verse.key);
    }
  };

  const handleAddVerse = () => {
    // Find the highest number in existing verse names
    const verseNumbers = verses
      .map(v => {
        const match = v.name.match(/Verse (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);

    const nextNumber = verseNumbers.length > 0 ? Math.max(...verseNumbers) + 1 : 1;
    onVerseAdd(`Verse ${nextNumber}`);
  };

  const handleDeleteClick = (verseId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tab selection
    if (verses.length === 1) return; // Don't allow deleting the last verse
    setDeleteVerseId(verseId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteVerseId) {
      onVerseDelete(deleteVerseId);
      setShowDeleteDialog(false);
      setDeleteVerseId(null);
    }
  };

  return (
    <>
      <div className="h-28 border-b border-[#333333] bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] flex items-center px-6 gap-3 overflow-x-auto overflow-y-visible py-2">
        {verses.map((verse, index) => (
          <ContextMenu key={verse.id}>
            <ContextMenuTrigger>
              <div
                onClick={() => onVerseSelect(verse.id)}
                onDoubleClick={() => handleDoubleClick(verse.id)}
                className={`
                  px-4 py-2 rounded-xl transition-all duration-300 flex flex-col gap-1.5 min-w-fit shadow-lg relative group cursor-pointer
                  ${verse.id === activeVerseId
                    ? 'bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] text-white font-bold scale-105 shadow-[#3b82f6]/50 border-2 border-[#60a5fa]'
                    : 'bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] text-[#a0a0a0] border-2 border-[#3a3a3a] hover:border-[#4a4a4a] hover:from-[#333333] hover:to-[#252525] hover:text-white hover:scale-102 hover:shadow-xl'
                  }
                `}
              >
                {/* +# indicator in top right */}
                {verse.chordProgression && verse.chordProgression.length > 6 && (
                  <span className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full font-bold shadow-lg bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white border-2 border-white/30 z-10">
                    +{verse.chordProgression.length - 6}
                  </span>
                )}
                {/* Top row: Number, Name, Key, Delete Icon */}
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                    verse.id === activeVerseId
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-[#1a1a1a] text-[#888888] border border-[#333333]'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="truncate max-w-[150px] font-semibold text-sm">{verse.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold shadow-lg border-2"
                    style={{
                      backgroundColor: `${NOTE_COLORS[verse.key] || '#888888'}30`,
                      borderColor: NOTE_COLORS[verse.key] || '#888888',
                      color: verse.id === activeVerseId ? '#ffffff' : NOTE_COLORS[verse.key] || '#a0a0a0',
                      boxShadow: `0 2px 8px ${NOTE_COLORS[verse.key] || '#888888'}40`,
                    }}
                  >
                    {getNoteDisplayName(verse.key)}
                  </span>
                  {/* Delete Icon - Visible on hover */}
                  <button
                    onClick={(e) => handleDeleteClick(verse.id, e)}
                    disabled={verses.length === 1}
                    className={`ml-auto p-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                      verses.length === 1
                        ? 'cursor-not-allowed'
                        : 'hover:bg-red-500/20 hover:scale-110'
                    }`}
                    title={verses.length === 1 ? 'Cannot delete the last verse' : 'Delete verse'}
                  >
                    <Trash2 className={`w-4 h-4 ${verses.length === 1 ? 'text-red-500/30' : 'text-red-500'}`} />
                  </button>
                </div>

                {/* Bottom row: Chord progression */}
                {verse.chordProgression && verse.chordProgression.length > 0 && (
                  <div
                    className="flex gap-1 flex-wrap max-w-[280px] p-1.5 rounded-lg border-2"
                    style={{
                      borderColor: verse.id === activeVerseId ? 'rgba(255,255,255,0.2)' : 'rgba(58,58,58,0.5)',
                      backgroundColor: verse.id === activeVerseId ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)',
                    }}
                  >
                    {verse.chordProgression.slice(0, 6).map((chord, idx) => {
                      const rootColor = NOTE_COLORS[chord.rootNote] || '#888888';
                      return (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-bold shadow-md transition-transform hover:scale-110"
                          style={{
                            backgroundColor: rootColor,
                            color: '#ffffff',
                            border: `2px solid ${rootColor}`,
                            boxShadow: `0 2px 8px ${rootColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                          }}
                        >
                          {chord.chordSymbol}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleRename(verse.id)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleDuplicate(verse.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onVerseDelete(verse.id)}
                className="text-red-500"
                disabled={verses.length === 1}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}

        <Button
          onClick={handleAddVerse}
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0 border-2 border-dashed border-[#3a3a3a] hover:border-[#3b82f6] hover:bg-gradient-to-b hover:from-[#3b82f6] hover:to-[#2563eb] hover:text-white hover:shadow-lg hover:shadow-[#3b82f6]/30 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0f0f0f] border-2 border-[#3a3a3a] shadow-2xl max-w-md">
          <DialogHeader className="pb-4 border-b border-[#2a2a2a]">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-[#e0e0e0] to-[#b0b0b0] bg-clip-text text-transparent">
              Rename Verse
            </DialogTitle>
            <p className="text-sm text-[#888888] mt-1 font-medium">
              Give your verse a memorable name
            </p>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter verse name"
              className="bg-[#2a2a2a] border-2 border-[#3a3a3a] focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/20 text-white placeholder:text-[#666666] text-lg px-4 py-3 rounded-lg transition-all duration-200"
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
              className="font-semibold bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:bg-[#333333] hover:border-[#4a4a4a] text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              className="font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5568d3] hover:to-[#6a3f91] text-white shadow-lg shadow-[#667eea]/30 transition-all duration-200"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0f0f0f] border-2 border-red-900/50 shadow-2xl max-w-md">
          <DialogHeader className="pb-4 border-b border-[#2a2a2a]">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-500" />
              Delete Song Section
            </DialogTitle>
            <p className="text-sm text-[#888888] mt-2 font-medium">
              Are you sure you want to delete this song section?
            </p>
            <p className="text-xs text-[#666666] mt-1">
              This action cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="font-semibold bg-[#2a2a2a] border-2 border-[#3a3a3a] hover:bg-[#333333] hover:border-[#4a4a4a] text-white transition-all duration-200"
            >
              No
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30 transition-all duration-200"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

