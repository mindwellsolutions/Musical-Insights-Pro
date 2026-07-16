'use client';

/**
 * Keyboard shortcuts help dialog
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    { keys: ['Space'], description: 'Play / Pause' },
    { keys: ['Esc'], description: 'Stop playback' },
    { keys: ['Ctrl', 'S'], description: 'Save project' },
    { keys: ['Ctrl', 'O'], description: 'Load project' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Delete'], description: 'Delete selected' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#333333] shadow-2xl max-w-lg">
        <DialogHeader className="pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-[#3b82f6]" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5 py-6">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="group flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3b82f6]/30 hover:shadow-md hover:shadow-[#3b82f6]/5 transition-all duration-200"
            >
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                {shortcut.description}
              </span>
              <div className="flex gap-1.5">
                {shortcut.keys.map((key, keyIndex) => (
                  <Badge
                    key={keyIndex}
                    variant="outline"
                    className="bg-[#0a0a0a] border-[#3a3a3a] font-mono text-xs px-2.5 py-1 text-gray-300 group-hover:border-[#3b82f6]/50 group-hover:text-white transition-all"
                  >
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#2a2a2a]">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">
              💡 <span className="font-semibold">Tip:</span> Use <span className="font-mono text-gray-300">Cmd</span> instead of <span className="font-mono text-gray-300">Ctrl</span> on Mac
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

