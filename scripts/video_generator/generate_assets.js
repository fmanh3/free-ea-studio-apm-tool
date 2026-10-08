const { execSync } = require("child_process");
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FRAMES_DIR = path.join(__dirname, "frames");
const OUTPUT_VIDEO = path.join(__dirname, "demo_presentation.mp4");
const VOICEOVER_AUDIO = path.join(__dirname, "voiceover.aiff");

// Create frames directory
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

// 1. Voice-over text using macOS say with embedded silence tags [[slnc ms]] for perfect synchronization!
const VOICE_TEXT = `
Dagens IT-landskap är komplext och svårt att styra. [[slnc 500]] Integrationer mellan snabba digitala portaler och långsamma stordatorer skapar friktion och teknisk skuld. [[slnc 3500]]

Men tänk om din målarkitektur kunde bli levande? [[slnc 500]] Med den interaktiva T.I.M.E.-tidslinjen visualiseras din roadmap automatiskt utifrån beslutad strategi. [[slnc 7000]]

Och med en enterprise-säkrad AI-Copilot kopplad direkt till grafen, får du omedelbara svar på komplexa beroende-analyser. [[slnc 8000]]

Ta kontroll över er evolutionära arkitektur. [[slnc 400]] Säkert, stabilt, och skalbart med modern data-isolering i molnet.
`;

