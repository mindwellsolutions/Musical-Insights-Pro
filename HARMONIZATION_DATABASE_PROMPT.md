# Harmonization Database Generation Prompt

## Objective
Generate a complete JSON database containing harmonization data (3rds, 5ths, 6ths, and 7ths) for all 12 keys and all major scales/modes used in this guitar scales application.

## Database Structure

Create a single JSON file named: `harmonization-complete-database.json`

### JSON Format

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-22",
  "description": "Complete harmonization database for all keys and scales",
  "keys": {
    "C": {
      "scales": {
        "Major": {
          "scaleNotes": ["C", "D", "E", "F", "G", "A", "B"],
          "harmonizations": {
            "thirds": {
              "interval": "major/minor third",
              "description": "Diatonic thirds harmony - common in country, rock, and classical music",
              "harmonizedNotes": [
                { "original": "C", "harmonized": "E", "intervalType": "major third" },
                { "original": "D", "harmonized": "F", "intervalType": "minor third" },
                { "original": "E", "harmonized": "G", "intervalType": "minor third" },
                { "original": "F", "harmonized": "A", "intervalType": "major third" },
                { "original": "G", "harmonized": "B", "intervalType": "major third" },
                { "original": "A", "harmonized": "C", "intervalType": "minor third" },
                { "original": "B", "harmonized": "D", "intervalType": "minor third" }
              ]
            },
            "fifths": {
              "interval": "perfect fifth",
              "description": "Power chord harmony - creates powerful, consonant harmonies used in rock and metal",
              "harmonizedNotes": [
                { "original": "C", "harmonized": "G", "intervalType": "perfect fifth" },
                { "original": "D", "harmonized": "A", "intervalType": "perfect fifth" },
                { "original": "E", "harmonized": "B", "intervalType": "perfect fifth" },
                { "original": "F", "harmonized": "C", "intervalType": "perfect fifth" },
                { "original": "G", "harmonized": "D", "intervalType": "perfect fifth" },
                { "original": "A", "harmonized": "E", "intervalType": "perfect fifth" },
                { "original": "B", "harmonized": "F", "intervalType": "diminished fifth" }
              ]
            },
            "sixths": {
              "interval": "major/minor sixth",
              "description": "Sweet sixth harmony - creates smooth harmonies popular in R&B and soul",
              "harmonizedNotes": [
                { "original": "C", "harmonized": "A", "intervalType": "major sixth" },
                { "original": "D", "harmonized": "B", "intervalType": "major sixth" },
                { "original": "E", "harmonized": "C", "intervalType": "minor sixth" },
                { "original": "F", "harmonized": "D", "intervalType": "major sixth" },
                { "original": "G", "harmonized": "E", "intervalType": "major sixth" },
                { "original": "A", "harmonized": "F", "intervalType": "minor sixth" },
                { "original": "B", "harmonized": "G", "intervalType": "minor sixth" }
              ]
            },
            "sevenths": {
              "interval": "major/minor seventh",
              "description": "Jazz seventh harmony - creates rich, complex harmonies used in jazz and fusion",
              "harmonizedNotes": [
                { "original": "C", "harmonized": "B", "intervalType": "major seventh" },
                { "original": "D", "harmonized": "C", "intervalType": "minor seventh" },
                { "original": "E", "harmonized": "D", "intervalType": "minor seventh" },
                { "original": "F", "harmonized": "E", "intervalType": "major seventh" },
                { "original": "G", "harmonized": "F", "intervalType": "minor seventh" },
                { "original": "A", "harmonized": "G", "intervalType": "minor seventh" },
                { "original": "B", "harmonized": "A", "intervalType": "minor seventh" }
              ]
            }
          }
        },
        "Minor": {
          "scaleNotes": ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
          "harmonizations": {
            "thirds": { /* ... same structure ... */ },
            "fifths": { /* ... same structure ... */ },
            "sixths": { /* ... same structure ... */ },
            "sevenths": { /* ... same structure ... */ }
          }
        },
        "Dorian": { /* ... same structure ... */ },
        "Phrygian": { /* ... same structure ... */ },
        "Lydian": { /* ... same structure ... */ },
        "Mixolydian": { /* ... same structure ... */ },
        "Aeolian": { /* ... same structure ... */ },
        "Locrian": { /* ... same structure ... */ },
        "Harmonic Minor": { /* ... same structure ... */ },
        "Melodic Minor": { /* ... same structure ... */ },
        "Pentatonic Major": { /* ... same structure ... */ },
        "Pentatonic Minor": { /* ... same structure ... */ },
        "Blues": { /* ... same structure ... */ }
      }
    },
    "Db": { /* ... repeat for all 12 keys ... */ },
    "D": { /* ... repeat for all 12 keys ... */ },
    "Eb": { /* ... repeat for all 12 keys ... */ },
    "E": { /* ... repeat for all 12 keys ... */ },
    "F": { /* ... repeat for all 12 keys ... */ },
    "Gb": { /* ... repeat for all 12 keys ... */ },
    "G": { /* ... repeat for all 12 keys ... */ },
    "Ab": { /* ... repeat for all 12 keys ... */ },
    "A": { /* ... repeat for all 12 keys ... */ },
    "Bb": { /* ... repeat for all 12 keys ... */ },
    "B": { /* ... repeat for all 12 keys ... */ }
  }
}
```

## Key Requirements

1. **Use Flat Keys**: Use Db, Eb, Gb, Ab, Bb instead of C#, D#, F#, G#, A# for key names
2. **All 12 Keys**: Generate data for all 12 keys (C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B)
3. **All Scales/Modes**: Include these scales for each key:
   - Major (Ionian)
   - Minor (Natural Minor/Aeolian)
   - Dorian
   - Phrygian
   - Lydian
   - Mixolydian
   - Locrian
   - Harmonic Minor
   - Melodic Minor
   - Pentatonic Major
   - Pentatonic Minor
   - Blues

4. **Harmonization Types**: For each scale, include:
   - thirds (diatonic thirds)
   - fifths (perfect/diminished fifths)
   - sixths (major/minor sixths)
   - sevenths (major/minor sevenths)

5. **Interval Types**: Specify the exact interval type for each harmonized note:
   - For thirds: "major third" or "minor third"
   - For fifths: "perfect fifth" or "diminished fifth"
   - For sixths: "major sixth" or "minor sixth"
   - For sevenths: "major seventh" or "minor seventh"

## Music Theory Rules

- Harmonizations should follow diatonic harmony (stay within the scale)
- Calculate intervals based on scale degrees, not chromatic intervals
- For example, in C Major:
  - C harmonized in thirds = E (major third)
  - D harmonized in thirds = F (minor third)
  - E harmonized in thirds = G (minor third)
  - etc.

## Output

Generate the complete JSON file with all 12 keys and all scales/modes with proper harmonization data.

