# Admin Dashboard Implementation Blueprint

## Project Overview
Implement a comprehensive admin dashboard system for Musical Insights platform that allows admin users to view, add, and modify all user accounts. The system includes role-based access control using a `user_type` column in the `user_settings` table.

**Project ID:** `jydaltnubswauneffbpj`  
**Admin User ID:** `5d4f3314-4620-47f2-80a8-72752fa30ae5`

---

## Phase 1: Database Schema Updates

### 1.1 Add `user_type` Column to `user_settings` Table

**SQL Migration Name:** `add_user_type_column`

**Migration SQL:**
```sql
-- Add user_type column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT NULL;

-- Add check constraint to ensure valid user types
ALTER TABLE user_settings 
ADD CONSTRAINT user_type_check 
CHECK (user_type IS NULL OR user_type IN ('admin', 'moderator'));

-- Add comment to column
COMMENT ON COLUMN user_settings.user_type IS 'User role type: NULL for regular users, "admin" for administrators, "moderator" for moderators';

-- Set the specified user as admin
UPDATE user_settings 
SET user_type = 'admin' 
WHERE user_id = '5d4f3314-4620-47f2-80a8-72752fa30ae5';

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_type ON user_settings(user_type) WHERE user_type IS NOT NULL;
```

**Design Notes:**
- `user_type` is NULL for regular users (default state)
- Only admin and moderator roles are stored in the column
- Index created for efficient admin user queries
- RLS policies remain unchanged (users can only access their own settings)

---

## Phase 2: Admin Authentication & Authorization

### 2.1 Create Admin Check Utility

**File:** `lib/auth/admin-check.ts`

**Purpose:** Server-side utility to verify if a user is an admin

**Key Functions:**
```typescript
export async function isUserAdmin(userId: string): Promise<boolean>
export async function requireAdmin(): Promise<{ userId: string; isAdmin: true }>
export async function getCurrentUserRole(): Promise<'admin' | 'moderator' | 'user' | null>
```

**Implementation Details:**
- Use Supabase service role key for admin queries
- Query `user_settings` table for `user_type` column
- Cache admin status in server-side session for performance
- Throw unauthorized errors for non-admin access attempts

### 2.2 Create Admin Context Provider

**File:** `contexts/AdminContext.tsx`

**Purpose:** Client-side context for admin state management

**Features:**
- Provides `isAdmin` boolean state
- Provides `userRole` state ('admin' | 'moderator' | 'user' | null)
- Automatically fetches admin status on mount
- Subscribes to auth state changes
- Uses React Query for caching

**API:**
```typescript
interface AdminContextValue {
  isAdmin: boolean;
  userRole: 'admin' | 'moderator' | 'user' | null;
  isLoading: boolean;
}
```

### 2.3 Create Admin Check Hook

**File:** `hooks/useAdminCheck.ts`

**Purpose:** Client-side hook to check admin status

**Features:**
- Returns admin status from AdminContext
- Provides loading state
- Automatically refetches on auth changes

---

## Phase 3: Admin Dashboard Backend API

### 3.1 User Management API Routes

**File:** `app/api/admin/users/route.ts`

**Endpoints:**

**GET /api/admin/users**
- List all users with pagination
- Query parameters: `page`, `limit`, `search`, `role`
- Returns: User list with metadata (email, created_at, last_sign_in, user_type, settings)
- Auth: Requires admin role
- Uses service role key to query auth.users and user_settings

**POST /api/admin/users**
- Create new user account
- Body: `{ email, password, user_type?, metadata? }`
- Returns: Created user object
- Auth: Requires admin role
- Creates auth user and user_settings record

**File:** `app/api/admin/users/[userId]/route.ts`

**Endpoints:**

**GET /api/admin/users/[userId]**
- Get detailed user information
- Returns: Full user profile with settings
- Auth: Requires admin role

**PATCH /api/admin/users/[userId]**
- Update user information
- Body: `{ email?, user_type?, metadata?, settings? }`
- Returns: Updated user object
- Auth: Requires admin role

**DELETE /api/admin/users/[userId]**
- Delete user account (soft delete or hard delete)
- Auth: Requires admin role
- Deletes from auth.users (cascades to user_settings via FK)

### 3.2 Admin Statistics API

**File:** `app/api/admin/stats/route.ts`

**GET /api/admin/stats**
- Returns dashboard statistics
- Data: Total users, active users (last 30 days), new users (last 7 days), admin count
- Auth: Requires admin role