async function main() {
  console.log("=== STARTING AUTOMATED VIDEO GENERATION PIPELINE ===");

  // Step 1: Generate Voiceover with macOS 'say'
  console.log("Step 1: Generating voice-over audio track using macOS 'say' (Alva)...");
  try {
    fs.writeFileSync(path.join(__dirname, "voice_text.txt"), VOICE_TEXT);
    execSync(`say -v Alva -f "${path.join(__dirname, "voice_text.txt")}" -o "${VOICEOVER_AUDIO}"`);
    console.log("✓ Voice-over track successfully generated:", VOICEOVER_AUDIO);
  } catch (err) {
    console.error("Failed to generate voice-over audio track:", err);
    process.exit(1);
  }

  // Step 2: Clear old frames
  console.log("Cleaning old frames in directory:", FRAMES_DIR);
  const files = fs.readdirSync(FRAMES_DIR);
  for (const file of files) {
    fs.unlinkSync(path.join(FRAMES_DIR, file));
  }

  // Step 3: Run Puppeteer and Capture Screen Frames
  console.log("Step 2: Starting Puppeteer camera capture...");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Track browser console logs and exceptions to debug freeze
  page.on("console", msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });
  page.on("pageerror", err => {
    console.error("[BROWSER CRASH/EXCEPTION]:", err.toString());
  });

  // Navigate & Log in
  console.log("Navigating to production URL...");
  await page.goto("https://free-apm-app-625737625145.europe-west1.run.app", { waitUntil: "networkidle2" });

  console.log("Logging in with standard password...");
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  await page.type('input[type="password"]', "labb-ea-2026");
  await page.click('button[type="submit"]');
  await delay(4000); // Allow dashboard to load

  // Set up frame capture
  let frameCounter = 0;
  let capturing = true;

  const captureLoop = async () => {
    while (capturing) {
      const startTime = Date.now();
      try {
        frameCounter++;
        const filename = path.join(FRAMES_DIR, `frame_${String(frameCounter).padStart(4, "0")}.png`);
        await page.screenshot({ path: filename, type: "png" });
      } catch (err) {
        console.error("Failed to capture frame:", err.message);
      }
      // Target ~30 fps: 33ms interval. Subtract execution time of the screenshot to keep timing uniform.
      const elapsed = Date.now() - startTime;
      const sleepTime = Math.max(5, 33 - elapsed);
      await delay(sleepTime);
    }
  };

  // Start capture loop in background
  const captureStartTime = Date.now();
  captureLoop();

  // === ACT 1: Intro (Sömkarta) ===
  console.log("--- Act 1: Showing Seam Map and Critical Shearing (0s - 10s) ---");
  await page.evaluate(() => {
    // Switch to APM Lens
    const buttons = Array.from(document.querySelectorAll("button"));
    const apmBtn = buttons.find(b => b.textContent.includes("APM Lens"));
    if (apmBtn) apmBtn.click();
  });
  await delay(1500); // wait for view switch

  // Click on 'edge-integ-2' (the critical Payment to Mainframe seam) to focus it in sandbox
  await page.evaluate(() => {
    // Click on critical row in table
    const rows = Array.from(document.querySelectorAll("tr"));
    const criticalRow = rows.find(r => r.textContent.includes("Mainframe Billing Engine") || r.textContent.includes("Betalningsmotor"));
    if (criticalRow) criticalRow.click();
  });
  await delay(8500); // wait out the rest of Act 1

  // === ACT 2: Timeline Animation ===
  console.log("--- Act 2: Timeline Animation and T.I.M.E. Play Player (10s - 23s) ---");
  await page.evaluate(() => {
    // Switch tab to 'Livscykel & Portfölj'
    const buttons = Array.from(document.querySelectorAll("button"));
    const lcButton = buttons.find(b => b.textContent.includes("Livscykel") || b.textContent.includes("Portfölj"));
    if (lcButton) lcButton.click();
  });
  await delay(2000); // wait for render

  await page.evaluate(() => {
    // Switch View Mode to 'TIME-Tidslinje'
    const buttons = Array.from(document.querySelectorAll("button"));
    const tlButton = buttons.find(b => b.textContent.includes("Tidslinje") || b.textContent.includes("TIME"));
    if (tlButton) tlButton.click();
  });
  await delay(1500); // wait for render

  await page.evaluate(() => {
    // Click Play button
    const buttons = Array.from(document.querySelectorAll("button"));
    const playBtn = buttons.find(b => b.textContent.includes("Spela"));
    if (playBtn) playBtn.click();
  });
  await delay(9500); // wait for full 2026 -> 2029 animation to play and loop

  // === ACT 3: Vertex AI Copilot (AURA) ===
  console.log("--- Act 3: Typing question to AI Copilot AURA (23s - 37s) ---");
  // Scroll the Copilot chat container into view
  await page.evaluate(() => {
    const copilotCard = Array.from(document.querySelectorAll("h3")).find(h => h.textContent.includes("AURA")) || document.body;
    copilotCard.scrollIntoView({ behavior: "smooth" });
  });
  await delay(1500);

  // Type question with organic human typing speed
  const question = "Vilka system påverkas om vi avvecklar Gamla Reskontran?";
  console.log(`Typing: "${question}"`);
  await page.waitForSelector('input[placeholder*="fråga"]', { timeout: 5000 });
  await page.type('input[placeholder*="fråga"]', question, { delay: 60 });
  await delay(800);

  // Press Enter to submit the form (since the submit button has no text, only an icon)
  console.log("Submitting chat query by pressing Enter...");
  await page.keyboard.press("Enter");
  
  // Wait 10 seconds for AURA response to render (and the user to read it)
  await delay(10000);

  // === ACT 4: Conclusion & Outro ===
  console.log("--- Act 4: Outro and Dashboard Stats Cards (37s - 61s) ---");
  await page.evaluate(() => {
    // Scroll back to top to showcase stats cards beautifully
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  await delay(22000); // Wait out the ending of the voiceover (increased to 22s for 61s total)

  // Stop capturing frames
  capturing = false;
  const captureDurationSeconds = (Date.now() - captureStartTime) / 1000;
  const actualFps = frameCounter / captureDurationSeconds;
  console.log(`✓ Screen capture finished. Total frames rendered: ${frameCounter} in ${captureDurationSeconds.toFixed(2)}s. Actual FPS: ${actualFps.toFixed(2)}`);
  await browser.close();

  // Step 4: Run FFmpeg to Compile Video
  console.log("Step 3: Invoking FFmpeg to compile video and merge audio track...");
  try {
    // Remove old output video if exists
    if (fs.existsSync(OUTPUT_VIDEO)) {
      fs.unlinkSync(OUTPUT_VIDEO);
    }

    // FFmpeg compile parameters:
    // -r actualFps: stretches/decompresses the fast-forward timelapse back into a gorgeous, normal-speed, real-time video!
    // -i frames/frame_%04d.png: inputs our sequential PNG files
    // -i voiceover.aiff: inputs the Alva voiceover
    // -r 25: output video standard framerate
    // -c:v libx264: H.264 video codec (standard web mp4)
    // -pix_fmt yuv420p: Pixel format for optimal compatibility
    // -c:a aac: AAC audio compression
    // -shortest: automatically stops at the shortest track duration
    const ffmpegCmd = `ffmpeg -r ${actualFps} -i "${path.join(FRAMES_DIR, "frame_%04d.png")}" -i "${VOICEOVER_AUDIO}" -r 25 -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest -y "${OUTPUT_VIDEO}"`;
    
    console.log("Executing FFmpeg command:", ffmpegCmd);
    execSync(ffmpegCmd);
    console.log("=== ✓ AUTOMATED VIDEO GENERATION SUCCESSFUL ===");
    console.log("Video output location:", OUTPUT_VIDEO);
  } catch (err) {
    console.error("FFmpeg compilation failed:", err);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Process error:", err);
  process.exit(1);
});
