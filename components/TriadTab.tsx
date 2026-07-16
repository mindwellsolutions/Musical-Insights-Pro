'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { TriadType, CAGEDShape, TriadInversion } from '@/lib/triad-theory';
import { TriadDatabaseEntry, getTriad } from '@/lib/triad-database-loader';
import { convertTriadPositionsToNotePositions } from '@/lib/triad-converter';

interface TriadTabProps {
  theme: ThemeConfig;
  selectedRoot: string;
  selectedType: TriadType;
  onTypeChange: (type: TriadType) => void;
  selectedCAGEDShapes: CAGEDShape[];
  onCAGEDShapesChange: (shapes: CAGEDShape[]) => void;
  selectedInversion?: TriadInversion;
  onInversionChange?: (inversion: TriadInversion) => void;
  onTriadDataChange?: (data: any) => void;
  onClose?: () => void;
  showCAGEDGuide?: boolean;
}

export default function TriadTab({
  theme,
  selectedRoot,
  selectedType,
  onTypeChange,
  selectedCAGEDShapes,
  onCAGEDShapesChange,
  selectedInversion: selectedInversionProp,
  onInversionChange,
  onTriadDataChange,
  onClose,
  showCAGEDGuide = false,
}: TriadTabProps) {
  const [triadData, setTriadData] = useState<TriadDatabaseEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use prop if provided, otherwise use internal state
  const [internalInversion, setInternalInversion] = useState<TriadInversion>('root');
  const selectedInversion = selectedInversionProp ?? internalInversion;

  const handleInversionChange = (inversion: TriadInversion) => {
    if (onInversionChange) {
      onInversionChange(inversion);
    } else {
      setInternalInversion(inversion);
    }
  };

  // Load triad data when selection changes
  useEffect(() => {
    async function loadTriadData() {
      setIsLoading(true);
      try {
        const data = await getTriad(selectedRoot, selectedType);
        setTriadData(data);
      } catch (error) {
        console.error('Error loading triad data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTriadData();
  }, [selectedRoot, selectedType]);

  // Notify parent when triad data changes
  useEffect(() => {
    if (onTriadDataChange && triadData) {
      // Filter positions by CAGED shapes if guide is enabled
      let positions = triadData.positions;
      if (showCAGEDGuide && selectedCAGEDShapes.length > 0) {
        positions = positions.filter(pos =>
          pos.cagedShape !== null && selectedCAGEDShapes.includes(pos.cagedShape)
        );
      }

      // Convert triad positions to note positions with proper chord tone metadata
      const notePositions = convertTriadPositionsToNotePositions(
        positions,
        selectedInversion,
        selectedRoot,
        selectedType
      );

      onTriadDataChange({
        triadData: { ...triadData, positions },
        notePositions,
        triadNotes: triadData.notes,
        selectedInversion,
      });
    }
  }, [triadData, selectedInversion, selectedRoot, selectedType, onTriadDataChange, showCAGEDGuide, selectedCAGEDShapes]);

  return (
    <div className="space-y-4">
      {/* Triad Settings card removed - now in Select Key & Scale */}

      {isLoading && (
        <div
          className="text-center py-8 text-sm"
          style={{ color: theme.textSecondary }}
        >
          <div className="animate-pulse">Loading triad data...</div>
        </div>
      )}

      {!isLoading && !triadData && (
        <div
          className="text-center py-8 rounded-lg"
          style={{
            background: theme.bgTertiary,
            border: `1px solid ${theme.border}`,
            color: theme.textSecondary,
          }}
        >
          <p className="text-sm">No triad data available</p>
          <p className="text-xs mt-2">Please select a root note and triad type</p>
        </div>
      )}
    </div>
  );
}

