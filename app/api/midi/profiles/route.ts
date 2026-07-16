import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MIDI_FILE_PATH = path.join(process.cwd(), 'data', 'midi.json');

export interface MIDIProfile {
  id: string;
  name: string;
  deviceName: string;
  config: any;
  createdAt: number;
  updatedAt: number;
}

export interface MIDIData {
  profiles: MIDIProfile[];
}

// GET - Retrieve all profiles or profiles for a specific device
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceName = searchParams.get('deviceName');

    const fileContent = await fs.readFile(MIDI_FILE_PATH, 'utf-8');
    const data: MIDIData = JSON.parse(fileContent);

    // Filter by device name if provided
    const profiles = deviceName
      ? data.profiles.filter(p => p.deviceName === deviceName)
      : data.profiles;

    return NextResponse.json({ profiles }, { status: 200 });
  } catch (error) {
    console.error('Error reading MIDI profiles:', error);
    return NextResponse.json({ error: 'Failed to read profiles' }, { status: 500 });
  }
}

// POST - Create a new profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, deviceName, config } = body;

    if (!name || !deviceName || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: name, deviceName, config' },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(MIDI_FILE_PATH, 'utf-8');
    const data: MIDIData = JSON.parse(fileContent);

    const newProfile: MIDIProfile = {
      id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      deviceName,
      config,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    data.profiles.push(newProfile);

    await fs.writeFile(MIDI_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ profile: newProfile }, { status: 201 });
  } catch (error) {
    console.error('Error creating MIDI profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

// PUT - Update an existing profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, config } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing profile ID' }, { status: 400 });
    }

    const fileContent = await fs.readFile(MIDI_FILE_PATH, 'utf-8');
    const data: MIDIData = JSON.parse(fileContent);

    const profileIndex = data.profiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (name) data.profiles[profileIndex].name = name;
    if (config) data.profiles[profileIndex].config = config;
    data.profiles[profileIndex].updatedAt = Date.now();

    await fs.writeFile(MIDI_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ profile: data.profiles[profileIndex] }, { status: 200 });
  } catch (error) {
    console.error('Error updating MIDI profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// DELETE - Delete a profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing profile ID' }, { status: 400 });
    }

    const fileContent = await fs.readFile(MIDI_FILE_PATH, 'utf-8');
    const data: MIDIData = JSON.parse(fileContent);

    const profileIndex = data.profiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    data.profiles.splice(profileIndex, 1);

    await fs.writeFile(MIDI_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting MIDI profile:', error);
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}

