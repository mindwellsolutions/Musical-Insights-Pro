'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PhotoUploaderProps {
  onPhotosChange: (files: File[]) => void;
  maxPhotos?: number;
  maxSizeMB?: number;
}

/**
 * PhotoUploader Component
 * Allows users to upload multiple photos with preview
 */
export function PhotoUploader({
  onPhotosChange,
  maxPhotos = 5,
  maxSizeMB = 5
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    // Validate number of photos
    if (photos.length + files.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} is larger than ${maxSizeMB}MB`);
        continue;
      }

      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File ${file.name} is not a valid image format`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    const updatedPhotos = [...photos, ...validFiles];
    const updatedPreviews = [...previews, ...newPreviews];

    setPhotos(updatedPhotos);
    setPreviews(updatedPreviews);
    onPhotosChange(updatedPhotos);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);

    setPhotos(updatedPhotos);
    setPreviews(updatedPreviews);
    onPhotosChange(updatedPhotos);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Photos (Optional)
        </label>
        <span className="text-xs text-gray-500">
          {photos.length}/{maxPhotos} photos
        </span>
      </div>

      {/* Upload Button */}
      {photos.length < maxPhotos && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Photo Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group"
            >
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {previews.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            No photos uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}

