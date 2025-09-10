/**
 * Navigates the UI to purchase the TOR router.
 * @param {NS} ns
 */
async function purchaseTorRouter(ns) {
  const torPrice = 200000;
  // A reliable way to check for TOR is to see if the "darkweb" server is connected to home.
  if (ns.scan('home').includes('darkweb')) {
    return; // We already have it.
  }

  if (ns.getServerMoneyAvailable('home') < torPrice) {
    ns.tprint("INFO: Not enough money for TOR router ($200k).");
    return;
  }

  ns.tprint("INFO: Attempting to purchase TOR router...");

  // --- Helper function to find and click elements by their text content ---
  const findAndClick = (selector, text) => {
    const elements = document.querySelectorAll(selector);
    const targetElement = Array.from(elements).find(el => el.textContent.includes(text));
    if (targetElement) {
      targetElement.click();
      return true;
    }
    ns.tprint(`ERROR: Could not find element with text: "${text}"`);
    return false;
  };

  // Step 1: Click the "City" button on the left navigation.
  if (!findAndClick('p', 'City')) return;
  await ns.sleep(1000);

  // Step 2: Verify we are in Sector-12. If not, abort.
  const cityElements = document.querySelectorAll('p');
  const inSector12 = Array.from(cityElements).some(el => el.textContent.includes('Sector-12'));
  if (!inSector12) {
    ns.tprint("ERROR: Must be in Sector-12 to purchase TOR. Aborting.");
    // Go back to the terminal
    findAndClick('p', 'Terminal');
    return;
  }

  // Step 3: Click the "Alpha Enterprises" location on the map.
  const alphaEnt = document.querySelector('[aria-label="Alpha Enterprises"]');
  if (alphaEnt) {
    alphaEnt.click();
  } else {
    ns.tprint("ERROR: Could not find 'Alpha Enterprises' on the map.");
    return;
  }
  await ns.sleep(1000);

  // Step 4: Click the button to purchase the TOR router.
  if (!findAndClick('button', 'Purchase TOR router')) return;
  await ns.sleep(1000);

  // Step 5: Return to the terminal.
  ns.tprint("INFO: Returning to terminal.");
  findAndClick('p', 'Terminal');
  await ns.sleep(1000);

  // Final verification
  if (ns.scan('home').includes('darkweb')) {
    ns.tprint("SUCCESS: TOR Router purchased.");
  } else {
    ns.tprint("WARN: TOR Router purchase may have failed.");
  }
}


/** @param {NS} ns */
export async function main(ns) {
  // --- NEW: Attempt to purchase TOR router first ---
  await purchaseTorRouter(ns);

  // --- The rest of the script for purchasing programs ---
  ns.tprint("INFO: Checking for and purchasing available hacking programs...");

  const programs = [
    { name: "BruteSSH.exe", cost: 500000 },
    { name: "FTPCrack.exe", cost: 1500000 },
    { name: "relaySMTP.exe", cost: 5000000 },
    { name: "HTTPWorm.exe", cost: 30000000 },
    { name: "SQLInject.exe", cost: 250000000 },
    { name: "DeepscanV2.exe", cost: 25000000 },
    { name: "AutoLink.exe", cost: 1000000 },
  ];

  // Only try to buy programs if we have TOR
  if (ns.scan('home').includes('darkweb')) {
    for (const program of programs) {
      if (ns.fileExists(program.name, "home") || ns.getServerMoneyAvailable('home') < program.cost) {
        continue;
      }

      ns.tprint(`INFO: Attempting to purchase ${program.name}...`);
      const terminalInput = document.getElementById("terminal-input");
      if (!terminalInput) {
        ns.tprint("ERROR: Could not find terminal input. Aborting purchases.");
        break;
      }

      const handler = Object.keys(terminalInput)[1];
      terminalInput.value = `buy ${program.name}`;
      terminalInput[handler].onChange({ target: terminalInput });
      terminalInput[handler].onKeyDown({ key: 'Enter', keyCode: 13, preventDefault: () => null });

      await ns.sleep(1000);

      if (ns.fileExists(program.name, "home")) {
        ns.tprint(`SUCCESS: Purchased ${program.name}.`);
      } else {
        ns.tprint(`WARN: Purchase of ${program.name} may have failed.`);
      }
    }
  } else {
    ns.tprint("INFO: No TOR router detected. Skipping program purchases.");
  }

  ns.tprint("INFO: Program purchasing complete. Spawning puppet generator...");
  ns.spawn('03-generatePuppets.js');
}