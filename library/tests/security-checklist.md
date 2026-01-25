# Sortid Security Checklist for Cloud Sync

**Last Updated**: 2026-01-25
**Reviewed By**: Security Audit
**Architecture**: Next.js 15 + Better Auth + Neon PostgreSQL

---

## Executive Summary

This checklist covers security considerations for the cloud sync feature being built for Sortid. The current architecture uses localStorage for list storage with plans to migrate to cloud-based storage via Neon PostgreSQL.

### Current State
- **Auth**: Better Auth with Google OAuth (configured)
- **Database**: Neon PostgreSQL (connection established, tables via Better Auth adapter)
- **API Routes**: `/api/recommendations`, `/api/search`, `/api/roast` (all unauthenticated currently)
- **List Storage**: Client-side localStorage only (no server persistence yet)

---

## 1. Authentication & Authorization

### 1.1 Route Protection

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] All `/api/lists/*` routes check session | REQUIRED | HIGH | No list API routes exist yet |
| [ ] Use `auth.api.getSession()` in all protected routes | REQUIRED | HIGH | Better Auth provides this |
| [ ] Middleware blocks unauthenticated requests | REQUIRED | HIGH | Create `middleware.ts` |
| [ ] Profile page requires authentication | EXISTING | MEDIUM | Mentioned in CLAUDE.md |
| [ ] Verify user owns list before modification | REQUIRED | HIGH | Add `userId` to list schema |
| [ ] Verify user owns list before deletion | REQUIRED | HIGH | Check ownership in DELETE handler |

### 1.2 Session Security

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [x] Session cookies are HTTP-only | EXISTING | HIGH | Better Auth default |
| [x] Session cookies are Secure (HTTPS only in prod) | EXISTING | HIGH | Better Auth default |
| [x] Session expiry configured | EXISTING | MEDIUM | 5-minute cookie cache |
| [ ] CSRF protection enabled | REQUIRED | HIGH | Better Auth supports this |
| [ ] Session invalidation on password change | N/A | LOW | No password auth (OAuth only) |

### 1.3 Authorization Checks

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Users can only read their own private lists | REQUIRED | HIGH | Add `userId` filter to queries |
| [ ] Users can only modify their own lists | REQUIRED | HIGH | Check `userId` matches session |
| [ ] Public lists accessible without auth | REQUIRED | MEDIUM | Check `isPublic` flag |
| [ ] Admin operations require admin role | FUTURE | LOW | No admin features planned |

---

## 2. Input Validation

### 2.1 List Data Validation

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] List titles max 200 characters | REQUIRED | HIGH | Prevent storage abuse |
| [ ] List descriptions max 1000 characters | REQUIRED | HIGH | Prevent storage abuse |
| [ ] List items max 100 per list | RECOMMENDED | MEDIUM | Current MAX_LIST_SIZE is configurable |
| [ ] Validate list type is valid category | REQUIRED | HIGH | Use CATEGORIES constant |
| [ ] Validate theme is valid option | REQUIRED | MEDIUM | Use LIST_THEMES constant |
| [ ] Validate accentColor is valid hex | REQUIRED | LOW | Prevent XSS in style attributes |
| [ ] Year must be reasonable (1800-2100) | REQUIRED | LOW | Prevent abuse |

### 2.2 Item Data Validation

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Item comments max 500 characters | REQUIRED | HIGH | Prevent storage abuse |
| [ ] User ratings 1-5 only | REQUIRED | MEDIUM | Currently allows null or 1-5 |
| [ ] Item IDs must be valid format | REQUIRED | HIGH | Prevent injection |
| [ ] TMDB IDs must be positive integers | REQUIRED | HIGH | For movie/TV items |
| [ ] External IDs sanitized | REQUIRED | HIGH | For books, podcasts, etc. |

### 2.3 Share Code Validation

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [x] Share codes use safe character set | EXISTING | HIGH | Excludes 0, 1, I, l, O |
| [ ] Share codes validated on lookup | REQUIRED | HIGH | Regex validation |
| [ ] Invalid share codes return 404 not 500 | REQUIRED | MEDIUM | Graceful error handling |
| [ ] Share code collision detection | REQUIRED | LOW | Check before assigning |

---

## 3. SQL Injection Prevention

### 3.1 Query Safety

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [x] Neon client uses tagged template literals | EXISTING | HIGH | `sql\`...\`` syntax |
| [ ] All user inputs parameterized | REQUIRED | HIGH | Never concatenate user input |
| [ ] JSONB fields use proper serialization | REQUIRED | HIGH | Use JSON.stringify safely |
| [ ] Array inputs use proper formatting | REQUIRED | MEDIUM | Use SQL array syntax |

