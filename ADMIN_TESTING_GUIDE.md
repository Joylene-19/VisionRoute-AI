# 🔐 Admin Panel Testing Guide

## Step-by-Step Instructions to Access Admin Panel

### Step 1: Start Your Servers

Open terminal and run:

```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 5173).

---

### Step 2: Make Your Account an Admin

**Option A: Using the make-admin.js Script (Recommended)**

1. Open a **NEW terminal** (keep the servers running)
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Run the admin script:
   ```bash
   node make-admin.js
   ```
4. You'll see a list of all users - enter the number of the user you want to make admin
5. The script will update the user role to "admin"

**Option B: Manual Database Update**

If you have MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your database
3. Go to `visionroute` database → `users` collection
4. Find your user document
5. Edit the document and change `role: "user"` to `role: "admin"`
6. Save the changes

---

### Step 3: Login to Your Account

1. Go to http://localhost:5173
2. Click "Login"
3. Login with the email/password of the account you made admin
4. You should be logged in successfully

---

### Step 4: Access the Admin Panel

Once logged in, you can access the admin panel in two ways:

**Method 1: Direct URL**

- Go to: http://localhost:5173/admin
- This will show the Admin Dashboard

**Method 2: Add Link to Navbar (Optional)**

- You can add an "Admin" link to the navigation bar (I can help with this if needed)

---

### Step 5: Test Admin Features

#### Admin Dashboard (`/admin`)

You'll see:

- 📊 **Total Users** - Count of all registered users
- 📝 **Total Assessments** - All assessments created
- ✅ **Completed Assessments** - Finished assessments
- ⚡ **Active Users** - Users active in last 7 days
- 📋 **Recent Users** - Last 10 registered users
- 📊 **Recent Assessments** - Last 10 assessments

#### User Management (`/admin/users`)

You can:

- ✅ View all users in a table
- 🔍 Search users by name or email
- 🎯 Filter users by role (User/Admin)
- 👑 Change user roles (promote user to admin or demote admin to user)
- 🗑️ Delete users (this will also delete their assessments)
- 📄 Pagination - Navigate through pages if you have many users

---

## Testing Checklist

### ✅ Dashboard Tests

- [ ] Check if statistics show correct numbers
- [ ] Verify recent users list displays
- [ ] Verify recent assessments list displays
- [ ] Check if cards are displaying properly

### ✅ User Management Tests

- [ ] View all users in table
- [ ] Search for a user by name
- [ ] Search for a user by email
- [ ] Filter by "Admin" role
- [ ] Filter by "User" role
- [ ] Clear filters
- [ ] Change a user's role from "user" to "admin"
- [ ] Change a user's role from "admin" to "user"
- [ ] Try to delete a user (be careful - this is permanent!)
- [ ] Test pagination if you have more than 10 users

---

## What to Check For

### 🔒 Security

- Non-admin users should NOT be able to access `/admin` or `/admin/users`
- Only users with `role: "admin"` should see admin content

### 📊 Data Display

- User count should match your database
- Assessment count should be accurate
- Recent activity should show latest entries

### 🎨 UI/UX

- All buttons should work
- Search and filters should update results
- Role dropdown should update immediately
- Delete confirmation should appear before deleting

---

## Common Issues & Solutions

### Issue: "Access denied. Admin privileges required"

**Solution:** Your account is not an admin. Run `node make-admin.js` again.

### Issue: Dashboard shows 0 for everything

**Solution:** The backend may not be running or the API endpoints have issues. Check the terminal for errors.

### Issue: Can't see admin pages

**Solution:** Make sure you imported and added the routes in App.jsx (already done).

### Issue: Backend API errors

**Solution:** Check if you have the `adminOnly` middleware exported in `authMiddleware.js`.

---

## Next Steps After Testing

Once you've verified everything works:

1. ✅ Confirm dashboard statistics are accurate
2. ✅ Confirm user management works (search, filter, role change, delete)
3. 🎯 Ready to build: Question Management page
4. 🎯 Ready to build: Admin Layout with sidebar navigation
5. 🎯 Ready to build: More admin features

---

## Quick Commands Reference

```bash
# Start both servers
npm run dev

# Make a user admin (in new terminal)
cd backend
node make-admin.js

# View all users
cd backend
node view-users.js
```

---

Let me know once you've tested and I'll continue with the remaining admin features! 🚀
