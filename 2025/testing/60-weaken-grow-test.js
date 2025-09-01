/** @param {NS} ns */

export async function main(ns) {
  const FILE_PUPPETS = 'puppet-data.txt';
  const FILE_TARGETS = 'target-data.txt';
  const USE_HOME = false;

  const allPuppetData = JSON.parse(ns.read(FILE_PUPPETS));
  const target = 'foodnstuff';

  const hackRam = ns.getScriptRam('hack.js'); // 1.7 GB
  const growRam = ns.getScriptRam('grow.js'); // 1.75 GB
  const weakenRam = ns.getScriptRam('weaken.js'); // 1.75 GB


  ns.tprint("INFO: Weakening foodnstuff...");

  while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
    for (const puppet of allPuppetData) {
      const availableRam = puppet.ram - ns.getServerUsedRam(puppet.hostname);
      const weakenThreads = Math.floor(availableRam / weakenRam);
      if (weakenThreads > 0) {
        ns.exec('weaken.js', puppet.hostname, weakenThreads, target);
        ns.print(`DEBUG: Launched ${weakenThreads} weaken threads on ${puppet.hostname} for ${target}`);
      }
    }

    await ns.sleep(ns.getWeakenTime(target) + 100);
  }

  ns.tprint("INFO: foodnstuff security minimized.");

  // Run a single growth thread to get calculation baseline
  ns.print("DEBUG: Running single growth thread to establish baseline");
  ns.exec('grow.js', 'home', 1, target);
  await ns.sleep(ns.getGrowTime(target) + 100);

  const securityGrowth = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
  ns.print(`DEBUG: Single growth thread increased security by ${securityGrowth}`);

  // Run a single weaken thread to get calculation baseline
  ns.print("DEBUG: Running single weaken thread to establish baseline");
  let currentSecurityLevel = ns.getServerSecurityLevel(target);
  ns.print(`DEBUG: Current security level: ${currentSecurityLevel}`);
  ns.exec('weaken.js', 'home', 1, target);
  await ns.sleep(ns.getWeakenTime(target) + 100);
  ns.print(`DEBUG: Post weaken security level: ${ns.getServerSecurityLevel(target)}`);

  const securityWeaken = currentSecurityLevel - ns.getServerSecurityLevel(target);
  ns.print(`DEBUG: Single weaken thread decreased security by ${securityWeaken}`);
}
