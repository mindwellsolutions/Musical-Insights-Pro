# SSR/Runtime Build Fix Blueprint
**Date:** May 29, 2026  
**Remaining Errors:** 2 categories  
**Strategy:** Fix all SSR issues in batch, then build once

---

## 📊 ERROR SUMMARY

### Error 1: localStorage is not defined (SSR)
**Count:** Multiple occurrences  
**File:** `lib/fretboard-learning/progress-tracker.ts`  
**Used By:** `app/learn/fretboard/page.tsx`  
**Cause:** Accessing localStorage during server-side rendering  
**Impact:** Build fails during static page generation

### Error 2: useSearchParams without Suspense
**Count:** 1 occurrence  
**File:** `app/subscription/required/page.tsx`  
**Lines:** 7, 12  
**Cause:** Using useSearchParams without Suspense boundary  
**Impact:** Build fails during prerender

---

## ⚡ PHASE 1: Fix localStorage SSR Issues

### Problem Analysis
`progress-tracker.ts` contains 8 localStorage calls that execute at module/import time during SSR, causing `ReferenceError: localStorage is not defined`.

**Affected Functions:**
1. `saveProgress()` - Line 17
2. `loadProgress()` - Line 29
3. `saveSpacedRepetitionItems()` - Line 107
4. `loadSpacedRepetitionItems()` - Line 121
5. `clearAllProgress()` - Lines 235, 238

### Fix Strategy
Wrap ALL localStorage access in `typeof window !== 'undefined'` checks to prevent execution during SSR.

---

### Fix 1.1: Update saveProgress()
**File:** `lib/fretboard-learning/progress-tracker.ts`  
**Lines:** 14-21