### 3.2 Query Construction

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] No dynamic table names | REQUIRED | HIGH | Use constants |
| [ ] No dynamic column names | REQUIRED | HIGH | Whitelist allowed columns |
| [ ] ORDER BY uses whitelist | REQUIRED | MEDIUM | Don't allow arbitrary sorting |
| [ ] LIMIT values are integers | REQUIRED | MEDIUM | Prevent injection via pagination |

**Example Safe Query Pattern:**
```javascript
import sql from "@/library/database/neon";

// SAFE: Parameterized query
const results = await sql`
  SELECT * FROM lists
  WHERE user_id = ${userId}
  AND is_public = ${isPublic}
  LIMIT ${parseInt(limit, 10)}
`;

// UNSAFE: String concatenation - NEVER DO THIS
// const results = await sql`SELECT * FROM lists WHERE id = '${listId}'`;
```

---

## 4. Data Exposure Prevention

### 4.1 Private Data Protection

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Private lists excluded from public queries | REQUIRED | HIGH | WHERE is_public = true |
| [ ] User emails not exposed in list responses | REQUIRED | HIGH | Don't include user details |
| [ ] User IDs use opaque identifiers | RECOMMENDED | MEDIUM | Don't expose sequential IDs |
| [ ] Soft delete preserves data | RECOMMENDED | LOW | Add deleted_at column |
| [ ] Deleted lists return 404 | REQUIRED | MEDIUM | Not "list deleted" message |

### 4.2 Error Message Safety

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Stack traces hidden in production | REQUIRED | HIGH | Check NODE_ENV |
| [ ] Database errors return generic message | REQUIRED | HIGH | Don't leak schema info |
| [ ] Auth errors don't reveal user existence | REQUIRED | MEDIUM | "Invalid credentials" not "user not found" |
| [ ] Validation errors are specific but safe | REQUIRED | MEDIUM | Tell user what's wrong |

### 4.3 API Response Sanitization

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Remove internal fields before response | REQUIRED | HIGH | user_id, created_at internals |
| [ ] Paginate large responses | REQUIRED | MEDIUM | Prevent data dumps |
| [ ] Rate limit list enumeration | REQUIRED | HIGH | Prevent scraping |

---

## 5. Rate Limiting

### 5.1 API Endpoints

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| POST /api/lists | 20/hour | per user | List creation |
| PUT /api/lists/[id] | 60/hour | per user | List updates |
| GET /api/lists | 100/min | per user | List retrieval |
| GET /api/share/[code] | 200/min | per IP | Public list views |
| POST /api/recommendations | 10/hour | per user | AI generation |
| POST /api/roast | 10/hour | per user | AI generation |
| GET /api/search | 60/min | per user | TMDB search |

### 5.2 Implementation Recommendations

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Use Vercel Edge Config for rate limits | RECOMMENDED | HIGH | Edge-level blocking |
| [ ] Upstash Redis for distributed counting | RECOMMENDED | HIGH | Serverless-friendly |
| [ ] Return 429 with Retry-After header | REQUIRED | MEDIUM | Standard rate limit response |
| [ ] Log rate limit violations | REQUIRED | LOW | Monitor for abuse |
| [ ] IP-based limits for unauthenticated | REQUIRED | HIGH | Prevent anonymous abuse |

### 5.3 Share Code Protection

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Limit share code generation | REQUIRED | MEDIUM | 50/hour per user |
| [ ] Limit share code lookups | REQUIRED | HIGH | Prevent enumeration |
| [ ] Exponential backoff on failures | RECOMMENDED | LOW | Slow down attackers |

---

## 6. XSS Prevention

### 6.1 User-Generated Content

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [x] React escapes content by default | EXISTING | HIGH | JSX auto-escapes |
| [ ] No dangerouslySetInnerHTML with user data | REQUIRED | HIGH | Audit all usage |
| [ ] List titles sanitized before render | REQUIRED | HIGH | Use sanitizeUserInput() |
| [ ] List descriptions sanitized | REQUIRED | HIGH | Use sanitizeUserInput() |
| [ ] Item comments sanitized | REQUIRED | HIGH | Use sanitizeUserInput() |
| [ ] accentColor validated as hex only | REQUIRED | MEDIUM | No CSS injection |

### 6.2 URL Handling

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Share URLs validated before redirect | REQUIRED | MEDIUM | Prevent open redirect |
| [ ] External links use rel="noopener noreferrer" | REQUIRED | MEDIUM | Already used in codebase |
| [ ] TMDB image URLs validated | REQUIRED | LOW | Check domain whitelist |

### 6.3 Content Security Policy

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| [ ] Add CSP headers | RECOMMENDED | MEDIUM | Prevent inline script injection |
| [ ] Strict img-src policy | RECOMMENDED | LOW | Whitelist image domains |
| [ ] frame-ancestors 'none' | RECOMMENDED | LOW | Prevent clickjacking |

---

## 7. Database Schema Security (Proposed)

### 7.1 Lists Table