---

## Phase 4: Admin Dashboard Frontend

### 4.1 Admin Dashboard Page

**File:** `app/admin/dashboard/page.tsx`

**Route:** `/admin/dashboard`

**Features:**
- Server-side admin check (redirect if not admin)
- Modern, sleek, ultra-premium design
- Responsive layout (desktop-first, mobile-friendly)
- Real-time data updates using React Query

**Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│ Header: Admin Dashboard + User Profile + Logout    │
├─────────────────────────────────────────────────────┤
│ Statistics Cards Row (4 cards)                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ │Total │ │Active│ │New   │ │Admin │               │
│ │Users │ │Users │ │Users │ │Count │               │
│ └──────┘ └──────┘ └──────┘ └──────┘               │
├─────────────────────────────────────────────────────┤
│ User Management Section                             │
│ ┌─────────────────────────────────────────────────┐│
│ │ Search Bar + Filters + Add User Button          ││
│ ├─────────────────────────────────────────────────┤│
│ │ User Table (Sortable, Paginated)                ││
│ │ Columns: Email, Role, Created, Last Login,      ││
│ │          Status, Actions                        ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Color Scheme: Dark theme with purple/blue gradients (matching app theme)
- Typography: Inter font family, clear hierarchy
- Spacing: Generous padding (24px sections, 16px cards)
- Shadows: Subtle elevation with colored glows
- Animations: Smooth transitions (200ms ease-in-out)

### 4.2 Admin Dashboard Components

**Component Structure:**

#### `components/admin/AdminDashboardLayout.tsx`
- Main layout wrapper
- Sidebar navigation (optional for future expansion)
- Header with admin branding
- Responsive container

#### `components/admin/StatisticsCards.tsx`
- Grid of 4 statistic cards
- Each card shows: Icon, Label, Value, Trend (optional)
- Gradient backgrounds with glassmorphism effect
- Animated number counters
- Loading skeleton states

**Card Design:**
```
┌─────────────────────────┐
│ 👥 Total Users          │
│                         │
│      1,234              │ ← Large, bold number
│   ↑ 12% this month      │ ← Trend indicator (green/red)
└─────────────────────────┘
```

**Styling:**
- Background: Semi-transparent with backdrop blur
- Border: 1px solid with gradient
- Padding: 24px
- Border radius: 16px
- Box shadow: 0 8px 32px rgba(0,0,0,0.1)

#### `components/admin/UserManagementTable.tsx`
- Sortable table with all user data
- Inline editing capabilities
- Row actions: Edit, Delete, View Details
- Bulk actions: Delete selected, Export CSV
- Pagination controls (10, 25, 50, 100 per page)
- Empty state with illustration

**Table Columns:**
1. **Checkbox** - Select for bulk actions
2. **Email** - User email (sortable, searchable)
3. **Role** - Badge showing user_type (admin/moderator/user)
4. **Created** - Account creation date (sortable, formatted)
5. **Last Login** - Last sign-in timestamp (sortable, relative time)
6. **Status** - Active/Inactive badge
7. **Actions** - Dropdown menu (Edit, Delete, View)

**Row Design:**
- Hover effect: Subtle background color change
- Selected: Blue/purple highlight
- Alternating row colors for readability
- Height: 64px for comfortable touch targets

**Table Features:**
- Virtual scrolling for large datasets (1000+ users)
- Column resizing
- Column visibility toggle
- Export to CSV/Excel
- Advanced filters (role, date range, status)

#### `components/admin/UserSearchBar.tsx`
- Real-time search with debouncing (300ms)
- Search by: email, name, user_id
- Clear button
- Search icon with loading spinner
- Keyboard shortcuts (Cmd/Ctrl + K to focus)

**Design:**
- Width: Full width on mobile, 400px on desktop
- Height: 48px
- Border radius: 12px
- Background: Semi-transparent with blur
- Icon: Left-aligned search icon
- Placeholder: "Search users by email or name..."

#### `components/admin/UserFilters.tsx`
- Filter by role (All, Admin, Moderator, User)
- Filter by status (All, Active, Inactive)
- Filter by date range (Last 7 days, 30 days, 90 days, Custom)
- Clear all filters button

**Design:**
- Horizontal layout on desktop, vertical on mobile
- Dropdown selects with custom styling
- Active filter count badge
- Smooth animations

