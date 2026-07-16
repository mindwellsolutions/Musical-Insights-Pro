'use client';

/**
 * Save project dialog
 */

import { useState } from 'react';
import { VerseData } from '@/lib/chord-progression/types';
import { saveProject, updateProject } from '@/lib/chord-progression/database-service';
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

interface SaveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verses: VerseData[];
  currentProjectId?: string;
  currentProjectName?: string;
  currentProjectDescription?: string;
  onSaveSuccess?: (projectId: string, projectName: string, projectDescription: string) => void;
}

export default function SaveProjectDialog({
  open,
  onOpenChange,
  verses,
  currentProjectId,
  currentProjectName,
  currentProjectDescription,
  onSaveSuccess,
}: SaveProjectDialogProps) {
  const [name, setName] = useState(currentProjectName || '');
  const [description, setDescription] = useState(currentProjectDescription || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      let result: { success: boolean; projectId?: string; error?: string };

      if (currentProjectId) {
        // Update existing project
        const updateResult = await updateProject(currentProjectId, name, description, verses, tags);
        result = { ...updateResult, projectId: currentProjectId };
      } else {
        // Create new project
        result = await saveProject(name, description, verses, tags);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: currentProjectId ? 'Project saved successfully' : 'Project saved successfully',
        });
        onSaveSuccess?.(result.projectId || '', name, description);
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save project',
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
            Save Project As
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-200">
              Project Name *
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
              placeholder="Add a description for your project..."
              className="bg-[#0a0a0a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all min-h-[100px] resize-none"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-semibold text-gray-200">
              Tags (Optional)
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      if (!tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                      }
                      setTagInput('');
                    }
                  }}
                  placeholder="Add a tag and press Enter..."
                  className="flex-1 bg-[#0a0a0a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all h-11"
                  disabled={isSaving}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }}
                  disabled={isSaving || !tagInput.trim()}
                  className="h-11 px-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a]"
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-sm text-[#3b82f6]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        disabled={isSaving}
                        className="hover:text-[#60a5fa] transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-300 mb-2">Project Summary</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                <span>{verses.length} verse{verses.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                <span>
                  {verses.reduce((sum, v) => sum + v.chordProgression.length, 0)} chord
                  {verses.reduce((sum, v) => sum + v.chordProgression.length, 0) !== 1 ? 's' : ''}
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
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

