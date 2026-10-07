import puppeteer from "puppeteer-core";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("=== COMPREHENSIVE AUTOMATED VERIFICATION SEQUENCE ===");
  
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Track browser logs and exceptions
  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
      console.log("[BROWSER ERROR]:", msg.text());
    } else if (msg.text().includes("YJS") || msg.text().includes("SYNC") || msg.text().includes("Blast") || msg.text().includes("Scenario") || msg.text().includes("failover")) {
      console.log("[BROWSER LOG]:", msg.text());
    }
  });

  page.on("pageerror", err => {
    consoleErrors.push(err.toString());
    console.error("[BROWSER EXCEPTION]:", err.toString());
  });

  try {
    console.log("Connecting to LOCAL production server on http://localhost:8080...");
    await page.goto("http://localhost:8080", { waitUntil: "networkidle2" });

    // Step 1: Login
    console.log("Step 1: Unlocking app with password 'labb-ea-2026'...");
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', "labb-ea-2026");
    await page.click('button[type="submit"]');
    
    // CRITICAL: Wait 8 seconds to allow local GCP Firestore authentication timeouts/failovers to cleanly complete!
    console.log("Waiting 8 seconds for database failovers and rendering...");
    await delay(8000);

    // Step 2: APM Lens - Catalog & Blast Radius Analysis
    console.log("Step 2: Testing APM Lens - Asset Catalog & Blast Radius...");
    // Click "EA Asset Catalog" tab button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const catButton = buttons.find(b => b.textContent.includes("EA Asset Catalog"));
      if (catButton) {
        catButton.click();
        console.log("Clicked 'EA Asset Catalog' tab button successfully!");
      } else {
        console.log("EA Asset Catalog tab button NOT found!");
      }
    });
    await delay(2000);

    // Ensure the Catalog Type is set to "Applikation" so that "Mainframe Billing Engine" is visible!
    console.log("Setting catalog type filter to 'Applikation'...");
    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll("select"));
      // The object type selector select is the first select in the main area
      const select = selects[0];
      if (select) {
        select.value = "Applikation";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(3000); // Wait for table update

    // Click "Analysera" on Mainframe Billing Engine row
    console.log("Triggering Blast Radius Analysis for 'Mainframe Billing Engine'...");
    const clickedBlastRadius = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("tr"));
      const billingRow = rows.find(r => r.textContent.includes("Mainframe Billing Engine"));
      if (!billingRow) return { success: false, reason: "Mainframe Billing Engine row not found" };
      
      const analyzeBtn = billingRow.querySelector("button");
      if (!analyzeBtn) return { success: false, reason: "Analyze button not found in row" };
      
      analyzeBtn.click();
      return { success: true };
    });
    console.log("Click Analysera button result:", clickedBlastRadius);
    
    // CRITICAL: Wait 10 seconds to allow the backend's Neo4j connection failovers (5s timeout) to fully complete and return the JSON payload!
    console.log("Waiting 10 seconds for Blast Radius analysis to fetch and render...");
    await delay(10000);

    // Take Blast Radius screenshot
    await page.screenshot({ path: "screenshot_blast_radius.png" });
    console.log("Saved screenshot: screenshot_blast_radius.png");

    // Verify Blast Radius report content
    const blastReportText = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      const hasBlastHeader = bodyText.includes("Blast Radius Analys");
      const hasBlastIndex = bodyText.includes("Blast Index");
      const hasKedjeeffekter = bodyText.includes("Kedjeeffekter i landskapet");
      
      return {
        hasBlastHeader,
        hasBlastIndex,
        hasKedjeeffekter,
        bodyLength: bodyText.length,
        textSample: bodyText.includes("Blast Index") ? bodyText.substring(bodyText.indexOf("Blast Index") - 50, bodyText.indexOf("Blast Index") + 250) : "N/A"
      };
    });
    console.log("Blast Radius Report check:", blastReportText);


    // Step 3: APM Lens - Scenarios Dropdown & Commit Decision
    console.log("Step 3: Testing APM Lens - Scenario Comparison Matrix...");
    // Click "Transitioner & Scenarier" tab button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const transButton = buttons.find(b => b.textContent.includes("Transitioner") || b.textContent.includes("Scenarier"));
      if (transButton) transButton.click();
    });
    await delay(2000);

    // Verify scenario dropdown select exists and select Scenario 2
    const scenarioDropdownResult = await page.evaluate(() => {
      const select = document.querySelector("select");
      if (!select) return { success: false, reason: "Scenario select dropdown not found" };
      
      const options = Array.from(select.querySelectorAll("option")).map(o => ({ value: o.value, text: o.textContent }));
      
      select.value = "sc-2";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      
      return { success: true, options };
    });
    console.log("Scenario Dropdown list & select sc-2 result:", scenarioDropdownResult);
    await delay(2000);

    // Take Scenarios screenshot
    await page.screenshot({ path: "screenshot_scenarios_dropdown.png" });
    console.log("Saved screenshot: screenshot_scenarios_dropdown.png");

    // Commit decision on Alternative A
    console.log("Committing decision for Alternative A on Scenario 2...");
    const decisionResult = await page.evaluate(() => {
      const decideButtons = Array.from(document.querySelectorAll("button")).filter(b => b.textContent.includes("Besluta denna väg"));
      if (decideButtons.length === 0) return { success: false, reason: "No 'Besluta denna väg' buttons found" };
      
      decideButtons[0].click(); // Click Alt A
      return { success: true };
    });
    console.log("Commit decision click result:", decisionResult);
    await delay(2500);


    // Step 4: EA Studio - No-Wipe Multiplayer Spawning
    console.log("Step 4: Testing EA Studio - Multi-Page Isolation & No-Wipe Spawning...");
    // Switch to EA Studio app
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const eaButton = buttons.find(b => b.textContent.includes("EA Studio"));
      if (eaButton) eaButton.click();
    });
    await delay(2000);

    // Click "+ Tavla" to create a board
    page.on("dialog", async dialog => {
      console.log("Dialog popped up:", dialog.message());
      await dialog.accept("test-automation-5");
    });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const addBoardBtn = buttons.find(b => b.textContent.includes("+ Tavla") || b.textContent.includes("+ Board"));
      if (addBoardBtn) addBoardBtn.click();
    });
    await delay(2000);

    // Select the 'test-automation-5' board
    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll("div"));
      const testBtn = divs.find(d => d.textContent.includes("test-automation-5"));
      if (testBtn) testBtn.click();
    });
    await delay(2000);

    let initialNodes = await page.evaluate(() => document.querySelectorAll(".react-flow__node").length);
    console.log(`Initial node count on board 'test-automation-5': ${initialNodes}`);

    // Click 'Skapa Group Element' to spawn the first node
    console.log("Spawning first group element...");
    const groupButton = await page.$('button[title="Skapa Group Element"]');
    if (!groupButton) throw new Error("Could not find spawn button in EA Studio toolbar");
    await groupButton.click();
    await delay(2000);

    let nodesCount1 = await page.evaluate(() => document.querySelectorAll(".react-flow__node").length);
    console.log(`Node count after first spawn: ${nodesCount1}`);

    // Click again to spawn the second node
    console.log("Spawning second group element...");
    await groupButton.click();
    await delay(2000);

    let nodesCount2 = await page.evaluate(() => document.querySelectorAll(".react-flow__node").length);
    console.log(`Node count after second spawn: ${nodesCount2}`);

    // Take EA Studio screenshot
    await page.screenshot({ path: "screenshot_ea_studio_no_wipe.png" });
    console.log("Saved screenshot: screenshot_ea_studio_no_wipe.png");

    if (nodesCount2 === initialNodes + 2) {
      console.log("SUCCESS: EA Studio spawned elements correctly without wiping the board!");
    } else {
      console.log(`FAIL: Expected ${initialNodes + 2} nodes on canvas, but found: ${nodesCount2}`);
    }

  } catch (err) {
    console.error("Verification sequence failed:", err);
  } finally {
    await browser.close();
    console.log("=== COMPREHENSIVE AUTOMATED VERIFICATION FINISHED ===");
  }
})();