#### `components/admin/AddUserDialog.tsx`
- Modal dialog for creating new users
- Form fields:
  - Email (required, validated)
  - Password (required, strength indicator)
  - Confirm Password (required, match validation)
  - Role (dropdown: User, Admin, Moderator)
  - Send welcome email (checkbox)
- Form validation with error messages
- Submit button with loading state
- Cancel button

**Design:**
- Modal overlay: Semi-transparent dark background
- Dialog: Centered, max-width 500px
- Padding: 32px
- Border radius: 20px
- Close button: Top-right corner
- Form spacing: 20px between fields

#### `components/admin/EditUserDialog.tsx`
- Modal dialog for editing existing users
- Pre-populated form fields:
  - Email (editable)
  - Role (dropdown)
  - Account status (Active/Inactive toggle)
  - Reset password (button to send reset email)
  - User settings (expandable section)
- Save button with loading state
- Cancel button
- Delete user button (with confirmation)

**Design:**
- Same modal styling as AddUserDialog
- Tabs for: Profile, Settings, Activity
- Danger zone section for destructive actions

#### `components/admin/DeleteUserConfirmation.tsx`
- Confirmation dialog for user deletion
- Warning message with user email
- Checkbox: "I understand this action cannot be undone"
- Delete button (red, disabled until checkbox checked)
- Cancel button

**Design:**
- Red accent color for danger
- Warning icon
- Bold text for user email
- Smaller modal (max-width 400px)

#### `components/admin/UserActivityLog.tsx`
- Timeline of user activities
- Shows: Login events, settings changes, actions
- Infinite scroll for loading more
- Filter by activity type

**Design:**
- Vertical timeline with connecting lines
- Icons for different activity types
- Relative timestamps
- Expandable details

---

## Phase 5: Menu Integration

### 5.1 Update HamburgerMenu Component

**File:** `components/HamburgerMenu.tsx`

**Changes Required:**

1. **Add Admin Check Hook:**
```typescript
const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();
```

2. **Add Admin Dashboard Menu Item:**
- Position: After "Song Builder", before "Triads & CAGED"
- Icon: Shield or Crown icon from lucide-react
- Label: "Admin Dashboard"
- Visibility: Only show if `isAdmin === true`
- Action: Navigate to `/admin/dashboard`

**Menu Item Design:**
```typescript
{isAdmin && (
  <button
    onClick={() => handleMenuItemClick(() => router.push('/admin/dashboard'))}
    className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:scale-[1.02]"
    style={{
      color: theme.textPrimary,
      background: 'transparent',
      borderBottom: `1px solid ${theme.border}`,
    }}
  >
    <Shield className="w-4 h-4" />
    <span className="font-medium">Admin Dashboard</span>
  </button>
)}
```

**Loading State:**
- Show skeleton/placeholder while `isAdminLoading === true`
- Prevent menu flicker during admin check

### 5.2 Update Middleware

**File:** `middleware.ts`

**Changes Required:**

1. **Add Admin Route Protection:**
```typescript
const adminPaths = ['/admin/dashboard', '/admin'];
```

2. **Add Admin Check Logic:**
- If user accesses admin path, verify admin status
- Redirect to home page if not admin
- Show 403 error page (optional)

