const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Media upload utility for चेtanā Virtual Environments
const MEDIA_FILES = {
    forest: {
        video: 'videos/forest.mp4',
        audio: 'audio/forest.mp3'
    },
    ocean: {
        video: 'videos/ocean.mp4', 
        audio: 'audio/ocean.mp3'
    },
    rain: {
        video: 'videos/rain.mp4',
        audio: 'audio/rain.mp3'
    },
    fireplace: {
        video: 'videos/fireplace.mp4',
        audio: 'audio/fireplace.mp3'
    }
};

const MIME_TYPES = {
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg'
};

async function uploadMediaFile(environment, mediaType, filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return false;
        }

        const stats = fs.statSync(filePath);
        if (stats.size < 1000) {
            console.log(`⚠️  File too small (placeholder): ${filePath}`);
            return false;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const fileBase64 = fileBuffer.toString('base64');
        const fileName = path.basename(filePath);
        const mimeType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';

        const response = await fetch('http://localhost:3000/api/media', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                environment,
                media_type: mediaType,
                file_name: fileName,
                file_data: fileBase64,
                mime_type: mimeType
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Uploaded ${environment} ${mediaType}: ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            return true;
        } else {
            console.log(`❌ Failed to upload ${environment} ${mediaType}: ${result.error}`);
            return false;
        }

    } catch (error) {
        console.log(`❌ Error uploading ${environment} ${mediaType}: ${error.message}`);
        return false;
    }
}

async function uploadAllMedia() {
    console.log('🎬 चेtanā Media Upload Utility');
    console.log('==============================\n');

    let uploaded = 0;
    let total = 0;

    for (const [environment, files] of Object.entries(MEDIA_FILES)) {
        console.log(`📁 Processing ${environment} environment:`);
        
        for (const [mediaType, filePath] of Object.entries(files)) {
            total++;
            const success = await uploadMediaFile(environment, mediaType, filePath);
            if (success) uploaded++;
        }
        console.log('');
    }

    console.log(`📊 Upload Summary:`);
    console.log(`   Uploaded: ${uploaded}/${total} files`);
    
    if (uploaded === total) {
        console.log('🎉 All media files uploaded successfully!');
        console.log('   Your virtual environments are ready to use.');
    } else {
        console.log('⚠️  Some files were not uploaded.');
        console.log('   Check the MEDIA_SOURCES.md guide for downloading media files.');
    }
}

// Sample media URLs (replace with actual copyright-free sources)
const SAMPLE_URLS = {
    forest: {
        video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    }
    // Add more sample URLs as needed
};

async function downloadSampleMedia() {
    console.log('📥 Downloading sample media files...\n');
    
    // Create directories
    ['videos', 'audio'].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log(`📁 Created directory: ${dir}/`);
        }
    });

    // Note: In a real implementation, you would download from actual copyright-free sources
    console.log('⚠️  Sample download not implemented.');
    console.log('   Please manually download copyright-free media files.');
    console.log('   See MEDIA_SOURCES.md for recommended sources.');
}

// Command line interface
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'upload') {
        uploadAllMedia();
    } else if (command === 'download') {
        downloadSampleMedia();
    } else {
        console.log('🎬 चेtanā Media Upload Utility');
        console.log('==============================');
        console.log('');
        console.log('Commands:');
        console.log('  node upload-media.js upload   - Upload media files to database');
        console.log('  node upload-media.js download - Download sample media files');
        console.log('');
        console.log('Make sure your server is running on http://localhost:3000');
    }
}

module.exports = { uploadMediaFile, uploadAllMedia };