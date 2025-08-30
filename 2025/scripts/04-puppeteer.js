/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Starting puppeteer...");

  while (true) {
    ns.tprint("INFO: Puppeteer running...");
    await ns.sleep(10000);
  }
}
