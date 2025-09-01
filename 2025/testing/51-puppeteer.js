/** @param {NS} ns */


export async function main(ns) {
  ns.tprint("INFO: Starting puppeteer...");

  // Constants
  // weaken - lowers security level by 0.05 per thread
  // hack - raises security level by 0.002 per thread
  // for every 25 hack threads, you need 1 weaken thread to offset the security increase
  const FILE_PUPPETS = 'puppet-data.txt';
  const FILE_TARGETS = 'target-data.txt';
  const USE_HOME = false;

  const allPuppetData = JSON.parse(ns.read(FILE_PUPPETS));
  const allTargetData = JSON.parse(ns.read(FILE_TARGETS));

  const hackRam = ns.getScriptRam('hack.js'); // 1.7 GB
  const growRam = ns.getScriptRam('grow.js'); // 1.75 GB
  const weakenRam = ns.getScriptRam('weaken.js'); // 1.75 GB

  //ns.print(`DEBUG: hackRAM: ${hackRAM}, growRAM: ${growRAM}, weakenRAM: ${weakenRAM}`);

  let target = null;
  let targetInitialized = false;

  while (true) {
    // Hack n00dles until we get TOR router
    if (!ns.hasTorRouter()) {
      if (ns.getServerMoneyAvailable("home") > 200000) {
        ns.tprint("INFO: TOR router available for purchase!");
      }
      else {
        ns.print("DEBUG: Hacking n00dles for money until we can afford TOR router...");
      }

      target = allTargetData.find(t => t.hostname === "foodnstuff");;
    }

    // Select the best target
    if (target === null) {
      let bestTarget = null;
      let bestScore = 0;
    }

    // Determine total RAM available across all puppets
    let totalRam = 0;
    for (const puppet of allPuppetData) {
      totalRam += puppet.ram;
    }
    ns.print(`DEBUG: Total RAM across all puppets: ${totalRam} GB`);

    let hackThreads = totalRam / hackRam;
    let growThreads = totalRam / growRam;
    let weakenThreads = totalRam / weakenRam;

    ns.print(`DEBUG: With total RAM of ${totalRam} GB, we can run approximately:`);
    ns.print(`  - Hack threads: ${Math.floor(hackThreads)}`);
    ns.print(`  - Grow threads: ${Math.floor(growThreads)}`);
    ns.print(`  - Weaken threads: ${Math.floor(weakenThreads)}`);

    // Run grow until money is at max
    if (!targetInitialized) {
      while (ns.getServerMoneyAvailable(target.hostname) < target.maxMoney) {
        ns.print(`DEBUG: ${target.hostname} money is below max. Running grow.`);
        for (const puppet of allPuppetData) {
          await ns.sleep(2000);
          ns.exec('grow.js', puppet.hostname, Math.floor(puppet.ram / growRam), target.hostname);
        }

        await ns.sleep(target.growthTime * 1000);
      }
      ns.print(`DEBUG: ${target.hostname} initialzed. Starting hack/weaken/grow cycle.`);
      targetInitialized = true;
    }

    ns.tprint("INFO: Puppeteer running...");
    await ns.sleep(10000);
  }
}
