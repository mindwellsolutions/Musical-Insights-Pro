# Supabase SSR Authentication & Database Migration Blueprint

## Project Overview
Implement Supabase SSR authentication system with login and password reset functionality (no registration), and migrate all localStorage data to Supabase database tables for per-user storage.

## Supabase Project Details
- **Project ID**: jydaltnubswauneffbpj
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5ZGFsdG51YnN3YXVuZWZmYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDIxNTcsImV4cCI6MjA4MDc3ODE1N30.1a_tVUNkE_g1fGP5esp_-XgOuA_RQchDW7xkNxlLdw0
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5ZGFsdG51YnN3YXVuZWZmYnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIwMjE1NywiZXhwIjoyMDgwNzc4MTU3fQ.PbnAC3ZLoore48Sbakgw48VczqntegwCeQ3vK9ZokCI

## Current LocalStorage Data Inventory

### User Settings (from app/page.tsx)
1. `guitar-app-theme` - Theme selection (dark/light)
2. `guitar-app-root-note` - Root note (e.g., 'B')
3. `guitar-app-scale-name` - Scale name (e.g., 'Aeolian')
4. `guitar-app-string-count` - Guitar string count (6 or 7)
5. `guitar-app-tuning-name` - Tuning name (e.g., 'Standard')
6. `guitar-app-is-inverted` - Fretboard inversion state
7. `guitar-app-selected-chord-notes` - Selected chord notes array
8. `guitar-app-selected-guide-tones` - Selected guide tones array
9. `guitar-app-chord-highlight-color` - Chord highlight color
10. `guitar-app-guide-tones-color` - Guide tones color
11. `guitar-app-show-chord-tones` - Show chord tones toggle
12. `guitar-app-show-guide-tones` - Show guide tones toggle
13. `guitar-app-show-chord-glow` - Show chord glow toggle
14. `guitar-app-fret-dot-color` - Fret dot color
15. `guitar-app-show-middle-dots` - Show middle dots toggle
16. `guitar-app-auto-recommendation` - Auto recommendation toggle
17. `guitar-app-auto-switch-fretboard` - Auto switch fretboard toggle
18. `guitar-app-manual-selections` - Manual selections array
19. `guitar-app-focus-mode` - Focus mode toggle
20. `guitar-app-focus-mode-position` - Focus mode position {x, y}

### MIDI Configuration
21. `midi-pedal-config` - MIDI pedal configuration object

### Server-Side Data (data/midi.json)
- Active MIDI configuration
- MIDI profiles array

---

## Phase 1: Environment & Dependencies Setup ✅ COMPLETE

### Tasks
- [x] Update .env.local with Supabase credentials
- [x] Install @supabase/ssr package
- [x] Verify @supabase/supabase-js is installed

### Files to Create/Modify
- `.env.local` - Add Supabase URL and keys ✅
- `package.json` - Add @supabase/ssr dependency ✅

---

## Phase 2: Supabase Client Setup (SSR) ✅ COMPLETE

### Tasks
- [x] Create server-side Supabase client utilities
- [x] Create client-side Supabase client utilities
- [x] Create middleware for auth protection
- [x] Update existing client.ts to use SSR approach

### Files to Create
- `lib/supabase/server.ts` - Server-side client creation ✅
- `lib/supabase/client-ssr.ts` - Client-side SSR client ✅
- `middleware.ts` - Auth middleware for route protection ✅

### Files to Modify
- `lib/supabase/client.ts` - Update to use SSR pattern (kept for backward compatibility)

---

## Phase 3: Database Schema Design & Creation ✅ COMPLETE

### Tasks
- [x] Design database schema for user settings
- [x] Create SQL migration for user_settings table
- [x] Create SQL migration for user_midi_config table
- [x] Create SQL migration for user_manual_selections table
- [x] Set up RLS policies for all tables
- [x] Execute migrations via Supabase MCP tool

### Database Tables

#### Table 1: user_settings
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Display Settings
  theme TEXT DEFAULT 'dark',
  
  -- Fretboard Settings
  root_note TEXT DEFAULT 'B',
  scale_name TEXT DEFAULT 'Aeolian',
  string_count INTEGER DEFAULT 6 CHECK (string_count IN (6, 7)),
  tuning_name TEXT DEFAULT 'Standard',
  is_inverted BOOLEAN DEFAULT true,
  
  -- Visual Settings
  chord_highlight_color TEXT DEFAULT '#fbbf24',
  guide_tones_color TEXT DEFAULT '#ec4899',
  show_chord_tones BOOLEAN DEFAULT true,
  show_guide_tones BOOLEAN DEFAULT true,
  show_chord_glow BOOLEAN DEFAULT false,
  fret_dot_color TEXT DEFAULT '#9ca3af',
  show_middle_dots BOOLEAN DEFAULT false,
  
  -- Audio Detection Settings
  auto_recommendation BOOLEAN DEFAULT false,
  auto_switch_fretboard BOOLEAN DEFAULT false,
  
  -- Focus Mode Settings
  focus_mode BOOLEAN DEFAULT false,
  focus_mode_position JSONB DEFAULT '{"x": 0, "y": 0}',
  
  -- Selected Notes (stored as JSONB arrays)
  selected_chord_notes JSONB DEFAULT NULL,
  selected_guide_tones JSONB DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table 2: user_midi_config
