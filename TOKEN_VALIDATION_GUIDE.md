# Token Validation Quick Test

## Open Browser Console (F12) and run these commands:

### 1. Check if token exists
```javascript
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token?.length);
```

### 2. Check token format
```javascript
const token = localStorage.getItem('token');
const parts = token?.split('.');
console.log('Token parts:', parts?.length, '(should be 3)');
console.log('Starts with eyJ:', token?.startsWith('eyJ'));
```

### 3. See full token structure
```javascript
const token = localStorage.getItem('token');
console.log('Full token:', token);
console.log('First 50 chars:', token?.substring(0, 50));
console.log('Part 1 (header):', token?.split('.')[0]);
console.log('Part 2 (payload):', token?.split('.')[1]?.substring(0, 50));
console.log('Part 3 (signature):', token?.split('.')[2]?.substring(0, 50));
```

### 4. Decode token payload (to see username, exp, etc.)
```javascript
const token = localStorage.getItem('token');
try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Username:', payload.sub);
  console.log('Issued at:', new Date(payload.iat * 1000));
  console.log('Expires at:', new Date(payload.exp * 1000));
  console.log('Is expired:', Date.now() > payload.exp * 1000);
} catch (e) {
  console.error('Failed to decode token:', e);
}
```

## What a Valid JWT Token Looks Like:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VybmFtZSIsImlhdCI6MTczMDcwMDAwMCwiZXhwIjoxNzMwNzg2NDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Structure:
1. **Header** (red): `eyJhbGciOiJIUzI1NiJ9`
2. **Dot**: `.`
3. **Payload** (blue): `eyJzdWIiOiJ1c2VybmFtZSIsImlhdCI6MTczMDcwMDAwMCwiZXhwIjoxNzMwNzg2NDAwfQ`
4. **Dot**: `.`
5. **Signature** (green): `SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

### Valid Token Characteristics:
- ✅ Starts with `eyJ`
- ✅ Has exactly 2 dots (3 parts total)
- ✅ Length: typically 200-400 characters
- ✅ Contains only: `a-z`, `A-Z`, `0-9`, `-`, `_`, `.`
- ✅ No spaces, quotes, or special characters

### Invalid Token Examples:
- ❌ `undefined` - No token
- ❌ `null` - No token
- ❌ `"eyJhbGci..."` - Has quotes (copy removed them)
- ❌ `eyJhbGci` - Too short, incomplete
- ❌ `abc.def` - Only 2 parts (missing signature)
- ❌ Contains spaces or newlines

## Common Issues:

### "Invalid token format. JWT should have 3 parts"
**Problem**: Token doesn't have exactly 3 parts separated by dots

**Solutions**:
1. Check in browser console: `localStorage.getItem('token').split('.').length`
2. Should return `3`
3. If not 3, log out and log in again

### Token doesn't start with "eyJ"
**Problem**: Not a valid JWT token

**Solutions**:
1. Check: `localStorage.getItem('token').substring(0, 3)`
2. Should show `eyJ`
3. If not, clear storage and re-login:
   ```javascript
   localStorage.clear();
   window.location.href = '/login';
   ```

### Token is expired
**Problem**: Token valid for 24 hours, might be old

**Test expiry**:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
const expiryDate = new Date(payload.exp * 1000);
console.log('Expires:', expiryDate);
console.log('Is expired:', Date.now() > payload.exp * 1000);
```

**Solution**: Log out and log in again

## Quick Fix Commands:

### Force re-login:
```javascript
localStorage.clear();
window.location.href = '/login';
```

### Copy token manually:
```javascript
const token = localStorage.getItem('token');
navigator.clipboard.writeText(token);
console.log('Token copied!');
```

### Verify copied token:
```javascript
navigator.clipboard.readText().then(text => {
  console.log('Clipboard has JWT:', text.startsWith('eyJ'));
  console.log('Clipboard token parts:', text.split('.').length);
  console.log('First 50 chars:', text.substring(0, 50));
});
```
