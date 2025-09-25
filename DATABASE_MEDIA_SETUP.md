# Database Media Setup Guide

## 🎯 **Overview**
Your virtual environments now use a database-based media system that stores videos and audio files directly in PostgreSQL. This makes media files easily accessible to all users without manual file management.

## 🗄️ **Database Schema**
```sql
CREATE TABLE environment_media (
    id SERIAL PRIMARY KEY,
    environment VARCHAR(50) NOT NULL,     -- forest, ocean, rain, fireplace
    media_type VARCHAR(10) NOT NULL,      -- video, audio
    file_name VARCHAR(255) NOT NULL,
    file_data BYTEA NOT NULL,             -- Binary file data
    mime_type VARCHAR(100) NOT NULL,      -- video/mp4, audio/mpeg
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(environment, media_type)
);
```

## 📁 **Required Media Files**
Download these copyright-free files and place them in the correct folders:

### Videos (MP4 format)
- `videos/forest.mp4` - Peaceful forest scene
- `videos/ocean.mp4` - Calm ocean waves  
- `videos/rain.mp4` - Gentle rainfall
- `videos/fireplace.mp4` - Cozy fireplace

### Audio (MP3 format)
- `audio/forest.mp3` - Forest birds and nature sounds
- `audio/ocean.mp3` - Ocean waves and sea sounds
- `audio/rain.mp3` - Rain and thunder sounds
- `audio/fireplace.mp3` - Crackling fire sounds

## 🚀 **Setup Steps**

### 1. Download Media Files
Use the sources from `MEDIA_SOURCES.md` to download copyright-free media files.

### 2. Upload to Database
```bash
# Upload all media files to database
node upload-media.js upload
```

### 3. Verify Upload
The upload utility will show:
```
🎬 चेtanā Media Upload Utility
==============================

📁 Processing forest environment:
✅ Uploaded forest video: forest.mp4 (15.2 MB)
✅ Uploaded forest audio: forest.mp3 (8.5 MB)

📁 Processing ocean environment:
✅ Uploaded ocean video: ocean.mp4 (18.7 MB)
✅ Uploaded ocean audio: ocean.mp3 (7.2 MB)

📊 Upload Summary:
   Uploaded: 8/8 files
🎉 All media files uploaded successfully!
```

## 🔧 **API Endpoints**

### Get Media File
```
GET /api/media?environment=forest&type=video
GET /api/media?environment=ocean&type=audio
```

### Upload Media File (Admin)
```
POST /api/media
{
  "environment": "forest",
  "media_type": "video", 
  "file_name": "forest.mp4",
  "file_data": "base64_encoded_data",
  "mime_type": "video/mp4"
}
```

## ✅ **Benefits**

### For Users
- **Instant Access**: No file downloads needed
- **Consistent Experience**: Same media for all users
- **Fast Loading**: Database caching and optimization
- **No Storage Issues**: Files stored centrally

### For Developers  
- **Easy Deployment**: No media file management
- **Scalable**: Database handles multiple users
- **Version Control**: Easy to update media files
- **Backup**: Media included in database backups

## 🔍 **Troubleshooting**

### Media Not Loading
1. Check if files are uploaded: `node upload-media.js upload`
2. Verify database connection in `.env`
3. Check browser console for 404 errors
4. Ensure server is running on correct port

### Upload Fails
1. Check file sizes (keep videos under 50MB)
2. Verify file formats (MP4 for video, MP3 for audio)
3. Ensure database has enough storage space
4. Check PostgreSQL connection

### Performance Issues
1. Add database indexes if needed
2. Enable PostgreSQL query caching
3. Consider CDN for large deployments
4. Optimize video compression

## 📊 **File Size Recommendations**
- **Videos**: 10-50MB each (1280x720, 10-15 minutes)
- **Audio**: 5-15MB each (128kbps, 10-15 minutes)
- **Total**: ~200-400MB for all environments

## 🔒 **Security Notes**
- Media files are served with proper MIME types
- 24-hour browser caching enabled
- Binary data stored securely in database
- No direct file system access required

## 🎬 **Media URLs in Code**
```html
<!-- Videos -->
<source src="/api/media?environment=forest&type=video" type="video/mp4">

<!-- Audio -->
<source src="/api/media?environment=forest&type=audio" type="audio/mpeg">
```

This system ensures all users get the same high-quality virtual environment experience!