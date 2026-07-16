# Build Debugging - Quick Reference Guide

## 🚀 Quick Commands for Future Debugging

### Capture All Errors (PowerShell)
```powershell
# TypeScript errors
npx tsc --noEmit --pretty false 2>&1 | Out-File -FilePath typescript-errors.txt -Encoding utf8

# Build errors
npm run build 2>&1 | Out-File -FilePath build-errors.txt -Encoding utf8
```

### Capture All Errors (Bash/Linux/Mac)
```bash
# TypeScript errors
npx tsc --noEmit --pretty false 2>&1 | tee typescript-errors.txt

# Build errors
npm run build 2>&1 | tee build-errors.txt
```

---

## 📋 Error Analysis Workflow

1. **Capture** - Get all errors at once (don't fix yet!)
2. **Categorize** - Group by file, type, or priority
3. **Prioritize** - Fix critical/blocking errors first
4. **Batch Fix** - Fix similar errors together
5. **Verify** - Run checks once at the end

---

## 🎯 Common Error Patterns & Fixes

### Next.js 15 Route Handler Params
**Error:** `Type 'Promise<any>' is not assignable to type 'any'`

**Fix:**
```typescript
// OLD (Next.js 14)
export async function POST(req, { params }: { params: { id: string } }) {
  const id = params.id;
}

// NEW (Next.js 15)
export async function POST(req, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

---

### Type Mismatch in Props
**Error:** `Type 'X' is not assignable to type 'Y'`

**Fix:** Create wrapper function or adjust type definition
```typescript
// Option 1: Wrapper function
<Component onCallback={(data) => handleCallback(data)} />

// Option 2: Adjust type
interface Props {
  value: string | number;  // Instead of just string
}
```

---

### Missing Theme Properties
**Error:** `Property 'X' does not exist on type 'ThemeConfig'`

**Fix:** Use existing properties or add to ThemeConfig
```typescript
// Quick fix: Use existing property
style={{ color: theme.textSecondary, opacity: 0.5 }}

// Proper fix: Add to lib/themes.ts
export interface ThemeConfig {
  textTertiary: string;  // Add new property
}
```

---

### Test Files in Build
**Error:** `Cannot find name 'describe', 'it', 'expect'`

**Fix:** Exclude test files from tsconfig.json
```json
{
  "exclude": [
    "node_modules",
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

---

## 🔍 Verification Commands

```bash
# Check TypeScript errors only (fast)
npx tsc --noEmit

# Full build (slower but comprehensive)
npm run build

# Development mode test
npm run dev
```

---

## 📊 Success Metrics

- ✅ `npx tsc --noEmit` returns 0 errors
- ✅ `npm run build` completes successfully
- ✅ No console errors in dev mode
- ✅ All features work as expected

---

## 🎓 Best Practices

1. **Never fix errors one-by-one during build** - Capture all first
2. **Always categorize before fixing** - Saves time
3. **Fix by file or category** - More efficient
4. **Verify once at the end** - Don't rebuild after each fix
5. **Document your fixes** - Helps future debugging

---

## 📁 File Structure

```
.build-debugging/
├── BUILD-ERRORS-RESOLUTION-BLUEPRINT.md  # Detailed fix guide
├── EXECUTION-SUMMARY.md                  # Before/after comparison
├── QUICK-REFERENCE.md                    # This file
├── typescript-errors.txt                 # Original TS errors
├── build-errors.txt                      # Original build errors
├── verification-errors.txt               # Post-fix verification
└── final-build-result.txt                # Successful build output
```

---

## 🆘 Emergency Fixes

### Build is completely broken
```bash
# 1. Clean everything
rm -rf .next node_modules

# 2. Reinstall
npm install

# 3. Try build
npm run build
```

### TypeScript cache issues
```bash
# Clear TypeScript cache
rm -rf .next/cache

# Rebuild
npm run build
```

### Dependency conflicts
```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Or update all (careful!)
npm update
```

---

## 📞 When to Ask for Help

- Errors persist after following this guide
- Build succeeds but runtime errors occur
- Performance degradation after fixes
- Unclear error messages

**Remember:** Batch debugging is 90% faster than one-by-one fixes!

