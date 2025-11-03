# 🧪 LOCAL TESTING GUIDE - FEATURE 6

## ✅ Server Status

**Server**: http://localhost:3000 ✅ RUNNING

Dev server is running on Turbopack (Next.js 16)
- Local: http://localhost:3000
- Network: http://192.168.1.13:3000

---

## 🎯 Testing Steps

### Step 1: Signup Page ✅

**URL**: http://localhost:3000/signup

**What to look for**:
- [ ] Beautiful dark Discord theme
- [ ] Form with all fields visible
- [ ] Username, Email, Password fields
- [ ] "Create Account" button
- [ ] "Login here" link at bottom
- [ ] "Show/Hide" password toggle

**Form Validation**:
- [ ] Username: 3-20 characters minimum
- [ ] Email: Valid email format required
- [ ] Password: Minimum 8 chars, uppercase, lowercase, number
- [ ] Password Confirm: Must match password

### Step 2: Create Test Account

Fill in the form:
```
Username:           testuser
Email:              test@example.com
Password:           TestPass123
Confirm Password:   TestPass123
```

Click "Create Account"

**Expected Result**:
- ✅ Account created successfully
- ✅ Redirects to chat interface
- ✅ Or shows error message if validation fails

---

### Step 3: Login Page ✅

**URL**: http://localhost:3000/login

**What to look for**:
- [ ] Beautiful dark Discord theme
- [ ] Email and Password fields
- [ ] "Login" button
- [ ] "Create one" link to signup
- [ ] Show/Hide password toggle
- [ ] Demo credentials hint

### Step 4: Test Login

Use the account you just created:
```
Email:    test@example.com
Password: TestPass123
```

Click "Sign In"

**Expected Result**:
- ✅ Successfully logs in
- ✅ Redirects to chat interface
- ✅ Or shows error if credentials wrong

---

### Step 5: Chat Interface ✅

After successful login, you should see:

**Sidebar** (Left side):
- [ ] Server name "WebChat"
- [ ] Channel list:
  - #general
  - #random
  - #announcements
  - #tech
  - #gaming
- [ ] User profile with username