```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_code VARCHAR(6) UNIQUE,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(1000),
  theme VARCHAR(20) DEFAULT 'classic',
  accent_color VARCHAR(7) DEFAULT '#3B82F6',
  year INTEGER,
  is_public BOOLEAN DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete

  -- Constraints
  CONSTRAINT valid_theme CHECK (theme IN ('classic', 'poster-grid', 'family-feud', 'awards', 'minimalist')),
  CONSTRAINT valid_year CHECK (year >= 1800 AND year <= 2100),
  CONSTRAINT valid_color CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT items_limit CHECK (jsonb_array_length(items) <= 100)
);

-- Indexes for common queries
CREATE INDEX idx_lists_user_id ON lists(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_lists_share_code ON lists(share_code) WHERE share_code IS NOT NULL;
CREATE INDEX idx_lists_public ON lists(is_public, created_at DESC) WHERE is_public = true AND deleted_at IS NULL;
```

### 7.2 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- Users can see their own lists
CREATE POLICY lists_owner_select ON lists
  FOR SELECT USING (user_id = current_user_id());

-- Users can see public lists
CREATE POLICY lists_public_select ON lists
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);

-- Users can only modify their own lists
CREATE POLICY lists_owner_modify ON lists
  FOR ALL USING (user_id = current_user_id());
```

---

## 8. API Route Checklist

### 8.1 GET /api/lists (List all user lists)

```javascript
// Required checks:
// 1. Verify session exists
// 2. Filter by userId from session
// 3. Exclude soft-deleted lists
// 4. Paginate results
// 5. Rate limit (100/min)
```

### 8.2 GET /api/lists/[id] (Get single list)

```javascript
// Required checks:
// 1. Validate list ID format
// 2. If private: verify session and ownership
// 3. If public: allow unauthenticated access
// 4. Return 404 for non-existent or deleted
// 5. Rate limit based on auth status
```

### 8.3 POST /api/lists (Create list)

```javascript
// Required checks:
// 1. Verify session exists
// 2. Validate all input fields
// 3. Sanitize title, description, comments
// 4. Generate unique share code if public
// 5. Rate limit (20/hour)
// 6. Check user hasn't exceeded list limit
```

### 8.4 PUT /api/lists/[id] (Update list)

```javascript
// Required checks:
// 1. Verify session exists
// 2. Verify user owns list
// 3. Validate all updated fields
// 4. Sanitize text content
// 5. Rate limit (60/hour)
// 6. Return 404 if not found/not owned
```

### 8.5 DELETE /api/lists/[id] (Delete list)

```javascript
// Required checks:
// 1. Verify session exists
// 2. Verify user owns list
// 3. Soft delete (set deleted_at)
// 4. Invalidate share code
// 5. Return 204 on success
```

### 8.6 GET /api/share/[code] (Get shared list)

```javascript
// Required checks:
// 1. Validate share code format
// 2. Only return if is_public = true
// 3. Only return if deleted_at IS NULL
// 4. Rate limit by IP (200/min)
// 5. Don't expose owner info
```

---

## 9. Implementation Priority

### Phase 1: Critical (Before Launch)
1. [ ] Create validation.js utility
2. [ ] Add input sanitization to all text fields
3. [ ] Validate share codes on lookup
4. [ ] Add session check to future list API routes
5. [ ] Create middleware.ts for route protection

### Phase 2: High (Within 1 Week)
1. [ ] Implement rate limiting (Upstash Redis)
2. [ ] Add user ownership checks
3. [ ] Create proper error responses
4. [ ] Add soft delete support
5. [ ] Audit for XSS vulnerabilities

### Phase 3: Medium (Within 1 Month)
1. [ ] Add CSP headers
2. [ ] Implement RLS in database
3. [ ] Add logging for security events
4. [ ] Create admin audit trail
5. [ ] Add CSRF protection

### Phase 4: Low (Ongoing)
1. [ ] Security testing automation
2. [ ] Penetration testing
3. [ ] Bug bounty program
4. [ ] Regular dependency audits

---

## 10. Testing Recommendations

### 10.1 Authentication Tests
```javascript
// Test unauthorized access returns 401
// Test accessing other user's lists returns 404
// Test expired sessions are rejected
// Test invalid tokens are rejected
```

### 10.2 Input Validation Tests
```javascript
// Test oversized titles are rejected
// Test malicious HTML is sanitized
// Test SQL injection attempts fail
// Test invalid share codes return 404
```

### 10.3 Authorization Tests
```javascript
// Test user can't modify other's lists
// Test user can't delete other's lists
// Test public lists are accessible
// Test private lists require ownership
```

---

## Appendix A: Security Headers

Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## Appendix B: Dependency Security

Run regularly:
```bash
pnpm audit
pnpm dlx npm-check-updates -u
```

Known considerations:
- Better Auth is actively maintained (check for updates)
- Neon client handles connection security
- TMDB API uses HTTPS only

---

*This checklist should be reviewed and updated with each major feature release.*
