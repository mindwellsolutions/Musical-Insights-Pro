'use client';

import { InstrumentType } from '@/lib/chord-progression/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InstrumentSelectorProps {
  value: InstrumentType;
  onChange: (instrument: InstrumentType) => void;
}

const INSTRUMENTS: { value: InstrumentType; label: string; description: string }[] = [
  { value: 'piano', label: 'Acoustic Piano', description: 'Rich, warm piano sound' },
  { value: 'guitar', label: 'Acoustic Guitar', description: 'Nylon string guitar' },
  { value: 'strings', label: 'String Ensemble', description: 'Orchestral strings' },
  { value: 'brass', label: 'Trumpet', description: 'Bright brass sound' },
  { value: 'synth', label: 'Synth Strings', description: 'Electronic pad sound' },
];

export default function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-300">Instrument:</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48 bg-[#1a1a1a] border-[#2a2a2a]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
          {INSTRUMENTS.map(instrument => (
            <SelectItem
              key={instrument.value}
              value={instrument.value}
              className="hover:bg-[#2a2a2a]"
            >
              <div>
                <div className="font-medium">{instrument.label}</div>
                <div className="text-xs text-gray-400">{instrument.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

