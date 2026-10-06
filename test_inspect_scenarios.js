import puppeteer from "puppeteer-core";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("=== INSPECTING SCENARIOS TAB HTML ===");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Track console errors
  const consoleErrors = [];
  page.on("console", msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", err => {
    consoleErrors.push(err.toString());
    console.error("[BROWSER EXCEPTION]:", err.toString());
  });

  try {
    await page.goto("https://free-apm-app-625737625145.europe-west1.run.app", { waitUntil: "networkidle2" });

    // Login
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', "labb-ea-2026");
    await page.click('button[type="submit"]');
    await delay(3000);

    // Switch App to APM Lens
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const apmBtn = buttons.find(b => b.textContent.includes("APM Lens"));
      if (apmBtn) apmBtn.click();
    });
    await delay(1500);

    // Click "Transitioner & Scenarier" tab inside APM Lens.
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const transButton = buttons.find(b => b.textContent.includes("Transitioner") || b.textContent.includes("Scenarier"));
      if (transButton) transButton.click();
    });
    await delay(2000);

    // Check if select element is rendered
    const selectData = await page.evaluate(() => {
      const select = document.querySelector("select");
      return select ? select.outerHTML : "Select element NOT found";
    });

    console.log("Select element HTML:", selectData);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
    console.log("=== INSPECTING SCENARIOS TAB HTML FINISHED ===");
  }
})();
