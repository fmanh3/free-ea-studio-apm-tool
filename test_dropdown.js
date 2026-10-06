import puppeteer from "puppeteer-core";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log("=== CHECKING SCENARIO DROPDOWN DOM ===");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  try {
    await page.goto("https://free-apm-app-625737625145.europe-west1.run.app", { waitUntil: "networkidle2" });

    // Login
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', "labb-ea-2026");
    await page.click('button[type="submit"]');
    await delay(3000);

    // 1. Switch App to APM Lens
    console.log("Switching App to APM Lens...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const apmBtn = buttons.find(b => b.textContent.includes("APM Lens"));
      if (apmBtn) {
        apmBtn.click();
        console.log("Clicked APM Lens button");
      } else {
        console.log("APM Lens button NOT found");
      }
    });
    await delay(1500);

    // 2. Click "Transitioner & Scenarier" tab inside APM Lens.
    console.log("Clicking 'Transitioner & Scenarier' tab inside APM Lens...");
    const clickedTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const transButton = buttons.find(b => b.textContent.includes("Transitioner") || b.textContent.includes("Scenarier"));
      if (transButton) {
        transButton.click();
        return { success: true, text: transButton.textContent };
      }
      return { success: false };
    });
    console.log("Tab click result:", clickedTab);
    await delay(2000);

    // Take screenshot of tab 3
    console.log("Taking screenshot of APM Lens Scenarios tab...");
    await page.screenshot({ path: "screenshot_tab3.png" });

    // Check if the select element is rendered
    const selectData = await page.evaluate(() => {
      const select = document.querySelector("select");
      const allSelects = Array.from(document.querySelectorAll("select")).map(s => s.outerHTML);
      const bodyText = document.body.textContent;
      
      return {
        selectFound: !!select,
        selectHTML: select ? select.outerHTML : null,
        allSelectsOnPage: allSelects,
        bodyContainsScenarioText: bodyText.includes("Aktivt Planeringsutrymme") || bodyText.includes("Jämförelsematris")
      };
    });

    console.log("Select element result:", selectData);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
    console.log("=== CHECKING SCENARIO DROPDOWN DOM FINISHED ===");
  }
})();
