'use client';

import React, { useState, useEffect } from 'react';
import { AudioDeviceSelectorProps, AudioDevice } from '@/types/audio';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mic, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * AudioDeviceSelector Component
 * Allows users to select audio input devices (WDM devices) for guitar/bass input
 */
export function AudioDeviceSelector({
  onDeviceSelect,
  selectedDeviceId,
  className = '',
}: AudioDeviceSelectorProps) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  /**
   * Request microphone permission and enumerate devices
   */
  const requestPermissionAndEnumerateDevices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      
      // Enumerate devices
      await enumerateDevices();
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      setError('Microphone permission denied. Please allow microphone access to use this feature.');
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enumerate available audio input devices
   */
  const enumerateDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      
      // Filter for audio input devices only
      const audioInputs = allDevices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
          groupId: device.groupId,
        }));

      setDevices(audioInputs);

      // Auto-select first device if none selected
      if (audioInputs.length > 0 && !selectedDeviceId) {
        onDeviceSelect(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Failed to enumerate audio devices.');
    }
  };

  /**
   * Handle device selection change
   */
  const handleDeviceChange = (deviceId: string) => {
    onDeviceSelect(deviceId);
  };

  /**
   * Check for existing permission on mount
   */
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (result.state === 'granted') {
          setHasPermission(true);
          await enumerateDevices();
        }
      } catch (err) {
        // Permission API not supported or error - user will need to click button
        console.log('Permission API not supported or error:', err);
      }
    };

    checkPermission();
  }, []);

  /**
   * Listen for device changes (plug/unplug)
   */
  useEffect(() => {
    if (!hasPermission) return;

    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [hasPermission]);

  return (
    <div className={`space-y-4 ${className}`}>
      {!hasPermission ? (
        <div className="space-y-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Microphone access is required to detect guitar notes. Click the button below to grant permission.
            </AlertDescription>
          </Alert>
          <Button
            onClick={requestPermissionAndEnumerateDevices}
            disabled={isLoading}
            className="w-full"
          >
            <Mic className="mr-2 h-4 w-4" />
            {isLoading ? 'Requesting Permission...' : 'Enable Microphone Access'}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="audio-device-select" className="text-sm font-medium">
            Audio Input Device
          </label>
          <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
            <SelectTrigger id="audio-device-select" className="w-full">
              <SelectValue placeholder="Select audio input device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {devices.length === 0 && (
            <p className="text-sm text-muted-foreground">No audio input devices found.</p>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

