# Customer Review System - Quick Start Guide

## 🚀 Getting Started

### Step 1: Create Admin User

Before you can manage reviews, you need to create an admin user account:

1. Go to [Supabase Dashboard](https://app.supabase.com/project/jydaltnubswauneffbpj/auth/users)
2. Click **"Add User"** button
3. Enter admin email and password
4. Click **"Create User"**
5. Save these credentials securely!

**Recommended Admin Credentials:**
- Email: `admin@kryswolf.com` (or your preferred email)
- Password: Use a strong password (min 8 characters)

---

### Step 2: Test Review Submission

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the review submission page:**
   - Open browser: `http://localhost:3000/reviews/submit`

3. **Fill out the form:**
   - Name: `John Doe`
   - Email: `john@example.com`
   - Service Type: Select `DJ Services`
   - Rating: Click 5 stars
   - Review: `Krys Wolf provided amazing DJ services for our wedding! The music selection was perfect and kept everyone dancing all night.`
   - Event Date: Select a recent date
   - Event Location: `Los Angeles, CA`

4. **Upload photos (optional):**
   - Click "Upload Photos"
   - Select 1-3 event photos from your computer
   - Verify thumbnails appear

5. **Submit the review:**
   - Click "Submit Review"
   - Wait for success message
   - You should see: "Thank you for your review! It will be published after approval."

---

### Step 3: Access Admin Dashboard

1. **Navigate to admin login:**
   - Open browser: `http://localhost:3000/adminaccesspoint`
   - ⚠️ **Important:** This URL is hidden and not linked publicly

2. **Sign in:**
   - Enter the admin email and password you created in Step 1
   - Click "Sign In"

3. **View the dashboard:**
   - You should be redirected to `/adminaccesspoint/dashboard`
   - See statistics: 1 Pending Review, 0 Approved Reviews

---

### Step 4: Approve a Review

1. **In the admin dashboard:**
   - Look at the "Pending Reviews" section (left column)
   - You should see the review you just submitted

2. **Review the details:**
   - Check customer name, email, rating
   - Read the review text
   - View uploaded photos (if any)

3. **Approve the review:**
   - Click the green "Approve" button
   - The review will move to the "Approved Reviews" section (right column)
   - Statistics will update: 0 Pending, 1 Approved

---

### Step 5: View Public Reviews Page

1. **Navigate to public reviews:**
   - Open browser: `http://localhost:3000/reviews`

2. **Verify the review appears:**
   - You should see the approved review displayed
   - Statistics should show: 1 Total Review, 5.0 Average Rating, 1 Five-Star Review
   - Customer name should be formatted (e.g., "John D.")

3. **Test photo gallery (if photos uploaded):**
   - Click on a photo thumbnail
   - Photo gallery modal should open
   - Use arrow keys or buttons to navigate
   - Press ESC or click X to close

---

## 🧪 Additional Testing

### Test Review Rejection

1. Submit another review at `/reviews/submit`
2. Go to admin dashboard
3. Click "Reject" button on the pending review
4. Confirm deletion
5. Verify review is removed from pending list

### Test Unapprove Feature

1. In admin dashboard, find an approved review
2. Click "Unapprove" button
3. Verify it moves back to pending list
4. Check public page - review should no longer appear

### Test Photo Upload Limits

1. Try uploading more than 5 photos
2. Verify error message appears
3. Try uploading a file larger than 5MB
4. Verify error message appears
5. Try uploading a non-image file
6. Verify error message appears

### Test Mobile Responsiveness

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone, Android)
4. Navigate through all pages
5. Verify layout looks good on mobile

---

## 📱 URLs Reference

| Page | URL | Access |
|------|-----|--------|
| Public Reviews | `/reviews` | Public |
| Submit Review | `/reviews/submit` | Public |
| Admin Login | `/adminaccesspoint` | Hidden (bookmark this!) |
| Admin Dashboard | `/adminaccesspoint/dashboard` | Admin only |

---

## 🎨 Customization Tips

### Change Service Types

Edit `lib/validations/review-schema.ts`:

```typescript
export const SERVICE_TYPES = [
  'DJ Services',
  'Music Production',
  'Live Performance',
  'Sound Engineering',
  'Music Lessons',
  'Event Planning',
  'Other'
] as const;
```

### Adjust Photo Limits

Edit `components/reviews/PhotoUploader.tsx`:

```typescript
<PhotoUploader
  onPhotosChange={setPhotos}
  maxPhotos={5}  // Change this number
  maxSizeMB={5}  // Change this number
/>
```

### Modify Colors

The system uses Tailwind CSS. Main colors:
- Purple: `purple-600`, `purple-700`
- Blue: `blue-600`, `blue-700`
- Yellow (stars): `yellow-400`
- Green (approve): `green-600`
- Red (reject): `red-500`

---

## ❓ Troubleshooting

### "Unauthorized" error in admin dashboard
- Make sure you're signed in
- Check that admin user exists in Supabase
- Clear browser cookies and sign in again

### Photos not uploading
- Check file size (must be < 5MB)
- Check file type (JPEG, PNG, WebP only)
- Verify storage bucket exists in Supabase
- Check browser console for errors

### Reviews not appearing on public page
- Verify review is approved (check admin dashboard)
- Refresh the page
- Check browser console for errors

### Can't access admin dashboard
- Verify URL is exactly `/adminaccesspoint/dashboard`
- Make sure you're signed in at `/adminaccesspoint`
- Check middleware.ts is configured correctly

---

## ✅ Success Criteria

Your review system is working correctly if:

- ✅ You can submit a review with photos
- ✅ Review appears in admin pending list
- ✅ You can approve the review
- ✅ Approved review appears on public page
- ✅ Photos display correctly in gallery
- ✅ Statistics update correctly
- ✅ Mobile layout looks good
- ✅ Admin routes are protected

---

## 🎉 You're All Set!

The customer review system is now fully functional. Customers can submit reviews, and you can manage them through the admin dashboard. The public reviews page will showcase your best testimonials!

**Pro Tip:** Bookmark `/adminaccesspoint` in your browser for easy access to the admin dashboard.

Enjoy! 🌟