**Header** (Top):
- [ ] Channel name (#general, #random, etc.)
- [ ] User info (username, profile icon)
- [ ] Logout button

**Chat Area** (Center):
- [ ] Empty message area (no messages yet)
- [ ] Message input at bottom
- [ ] Ready to send messages

**Members List** (Right side):
- [ ] Online members displayed
- [ ] Status indicators (online, idle, DND, offline)
- [ ] Member avatars

---

## 🧪 Test Scenarios

### Scenario 1: Valid Signup
```
Username: john_doe
Email: john@example.com
Password: SecurePass123
Result: ✅ Account created, login succeeds
```

### Scenario 2: Invalid Username (Too Short)
```
Username: ab
Email: test@example.com
Password: SecurePass123
Result: ✅ Shows validation error
```

### Scenario 3: Invalid Email
```
Username: testuser
Email: notanemail
Password: SecurePass123
Result: ✅ Shows email validation error
```

### Scenario 4: Weak Password
```
Username: testuser
Email: test@example.com
Password: weak123
Result: ✅ Shows password requirement error
```

### Scenario 5: Passwords Don't Match
```
Username: testuser
Email: test@example.com
Password: StrongPass123
Confirm: DifferentPass123
Result: ✅ Shows mismatch error
```

### Scenario 6: Duplicate Username
```
Username: testuser (already created)
Email: different@example.com
Password: SecurePass123
Result: ✅ Shows "Username already taken" error
```

### Scenario 7: Duplicate Email
```
Username: newuser
Email: test@example.com (already used)
Password: SecurePass123
Result: ✅ Shows "Email already registered" error
```

---

## 📋 Database Testing

### Check Database File

**Location**: `.data/webchat.db`

**Verify**:
- [ ] File exists after first signup
- [ ] File size increases after each signup
- [ ] File persists between page refreshes

### Test Database Persistence

1. Create account: `user1@test.com`
2. Logout
3. Try to login with `user1@test.com` → Should work ✅
4. Restart server
5. Try to login with `user1@test.com` → Should still work ✅

---

## 🔒 Security Testing

### Password Hashing
- [ ] Passwords are hashed (check database)
- [ ] Plain text passwords never stored
- [ ] Same password creates different hash each time

### JWT Token
- [ ] Token generated on login
- [ ] Token stored in localStorage
- [ ] Token sent in API requests
- [ ] Token verified on protected routes

### Protected Routes
- [ ] Cannot access /channels without login
- [ ] Redirects to /login if not authenticated
- [ ] Token required for API endpoints

---

## 🎨 UI/UX Testing

### Login Page
- [ ] Beautiful gradient background
- [ ] Form centered on screen
- [ ] All text readable (good contrast)
- [ ] Buttons have hover effects
- [ ] Responsive on different screen sizes

### Signup Page
- [ ] Beautiful gradient background
- [ ] Form centered on screen
- [ ] All fields clearly labeled
- [ ] Validation hints visible
- [ ] Error messages highlighted in red
- [ ] Success messages appear

### Chat Interface
- [ ] Sidebar visible and collapsible
- [ ] Header shows current channel
- [ ] Chat area displays correctly
- [ ] Members list shows users
- [ ] Colors match Discord theme

---

## ⚡ Performance Testing

### Load Time
- [ ] Signup page loads in <2 seconds
- [ ] Login page loads in <2 seconds
- [ ] Chat interface loads in <1 second
- [ ] No lag on form interaction

### Database Speed
- [ ] Signup completes in <1 second
- [ ] Login completes in <500ms
- [ ] Database queries are fast

---

## 🐛 Error Handling

### Network Errors
- [ ] Shows error message if signup fails
- [ ] Shows error message if login fails
- [ ] Error messages are clear and helpful

### Validation Errors
- [ ] Username validation messages appear
- [ ] Email validation messages appear
- [ ] Password validation messages appear
- [ ] All errors clearly explain what's wrong

### Server Errors
- [ ] Graceful error handling
- [ ] No white screens of death
- [ ] Error messages help user understand issue

---

## 📱 Responsive Design

### Desktop (1920x1080)
- [ ] All elements visible
- [ ] Proper spacing
- [ ] Readable text

### Tablet (768x1024)
- [ ] Layout adapts properly
- [ ] Touch-friendly buttons
- [ ] Forms still usable

### Mobile (375x667)
- [ ] Layout stacks vertically
- [ ] Form takes full width
- [ ] Buttons large enough to tap

---

## ✅ Full Test Checklist

```
PAGES:
[ ] Homepage loads
[ ] Signup page renders
[ ] Login page renders
[ ] Chat interface shows after login
[ ] Logout redirects to login

AUTHENTICATION:
[ ] Signup creates account
[ ] Login authenticates user
[ ] Auto-login on page refresh (if token exists)
[ ] Logout clears token
[ ] Protected routes redirect to login

DATABASE:
[ ] User data persists after logout
[ ] Can login with created account
[ ] Duplicate username rejected
[ ] Duplicate email rejected
[ ] Database file exists

STYLING:
[ ] Dark theme applied
[ ] Gradient backgrounds visible
[ ] Colors match Discord theme
[ ] Animations smooth
[ ] Responsive layout

UI COMPONENTS:
[ ] Forms display correctly
[ ] Buttons are clickable
[ ] Links work
[ ] Error messages show
[ ] Success messages show
[ ] Loading states appear

SECURITY:
[ ] Passwords are hashed
[ ] JWT tokens created
[ ] Protected routes work
[ ] Invalid tokens rejected
[ ] XSS protection working
```

---

## 🎯 Recommended Test Order

1. ✅ **Visit pages** (Visual inspection)
2. ✅ **Create account** (Full signup flow)
3. ✅ **Test validation** (Try invalid inputs)
4. ✅ **Login** (Authentication)
5. ✅ **Explore chat** (UI components)
6. ✅ **Logout** (Session cleanup)
7. ✅ **Auto-login** (Refresh page, should stay logged in)
8. ✅ **Try login** (Use created credentials)

---

## 🎊 Success Criteria

**All of the following should work**:

1. ✅ Can create account with valid data
2. ✅ Cannot create with invalid data (validation works)
3. ✅ Can login with created account
4. ✅ Cannot login with wrong password
5. ✅ Protected routes redirect to login
6. ✅ Can logout
7. ✅ Auto-login works on page refresh
8. ✅ Chat interface displays after login
9. ✅ UI is beautiful and responsive
10. ✅ All error messages are helpful

---

## 📊 Current Status

- ✅ Server running at http://localhost:3000
- ✅ Signup page accessible
- ✅ Login page accessible
- ✅ Database initialized
- ✅ All API routes ready
- ✅ Authentication system complete

**Ready for testing!** 🚀

---

## 🎯 Next After Testing

- ✅ If everything works → Share with friends!
- ✅ If bugs found → Fix and redeploy
- ✅ If ready → Consider PostgreSQL for Vercel

---

## 🆘 Troubleshooting

### Pages not loading
- Check server is running: http://localhost:3000
- Check console for errors (F12)
- Restart dev server: Stop with Ctrl+C, then `npx next dev --webpack`

### Signup fails
- Check database file exists at `.data/webchat.db`
- Check password meets requirements
- Look at server logs for detailed error

### Can't login
- Check username/email and password are correct
- Check account was created successfully
- Verify database file is not corrupted

### Styling looks weird
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R)
- Restart dev server

---

**Test It Out!** 🧪 Go to http://localhost:3000 and try it!
