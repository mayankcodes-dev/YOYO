/**
 * YoYo Rooms — Upload ALL remaining local PNG assets to Cloudinary
 * 
 * Uploads:
 *   - heroImage.png          → yoyo/assets/hero_image
 *   - regImage.png           → yoyo/assets/reg_image
 *   - roomImg1-4.png         → yoyo/assets/room_img_1-4
 *   - exclusiveOfferCardImg1-3.png → yoyo/assets/offer_1-3
 *
 * Run: node server/uploadLocalAssets.js
 */

import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ASSETS_DIR = path.join(__dirname, "../client/src/assets");

// Map: local filename → Cloudinary public_id
const UPLOAD_MAP = [
  { file: "heroImage.png",              publicId: "yoyo/assets/hero_image" },
  { file: "regImage.png",               publicId: "yoyo/assets/reg_image" },
  { file: "roomImg1.png",               publicId: "yoyo/assets/room_img_1" },
  { file: "roomImg2.png",               publicId: "yoyo/assets/room_img_2" },
  { file: "roomImg3.png",               publicId: "yoyo/assets/room_img_3" },
  { file: "roomImg4.png",               publicId: "yoyo/assets/room_img_4" },
  { file: "exclusiveOfferCardImg1.png", publicId: "yoyo/assets/offer_1" },
  { file: "exclusiveOfferCardImg2.png", publicId: "yoyo/assets/offer_2" },
  { file: "exclusiveOfferCardImg3.png", publicId: "yoyo/assets/offer_3" },
];

async function uploadFile(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id:     publicId,
      resource_type: "image",
      overwrite:     true,
      folder:        "",   // publicId already contains the folder
    });
    return result.secure_url;
  } catch (err) {
    throw new Error(`Upload failed for ${publicId}: ${err.message}`);
  }
}

async function main() {
  console.log("🚀 YoYo — Uploading local PNG assets to Cloudinary");
  console.log(`📦 Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

  const results = {};

  for (const { file, publicId } of UPLOAD_MAP) {
    const filePath = path.join(ASSETS_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  Not found, skipping: ${file}`);
      continue;
    }

    const sizeMB = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
    process.stdout.write(`  ⬆️  Uploading ${file} (${sizeMB} MB) → ${publicId} ... `);

    try {
      const url = await uploadFile(filePath, publicId);
      results[file] = { publicId, url };
      console.log("✅");
    } catch (err) {
      console.log(`❌  ${err.message}`);
    }
  }

  console.log("\n📋 Upload Results:");
  console.log("=".repeat(70));
  for (const [file, { publicId, url }] of Object.entries(results)) {
    console.log(`  ${file}`);
    console.log(`    → public_id : ${publicId}`);
    console.log(`    → url       : ${url}`);
  }

  console.log("\n✅ Done! All assets are now in Cloudinary under the yoyo/ folder.");
  console.log("💡 The assets.js file has been updated to use CDN URLs.\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
