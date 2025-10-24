/**
 * Script to generate test QR codes for bins
 * This helps you test the QR scanning feature
 * 
 * Usage: node scripts/generateTestQRCodes.js
 */

import { supabase } from '../libs/supabase/supabase.js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateQRCodes() {
    console.log('🔍 Fetching bins from database...\n');

    // Fetch all bins with their QR codes
    const { data: bins, error } = await supabase
        .from('bins')
        .select('bin_id, qr_code_link, user_id')
        .limit(10);

    if (error) {
        console.error('❌ Error fetching bins:', error);
        return;
    }

    if (!bins || bins.length === 0) {
        console.log('⚠️  No bins found in database!');
        console.log('💡 Please create some bins first using the app.');
        return;
    }

    // Create output directory
    const outputDir = path.join(__dirname, '../qr-codes');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`✅ Found ${bins.length} bins\n`);
    console.log('━'.repeat(80));

    // Generate QR code for each bin
    for (const bin of bins) {
        const filename = `bin-${bin.bin_id.substring(0, 8)}.png`;
        const outputPath = path.join(outputDir, filename);

        try {
            // Generate QR code image
            await QRCode.toFile(outputPath, bin.qr_code_link, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#059669',  // Green color
                    light: '#FFFFFF'
                }
            });

            console.log(`✅ Generated QR Code:`);
            console.log(`   Bin ID: ${bin.bin_id}`);
            console.log(`   QR Link: ${bin.qr_code_link}`);
            console.log(`   File: ${filename}`);
            console.log(`   Path: ${outputPath}`);
            console.log('━'.repeat(80));
        } catch (err) {
            console.error(`❌ Failed to generate QR for bin ${bin.bin_id}:`, err.message);
        }
    }

    console.log('\n🎉 QR Code generation complete!');
    console.log(`📁 QR codes saved to: ${outputDir}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Open the qr-codes folder');
    console.log('   2. Display a QR code on your screen or print it');
    console.log('   3. In the app, click on the bin that matches the QR code');
    console.log('   4. Scan the QR code with your camera');
    console.log('   5. The system will validate and allow status update\n');
}

// Run the script
generateQRCodes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
