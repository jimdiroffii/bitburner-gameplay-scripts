/** @param {NS} ns */

export async function main(ns) {
  ns.tprint("INFO: Starting GWHW test...");

  const target = "n00dles";

  const allPuppetData = JSON.parse(ns.read('puppet-data.txt'));

  ns.tprint("INFO: Security level of " + target + ": " + ns.getServerSecurityLevel(target));

  const weakenSecLevel = 0.05;
  const hackSecLevel = 0.002;
  const growSecLevel = 0.1;

  const hackRam = ns.getScriptRam('hack.js'); // 1.7 GB
  const growRam = ns.getScriptRam('grow.js'); // 1.75 GB
  const weakenRam = ns.getScriptRam('weaken.js'); // 1.75 GB

  let programSelection = null;

  while (true) {
    if (ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target) && (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target))) {
      ns.tprint("INFO: Growing " + target + " for money...");
      const growThreads = 1;
      let totalGrowThreads = 0;
      while (totalGrowThreads < growThreads) {
        for (const puppet of allPuppetData) {
          if (ns.getServerMaxRam(puppet.hostname) - ns.getServerUsedRam(puppet.hostname) >= growRam) {
            ns.exec('grow.js', puppet.hostname, growThreads, target);
            totalGrowThreads++;
            ns.tprint(`INFO: Launched 1 grow thread on ${puppet.hostname} for ${target} (Total launched: ${totalGrowThreads}/${growThreads})`);
          }
          if (totalGrowThreads >= growThreads) {
            break;
          }
        }
      }
      programSelection = 'grow';
    }
    else if (ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target)) {
      ns.tprint("INFO: Hacking " + target + " for money...");
      const hackThreads = 50;
      let totalHackThreads = 0;
      while (totalHackThreads < hackThreads) {
        for (const puppet of allPuppetData) {
          const availableRam = ns.getServerMaxRam(puppet.hostname) - ns.getServerUsedRam(puppet.hostname);
          if (availableRam >= hackRam) {
            let serverThreads = Math.floor(availableRam / hackRam);
            ns.exec('hack.js', puppet.hostname, serverThreads, target);
            totalHackThreads += serverThreads;
            ns.tprint(`INFO: Launched ${serverThreads} hack threads on ${puppet.hostname} for ${target} (Total launched: ${totalHackThreads}/${hackThreads})`);
          }
          if (totalHackThreads >= hackThreads) {
            break;
          }
        }
      }
      programSelection = 'hack';
    }
    else {
      ns.tprint("INFO: Weakening " + target + " from security level " + ns.getServerSecurityLevel(target) + " to " + ns.getServerMinSecurityLevel(target));
      const weakenThreads = 2;
      let totalWeakenThreads = 0;
      while (totalWeakenThreads < weakenThreads) {
        for (const puppet of allPuppetData) {
          const availableRam = ns.getServerMaxRam(puppet.hostname) - ns.getServerUsedRam(puppet.hostname);
          if (availableRam >= weakenRam) {
            let serverThreads = Math.floor(availableRam / weakenRam);
            ns.exec('weaken.js', puppet.hostname, serverThreads, target);
            totalWeakenThreads += serverThreads;
            ns.tprint(`INFO: Launched ${serverThreads} weaken threads on ${puppet.hostname} for ${target} (Total launched: ${totalWeakenThreads}/${weakenThreads})`);
          }
          if (totalWeakenThreads >= weakenThreads) {
            break;
          }
        }
      }
      programSelection = 'weaken';
    }

    if (programSelection === 'grow') {
      await ns.sleep(ns.getGrowTime(target) + 100);
    }
    else if (programSelection === 'hack') {
      await ns.sleep(ns.getHackTime(target) + 100);
    }
    else if (programSelection === 'weaken') {
      await ns.sleep(ns.getWeakenTime(target) + 100);
    }
    else {
      await ns.sleep(1000);
    }
  }
}
