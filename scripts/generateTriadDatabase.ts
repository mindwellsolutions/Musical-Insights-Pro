/**
 * Generate Triad Database
 * Creates a comprehensive JSON database of all triads with positions and CAGED shapes
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAllTriadTypes, getTriadNotes, getTriadSymbol, TriadType } from '../lib/triad-theory';
import { calculateTriadPositions, TriadPosition } from '../lib/triad-positions';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface TriadDatabaseEntry {
  rootNote: string;
  triadType: TriadType;
  symbol: string;
  notes: string[];
  positions: TriadPosition[];
}

interface TriadDatabase {
  version: string;
  generatedAt: string;
  triads: TriadDatabaseEntry[];
}

/**
 * Generate the complete triad database
 */
function generateTriadDatabase(): TriadDatabase {
  const triads: TriadDatabaseEntry[] = [];
  const triadTypes = getAllTriadTypes();
  
  console.log('Generating triad database...');
  
  // For each root note
  for (const rootNote of NOTES) {
    // For each triad type
    for (const triadType of triadTypes) {
      console.log(`Processing ${rootNote} ${triadType}...`);

      const notes = getTriadNotes(rootNote, triadType);
      const symbol = getTriadSymbol(rootNote, triadType);
      const positions = calculateTriadPositions(rootNote, triadType, 24);
      
      triads.push({
        rootNote,
        triadType,
        symbol,
        notes,
        positions
      });
    }
  }
  
  console.log(`Generated ${triads.length} triads`);
  
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    triads
  };
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('Starting triad database generation...');
    
    // Generate the database
    const database = generateTriadDatabase();
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'data', 'triads');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }
    
    // Write to file
    const outputPath = path.join(outputDir, 'triad-database.json');
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
    
    console.log(`✅ Triad database generated successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Total triads: ${database.triads.length}`);
    
    // Print summary statistics
    const positionCounts = database.triads.map(t => t.positions.length);
    const totalPositions = positionCounts.reduce((a, b) => a + b, 0);
    const avgPositions = totalPositions / database.triads.length;
    
    console.log(`📈 Total positions: ${totalPositions}`);
    console.log(`📊 Average positions per triad: ${avgPositions.toFixed(1)}`);
    
  } catch (error) {
    console.error('❌ Error generating triad database:', error);
    process.exit(1);
  }
}

// Run the script
main();

