'use client';

/**
 * MIDI Configuration Modal
 * Allows users to configure MIDI pedal buttons and assign functions
 */

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Save, RotateCcw, Zap, Trash2, Plus, AlertCircle, Download, Upload } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { useMIDIPedal } from './MIDIContext';
import { MIDIButtonConfig, MIDI_ACTION_LABELS, MIDIButtonAction, MIDIProfile } from '@/lib/midi/midiTypes';
import { isMIDISupported, getAvailableActionsForButton } from '@/lib/midi/midiUtils';

interface MIDIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

export default function MIDIConfigModal({ isOpen, onClose, theme }: MIDIConfigModalProps) {
  const {
    config,
    availableDevices,
    selectedDevice,
    isLearning,
    learningButtonId,
    lastMIDIMessage,
    updateConfig,
    selectDevice,
    startLearning,
    stopLearning,
    resetConfig,
    saveConfig,
    clearAllButtons,
  } = useMIDIPedal();

  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [profiles, setProfiles] = useState<MIDIProfile[]>([]);
  const [profileName, setProfileName] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Sync local config with context config
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(localConfig) !== JSON.stringify(config);
    setHasChanges(changed);
  }, [localConfig, config]);

  // Load profiles when device changes
  useEffect(() => {
    if (selectedDevice?.name) {
      loadProfiles();
    }
  }, [selectedDevice?.name]);

  // Load profiles from API
  const loadProfiles = async () => {
    if (!selectedDevice?.name) return;

    setIsLoadingProfiles(true);
    try {
      const response = await fetch(`/api/midi/profiles?deviceName=${encodeURIComponent(selectedDevice.name)}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Save current configuration as a profile
  const handleSaveProfile = async () => {
    if (!profileName.trim() || !selectedDevice?.name) return;

    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/midi/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName.trim(),
          deviceName: selectedDevice.name,
          config: localConfig,
        }),
      });

      if (response.ok) {
        setProfileName('');
        await loadProfiles();
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Load a profile
  const handleLoadProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    setLocalConfig(profile.config);
    setSelectedProfileId(profileId);
  };

  // Delete a profile
  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Delete this profile?')) return;

    try {
      const response = await fetch(`/api/midi/profiles?id=${profileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadProfiles();
        if (selectedProfileId === profileId) {
          setSelectedProfileId(null);
        }
      } else {
        alert('Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile');
    }
  };

  if (!isOpen) return null;

  const handleDeviceChange = (deviceId: string) => {
    selectDevice(deviceId);
  };

  const handleButtonActionChange = (buttonId: string, action: MIDIButtonAction) => {
    setLocalConfig(prev => ({
      ...prev,
      buttons: prev.buttons.map(btn =>
        btn.id === buttonId ? { ...btn, action } : btn
      ),
    }));
  };

  const handleLearnButton = (action: MIDIButtonAction) => {
    if (isLearning && learningButtonId === action) {
      stopLearning();
    } else {
      // Use the action as the learning ID
      startLearning(action);
    }
  };

  const handleSave = async () => {
    // Ensure enabled is true if we have a device and buttons assigned
    const configToSave = {
      ...localConfig,
      enabled: selectedDevice ? true : localConfig.enabled,
    };

    console.log('[MIDI Config] Saving configuration:', configToSave);

    // updateConfig already calls saveMIDIConfig internally (saves to localStorage)
    updateConfig(configToSave);

    // Save to server (midi.json) as the active configuration
    try {
      const response = await fetch('/api/midi/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: configToSave,
        }),
      });

      if (response.ok) {
        console.log('[MIDI Config] Successfully saved to server');
      } else {
        console.error('[MIDI Config] Failed to save to server');
      }
    } catch (error) {
      console.error('[MIDI Config] Error saving to server:', error);
    }

    // Also update the profile if one is selected
    if (selectedProfileId && selectedDevice?.name) {
      try {
        await fetch('/api/midi/profiles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedProfileId,
            config: configToSave,
          }),
        });
      } catch (error) {
        console.error('[MIDI Config] Error updating profile:', error);
      }
    }

    onClose();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all MIDI configuration to defaults?')) {
      resetConfig();
      setLocalConfig(config);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        setLocalConfig(config);
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isMIDISupported()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className="rounded-lg p-6 max-w-md w-full mx-4"
          style={{
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: theme.textPrimary }}>
            MIDI Not Supported
          </h2>
          <p className="mb-4" style={{ color: theme.textSecondary }}>
            Your browser does not support the Web MIDI API. Please use Chrome, Edge, or Opera to use MIDI pedal features.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg font-medium"
            style={{
              background: theme.accentPrimary,
              color: '#ffffff',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
            Configure MIDI Pedalboard
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: theme.textSecondary }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Device Selection Section */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: theme.textPrimary }}>
              1. Select MIDI Device
            </h3>
            <div className="flex gap-2">
              <select
                value={selectedDevice?.id || ''}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{
                  background: theme.bgTertiary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <option value="">No Device Selected</option>
                {availableDevices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.name} {device.manufacturer ? `(${device.manufacturer})` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 rounded-lg hover:opacity-70 transition-opacity"
                style={{
                  background: theme.bgTertiary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
                title="Refresh devices"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Management */}
            {selectedDevice && (
              <div className="mt-4 space-y-3">
                {/* Save Profile */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Profile name..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: theme.bgSecondary,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                    }}
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={!profileName.trim() || isSavingProfile}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      background: theme.accentPrimary,
                      color: '#ffffff',
                      border: `1px solid ${theme.accentPrimary}`,
                    }}
                  >
                    <Save className="h-4 w-4" />
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>

                {/* Load Profile */}
                {profiles.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={selectedProfileId || ''}
                      onChange={(e) => e.target.value && handleLoadProfile(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm"
                      style={{
                        background: theme.bgSecondary,
                        color: theme.textPrimary,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <option value="">Load a profile...</option>
                      {profiles.map(profile => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                    {selectedProfileId && (
                      <button
                        onClick={() => handleDeleteProfile(selectedProfileId)}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-70"
                        style={{
                          background: '#dc2626',
                          color: '#ffffff',
                          border: '1px solid #b91c1c',
                        }}
                        title="Delete selected profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Button Assignment Section */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: theme.textPrimary }}>
              2. Set MIDI Pedal Buttons
            </h3>

            {!selectedDevice ? (
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <AlertCircle className="h-8 w-8 mx-auto mb-2" style={{ color: theme.textSecondary }} />
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Please select a MIDI device first
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
                  Click "Assign Button" next to each action, then press the corresponding button on your MIDI pedal.
                </p>

                {/* Action Assignment List */}
                <div className="space-y-3">
                  {(['prev', 'next', 'scale-left', 'scale-right', 'item-left', 'item-right', 'section-left', 'section-right'] as MIDIButtonAction[]).map((action) => {
                    // Find if this action is already assigned to a button
                    const assignedButton = localConfig.buttons.find(b => b.action === action);
                    const isLearningThis = isLearning && learningButtonId === action;

                    return (
                      <div
                        key={action}
                        className="rounded-lg p-4"
                        style={{
                          background: theme.bgTertiary,
                          border: `2px solid ${isLearningThis ? theme.accentPrimary : theme.border}`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Action Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                                {MIDI_ACTION_LABELS[action]}
                              </span>
                              {assignedButton && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded"
                                  style={{
                                    background: theme.accentPrimary,
                                    color: '#ffffff',
                                  }}
                                >
                                  Assigned
                                </span>
                              )}
                            </div>

                            {assignedButton ? (
                              <div className="text-xs" style={{ color: theme.textSecondary }}>
                                {assignedButton.messageType === 'cc' && `CC ${assignedButton.ccNumber}`}
                                {assignedButton.messageType === 'note' && `Note ${assignedButton.noteNumber}`}
                                {assignedButton.messageType === 'program' && `Program ${assignedButton.programNumber}`}
                                {' • Channel '}{assignedButton.channel}
                              </div>
                            ) : (
                              <div className="text-xs" style={{ color: theme.textSecondary }}>
                                Not assigned
                              </div>
                            )}
                          </div>

                          {/* Assign/Reassign Button */}
                          <button
                            onClick={() => handleLearnButton(action)}
                            className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                            style={{
                              background: isLearningThis ? theme.accentPrimary : theme.bgSecondary,
                              color: isLearningThis ? '#ffffff' : theme.textPrimary,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            <Zap className="h-3.5 w-3.5" />
                            {isLearningThis ? 'Listening...' : assignedButton ? 'Reassign' : 'Assign Button'}
                          </button>
                        </div>

                        {/* Learning Feedback */}
                        {isLearningThis && (
                          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                            <div className="flex items-center gap-2 text-xs" style={{ color: theme.accentPrimary }}>
                              <div className="animate-pulse">●</div>
                              <span>Press a button on your MIDI pedal...</span>
                            </div>
                            {lastMIDIMessage && (
                              <div className="mt-2 text-xs font-mono p-2 rounded" style={{
                                background: theme.bgSecondary,
                                color: theme.textPrimary,
                              }}>
                                Detected: {lastMIDIMessage.type === 'cc' ? 'CC' : 'Note'} {lastMIDIMessage.number} •
                                Ch {lastMIDIMessage.channel} •
                                Val {lastMIDIMessage.value}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Clear All Button */}
                {localConfig.buttons.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all button assignments?')) {
                        clearAllButtons();
                      }
                    }}
                    className="w-full mt-4 px-3 py-2 rounded-lg text-xs font-medium hover:opacity-70 transition-opacity"
                    style={{
                      background: theme.bgTertiary,
                      color: theme.textSecondary,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    Clear All Assignments
                  </button>
                )}
              </>
            )}
          </div>

          {/* Configuration Summary */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: theme.textPrimary }}>
              3. Configuration Summary
            </h3>
            <div
              className="rounded-lg p-4 space-y-2"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: theme.textSecondary }}>Assigned Actions:</span>
                <span className="font-medium" style={{ color: theme.textPrimary }}>
                  {localConfig.buttons.filter(b => b.action !== 'none').length} / 4
                </span>
              </div>

              <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${theme.border}` }}>
                <p className="text-xs mb-2" style={{ color: theme.textSecondary }}>
                  Status:
                </p>
                <div className="space-y-1">
                  {(['prev', 'next', 'scale-left', 'scale-right', 'item-left', 'item-right', 'section-left', 'section-right'] as MIDIButtonAction[]).map(action => {
                    const assigned = localConfig.buttons.find(b => b.action === action);
                    return (
                      <div key={action} className="flex items-center justify-between text-xs">
                        <span style={{ color: theme.textSecondary }}>
                          {MIDI_ACTION_LABELS[action]}:
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: assigned ? '#22c55e' : theme.textSecondary }}
                        >
                          {assigned ? '✓ Assigned' : 'Not assigned'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {lastMIDIMessage && (
                <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                    Last MIDI Message:
                  </p>
                  <div className="text-xs font-mono p-2 rounded" style={{
                    background: theme.bgSecondary,
                    color: theme.textPrimary,
                  }}>
                    {lastMIDIMessage.type === 'cc' ? 'CC' : 'Note'} {lastMIDIMessage.number} •
                    Ch {lastMIDIMessage.channel} •
                    Val {lastMIDIMessage.value}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="flex items-center justify-between gap-3 p-4 border-t"
          style={{ borderColor: theme.border }}
        >
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-70 flex items-center gap-2"
            style={{
              background: theme.bgTertiary,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
            }}
            title="Reset all configuration to defaults"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-70"
              style={{
                background: theme.bgTertiary,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: '2px solid #2563eb',
              }}
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

