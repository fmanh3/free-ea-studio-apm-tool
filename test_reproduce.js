import puppeteer from "puppeteer-core";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("=== REPRODUCING JOAKIM'S SCENARIO ===");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Track console errors
  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
      console.log("[BROWSER ERROR]:", msg.text());
    } else if (msg.text().includes("JIT") || msg.text().includes("Yjs") || msg.text().includes("sync")) {
      console.log("[BROWSER LOG]:", msg.text());
    }
  });

  page.on("pageerror", err => {
    consoleErrors.push(err.toString());
    console.error("[BROWSER EXCEPTION]:", err.toString());
  });

  // CRITICAL: Handle window.prompt dialogs BEFORE they are triggered to prevent thread blocking!
  page.on("dialog", async dialog => {
    console.log("Dialog popped up:", dialog.message());
    await dialog.accept("pelle");
    console.log("Accepted dialog with 'pelle'");
  });

  try {
    console.log("Navigating to production URL...");
    await page.goto("https://free-apm-app-625737625145.europe-west1.run.app", { waitUntil: "networkidle2" });

    // Login
    console.log("Entering password...");
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', "labb-ea-2026");
    await page.click('button[type="submit"]');
    await delay(3000);

    // Switch to EA Studio
    console.log("Switching to EA Studio app tab...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const eaButton = buttons.find(b => b.textContent.includes("EA Studio"));
      if (eaButton) eaButton.click();
    });
    await delay(2500);

    // Create a new board (pelle)
    console.log("Clicking '+ Tavla' button to create a new board...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const addBoardBtn = buttons.find(b => b.textContent.includes("+ Tavla") || b.textContent.includes("+ Board"));
      if (addBoardBtn) addBoardBtn.click();
    });
    await delay(2000);

    // Switch to the newly created board 'pelle' (which is selected or click on it)
    console.log("Switching to the newly created board 'pelle'...");
    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll("div"));
      const pelleBtn = divs.find(d => d.textContent.includes("pelle"));
      if (pelleBtn) {
        pelleBtn.click();
      } else {
        // Fallback: click on the last div that looks like a board
        const boardDivs = divs.filter(d => d.textContent.includes("📄"));
        if (boardDivs.length > 0) boardDivs[boardDivs.length - 1].click();
      }
    });
    await delay(2500);

    let nodeCountAfterLoad = await page.evaluate(() => {
      return document.querySelectorAll(".react-flow__node").length;
    });
    console.log(`Nodes visible on empty board 'pelle': ${nodeCountAfterLoad}`);

    // Add first component
    console.log("Clicking 'Skapa Group Element' to spawn the FIRST component...");
    const groupButton = await page.$('button[title="Skapa Group Element"]');
    if (!groupButton) throw new Error("Could not find spawn button");
    await groupButton.click();
    await delay(2500);

    let nodeCount1 = await page.evaluate(() => {
      return document.querySelectorAll(".react-flow__node").length;
    });
    console.log(`Nodes on canvas after first spawn: ${nodeCount1}`);

    // Add second component
    console.log("Clicking 'Skapa Group Element' to spawn the SECOND component...");
    await groupButton.click();
    await delay(2500);

    let nodeCount2 = await page.evaluate(() => {
      return document.querySelectorAll(".react-flow__node").length;
    });
    console.log(`Nodes on canvas after second spawn: ${nodeCount2}`);

    if (consoleErrors.length > 0) {
      console.log("FAIL: Console errors occurred!", consoleErrors);
    } else if (nodeCount2 === 0) {
      console.log("FAIL: All nodes disappeared after second spawn! Reproduced Joakim's bug!");
    } else if (nodeCount2 === 2) {
      console.log("SUCCESS: Both nodes are visible! No bug reproduced!");
    } else {
      console.log("WARN: Unexpected node count:", nodeCount2);
    }

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
    console.log("=== REPRODUCING JOAKIM'S SCENARIO FINISHED ===");
  }
})();
