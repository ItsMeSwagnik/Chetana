// Media Setup and Validation Script for चेtanā Virtual Environments
// Run this script to check media file availability and setup

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = {
    videos: [
        'forest.mp4',
        'ocean.mp4', 
        'rain.mp4',
        'fireplace.mp4'
    ],
    audio: [
        'forest.mp3',
        'forest.ogg',
        'ocean.mp3',
        'ocean.ogg',
        'rain.mp3',
        'rain.ogg',
        'fireplace.mp3',
        'fireplace.ogg'
    ]
};

const RECOMMENDED_SOURCES = {
    videos: {
        'forest.mp4': 'Search: "peaceful forest meditation" on Pixabay/Pexels',
        'ocean.mp4': 'Search: "calm ocean waves" on Pixabay/Pexels',
        'rain.mp4': 'Search: "gentle rain meditation" on Pixabay/Pexels',
        'fireplace.mp4': 'Search: "cozy fireplace" on Pixabay/Pexels'
    },
    audio: {
        'forest': 'Search: "forest birds nature sounds" on Freesound/Zapsplat',
        'ocean': 'Search: "ocean waves beach sounds" on Freesound/Zapsplat',
        'rain': 'Search: "gentle rain sounds" on Freesound/Zapsplat',
        'fireplace': 'Search: "fireplace crackling" on Freesound/Zapsplat'
    }
};

function checkMediaFiles() {
    console.log('🎬 चेtanā Virtual Environment Media Setup');
    console.log('==========================================\\n');
    
    let missingFiles = [];
    let foundFiles = [];
    
    // Check video files
    console.log('📹 Checking Video Files:');
    REQUIRED_FILES.videos.forEach(file => {
        const filePath = path.join(__dirname, 'videos', file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > 1000) { // More than 1KB (not just placeholder)
                console.log(`  ✅ ${file} - Found (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                foundFiles.push(file);
            } else {
                console.log(`  ⚠️  ${file} - Placeholder only`);
                missingFiles.push(file);
            }
        } else {
            console.log(`  ❌ ${file} - Missing`);
            missingFiles.push(file);
        }
    });
    
    console.log('\\n🎵 Checking Audio Files:');
    REQUIRED_FILES.audio.forEach(file => {
        const filePath = path.join(__dirname, 'audio', file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > 1000) { // More than 1KB (not just placeholder)
                console.log(`  ✅ ${file} - Found (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                foundFiles.push(file);
            } else {
                console.log(`  ⚠️  ${file} - Placeholder only`);
                missingFiles.push(file);
            }
        } else {
            console.log(`  ❌ ${file} - Missing`);
            missingFiles.push(file);
        }
    });
    
    // Summary
    console.log('\\n📊 Summary:');
    console.log(`  Found: ${foundFiles.length} files`);
    console.log(`  Missing/Placeholder: ${missingFiles.length} files`);
    
    if (missingFiles.length > 0) {
        console.log('\\n🔍 Where to find missing files:');
        console.log('\\n📹 Video Sources:');
        Object.entries(RECOMMENDED_SOURCES.videos).forEach(([file, source]) => {
            if (missingFiles.includes(file)) {
                console.log(`  ${file}: ${source}`);
            }
        });
        
        console.log('\\n🎵 Audio Sources:');
        Object.entries(RECOMMENDED_SOURCES.audio).forEach(([env, source]) => {
            const mp3File = `${env}.mp3`;
            const oggFile = `${env}.ogg`;
            if (missingFiles.includes(mp3File) || missingFiles.includes(oggFile)) {
                console.log(`  ${env}: ${source}`);
            }
        });
        
        console.log('\\n📚 Detailed guide: See MEDIA_SOURCES.md');
        console.log('\\n⚡ Quick Setup:');
        console.log('  1. Visit the recommended sources above');
        console.log('  2. Download the media files');
        console.log('  3. Rename them to match the required filenames');
        console.log('  4. Place videos in videos/ and audio in audio/');
        console.log('  5. Run this script again to verify');
    } else {
        console.log('\\n🎉 All media files are ready!');
        console.log('   Your virtual environments should work perfectly.');
    }
    
    return missingFiles.length === 0;
}

function createDirectories() {
    const dirs = ['videos', 'audio'];
    dirs.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
            console.log(`📁 Created directory: ${dir}/`);
        }
    });
}

function generateDownloadScript() {
    console.log('\\n📝 Generating download helper script...');
    
    const downloadScript = `#!/bin/bash
# Download script for चेtanā Virtual Environment Media
# This script provides wget commands for sample files (replace with your chosen files)

echo "🎬 चेtanā Media Download Helper"
echo "================================"
echo "Replace these URLs with your chosen copyright-free media files"
echo ""

# Example commands (replace URLs with actual copyright-free sources)
echo "📹 Video Downloads (replace with your chosen files):"
echo "wget -O videos/forest.mp4 'YOUR_FOREST_VIDEO_URL'"
echo "wget -O videos/ocean.mp4 'YOUR_OCEAN_VIDEO_URL'"
echo "wget -O videos/rain.mp4 'YOUR_RAIN_VIDEO_URL'"
echo "wget -O videos/fireplace.mp4 'YOUR_FIREPLACE_VIDEO_URL'"
echo ""

echo "🎵 Audio Downloads (replace with your chosen files):"
echo "wget -O audio/forest.mp3 'YOUR_FOREST_AUDIO_URL'"
echo "wget -O audio/ocean.mp3 'YOUR_OCEAN_AUDIO_URL'"
echo "wget -O audio/rain.mp3 'YOUR_RAIN_AUDIO_URL'"
echo "wget -O audio/fireplace.mp3 'YOUR_FIREPLACE_AUDIO_URL'"
echo ""

echo "💡 Tip: Use online converters to create .ogg versions for better browser compatibility"
`;
    
    fs.writeFileSync('download-media.sh', downloadScript);
    console.log('   Created: download-media.sh');
    console.log('   Edit this file with your chosen media URLs');
}

// Main execution
if (require.main === module) {
    createDirectories();
    const allReady = checkMediaFiles();
    
    if (!allReady) {
        generateDownloadScript();
    }
    
    console.log('\\n🚀 Next Steps:');
    console.log('  1. Download media files from the sources listed above');
    console.log('  2. Place them in the correct directories');
    console.log('  3. Test the virtual environments in your browser');
    console.log('  4. Enjoy the immersive relaxation experience!');
}

module.exports = { checkMediaFiles, createDirectories };