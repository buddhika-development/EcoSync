# 🔧 QR Code Testing Guide

## ❌ Common Issue: "Invalid QR Code" Error

### **Why This Happens**

The error `"Invalid QR code"` means the QR code you scanned **does not exist in your database**.

**The Problem:**
- You generated a QR code with link: `ecosync://bin/abc123...`
- But this exact link doesn't exist in the `bins` table's `qr_code_link` column
- The system looks for this link in the database and can't find it

---

## ✅ Solution: Generate QR Codes from Your Database

You have **2 options**:

### **Option 1: Use the QR Generator Script (Recommended)**

1. **Run the script** to generate QR codes for all your existing bins:

```bash
cd server
node scripts/generateTestQRCodes.js
```

2. **Output:**
```
🔍 Fetching bins from database...

✅ Found 5 bins

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Generated QR Code:
   Bin ID: a1b2c3d4-5678-90ab-cdef-1234567890ab
   QR Link: ecosync://bin/3f5a8c2e9d1b7f4a6c8e0d2b5f9a3c7e1d4b8f2a...
   File: bin-a1b2c3d4.png
   Path: /path/to/server/qr-codes/bin-a1b2c3d4.png
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 QR Code generation complete!
📁 QR codes saved to: /path/to/server/qr-codes
```

3. **Testing Steps:**
   - Open the `server/qr-codes/` folder
   - Display a QR code image on your screen (or print it)
   - In the app, click on the **matching bin** (check the Bin ID)
   - Scan the QR code
   - ✅ Should validate successfully!

---

### **Option 2: Manual Database Query**

If you want to create a custom QR code:

1. **Get an existing QR link from database:**

```sql
SELECT bin_id, qr_code_link FROM bins LIMIT 1;
```

Example result:
```
bin_id: a1b2c3d4-5678-90ab-cdef-1234567890ab
qr_code_link: ecosync://bin/3f5a8c2e9d1b7f4a6c8e0d2b5f9a3c7e1d4b8f2a6c9e0d3b7f1a5c8e2d6b9f3
```

2. **Generate QR code** with this exact link:
   - Go to https://www.qr-code-generator.com/
   - Input: `ecosync://bin/3f5a8c2e9d1b7f4a6c8e0d2b5f9a3c7e1d4b8f2a6c9e0d3b7f1a5c8e2d6b9f3`
   - Download the QR code

3. **Test:**
   - Click on bin with ID: `a1b2c3d4-5678-90ab-cdef-1234567890ab`
   - Scan the generated QR code
   - ✅ Should work!

---

## 🔍 Debugging Steps

If still getting errors, check the browser console for detailed logs:

```javascript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📷 QR Code Scanned:
   Raw Data: ecosync://bin/abc123...
   Bin ID: a1b2c3d4-5678-90ab-cdef-1234567890ab
   Expected QR: ecosync://bin/xyz789...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Compare:**
- `Raw Data` = What you scanned
- `Expected QR` = What's in the database for this bin

**They must match exactly!**

---

## 📋 Validation Flow

```
1. Collector clicks bin in list/map
   → Frontend knows: binId = "abc123"

2. Collector scans QR code
   → QR contains: "ecosync://bin/xyz789..."

3. Frontend sends to backend:
   {
     binId: "abc123",
     qrCodeLink: "ecosync://bin/xyz789..."
   }

4. Backend queries database:
   SELECT * FROM bins WHERE bin_id = 'abc123'
   → Gets bin with qr_code_link = "ecosync://bin/xyz789..."

5. Backend checks:
   Does qr_code_link match what was scanned?
   
   ✅ YES → Return: { ok: true, qrValidated: true }
   ❌ NO  → Return: { ok: false, message: "QR mismatch" }
```

---

## ⚠️ Important Rules

1. **QR must exist in database first**
   - Don't create random QR codes
   - Use QR codes generated when bins were created

2. **Click correct bin**
   - The bin you click must match the QR you scan
   - Check Bin IDs to be sure

3. **Format must be exact**
   - Scheme: `ecosync://bin/`
   - Token: Hex string (96 characters)
   - Example: `ecosync://bin/3f5a8c2e9d1b7f4a6c8e0d2b5f9a3c7e...`

---

## 🎯 Quick Test

```bash
# 1. Generate QR codes
cd server
node scripts/generateTestQRCodes.js

# 2. Start servers
npm run dev  # Terminal 1

cd ../client
npm run dev  # Terminal 2

# 3. Test in browser
- Open: http://localhost:3002/collector/dashboard
- Click any route
- Click a bin's "Scan QR Code" button
- Display the matching QR code image on screen
- Point camera at QR code
- Should validate successfully! ✅
```

---

## 🐛 Still Having Issues?

Check these:

1. **Database has bins?**
   ```sql
   SELECT COUNT(*) FROM bins;
   ```

2. **Bins have QR codes?**
   ```sql
   SELECT bin_id, qr_code_link FROM bins LIMIT 5;
   ```

3. **QR format is correct?**
   - Should start with `ecosync://bin/`
   - Should be ~110 characters long

4. **Camera permissions?**
   - Browser must have camera access
   - Check browser settings

5. **Console errors?**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Look for red error messages

---

## ✨ Summary

**You CANNOT use random QR codes!**

The QR code must:
1. ✅ Be stored in your database (`bins.qr_code_link`)
2. ✅ Match the bin you clicked
3. ✅ Have the exact format: `ecosync://bin/<token>`

**Use the generator script to create valid QR codes!**

```bash
node scripts/generateTestQRCodes.js
```

This ensures QR codes match your database! 🎉