```typescript
// CHANGE FROM:
export function saveProgress(methodId: string, progress: UserProgress): void {
  try {
    const key = `${STORAGE_PREFIX}progress_${methodId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

// CHANGE TO:
export function saveProgress(methodId: string, progress: UserProgress): void {
  if (typeof window === 'undefined') return; // SSR guard
  
  try {
    const key = `${STORAGE_PREFIX}progress_${methodId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}
```

---

### Fix 1.2: Update loadProgress()
**File:** `lib/fretboard-learning/progress-tracker.ts`  
**Lines:** 26-35

```typescript
// CHANGE FROM:
export function loadProgress(methodId: string): UserProgress | null {
  try {
    const key = `${STORAGE_PREFIX}progress_${methodId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as UserProgress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
}

// CHANGE TO:
export function loadProgress(methodId: string): UserProgress | null {
  if (typeof window === 'undefined') return null; // SSR guard
  
  try {
    const key = `${STORAGE_PREFIX}progress_${methodId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as UserProgress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
}
```

---

### Fix 1.3: Update saveSpacedRepetitionItems()
**File:** `lib/fretboard-learning/progress-tracker.ts`  
**Lines:** 101-111

```typescript
// CHANGE FROM:
export function saveSpacedRepetitionItems(
  methodId: string,
  items: SpacedRepetitionItem[]
): void {
  try {
    const key = `${STORAGE_PREFIX}sr_${methodId}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save spaced repetition items:', error);
  }
}

// CHANGE TO:
export function saveSpacedRepetitionItems(
  methodId: string,
  items: SpacedRepetitionItem[]
): void {
  if (typeof window === 'undefined') return; // SSR guard
  
  try {
    const key = `${STORAGE_PREFIX}sr_${methodId}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save spaced repetition items:', error);
  }
}
```

---

### Fix 1.5: Update clearAllProgress()
**File:** `lib/fretboard-learning/progress-tracker.ts`
**Lines:** 234-239

```typescript
// CHANGE FROM:
export function clearAllProgress(): void {
  const keys = Object.keys(localStorage).filter((key) =>
    key.startsWith(STORAGE_PREFIX)
  );
  keys.forEach((key) => localStorage.removeItem(key));
}

// CHANGE TO:
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return; // SSR guard

  const keys = Object.keys(localStorage).filter((key) =>
    key.startsWith(STORAGE_PREFIX)
  );
  keys.forEach((key) => localStorage.removeItem(key));
}
```

**Errors Fixed:** All localStorage SSR errors (Phase 1 complete)

---

## ⚡ PHASE 2: Fix useSearchParams Suspense Issue

### Problem Analysis
`app/subscription/required/page.tsx` uses `useSearchParams()` without wrapping in Suspense, causing prerender error.

### Fix Strategy
Create a client component wrapper with Suspense boundary for the page content.

---

### Fix 2.1: Create Client Component Wrapper
**File:** `app/subscription/required/page.tsx`
**Action:** Wrap page content in Suspense

```typescript
// CHANGE FROM:
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Unlock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionRequiredPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  // ... rest of component

// CHANGE TO:
'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Unlock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function SubscriptionRequiredContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  // ... rest of component (move all logic here)
}

export default function SubscriptionRequiredPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <SubscriptionRequiredContent />
    </Suspense>
  );
}
```

**Errors Fixed:** All useSearchParams Suspense errors (Phase 2 complete)

---

## 📋 EXECUTION CHECKLIST

### Pre-Execution
- [ ] Review all changes above
- [ ] Understand SSR guard pattern: `if (typeof window === 'undefined') return;`
- [ ] Understand Suspense wrapper pattern

### Execution Order (DO NOT RUN BUILD BETWEEN PHASES!)
- [ ] **Phase 1:** Fix all 5 localStorage functions in progress-tracker.ts
- [ ] **Phase 2:** Add Suspense wrapper to subscription/required page

### Verification
- [ ] Run: `npm run build` (should complete successfully)
- [ ] Check build output for static pages generation
- [ ] Test fretboard learning pages in browser
- [ ] Test subscription required page in browser

---

## 🎯 EXPECTED OUTCOME

### Before
- **SSR Errors:** 2 categories (localStorage + Suspense)
- **Build Status:** FAILED
- **Static Pages:** 0/68 generated

### After
- **SSR Errors:** 0
- **Build Status:** SUCCESS
- **Static Pages:** 68/68 generated

---

## 📝 TECHNICAL NOTES

### Why typeof window !== 'undefined'?
- **SSR Environment:** Node.js has no `window` or `localStorage`
- **Client Environment:** Browser has both
- **Guard Pattern:** Safely skip browser-only code during SSR
- **Graceful Degradation:** Return null/empty for load functions

### Why Suspense for useSearchParams?
- **Next.js 13+ Requirement:** Dynamic hooks need Suspense
- **Prerendering:** Allows static page generation
- **Client-Side Hydration:** Suspends until params available
- **Better UX:** Shows loading state during navigation

### Alternative Approaches (NOT RECOMMENDED)
❌ Make page dynamic with `export const dynamic = 'force-dynamic'` (loses static optimization)
❌ Use try/catch around localStorage (still throws during SSR)
❌ Use useEffect for all localStorage (causes flash of empty state)
✅ **Use SSR guards** (clean, efficient, follows Next.js patterns)

---

## 🚀 COMPLETION CRITERIA

All criteria must be met:
1. ✅ No `localStorage is not defined` errors
2. ✅ No `useSearchParams` Suspense warnings
3. ✅ Build completes successfully (exit code 0)
4. ✅ All 68 pages generate statically
5. ✅ Fretboard learning pages load correctly
6. ✅ Subscription required page handles URL params

### Fix 1.4: Update loadSpacedRepetitionItems()
**File:** `lib/fretboard-learning/progress-tracker.ts`  
**Lines:** 116-127

```typescript
// CHANGE FROM:
export function loadSpacedRepetitionItems(
  methodId: string
): SpacedRepetitionItem[] {
  try {
    const key = `${STORAGE_PREFIX}sr_${methodId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data) as SpacedRepetitionItem[];
  } catch (error) {
    console.error('Failed to load spaced repetition items:', error);
    return [];
  }
}

// CHANGE TO:
export function loadSpacedRepetitionItems(
  methodId: string
): SpacedRepetitionItem[] {
  if (typeof window === 'undefined') return []; // SSR guard
  
  try {
    const key = `${STORAGE_PREFIX}sr_${methodId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data) as SpacedRepetitionItem[];
  } catch (error) {
    console.error('Failed to load spaced repetition items:', error);
    return [];
  }
}
```

---

