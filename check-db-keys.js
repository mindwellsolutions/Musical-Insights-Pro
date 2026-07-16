const guitar = require('@tombatossals/chords-db/lib/guitar.json');

console.log('Available root notes in chord database:');
console.log(Object.keys(guitar.chords).sort().join(', '));

console.log('\n\nChecking specific notes:');
console.log('Has C#:', !!guitar.chords['C#']);
console.log('Has Db:', !!guitar.chords['Db']);
console.log('Has F#:', !!guitar.chords['F#']);
console.log('Has Gb:', !!guitar.chords['Gb']);
console.log('Has G#:', !!guitar.chords['G#']);
console.log('Has Ab:', !!guitar.chords['Ab']);

if (guitar.chords['F#']) {
  console.log('\nF# suffixes:', guitar.chords['F#'].map(c => c.suffix).join(', '));
}

if (guitar.chords['Gb']) {
  console.log('\nGb suffixes:', guitar.chords['Gb'].map(c => c.suffix).join(', '));
}

