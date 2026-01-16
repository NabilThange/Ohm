# Supabase Storage Setup for Wiring Images

## Required Setup

Before the visual wiring diagram feature can work, you need to create a storage bucket in your Supabase project.

## Step-by-Step Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your OHM project

2. **Create Storage Bucket**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"
   - Bucket name: `wiring-images`
   - **IMPORTANT**: Make it PUBLIC (toggle "Public bucket" ON)
   - Click "Create bucket"

3. **Verify Bucket Settings**
   - Select the `wiring-images` bucket
   - Go to "Policies" tab
   - You should see policies for:
     - SELECT (public read access)
     - INSERT (authenticated users can upload)

4. **Done!** The bucket is now ready for use.

### Option 2: Using SQL (Alternative)

If you prefer SQL, run these commands in the Supabase SQL Editor:

```sql
-- 1. Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wiring-images',
  'wiring-images',
  true,  -- Public bucket
  10485760,  -- 10MB file size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
);

-- 2. Set upload policy (allow authenticated users)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wiring-images');

-- 3. Set public read policy
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wiring-images');

-- 4. Set delete policy (allow users to delete their own images)
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'wiring-images');
```

## Verification

To verify the bucket is set up correctly:

1. Go to Storage > wiring-images in Supabase Dashboard
2. Try uploading a test image manually
3. Check if you can access the image via its public URL

Example public URL format:
```
https://[your-project-ref].supabase.co/storage/v1/object/public/wiring-images/test-image.png
```

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `wiring-images` (lowercase, with hyphen)
- Check that the bucket is created in the correct Supabase project

### Error: "Permission denied"
- Ensure the bucket is set to PUBLIC
- Verify that the policies are correctly set
- Check that your Supabase URL and ANON_KEY are correct in `.env.local`

### Error: "File too large"
- Default limit is 10MB per file
- Generated images are typically 500KB-2MB, so this should be sufficient
- If needed, increase `file_size_limit` in the bucket settings

## Storage Structure

Images will be stored with the following path structure:
```
wiring-images/
└── {chatId}/
    └── wiring-{timestamp}.png
```

Example:
```
wiring-images/abc123-def456-789/wiring-1705334400000.png
```

This organization allows:
- Easy cleanup of all images for a specific chat
- Chronological ordering by timestamp
- No naming conflicts (unique timestamps)

## Costs

Supabase Storage pricing (as of 2026):
- **Free tier**: 1GB storage, 2GB bandwidth/month
- **Pro tier**: 100GB storage, 200GB bandwidth/month

Typical usage estimate:
- Average image size: 1-2MB
- 100 wiring diagrams: ~150MB storage
- Well within free tier limits for most users

## Security Notes

- Images are PUBLIC - anyone with the URL can view them
- This is intentional for easy sharing of wiring diagrams
- No sensitive data should be in the images (they're just circuit diagrams)
- User authentication is NOT required to view images
- User authentication IS required to upload/delete images

## Next Steps

After setting up the storage bucket:

1. **Add BYTEZ API Key**
   - Add `BYTEZ_API_KEY=your_key_here` to `.env.local`
   - Get your key from https://bytez.com

2. **Test the Feature**
   - Start the development server: `npm run dev`
   - Create a new chat
   - Ask: "Generate a wiring diagram for Arduino with LED"
   - Check that:
     - Table view appears immediately
     - SVG schematic generates within 1 second
     - Breadboard tab shows progress
     - AI breadboard image appears after 10-15 seconds

3. **Verify in Supabase**
   - Go to Storage > wiring-images
   - You should see the uploaded image
   - Click on it to view the public URL
   - Verify the URL works in a browser

## Cleanup (Optional)

To remove all wiring images for a chat:

```sql
-- Delete all images for a specific chat
DELETE FROM storage.objects
WHERE bucket_id = 'wiring-images'
  AND name LIKE 'chat-id-here/%';
```

Or use the Supabase Dashboard to manually delete folders.

---

**Status**: Once this bucket is created, the visual wiring diagram feature is fully ready to use!
