# Deployment Verification Guide
## Critical Steps to Verify CSS Loading on Vercel

After deploying the fixed `vercel.json`, you MUST verify the following:

---

## 🔍 Step 1: Verify CSS File is Deployed

### Check File Exists and Size:
```bash
curl -I https://your-domain.vercel.app/styles.css
```

**Expected Output:**
```
HTTP/2 200
content-type: text/css; charset=utf-8
content-length: 67673
```

**If you see:**
- `404 Not Found` → CSS file not deployed
- `content-length: 0` or very small → File truncated
- `content-type: text/plain` → Header not applied

### Check File Content:
```bash
curl -L https://your-domain.vercel.app/styles.css | head -20
```

**Expected:** Should show CSS content starting with `:root {`

### Check File Completeness:
```bash
curl -L https://your-domain.vercel.app/styles.css | tail -10
```

**Expected:** Should end with closing braces `}`, not cut off mid-rule

---

## 🔍 Step 2: Verify Content-Type Header

### Check Header:
```bash
curl -I https://your-domain.vercel.app/styles.css | grep -i content-type
```

**Expected:**
```
Content-Type: text/css; charset=utf-8
```

**If you see:**
- `Content-Type: text/plain` → Header pattern not matching
- No `Content-Type` header → Configuration not applied

---

## 🔍 Step 3: Browser DevTools Verification

1. **Open deployed site in browser**
2. **Open DevTools (F12)**
3. **Go to Network tab**
4. **Reload page**
5. **Find `styles.css` in network list**

**Check:**
- **Status:** Should be `200`
- **Type:** Should be `text/css` (NOT `text/plain`)
- **Size:** Should be ~67KB (67,673 bytes)
- **Response Headers:** Should include `Content-Type: text/css; charset=utf-8`

---

## 🔍 Step 4: Verify CSS Actually Loads

### In Browser Console:
```javascript
// Check if stylesheet is loaded
const link = document.querySelector('link[href="styles.css"]');
console.log('Stylesheet link:', link);
console.log('Stylesheet href:', link?.href);

// Check if CSS rules are applied
const testEl = document.querySelector('.calendar-wrapper');
if (testEl) {
  const styles = window.getComputedStyle(testEl);
  console.log('Calendar wrapper display:', styles.display);
  console.log('Calendar wrapper background:', styles.background);
}
```

**Expected:**
- `display: block` (not `inline` or empty)
- `background: rgb(...)` (not empty)

---

## 🔍 Step 5: Check for CSS Parse Errors

### In Browser Console:
```javascript
// Check for CSS parse errors
const sheets = Array.from(document.styleSheets);
sheets.forEach((sheet, i) => {
  try {
    const rules = sheet.cssRules || sheet.rules;
    console.log(`Stylesheet ${i}:`, rules.length, 'rules');
  } catch (e) {
    console.error(`Stylesheet ${i} parse error:`, e);
  }
});
```

**Expected:** No parse errors, rules count should be > 0

---

## 🚨 If CSS Still Not Loading

### Possible Causes:

1. **Vercel Cache:**
   - Clear Vercel cache
   - Force redeploy
   - Wait 5-10 minutes for CDN propagation

2. **File Not Committed:**
   - Verify `styles.css` is committed to Git
   - Verify `vercel.json` is committed to Git
   - Check Git status: `git status`

3. **Build Process:**
   - Check Vercel build logs
   - Verify no build step is modifying CSS
   - Verify no build step is excluding CSS

4. **Path Resolution:**
   - Verify HTML files are at root level
   - Verify CSS file is at root level
   - Check for `.vercelignore` excluding CSS

5. **Case Sensitivity:**
   - Verify file is `styles.css` (lowercase)
   - Not `Styles.css` or `STYLES.CSS`

---

## 📝 Verification Commands Summary

```bash
# 1. Check CSS file exists and headers
curl -I https://your-domain.vercel.app/styles.css

# 2. Check CSS file size
curl -L https://your-domain.vercel.app/styles.css | wc -c
# Expected: 67673

# 3. Check CSS file starts correctly
curl -L https://your-domain.vercel.app/styles.css | head -5
# Expected: Should start with :root {

# 4. Check CSS file ends correctly
curl -L https://your-domain.vercel.app/styles.css | tail -5
# Expected: Should end with closing braces

# 5. Check Content-Type header
curl -I https://your-domain.vercel.app/styles.css | grep -i content-type
# Expected: Content-Type: text/css; charset=utf-8
```

---

**Run these commands and report the results.**
