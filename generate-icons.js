// Generate PWA icons for चेtanā
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = './icons/';

// Ensure icons directory exists
if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(1, '#3730a3');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add rounded corners
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    // Add चेtanā text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.15}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('चेtanā', size/2, size/2);
    
    // Add subtitle for larger icons
    if (size >= 192) {
        ctx.font = `${size * 0.08}px Arial`;
        ctx.fillText('Mental Wellness', size/2, size/2 + size * 0.2);
    }
    
    return canvas.toBuffer('image/png');
}

// Generate all icon sizes
sizes.forEach(size => {
    const buffer = generateIcon(size);
    fs.writeFileSync(`${iconDir}icon-${size}x${size}.png`, buffer);
    console.log(`Generated icon-${size}x${size}.png`);
});

// Generate badge icon
const badgeBuffer = generateIcon(72);
fs.writeFileSync(`${iconDir}badge-72x72.png`, badgeBuffer);
console.log('Generated badge-72x72.png');

console.log('All PWA icons generated successfully!');