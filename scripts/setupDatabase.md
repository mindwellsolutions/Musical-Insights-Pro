# Database Setup Instructions

This document provides instructions for setting up the Supabase database for the Real-Time Key Detection feature.

## Prerequisites

1. A Supabase project created
2. Supabase project credentials added to `.env.local`
3. Access to Supabase SQL Editor or CLI

## Step 1: Create .env.local

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual Supabase credentials.

## Step 2: Run Migrations

Execute the following SQL migration files in order using the Supabase SQL Editor:

### Migration 1: Create musical_keys table
```bash
sql/migrations/001_create_musical_keys.sql
```

### Migration 2: Create scale_mode_compatibility table
```bash
sql/migrations/002_create_scale_compatibility.sql
```

### Migration 3: Create detected_key_history table (optional)
```bash
sql/migrations/003_create_detected_key_history.sql
```

### Migration 4: Seed musical keys
```bash
sql/migrations/004_seed_musical_keys.sql
```

## Step 3: Generate and Seed Compatibility Data

### Option A: Using the TypeScript Generator (Recommended)

1. Install ts-node if not already installed:
```bash
npm install -D ts-node
```

2. Generate the compatibility data SQL:
```bash
npx ts-node scripts/generateCompatibilityData.ts > sql/migrations/005_seed_compatibility_data.sql
```

3. Run the generated SQL file in Supabase SQL Editor:
```bash
sql/migrations/005_seed_compatibility_data.sql
```

### Option B: Manual Seeding via Supabase Client

If you prefer to seed the data programmatically:

1. Create a seed script:
```typescript
// scripts/seedDatabase.ts
import { supabase } from '../lib/supabase/client';
import { getCompatibleScales } from '../lib/musical-intelligence/scaleCompatibility';

async function seedCompatibilityData() {
  const keys = [
    { keyName: 'C', quality: 'major' as const },
    { keyName: 'Cm', quality: 'minor' as const },
    // ... add all 24 keys
  ];

  for (const { keyName, quality } of keys) {
    const musicalKey = await supabase
      .from('musical_keys')
      .select('id')
      .eq('key_name', keyName)
      .single();

    if (!musicalKey.data) continue;

    const compatibleScales = getCompatibleScales(keyName, quality);

    for (const scale of compatibleScales) {
      await supabase.from('scale_mode_compatibility').insert({
        musical_key_id: musicalKey.data.id,
        scale_mode_name: scale.scaleName,
        root_note: scale.rootNote,
        compatibility_rating: scale.rating,
        is_primary: scale.isPrimary,
        chord_tones: scale.chordTones,
        guide_tones: scale.guideTones,
        musical_context: scale.musicalContext,
        scale_intervals: scale.scaleIntervals,
      });
    }
  }
}

seedDatabase().then(() => console.log('Done!'));
```

2. Run the seed script:
```bash
npx ts-node scripts/seedDatabase.ts
```

## Step 4: Verify Data

Run the following queries in Supabase SQL Editor to verify:

```sql
-- Check musical keys (should return 24 rows)
SELECT COUNT(*) FROM musical_keys;

-- Check compatibility data (should return thousands of rows)
SELECT COUNT(*) FROM scale_mode_compatibility;

-- View sample compatibility data for C major
SELECT 
  mk.key_name,
  smc.scale_mode_name,
  smc.root_note,
  smc.compatibility_rating,
  smc.is_primary
FROM scale_mode_compatibility smc
JOIN musical_keys mk ON smc.musical_key_id = mk.id
WHERE mk.key_name = 'C'
ORDER BY smc.compatibility_rating DESC
LIMIT 10;
```

## Step 5: Set Up Row Level Security (Optional but Recommended)

If you want to enable RLS for security:

```sql
-- Enable RLS on tables
ALTER TABLE musical_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_mode_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_key_history ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (public read)
CREATE POLICY "Allow public read access to musical_keys"
  ON musical_keys FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to scale_mode_compatibility"
  ON scale_mode_compatibility FOR SELECT
  USING (true);

-- For detected_key_history, you might want to restrict access
CREATE POLICY "Allow insert for detected_key_history"
  ON detected_key_history FOR INSERT
  WITH CHECK (true);
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the migrations in order
- Check that you're connected to the correct Supabase project

### Error: "duplicate key value violates unique constraint"
- The seed data might already exist
- Use `ON CONFLICT DO NOTHING` clauses in the SQL

### No data returned from queries
- Verify the migrations ran successfully
- Check Supabase logs for errors
- Ensure your `.env.local` has correct credentials

## Next Steps

After completing the database setup:

1. Test the queries using the Supabase client
2. Proceed to Phase 3: Audio Detection Engine
3. Build the UI components in Phase 4

## Estimated Time

- Database setup: 15-30 minutes
- Data generation and seeding: 5-10 minutes
- Verification: 5 minutes

Total: ~30-45 minutes