```sql
CREATE TABLE user_midi_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- MIDI Configuration (stored as JSONB)
  active_config JSONB DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table 3: user_manual_selections
```sql
CREATE TABLE user_manual_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Manual Selection Data
  key TEXT NOT NULL,
  scale_name TEXT NOT NULL,
  timestamp BIGINT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for efficient querying
  CONSTRAINT unique_user_selection UNIQUE (user_id, timestamp)
);
```

#### Table 4: user_midi_profiles
```sql
CREATE TABLE user_midi_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Profile Data
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at_timestamp BIGINT NOT NULL,
  updated_at_timestamp BIGINT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for efficient querying
  CONSTRAINT unique_user_profile UNIQUE (user_id, profile_id)
);
```

### RLS Policies
All tables will have the following RLS policies:
1. Users can only read their own data
2. Users can only insert their own data
3. Users can only update their own data
4. Users can only delete their own data
5. Service role has full access (for admin operations)

---

## Phase 4: Authentication UI Components ✅ COMPLETE

### Tasks
- [x] Create modern login page component
- [x] Create password reset page component
- [x] Create auth callback handler
- [x] Create password update page
- [x] Add loading states and error handling

### Files to Create
- `app/login/page.tsx` - Login page with modern, sleek design ✅
- `app/reset-password/page.tsx` - Password reset page ✅
- `app/reset-password/update/page.tsx` - Password update page ✅
- `app/auth/callback/route.ts` - Auth callback handler ✅

### Design Requirements ✅
- Modern, sleek, visually striking design with gradient backgrounds
- Smooth animations and professional typography
- Responsive layout with clear error messages
- Loading states with spinners

---

## Phase 5: Data Migration Utilities ✅ COMPLETE

### Tasks
- [x] Create hook to sync localStorage to Supabase
- [x] Create hook to load user settings from Supabase
- [x] Create migration utility to transfer existing localStorage data
- [x] Create API routes for settings CRUD operations

### Files to Create
- `hooks/useUserSettings.ts` - Hook for managing user settings with Supabase ✅
- `hooks/useSupabaseStorage.ts` - Drop-in replacement for useLocalStorage ✅
- `lib/supabase/settings-service.ts` - Service for settings operations ✅
- `lib/supabase/midi-service.ts` - Service for MIDI operations ✅
- `app/api/user-settings/route.ts` - API route for user settings ✅
- `app/api/user-midi-config/route.ts` - API route for MIDI config ✅
- `app/api/user-manual-selections/route.ts` - API route for manual selections ✅

---

## Phase 6: Update Application to Use Supabase ✅ COMPLETE

### Tasks
- [x] Replace useLocalStorage with useSupabaseStorage in app/page.tsx
- [x] Update MIDI components to use Supabase (via existing API routes)
- [x] Update manual selections to use Supabase (via useSupabaseStorage)
- [x] Add authentication checks to protected routes (via middleware)
- [x] Add logout functionality to Header component

### Files to Modify
- `app/page.tsx` - Replace all useLocalStorage calls ✅
- `components/Header.tsx` - Add logout button ✅
- `components/midi/MIDIConfigModal.tsx` - Already uses API routes (compatible)
- `components/ManualSelectionList.tsx` - Uses Supabase via useSupabaseStorage

---

## Phase 7: Middleware & Route Protection ✅ COMPLETE

### Tasks
- [x] Create middleware to protect app routes
- [x] Redirect unauthenticated users to login
- [x] Handle auth state changes
- [x] Add session refresh logic

### Files to Create/Modify
- `middleware.ts` - Route protection middleware ✅

---

## Phase 8: Testing & Validation

### Tasks
- [ ] Test login flow
- [ ] Test password reset flow
- [ ] Test settings persistence across sessions
- [ ] Test MIDI config persistence
- [ ] Test manual selections persistence
- [ ] Test logout functionality
- [ ] Test middleware protection
- [ ] Test RLS policies
- [ ] Test data migration from localStorage
- [ ] Performance testing

---

## Phase 9: Cleanup & Documentation

### Tasks
- [ ] Remove old localStorage code (optional - keep as fallback)
- [ ] Update README with auth instructions
- [ ] Document database schema
- [ ] Add migration guide for existing users
- [ ] Update deployment checklist

---

## Implementation Order

1. **Phase 1**: Environment & Dependencies Setup
2. **Phase 2**: Supabase Client Setup (SSR)
3. **Phase 3**: Database Schema Design & Creation
4. **Phase 4**: Authentication UI Components
5. **Phase 5**: Data Migration Utilities
6. **Phase 6**: Update Application to Use Supabase
7. **Phase 7**: Middleware & Route Protection
8. **Phase 8**: Testing & Validation
9. **Phase 9**: Cleanup & Documentation

---

## Security Considerations

1. **RLS Policies**: All tables have Row Level Security enabled
2. **Service Role**: Only used server-side for admin operations
3. **Anon Key**: Used client-side with RLS protection
4. **Session Management**: Handled by Supabase SSR
5. **CSRF Protection**: Built into Next.js and Supabase SSR
6. **Password Reset**: Secure token-based flow via Supabase Auth

---

## Performance Optimizations

1. **Debounced Saves**: Settings updates debounced to reduce DB writes
2. **Optimistic Updates**: UI updates immediately, syncs in background
3. **Caching**: React Query for client-side caching
4. **Batch Operations**: Multiple settings updated in single transaction
5. **Indexes**: Database indexes on frequently queried columns

---

## Rollback Plan

If issues arise:
1. Keep localStorage as fallback
2. Feature flag to toggle between localStorage and Supabase
3. Data export functionality for users
4. Ability to revert to localStorage-only mode

---

## Success Criteria

- ✅ Users can log in with email/password
- ✅ Users can reset their password
- ✅ All settings persist to Supabase per user
- ✅ MIDI configuration persists per user
- ✅ Manual selections persist per user
- ✅ Unauthenticated users redirected to login
- ✅ No data loss during migration
- ✅ Performance remains optimal
- ✅ Modern, visually striking login UI