**Implementation:**
```typescript
if (isAdminPath && user) {
  const { data: settings } = await supabase
    .from('user_settings')
    .select('user_type')
    .eq('user_id', user.id)
    .single();

  if (settings?.user_type !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

---

## Phase 6: Styling & Design System

### 6.1 Color Palette

**Admin Dashboard Specific Colors:**

```typescript
const adminColors = {
  // Primary gradient
  gradientStart: '#3b82f6', // Blue
  gradientEnd: '#8b5cf6',   // Purple

  // Status colors
  success: '#10b981',  // Green
  warning: '#f59e0b',  // Amber
  danger: '#ef4444',   // Red
  info: '#3b82f6',     // Blue

  // Role badges
  adminBadge: '#8b5cf6',     // Purple
  moderatorBadge: '#3b82f6', // Blue
  userBadge: '#6b7280',      // Gray

  // Backgrounds
  cardBg: 'rgba(30, 30, 46, 0.6)',
  cardBgHover: 'rgba(30, 30, 46, 0.8)',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',

  // Borders
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(255, 255, 255, 0.2)',
};
```

### 6.2 Typography Scale

```typescript
const typography = {
  // Headings
  h1: { size: '32px', weight: 700, lineHeight: 1.2 },
  h2: { size: '24px', weight: 600, lineHeight: 1.3 },
  h3: { size: '20px', weight: 600, lineHeight: 1.4 },
  h4: { size: '18px', weight: 600, lineHeight: 1.4 },

  // Body
  body: { size: '16px', weight: 400, lineHeight: 1.5 },
  bodySmall: { size: '14px', weight: 400, lineHeight: 1.5 },

  // Labels
  label: { size: '14px', weight: 500, lineHeight: 1.4 },
  caption: { size: '12px', weight: 400, lineHeight: 1.4 },
};
```

### 6.3 Spacing System

```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};
```

### 6.4 Component Styling Guidelines

**Cards:**
- Background: Semi-transparent with backdrop-filter blur
- Border: 1px solid with subtle gradient
- Border radius: 16px
- Padding: 24px
- Shadow: Multi-layer with colored glow
- Hover: Scale 1.02, increase shadow

**Buttons:**
- Primary: Gradient background (blue to purple)
- Secondary: Transparent with border
- Danger: Red background
- Height: 40px (small), 48px (medium), 56px (large)
- Border radius: 12px
- Font weight: 600
- Transition: All 200ms ease-in-out
- Hover: Brightness 110%, scale 1.02
- Active: Scale 0.98

**Inputs:**
- Background: Semi-transparent
- Border: 1px solid border color
- Border radius: 12px
- Height: 48px
- Padding: 12px 16px
- Focus: Border color changes to accent, subtle glow
- Error: Red border, red text below

**Badges:**
- Border radius: 8px
- Padding: 4px 12px
- Font size: 12px
- Font weight: 600
- Text transform: Uppercase
- Letter spacing: 0.5px

**Tables:**
- Header: Sticky, semi-transparent background
- Row height: 64px
- Cell padding: 16px
- Border: Bottom border only (1px solid)
- Hover: Background color change
- Selected: Accent color background

---

## Phase 7: Data Management & React Query

### 7.1 Query Keys

**File:** `lib/react-query/admin-query-keys.ts`

```typescript
export const adminQueryKeys = {
  all: ['admin'] as const,
  users: () => [...adminQueryKeys.all, 'users'] as const,
  userList: (filters: UserFilters) => [...adminQueryKeys.users(), 'list', filters] as const,
  userDetail: (userId: string) => [...adminQueryKeys.users(), 'detail', userId] as const,
  stats: () => [...adminQueryKeys.all, 'stats'] as const,
  activityLog: (userId: string) => [...adminQueryKeys.all, 'activity', userId] as const,
};
```

### 7.2 Query Hooks

**File:** `hooks/admin/useAdminUsers.ts`

**Hooks:**
- `useAdminUserList(filters)` - Paginated user list
- `useAdminUserDetail(userId)` - Single user details
- `useAdminStats()` - Dashboard statistics
- `useCreateUser()` - Mutation for creating users
- `useUpdateUser()` - Mutation for updating users
- `useDeleteUser()` - Mutation for deleting users

**Features:**
- Automatic refetching on window focus
- Optimistic updates for mutations
- Error handling with toast notifications
- Loading states
- Cache invalidation on mutations

### 7.3 API Client

**File:** `lib/api/admin-client.ts`

**Functions:**
```typescript
export async function fetchAdminUsers(filters: UserFilters): Promise<UserListResponse>
export async function fetchAdminUserDetail(userId: string): Promise<UserDetail>
export async function fetchAdminStats(): Promise<AdminStats>
export async function createUser(data: CreateUserData): Promise<User>
export async function updateUser(userId: string, data: UpdateUserData): Promise<User>
export async function deleteUser(userId: string): Promise<void>
```

**Error Handling:**
- Throw typed errors for different scenarios
- Include error codes and messages
- Handle network errors gracefully

---

## Phase 8: Security Considerations

### 8.1 RLS Policies

**No changes needed to existing RLS policies**
- User settings remain user-scoped
- Admin operations use service role key
- Service role bypasses RLS

### 8.2 API Security

**All admin API routes must:**
1. Verify user authentication
2. Check admin role from user_settings
3. Use service role key for admin operations
4. Validate all input data
5. Sanitize output data
6. Rate limit requests (100 req/min per user)
7. Log all admin actions for audit trail

### 8.3 Audit Logging (Future Enhancement)

**Create audit log table:**
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Log actions:**
- User created
- User updated
- User deleted
- Role changed
- Settings modified

---

## Phase 9: Testing Requirements

### 9.1 Unit Tests

**Test files to create:**
- `lib/auth/admin-check.test.ts`
- `hooks/useAdminCheck.test.ts`
- `components/admin/UserManagementTable.test.tsx`
- `app/api/admin/users/route.test.ts`

**Test coverage:**
- Admin role verification
- User CRUD operations
- Permission checks
- Error handling
- Edge cases (no users, deleted users, etc.)

### 9.2 Integration Tests

**Scenarios:**
- Admin login and access dashboard
- Non-admin user cannot access dashboard
- Create new user from dashboard
- Edit existing user
- Delete user
- Search and filter users
- Pagination

### 9.3 E2E Tests (Playwright)

**Test flows:**
1. Admin login → Dashboard → View stats
2. Admin login → Create user → Verify in table
3. Admin login → Edit user → Save → Verify changes
4. Admin login → Delete user → Confirm → Verify deletion
5. Regular user login → Attempt admin access → Redirect

---

## Phase 10: Performance Optimization

### 10.1 Data Fetching

**Strategies:**
- Server-side rendering for initial page load
- React Query for client-side caching
- Pagination for large user lists (50 users per page)
- Virtual scrolling for 1000+ users
- Debounced search (300ms)
- Prefetch next page on hover

### 10.2 Bundle Size

**Optimizations:**
- Code splitting for admin routes
- Lazy load admin components
- Tree-shake unused icons
- Compress images and assets
- Use dynamic imports for heavy libraries

### 10.3 Database Queries

**Optimizations:**
- Index on user_type column
- Limit query results
- Use select specific columns
- Avoid N+1 queries
- Cache frequently accessed data

---

## Phase 11: Accessibility (a11y)

### 11.1 Keyboard Navigation

**Requirements:**
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for table navigation
- Cmd/Ctrl + K for search focus

### 11.2 Screen Readers

**Requirements:**
- Semantic HTML elements
- ARIA labels for icons
- ARIA live regions for dynamic content
- Role attributes for custom components
- Alt text for images

### 11.3 Color Contrast

**Requirements:**
- WCAG AA compliance (4.5:1 for text)
- Sufficient contrast for all text
- Don't rely on color alone for information
- Focus indicators visible

---

## Phase 12: Mobile Responsiveness

### 12.1 Breakpoints

```typescript
const breakpoints = {
  mobile: '0px',      // 0-639px
  tablet: '640px',    // 640-1023px
  desktop: '1024px',  // 1024-1279px
  wide: '1280px',     // 1280px+
};
```

### 12.2 Mobile Adaptations

**Dashboard:**
- Stack statistics cards vertically
- Single column layout
- Collapsible filters
- Bottom sheet for actions

**Table:**
- Card view instead of table
- Swipe actions for edit/delete
- Simplified columns
- Infinite scroll instead of pagination

**Modals:**
- Full-screen on mobile
- Slide-up animation
- Close button in header

---

## Implementation Checklist

### Database
- [ ] Add user_type column to user_settings
- [ ] Set admin user (5d4f3314-4620-47f2-80a8-72752fa30ae5)
- [ ] Create index on user_type
- [ ] Test migration

### Backend
- [ ] Create admin-check.ts utility
- [ ] Create admin API routes (users, stats)
- [ ] Add admin middleware protection
- [ ] Test API endpoints
- [ ] Add error handling
- [ ] Add rate limiting

### Frontend - Core
- [ ] Create AdminContext provider
- [ ] Create useAdminCheck hook
- [ ] Create admin query keys
- [ ] Create admin API client
- [ ] Create admin query hooks

### Frontend - Components
- [ ] AdminDashboardLayout
- [ ] StatisticsCards
- [ ] UserManagementTable
- [ ] UserSearchBar
- [ ] UserFilters
- [ ] AddUserDialog
- [ ] EditUserDialog
- [ ] DeleteUserConfirmation
- [ ] UserActivityLog

### Frontend - Pages
- [ ] /admin/dashboard page
- [ ] 403 Forbidden page (optional)

### Integration
- [ ] Update HamburgerMenu with admin link
- [ ] Update middleware for admin routes
- [ ] Add admin provider to app layout
- [ ] Test admin menu visibility

### Testing
- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] API route tests
- [ ] Integration tests
- [ ] E2E tests

### Polish
- [ ] Responsive design testing
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Error handling review
- [ ] Documentation

---

## Success Criteria

1. ✅ Admin user can access dashboard via menu
2. ✅ Regular users cannot see admin menu item
3. ✅ Regular users cannot access admin routes
4. ✅ Admin can view all users in table
5. ✅ Admin can search and filter users
6. ✅ Admin can create new users
7. ✅ Admin can edit existing users
8. ✅ Admin can delete users
9. ✅ Dashboard shows accurate statistics
10. ✅ All operations work with Supabase auth
11. ✅ UI is modern, sleek, and premium
12. ✅ Mobile responsive
13. ✅ Accessible (WCAG AA)
14. ✅ Fast performance (<2s page load)
15. ✅ No console errors or warnings

---

## Future Enhancements

1. **Audit Logging** - Track all admin actions
2. **Bulk Operations** - Import/export users via CSV
3. **Advanced Analytics** - User engagement metrics, charts
4. **Email Templates** - Customize welcome emails
5. **Role Permissions** - Granular permission system
6. **User Impersonation** - View app as specific user
7. **Activity Dashboard** - Real-time user activity
8. **Notification System** - Alert admins of important events
9. **Multi-factor Authentication** - Require MFA for admins
10. **API Key Management** - Generate API keys for users

---

## Technical Notes

### Authentication Flow
1. User logs in via Supabase Auth
2. Middleware checks if user is authenticated
3. For admin routes, middleware queries user_settings.user_type
4. If user_type === 'admin', allow access
5. Otherwise, redirect to home page

### Data Flow
1. Admin dashboard page loads
2. Server component fetches initial data using service role
3. Client components use React Query for subsequent requests
4. All mutations invalidate relevant queries
5. Optimistic updates for better UX

### Service Role Usage
- Admin API routes use SUPABASE_SERVICE_ROLE_KEY
- Service role bypasses RLS policies
- Only use for admin operations
- Never expose service role key to client

### Error Handling
- API routes return standardized error responses
- Client shows toast notifications for errors
- Validation errors show inline in forms
- Network errors show retry button
- 403 errors redirect to home page

### Caching Strategy
- React Query caches all admin data
- Cache time: 5 minutes
- Stale time: 1 minute
- Refetch on window focus
- Invalidate on mutations

---

## API Response Formats

### User List Response
```typescript
interface UserListResponse {
  users: Array<{
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    user_type: 'admin' | 'moderator' | null;
    email_confirmed_at: string | null;
    settings: UserSettings | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### User Detail Response
```typescript
interface UserDetailResponse {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  user_type: 'admin' | 'moderator' | null;
  settings: UserSettings;
  metadata: Record<string, any>;
  app_metadata: Record<string, any>;
}
```

### Stats Response
```typescript
interface AdminStatsResponse {
  totalUsers: number;
  activeUsers: number; // Last 30 days
  newUsers: number; // Last 7 days
  adminCount: number;
  moderatorCount: number;
  trends: {
    usersGrowth: number; // Percentage
    activeGrowth: number; // Percentage
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

---

## Database Queries Reference

### Get All Users (Admin)
```sql
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  us.user_type,
  us.theme,
  us.created_at as settings_created_at
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.user_id
ORDER BY u.created_at DESC
LIMIT 50 OFFSET 0;
```

### Get User Count by Role
```sql
SELECT
  COALESCE(user_type, 'user') as role,
  COUNT(*) as count
FROM user_settings
GROUP BY user_type;
```

### Get Active Users (Last 30 Days)
```sql
SELECT COUNT(DISTINCT id)
FROM auth.users
WHERE last_sign_in_at > NOW() - INTERVAL '30 days';
```

### Get New Users (Last 7 Days)
```sql
SELECT COUNT(*)
FROM auth.users
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Update User Role
```sql
UPDATE user_settings
SET user_type = 'admin', updated_at = NOW()
WHERE user_id = $1;
```

---

## Component Props Reference

### AdminDashboardLayout
```typescript
interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}
```

### StatisticsCards
```typescript
interface StatisticsCardsProps {
  stats: AdminStatsResponse;
  isLoading?: boolean;
}
```

### UserManagementTable
```typescript
interface UserManagementTableProps {
  users: UserListResponse['users'];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}
```

### UserSearchBar
```typescript
interface UserSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}
```

### UserFilters
```typescript
interface UserFiltersProps {
  filters: UserFilters;
  onChange: (filters: UserFilters) => void;
  onClear: () => void;
}

interface UserFilters {
  role: 'all' | 'admin' | 'moderator' | 'user';
  status: 'all' | 'active' | 'inactive';
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
}
```

### AddUserDialog
```typescript
interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}
```

### EditUserDialog
```typescript
interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: (user: User) => void;
}
```

### DeleteUserConfirmation
```typescript
interface DeleteUserConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email: string };
  onConfirm: () => void;
  isDeleting?: boolean;
}
```

---

## Environment Variables Required

```env
# Existing variables (already in .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://jydaltnubswauneffbpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_PROJECT_ID=jydaltnubswauneffbpj

# No new variables needed for admin dashboard
```

---

## File Structure

```
app/
├── admin/
│   └── dashboard/
│       └── page.tsx
├── api/
│   └── admin/
│       ├── users/
│       │   ├── route.ts
│       │   └── [userId]/
│       │       └── route.ts
│       └── stats/
│           └── route.ts

components/
└── admin/
    ├── AdminDashboardLayout.tsx
    ├── StatisticsCards.tsx
    ├── UserManagementTable.tsx
    ├── UserSearchBar.tsx
    ├── UserFilters.tsx
    ├── AddUserDialog.tsx
    ├── EditUserDialog.tsx
    ├── DeleteUserConfirmation.tsx
    └── UserActivityLog.tsx

contexts/
└── AdminContext.tsx

hooks/
└── admin/
    ├── useAdminCheck.ts
    ├── useAdminUsers.ts
    └── useAdminStats.ts

lib/
├── auth/
│   └── admin-check.ts
├── api/
│   └── admin-client.ts
└── react-query/
    └── admin-query-keys.ts

types/
└── admin.ts
```

---

## Dependencies

**No new dependencies required!**

All functionality can be implemented using existing dependencies:
- `@supabase/supabase-js` - Database and auth
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `next` - Framework
- `react` - UI library
- `typescript` - Type safety

Optional (if needed):
- `sonner` - Toast notifications (may already be installed)
- `react-hook-form` - Form handling (may already be installed)
- `zod` - Validation (may already be installed)

---

## Implementation Order

**Recommended implementation sequence:**

1. **Database** (Phase 1)
   - Add user_type column
   - Set admin user
   - Test migration

2. **Backend Auth** (Phase 2)
   - Create admin-check utility
   - Create AdminContext
   - Create useAdminCheck hook

3. **Backend API** (Phase 3)
   - Create user management API
   - Create stats API
   - Test endpoints

4. **Menu Integration** (Phase 5)
   - Update HamburgerMenu
   - Update middleware
   - Test admin access

5. **Frontend Components** (Phase 4)
   - Create layout and basic components
   - Create statistics cards
   - Create user table
   - Create dialogs

6. **Data Layer** (Phase 7)
   - Create query keys
   - Create query hooks
   - Create API client

7. **Dashboard Page** (Phase 4)
   - Assemble components
   - Add data fetching
   - Test functionality

8. **Polish** (Phases 6, 10, 11, 12)
   - Apply styling
   - Optimize performance
   - Add accessibility
   - Make responsive

9. **Testing** (Phase 9)
   - Write tests
   - Fix bugs
   - Verify all features

---

## Notes for AI Implementation

1. **Always use AuthType.Admin** for SQL operations (service role key)
2. **Never hardcode user IDs** except for the initial admin setup
3. **Use existing theme system** from the app (dark theme with purple/blue gradients)
4. **Follow Next.js App Router** conventions (server components where possible)
5. **Use TypeScript strictly** - no `any` types
6. **Implement proper error handling** - never let errors crash the app
7. **Add loading states** to all async operations
8. **Use React Query** for all data fetching
9. **Make it responsive** - mobile-first approach
10. **Keep it accessible** - WCAG AA compliance
11. **Optimize performance** - lazy load, code split, cache
12. **Match existing code style** - consistent with the rest of the app
13. **Add comments** for complex logic
14. **Use inline styles** for theme integration (like existing components)
15. **Test thoroughly** before marking complete

---

## End of Blueprint

This blueprint provides comprehensive details for implementing a fully functional, modern, sleek, and ultra-premium admin dashboard for the Musical Insights platform. Follow the phases in order, complete all checklist items, and verify against the success criteria.


