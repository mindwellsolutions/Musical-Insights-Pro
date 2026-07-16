import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MIDI_FILE_PATH = path.join(process.cwd(), 'data', 'midi.json');

interface MIDIData {
  activeConfig?: any;
  profiles: any[];
}

/**
 * GET /api/midi/config
 * Retrieve the active MIDI configuration
 */
export async function GET() {
  try {
    const fileContent = await fs.readFile(MIDI_FILE_PATH, 'utf-8');
    const data: MIDIData = JSON.parse(fileContent);
    
    return NextResponse.json({
      config: data.activeConfig || null,
    });
  } catch (error) {
    console.error('Error reading MIDI config:', error);
    return NextResponse.json(
      { error: 'Failed to read MIDI configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/midi/config
 * Save the active MIDI configuration
 */
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();

    if (!config) {
      return NextResponse.json(
        { error: 'Config is required' },
        { status: 400 }
      );
    }

    // Read existing data
    let data: MIDIData = { profiles: [] };
    try {
      const fileContent = await fs.readFile(MIDI_FILE_PATH, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is invalid, use default
      console.log('Creating new MIDI config file');
    }

    // Update active config
    data.activeConfig = {
      ...config,
      lastUpdated: Date.now(),
    };

    // Write back to file
    await fs.writeFile(MIDI_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      config: data.activeConfig,
    });
  } catch (error) {
    console.error('Error saving MIDI config:', error);
    return NextResponse.json(
      { error: 'Failed to save MIDI configuration' },
      { status: 500 }
    );
  }
}

