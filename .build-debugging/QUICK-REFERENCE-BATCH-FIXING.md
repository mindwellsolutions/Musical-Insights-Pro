# Quick Reference: Batch Error Fixing

## 🎯 The Strategy in 3 Steps

### 1️⃣ CAPTURE ALL ERRORS
```bash
# TypeScript errors
npx tsc --noEmit --pretty false 2>&1 | tee typescript-errors.txt

# Build errors (includes runtime/SSR)
npm run build 2>&1 | tee build-errors.txt
```

### 2️⃣ CREATE BLUEPRINT
- Categorize errors by type/root cause
- Group related errors into phases
- Plan fixes for each phase
- Document expected outcome

### 3️⃣ FIX IN BATCH
- Execute ALL fixes from blueprint
- **DO NOT BUILD** between fixes
- Build ONCE at the end
- Verify all errors resolved

---

## 📋 Common Error Patterns & Fixes

### localStorage in SSR
```typescript
// ❌ BEFORE
export function saveData() {
  localStorage.setItem('key', data);
}

// ✅ AFTER
export function saveData() {
  if (typeof window === 'undefined') return; // SSR guard
  localStorage.setItem('key', data);
}
```

### useSearchParams without Suspense
```typescript
// ❌ BEFORE
export default function Page() {
  const searchParams = useSearchParams();
  return <div>...</div>;
}

// ✅ AFTER
function PageContent() {
  const searchParams = useSearchParams();
  return <div>...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
```

### Type Mismatches (String to Union Type)
```typescript
// ❌ BEFORE
function getQuality(chord: string): ChordQuality {
  if (chord.includes('m')) return 'minor'; // 'minor' not in ChordQuality
  return 'major'; // 'major' not in ChordQuality
}

// ✅ AFTER
function getQuality(chord: string): ChordQuality {
  if (chord.includes('m')) return 'min'; // Matches ChordQuality
  return 'maj'; // Matches ChordQuality
}

// ✅ OR with mapping
function normalizeQuality(quality: string): ChordQuality {
  const mapping: Record<string, ChordQuality> = {
    'major': 'maj',
    'minor': 'min',
  };
  return (mapping[quality] || quality) as ChordQuality;
}
```

---

## ⏱️ Time Comparison

| Method | Time | Builds | Efficiency |
|--------|------|--------|------------|
| **Iterative** | 42+ min | 7+ builds | ❌ Slow |
| **Batch** | 30 min | 1 build | ✅ Fast |
| **Savings** | ~40% faster | 85% fewer builds | 🚀 |

---

## 🎯 Key Rules

1. ✅ **DO** capture all errors first
2. ✅ **DO** plan all fixes before coding
3. ✅ **DO** fix everything before building
4. ✅ **DO** verify with single final build
5. ❌ **DON'T** fix one error at a time
6. ❌ **DON'T** build after each fix
7. ❌ **DON'T** skip error categorization
8. ❌ **DON'T** forget SSR guards

---

## 📦 Blueprint Template

```markdown
# Fix Blueprint

## Error Summary
- Category 1: Description (X errors)
- Category 2: Description (Y errors)

## Phase 1: Category 1 Fixes
**Impact:** X errors → 0
**Files:** list files
**Changes:** 
- Change 1
- Change 2

## Phase 2: Category 2 Fixes
**Impact:** Y errors → 0
**Files:** list files
**Changes:**
- Change 1
- Change 2

## Execution Checklist
- [ ] Phase 1 complete
- [ ] Phase 2 complete
- [ ] Run build (once)
- [ ] Verify success
```

---

## 🚀 Success Criteria

All must be true:
- ✅ `npx tsc --noEmit` returns 0 errors
- ✅ `npm run build` completes successfully
- ✅ All pages generate (X/X static pages)
- ✅ No breaking changes to functionality
- ✅ Build time is reasonable (< 10 min)

---

## 📚 Documentation Files

After fixing, create:
1. **Blueprint** - Detailed fix plan
2. **Execution Summary** - What was done
3. **Success Summary** - Final results
4. **Quick Reference** - This guide

Store in: `/.build-debugging/`
