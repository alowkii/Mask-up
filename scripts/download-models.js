// scripts/download-models.js
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, "../public/models");

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const MODELS = [
  {
    name: "tiny_face_detector_model",
    files: ["-weights_manifest.json", "-shard1"],
  },
  {
    name: "face_landmark_68_model",
    files: ["-weights_manifest.json", "-shard1"],
  },
  {
    name: "face_expression_model",
    files: ["-weights_manifest.json", "-shard1"],
  },
];

const BASE_URL =
  "https://github.com/justadudewhohacks/face-api.js/blob/master/weights";

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    console.log(`  Downloading ${path.basename(dest)}...`);
    const file = fs.createWriteStream(dest);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`  ✓ Downloaded ${path.basename(dest)}`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
};

const downloadModels = async () => {
  console.log("🚀 Starting face-api.js models download...\n");

  for (const model of MODELS) {
    console.log(`📦 Downloading ${model.name}:`);

    for (const file of model.files) {
      const fileName = model.name + file;
      const url = `${BASE_URL}/${fileName}`;
      const dest = path.join(MODELS_DIR, fileName);

      try {
        await downloadFile(url, dest);
      } catch (error) {
        console.error(`❌ Error downloading ${fileName}:`, error.message);
      }
    }
    console.log("");
  }

  console.log("✅ All models downloaded successfully!");
  console.log(`📁 Models saved to: ${MODELS_DIR}`);
};

downloadModels().catch(console.error);
