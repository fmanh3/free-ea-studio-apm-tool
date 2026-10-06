import puppeteer from "puppeteer-core";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("=== STARTING AUTOMATED LIVE VERIFICATION ===");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Track browser console logs and exceptions
  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
      console.log("[BROWSER ERROR]:", msg.text());
    } else if (msg.text().includes("JIT") || msg.text().includes("sync") || msg.text().includes("Yjs")) {
      console.log("[BROWSER LOG]:", msg.text());
    }
  });

  page.on("pageerror", err => {
    consoleErrors.push(err.toString());
    console.error("[BROWSER EXCEPTION]:", err.toString());
  });

  try {
    // 1. Open the page
    console.log("Navigating to production URL...");
    await page.goto("https://free-apm-app-625737625145.europe-west1.run.app", { waitUntil: "networkidle2" });

    // 2. Perform team password login
    console.log("Waiting for password input field...");
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    console.log("Entering password 'labb-ea-2026'...");
    await page.type('input[type="password"]', "labb-ea-2026");

    console.log("Submitting login form...");
    await page.click('button[type="submit"]');

    // Wait for authentication to succeed and load the app
    console.log("Waiting for navigation to complete...");
    await delay(3000);

    // 3. Switch to EA Studio (Process & Arkitektur)
    console.log("Switching to EA Studio app tab...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const eaButton = buttons.find(b => b.textContent.includes("EA Studio"));
      if (eaButton) eaButton.click();
    });

    console.log("Waiting for canvas to mount and connect to Yjs...");
    await delay(4000);

    // Let's count nodes currently on screen
    let nodeCountBefore = await page.evaluate(() => {
      return document.querySelectorAll(".react-flow__node").length;
    });
    console.log(`Initial nodes visible on canvas: ${nodeCountBefore}`);

    // Test Case A: Click on an existing node on the canvas to test selection krasch!
    console.log("Simulating click on an existing node...");
    await page.click(".react-flow__node");
    await delay(1000);
    
    let nodeCountAfterClick = await page.evaluate(() => {
      return document.querySelectorAll(".react-flow__node").length;
    });
    console.log(`Nodes visible on canvas AFTER click: ${nodeCountAfterClick}`);
    if (nodeCountAfterClick === 0) {
      throw new Error("FAIL: Clicking a node cleared the canvas!");
    }

    // Test Case B: Click 'Skapa Group Element' button in the floating toolbox
    console.log("Clicking 'Skapa Group Element' button in the floating toolbox...");
    const groupButton = await page.$('button[title="Skapa Group Element"]');
    if (!groupButton) {
      throw new Error("Could not find 'Skapa Group Element' button in DOM");
    }
    await groupButton.click();

    // 5. Wait to let Yjs sync and render
    console.log("Waiting 3000ms for Yjs sync and render to complete...");
    await delay(3000);

    // 6. Check node count again
    let nodeCountAfter = await page.evaluate(() => {
      return document.querySelectorAll(".react-flow__node").length;
    });
    console.log(`Nodes visible on canvas AFTER spawn: ${nodeCountAfter}`);

    // Check if any errors occurred
    if (consoleErrors.length > 0) {
      console.log("FAIL: Console errors occurred during spawn!", consoleErrors);
    } else if (nodeCountAfter === 0) {
      console.log("FAIL: All nodes disappeared! Canvas is empty!");
    } else if (nodeCountAfter > nodeCountBefore) {
      console.log("SUCCESS: Clicking, selecting, and spawning works perfectly! Board did NOT clear!");
    } else {
      console.log("WARN: Node count did not increase as expected.", { before: nodeCountBefore, after: nodeCountAfter });
    }

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
    console.log("=== AUTOMATED LIVE VERIFICATION FINISHED ===");
  }
})();
