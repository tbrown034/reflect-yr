# Cloud Sync Feature Test Plan

This document outlines the comprehensive test plan for the cloud sync feature in Sortid. The feature enables signed-in users to sync their lists across devices while maintaining localStorage as a fallback for anonymous users and offline scenarios.

---

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [List Sync Flow](#list-sync-flow)
3. [Sharing Flow](#sharing-flow)
4. [Offline/Edge Cases](#offlineedge-cases)
5. [Security](#security)

---

## Authentication Flow

### Test 1: Anonymous User Can Create Lists (localStorage Only, Max 10)

**Description**
Anonymous users should be able to create and manage lists without signing in. Lists are stored in localStorage with a maximum limit of 10 total lists.

**Preconditions**
- User is not signed in
- localStorage is empty or has fewer than 10 lists
- Browser supports localStorage

**Steps to Test**
1. Navigate to the app (ensure no active session)
2. Create a new list via `/create`
3. Add 5 items to the list
4. Publish the list
5. Repeat until 10 lists are created
6. Attempt to create an 11th list

**Expected Result**
- Lists 1-10 are created successfully and stored in localStorage
- 11th list creation is blocked with an appropriate message
- `publishedLists` key in localStorage contains all 10 lists
- No network requests to save lists to database

**How to Verify**
```javascript
// In Chrome DevTools Console
const lists = JSON.parse(localStorage.getItem('publishedLists'));
console.log('Total lists:', Object.keys(lists).length);
console.log('List IDs:', Object.keys(lists));
```

---

### Test 2: User Can Sign In with Google

**Description**
Users should be able to authenticate via Google OAuth and have their session persist across page refreshes.

**Preconditions**
- User has a Google account
- Google OAuth credentials are configured
- User is not currently signed in

**Steps to Test**
1. Navigate to the app
2. Click the "Sign In" button in the header
3. Select Google as the provider
4. Complete Google OAuth flow
5. Verify redirect back to app
6. Refresh the page

**Expected Result**
- OAuth flow completes without errors
- User is redirected back to the app
- User avatar/name appears in header
- Session persists after page refresh
- Session cookie is set (`better-auth.session_token`)

**How to Verify**
```javascript
// In Chrome DevTools Console
// Check session via authClient
import { authClient } from '@/library/auth-client';
const session = await authClient.getSession();
console.log('Session:', session);

// Or check cookies
document.cookie.split(';').filter(c => c.includes('better-auth'));
```

---

### Test 3: Signed-In User Sees Their Synced Lists

**Description**
When a user signs in, they should see lists fetched from the database, merged with any existing localStorage lists.

**Preconditions**
- User has an account with existing lists in the database
- User may have localStorage lists from anonymous usage

**Steps to Test**
1. Create 2 lists while signed out (stored in localStorage)
2. Sign in with Google
3. Navigate to `/lists`
4. Verify both localStorage and database lists are visible
5. Sign out and sign in again
6. Verify database lists are still present

**Expected Result**
- After sign-in, user sees combined view of local + cloud lists
- Lists from database are marked/distinguished from local-only lists
- Signing out and back in preserves cloud lists
- Local lists can be optionally migrated to cloud

**How to Verify**
```bash
# Check database for user's lists
curl -X GET "https://your-app.vercel.app/api/lists" \
  -H "Cookie: better-auth.session_token=<token>"
```

---

### Test 4: Sign Out Clears Session but Keeps localStorage Lists

**Description**
When a user signs out, their session is terminated but localStorage lists remain accessible.

**Preconditions**
- User is signed in
- User has both cloud-synced and localStorage lists

**Steps to Test**
1. Sign in and verify session is active
2. Create a list while signed in (should sync to cloud)
3. Verify list appears in `/lists`
4. Click "Sign Out"
5. Verify session is cleared
6. Navigate to `/lists`
7. Check what lists remain visible

**Expected Result**
- Session cookie is removed
- User avatar disappears from header
- localStorage lists remain accessible
- Cloud-only lists are no longer visible (until sign-in)
- No errors thrown during sign-out

**How to Verify**
```javascript
// After sign out
const session = await authClient.getSession();
console.log('Session should be null:', session);

// localStorage should still have data
const localLists = JSON.parse(localStorage.getItem('publishedLists'));
console.log('Local lists:', Object.keys(localLists).length);
```

---

## List Sync Flow

### Test 5: Signed-In User Creates List -> Saves to Database AND localStorage

**Description**
When a signed-in user creates a list, it should be persisted to both the database and localStorage for offline access.

**Preconditions**
- User is signed in
- Database connection is active
- User has not reached list limit

**Steps to Test**
1. Sign in to the app
2. Navigate to `/create`
3. Select "Movies" category
4. Add 5 movies to the list
5. Fill in title and description
6. Click "Publish"
7. Check network requests
8. Check localStorage

**Expected Result**
- POST request sent to `/api/lists` with list data
- API returns 201 Created with list ID
- List appears in localStorage under `publishedLists`
- List has `userId` field set
- List has `syncedAt` timestamp

**How to Verify**
```javascript
// Check network tab for POST to /api/lists
// Response should include:
{
  id: "list_xxx_yyy",
  userId: "user_abc",
  syncedAt: "2025-01-25T..."
}

// Check localStorage
const lists = JSON.parse(localStorage.getItem('publishedLists'));
const newList = lists['list_xxx_yyy'];
console.log('Has userId:', !!newList.userId);
console.log('Synced at:', newList.syncedAt);
```

---

### Test 6: Signed-In User's Lists Load from Database on Page Refresh

**Description**
On page load, signed-in users should fetch their lists from the database rather than relying solely on localStorage.

**Preconditions**
- User is signed in
- User has lists stored in the database
- Page is being loaded fresh (not from cache)

**Steps to Test**
1. Sign in and create a list
2. Open a new browser window/incognito (no localStorage)
3. Sign in with the same account
4. Navigate to `/lists`
5. Verify the list created in step 1 appears

**Expected Result**
- GET request to `/api/lists` on page load
- Lists from database are merged with localStorage
- All user's lists are visible regardless of device
- Loading state shown while fetching

**How to Verify**
```javascript
// In Network tab, look for:
GET /api/lists
Response: {
  lists: [
    { id: "list_xxx", title: "My Movies", items: [...] },
    ...
  ]
}
```

---

### Test 7: List Updates Sync to Database in Real-Time

**Description**
When a user modifies a list (reorder, add comment, change rating), changes should sync to the database.

**Preconditions**
- User is signed in
- User has an existing synced list
- Network connection is available

**Steps to Test**
1. Navigate to a published list
2. Add a comment to an item
3. Check network for PATCH request
4. Change an item's rating
5. Check network for PATCH request
6. Reorder items via drag-and-drop
7. Check network for PATCH request
8. Refresh the page
9. Verify all changes persisted

**Expected Result**
- PATCH request sent after each modification
- API returns 200 OK
- Changes reflect immediately in UI
- Changes persist after page refresh
- localStorage and database stay in sync

**How to Verify**
```bash
# Monitor network for PATCH requests
PATCH /api/lists/list_xxx_yyy
Body: {
  "items": [...updated items...],
  "updatedAt": "2025-01-25T..."
}
Response: 200 OK
```

---

### Test 8: Deleting a List Removes from Database (Soft Delete)

**Description**
When a user deletes a list, it should be soft-deleted in the database (marked as deleted, not removed).

**Preconditions**
- User is signed in
- User has at least one synced list
- Database supports soft delete (`deletedAt` field)

**Steps to Test**
1. Navigate to `/lists`
2. Find a synced list
3. Click "Delete" button
4. Confirm deletion in modal
5. Verify list disappears from UI
6. Check network for DELETE request
7. Check database directly

**Expected Result**
- DELETE request sent to `/api/lists/[listId]`
- API returns 200 OK (soft delete)
- List no longer appears in UI
- List remains in database with `deletedAt` timestamp
- localStorage list is removed

**How to Verify**
```sql
-- In database (Neon console)
SELECT id, title, deleted_at
FROM lists
WHERE id = 'list_xxx_yyy';
-- Should show deleted_at is NOT NULL
```

---

## Sharing Flow

### Test 9: Public List Accessible via Share Code Without Auth

**Description**
Lists marked as public should be accessible to anyone with the share code, without requiring authentication.

**Preconditions**
- A public list exists with a share code
- User accessing the link is not signed in

**Steps to Test**
1. Create and publish a list as signed-in user
2. Copy the share link (e.g., `/share/X7Kp2m`)
3. Open an incognito browser window
4. Paste and navigate to the share link
5. Verify list content is visible

**Expected Result**
- List page loads without authentication
- All list items are displayed
- User info shows "Guest" or anonymous
- Share button allows copying link
- Cannot edit/delete the list

**How to Verify**
```javascript
// The share page should fetch via:
GET /api/share/X7Kp2m
// Response includes full list without requiring auth
{
  list: {
    title: "My Top Movies",
    items: [...],
    isPublic: true
  }
}
```

---

### Test 10: Private List Only Accessible to Owner

**Description**
Lists marked as private should only be accessible to the authenticated owner.

**Preconditions**
- A private list exists (`isPublic: false`)
- Owner is signed in
- Non-owner user attempts access

**Steps to Test**
1. Create a list and set `isPublic: false`
2. Note the list ID
3. Try accessing via share code while signed out
4. Try accessing via direct URL while signed in as different user
5. Access as the owner

**Expected Result**
- Share code returns 404 or "List not found"
- Direct URL returns 403 Forbidden for non-owners
- Owner can access the list normally
- No list data leaked in error responses

**How to Verify**
```bash
# As non-owner
curl -X GET "https://your-app.vercel.app/api/lists/private_list_id"
# Response: 403 Forbidden

# As owner (with session cookie)
curl -X GET "https://your-app.vercel.app/api/lists/private_list_id" \
  -H "Cookie: better-auth.session_token=<owner_token>"
# Response: 200 OK with list data
```

---

### Test 11: Share Link Copies Correct URL Format

**Description**
The share button should copy the correctly formatted public URL to the clipboard.

**Preconditions**
- User has a published public list
- Browser supports clipboard API

**Steps to Test**
1. Navigate to a published list
2. Click the "Share" button
3. Check clipboard content
4. Paste and verify URL format

**Expected Result**
- URL format: `https://sortid.app/share/X7Kp2m`
- Share code is 6 characters
- No ambiguous characters (0, 1, I, l, O)
- URL is functional when pasted into browser

**How to Verify**
```javascript
// After clicking share button
navigator.clipboard.readText().then(url => {
  console.log('Copied URL:', url);
  // Should match: https://sortid.app/share/[a-zA-Z2-9]{6}
});
```

---

## Offline/Edge Cases

### Test 12: Creating List While Offline Saves to localStorage

**Description**
When network is unavailable, list operations should gracefully fall back to localStorage.

**Preconditions**
- User is signed in
- User goes offline (disable network in DevTools)
- User attempts to create a list

**Steps to Test**
1. Sign in to the app
2. Open DevTools > Network > Offline
3. Navigate to `/create`
4. Add items and publish list
5. Verify list is saved locally
6. Re-enable network

**Expected Result**
- No network errors crash the app
- List saved to localStorage with `pendingSync: true` flag
- User sees "Saved offline" notification
- List appears in `/lists` with sync pending indicator

**How to Verify**
```javascript
// Check localStorage for pending sync
const lists = JSON.parse(localStorage.getItem('publishedLists'));
const offlineList = Object.values(lists).find(l => l.pendingSync);
console.log('Offline list:', offlineList);
console.log('Pending sync:', offlineList.pendingSync);
```

---

### Test 13: Coming Back Online Syncs Pending Changes

**Description**
When network connectivity is restored, pending changes should automatically sync to the database.

**Preconditions**
- User has lists with `pendingSync: true`
- User was previously signed in
- Network is now available

**Steps to Test**
1. Have a list in pending sync state (from Test 12)
2. Re-enable network connection
3. Refresh the page or wait for auto-sync
4. Verify list syncs to database
5. Verify `pendingSync` flag is cleared

**Expected Result**
- Auto-sync triggers on `online` event or page load
- POST/PATCH requests sent for pending items
- `pendingSync` flag removed after successful sync
- `syncedAt` timestamp updated
- User notified of successful sync

**How to Verify**
```javascript
// Listen for online event
window.addEventListener('online', () => {
  console.log('Back online - sync should trigger');
});

// After sync, check localStorage
const lists = JSON.parse(localStorage.getItem('publishedLists'));
const syncedList = Object.values(lists).find(l => l.id === 'previously_pending');
console.log('Still pending?', syncedList.pendingSync); // Should be false/undefined
console.log('Synced at:', syncedList.syncedAt); // Should have recent timestamp
```

---

### Test 14: Duplicate Share Codes Are Handled (Regenerate)

**Description**
If a generated share code already exists in the database, the system should regenerate a unique one.

**Preconditions**
- Database has existing share codes
- Code generation has possibility of collision

**Steps to Test**
1. Mock the share code generator to return a known existing code
2. Attempt to publish a new list
3. Verify system detects collision
4. Verify new unique code is generated

**Expected Result**
- First code attempt is rejected by database (unique constraint)
- System automatically retries with new code
- List is published with unique code
- No error shown to user
- Maximum 3 retry attempts before failing gracefully

**How to Verify**
```javascript
// In generateShareCode tests
describe('share code collision handling', () => {
  it('regenerates code on collision', async () => {
    // Mock first code to collide
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.5) // First attempt - will collide
      .mockReturnValue(0.7);    // Subsequent attempts

    const result = await createList(listData);
    expect(result.shareCode).toBeDefined();
    expect(result.shareCode).not.toBe('existing_code');
  });
});
```

---

### Test 15: Database Errors Don't Crash the App (Graceful Fallback)

**Description**
Database connection issues should not prevent the app from functioning; it should fall back to localStorage.

**Preconditions**
- User is signed in
- Database becomes temporarily unavailable
- User is interacting with the app

**Steps to Test**
1. Sign in to the app
2. Simulate database failure (can use mock or actual downtime)
3. Attempt to create a list
4. Attempt to view existing lists
5. Attempt to modify a list
6. Restore database connection

**Expected Result**
- App remains functional throughout
- Error boundary doesn't trigger
- Lists fall back to localStorage
- User sees "Offline mode" or similar indicator
- Changes are queued for sync when database returns
- Console logs database errors for debugging

**How to Verify**
```javascript
// Error handling in API route
try {
  await sql`INSERT INTO lists ...`;
} catch (dbError) {
  console.error('[API] Database error:', dbError);
  // Return success but flag for client-side localStorage fallback
  return NextResponse.json({
    success: true,
    fallback: true,
    message: 'Saved locally, will sync when database is available'
  }, { status: 202 }); // Accepted
}
```

---

## Security

### Test 16: User Cannot Access Another User's Private Lists

**Description**
Authorization checks must prevent users from accessing lists they don't own.

**Preconditions**
- User A has private lists
- User B is signed in
- User B knows User A's list IDs

**Steps to Test**
1. As User A, create a private list
2. Note the list ID
3. Sign out and sign in as User B
4. Attempt to fetch `/api/lists/[userA_list_id]`
5. Attempt to navigate to `/lists/movies/publish/[userA_list_id]`

**Expected Result**
- API returns 403 Forbidden
- Page shows "Not Found" or "Access Denied"
- No list data is returned in response
- Error is logged server-side

**How to Verify**
```bash
# As User B
curl -X GET "https://your-app.vercel.app/api/lists/userA_private_list" \
  -H "Cookie: better-auth.session_token=<userB_token>"

# Expected response:
# HTTP 403
# { "error": "Access denied" }
```

---

### Test 17: User Cannot Modify Another User's Lists

**Description**
Write operations must verify ownership before allowing modifications.

**Preconditions**
- User A owns a list
- User B is signed in
- User B attempts to modify User A's list

**Steps to Test**
1. As User A, create a list
2. Sign in as User B
3. Attempt PATCH to modify list items
4. Attempt DELETE to remove the list
5. Attempt PUT to update list metadata

**Expected Result**
- All modification attempts return 403 Forbidden
- List remains unchanged in database
- User A's list is unaffected
- Attempts are logged for audit

**How to Verify**
```bash
# As User B, attempt to modify User A's list
curl -X PATCH "https://your-app.vercel.app/api/lists/userA_list" \
  -H "Cookie: better-auth.session_token=<userB_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked!"}'

# Expected response:
# HTTP 403
# { "error": "You do not have permission to modify this list" }
```

---

### Test 18: API Validates All Inputs

**Description**
All API endpoints must validate input data to prevent malformed requests and potential attacks.

**Preconditions**
- API endpoints are accessible
- User is authenticated

**Steps to Test**
1. Send request with missing required fields
2. Send request with invalid data types
3. Send request with excessively long strings
4. Send request with special characters
5. Send request with negative numbers where positive expected

**Expected Result**
- 400 Bad Request for invalid inputs
- Specific error messages for each validation failure
- No server errors (500) for bad input
- Malformed data is never stored

**How to Verify**
```bash
# Missing required field
curl -X POST "https://your-app.vercel.app/api/lists" \
  -H "Content-Type: application/json" \
  -d '{"items": []}'
# Response: 400 - "title is required"

# Invalid type
curl -X POST "https://your-app.vercel.app/api/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": 123, "items": "not-an-array"}'
# Response: 400 - "items must be an array"

# Excessive length
curl -X POST "https://your-app.vercel.app/api/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": "[10000 character string]", "items": []}'
# Response: 400 - "title must be less than 200 characters"
```

---

### Test 19: SQL Injection Attempts Are Blocked

**Description**
All database queries must be parameterized to prevent SQL injection attacks.

**Preconditions**
- API endpoints accept user input
- Database is PostgreSQL (Neon)

**Steps to Test**
1. Send list title with SQL injection attempt
2. Send share code with SQL characters
3. Send user ID with injection attempt
4. Verify no data is leaked or corrupted

**Expected Result**
- All inputs are properly escaped/parameterized
- Injection attempts stored as literal strings (if valid otherwise)
- No database errors from special characters
- No unauthorized data access

**How to Verify**
```bash
# Attempt SQL injection in title
curl -X POST "https://your-app.vercel.app/api/lists" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test'; DROP TABLE lists; --", "items": []}'

# Should either:
# 1. Reject as invalid input (400)
# 2. Store literal string "Test'; DROP TABLE lists; --" as title (safe)

# Verify lists table still exists and data is intact
# In Neon console:
SELECT COUNT(*) FROM lists;
```

```javascript
// Code should use parameterized queries:
// GOOD (safe):
await sql`INSERT INTO lists (title) VALUES (${userInput})`;

// BAD (vulnerable):
await sql(`INSERT INTO lists (title) VALUES ('${userInput}')`);
```

---

## Test Utilities

For automated testing, use the utilities in `/library/tests/test-utils.js`:

```javascript
import {
  createTestList,
  createTestUser,
  cleanupTestData,
  assertApiResponse
} from './test-utils';

describe('Cloud Sync', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it('syncs list to database', async () => {
    const user = await createTestUser();
    const list = await createTestList(user.id, { title: 'Test List' });

    const response = await fetch('/api/lists');
    assertApiResponse(response, 200, { lists: expect.arrayContaining([list]) });
  });
});
```

---

## Notes

- **Test Environment**: Use separate test database with `TEST_DATABASE_URL`
- **Fixtures**: Sample list data available in `/library/tests/fixtures/`
- **Mocking**: Auth can be mocked via `jest.mock('@/library/auth-client')`
- **CI/CD**: Tests should run on PR before merge
- **Coverage**: Aim for 80%+ coverage on sync-related code

---

*Last updated: 2025-01-25*
