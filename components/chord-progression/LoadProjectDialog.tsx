'use client';

/**
 * Load project dialog
 */

import { useState, useEffect } from 'react';
import { VerseData } from '@/lib/chord-progression/types';
import {
  getUserProjects,
  loadProject,
  deleteProject,
  ChordProgressionProject,
} from '@/lib/chord-progression/database-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Loader2, Trash2, Calendar, Music, X, Search, Tag } from 'lucide-react';
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
import { NOTE_COLORS } from '@/lib/musicTheory';

interface LoadProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadSuccess?: (projectId: string, verses: VerseData[], projectName: string, projectDescription: string) => void;
}

export default function LoadProjectDialog({
  open,
  onOpenChange,
  onLoadSuccess,
}: LoadProjectDialogProps) {
  const [projects, setProjects] = useState<ChordProgressionProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<ChordProgressionProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // Extract root note from chord symbol and get its color
  const getRootNoteColor = (chordSymbol: string) => {
    const rootNote = chordSymbol.replace(/[^A-G#b]/g, '');
    return NOTE_COLORS[rootNote] || '#3b82f6';
  };
  const [selectedProjectData, setSelectedProjectData] = useState<VerseData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProjects();
      setSelectedProject(null);
      setSelectedProjectData(null);
    }
  }, [open]);

  // Load preview when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadPreview(selectedProject.id);
    }
  }, [selectedProject]);

  const loadPreview = async (projectId: string) => {
    setLoadingPreview(true);
    const result = await loadProject(projectId);

    if (result.success && result.verses) {
      setSelectedProjectData(result.verses);
    } else {
      setSelectedProjectData(null);
    }

    setLoadingPreview(false);
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    const result = await getUserProjects();
    
    if (result.success && result.projects) {
      setProjects(result.projects);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load projects',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const handleLoadProject = async () => {
    if (!selectedProject || !selectedProjectData) return;

    setLoadingProjectId(selectedProject.id);

    toast({
      title: 'Success',
      description: 'Project loaded successfully',
    });
    onLoadSuccess?.(
      selectedProject.id,
      selectedProjectData,
      selectedProject.name,
      selectedProject.description || ''
    );
    onOpenChange(false);

    setLoadingProjectId(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    const result = await deleteProject(projectToDelete);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      setProjects(projects.filter(p => p.id !== projectToDelete));
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete project',
        variant: 'destructive',
      });
    }
    
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get all unique tags from projects
  const allTags = Array.from(
    new Set(projects.flatMap(p => p.tags || []))
  ).sort();

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Search filter
      const matchesSearch = searchQuery.trim() === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTag = selectedTag === '' ||
        (project.tags && project.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] border-[#3b82f6]/30 shadow-2xl shadow-[#3b82f6]/10 max-w-6xl h-[80vh] p-0">
          {/* Custom Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-50 rounded-lg p-2 bg-[#2a2a2a]/80 backdrop-blur-sm hover:bg-[#3a3a3a] border border-[#444444] hover:border-[#3b82f6]/50 transition-all"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>

          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#3b82f6]/20 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f]">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-[#60a5fa] via-[#3b82f6] to-[#2563eb] bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] shadow-lg shadow-[#3b82f6]/30">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              Load Project
            </DialogTitle>
          </DialogHeader>

          {/* Main Content - Sidebar + Preview Layout */}
          <div className="flex h-[calc(80vh-120px)]">
            {/* Left Sidebar - Project List */}
            <div className="w-80 border-r border-[#2a2a2a] flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <Loader2 className="w-10 h-10 animate-spin text-[#3b82f6] mb-4" />
                  <p className="text-gray-400 text-sm">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
                  <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-full w-16 h-16 mb-4 flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-300 font-semibold mb-2">No Projects</p>
                  <p className="text-sm text-gray-500">Save a project to see it here</p>
                </div>
              ) : (
                <>
                  {/* Filter Controls */}
                  <div className="p-4 space-y-3 border-b border-[#2a2a2a]">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-[#0a0a0a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 h-9 text-sm"
                      />
                    </div>

                    {/* Tag Filter */}
                    {allTags.length > 0 && (
                      <Select value={selectedTag} onValueChange={setSelectedTag}>
                        <SelectTrigger className="bg-[#0a0a0a] border-[#3a3a3a] text-white h-9 text-sm">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <SelectValue placeholder="All Tags" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#3a3a3a]">
                          <SelectItem value="" className="text-white hover:bg-[#2a2a2a]">All Tags</SelectItem>
                          {allTags.map(tag => (
                            <SelectItem key={tag} value={tag} className="text-white hover:bg-[#2a2a2a]">
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'name')}>
                      <SelectTrigger className="bg-[#0a0a0a] border-[#3a3a3a] text-white h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#3a3a3a]">
                        <SelectItem value="newest" className="text-white hover:bg-[#2a2a2a]">Newest First</SelectItem>
                        <SelectItem value="oldest" className="text-white hover:bg-[#2a2a2a]">Oldest First</SelectItem>
                        <SelectItem value="name" className="text-white hover:bg-[#2a2a2a]">Name (A-Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project List */}
                  {filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
                      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-full w-16 h-16 mb-4 flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-600" />
                      </div>
                      <p className="text-gray-300 font-semibold mb-2">No Projects Found</p>
                      <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-2">
                        {filteredProjects.map(project => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`group p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedProject?.id === project.id
                            ? 'border-[#3b82f6] bg-gradient-to-br from-[#3b82f6]/20 to-[#2563eb]/10 shadow-lg shadow-[#3b82f6]/20'
                            : 'border-[#2a2a2a] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] hover:border-[#3b82f6]/50 hover:shadow-md hover:shadow-[#3b82f6]/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`font-bold text-sm line-clamp-1 ${
                            selectedProject?.id === project.id ? 'text-[#60a5fa]' : 'text-white'
                          }`}>
                            {project.name}
                          </h3>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project.id);
                              setDeleteDialogOpen(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        {project.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                            {project.description}
                          </p>
                        )}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.tags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40 hover:bg-[#3b82f6]/30"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(project.updated_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                  )}
                </>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 flex flex-col">
              {!selectedProject ? (
                <div className="flex-1 flex items-center justify-center text-center px-8">
                  <div>
                    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Music className="w-10 h-10 text-gray-600" />
                    </div>
                    <p className="text-gray-300 font-semibold mb-2">Select a Project</p>
                    <p className="text-sm text-gray-500">Choose a project from the list to preview</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Preview Content */}
                  <div className="flex-1 overflow-auto p-6">
                    {loadingPreview ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
                      </div>
                    ) : selectedProjectData ? (
                      <div className="space-y-6">
                        {/* Project Info */}
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.name}</h2>
                          {selectedProject.description && (
                            <p className="text-gray-400">{selectedProject.description}</p>
                          )}
                        </div>

                        {/* Verses Preview */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Music className="w-5 h-5 text-[#3b82f6]" />
                            Verses ({selectedProjectData.length})
                          </h3>
                          {selectedProjectData.map((verse, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30">
                                  {verse.name}
                                </Badge>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                  <span>Key: {verse.key}</span>
                                  <span>BPM: {verse.bpm}</span>
                                </div>
                              </div>

                              {/* Chord Progression Preview with Root Note Colors */}
                              {verse.chordProgression && verse.chordProgression.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-2">Chord Progression:</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {verse.chordProgression.map((chord, chordIdx) => {
                                      const rootColor = getRootNoteColor(chord.chordSymbol);
                                      return (
                                        <Badge
                                          key={chordIdx}
                                          className="text-white font-bold text-xs border-0 shadow-md"
                                          style={{
                                            backgroundColor: rootColor,
                                            boxShadow: `0 0 12px ${rootColor}40`,
                                          }}
                                        >
                                          {chord.chordSymbol}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Failed to load preview
                      </div>
                    )}
                  </div>

                  {/* Load Button Footer */}
                  <div className="border-t border-[#3b82f6]/20 p-6 flex justify-center bg-gradient-to-t from-[#0a0a0a] to-transparent">
                    <Button
                      onClick={handleLoadProject}
                      disabled={loadingProjectId === selectedProject.id || !selectedProjectData}
                      className="px-10 h-12 font-bold text-base bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] shadow-xl shadow-[#3b82f6]/30 hover:shadow-2xl hover:shadow-[#3b82f6]/40 transition-all transform hover:scale-105"
                    >
                      {loadingProjectId === selectedProject.id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FolderOpen className="w-5 h-5 mr-2" />
                          Load Project
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#333333] shadow-2xl">
          <AlertDialogHeader className="pb-4 border-b border-[#2a2a2a]">
            <AlertDialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 mt-2">
              Are you sure you want to delete this project? This action cannot be undone and all data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-3">
            <AlertDialogCancel className="flex-1 h-10 font-semibold bg-transparent border-[#3a3a3a] hover:bg-[#2a2a2a] hover:border-[#4a4a4a] transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="flex-1 h-10 font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

