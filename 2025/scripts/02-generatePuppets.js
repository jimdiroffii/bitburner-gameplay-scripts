/** @param {NS} ns */

import { getPuppets } from "utils.js";

export async function main(ns) {
  ns.tprint("INFO: Generating puppets...");
  const puppetNames = await getPuppets(ns);

  const workerScripts = ["hack.js", "grow.js", "weaken.js"];
  for (const puppet of puppetNames) {
    await ns.scp(workerScripts, puppet, "home");
  }

  // Puppets are rooted servers
  const puppetData = puppetNames.map(puppet => {
    return {
      hostname: puppet,
      ram: ns.getServerMaxRam(puppet)
    };
  });

  await ns.write('puppet-data.txt', JSON.stringify(puppetData, null, 2), 'w');
  ns.tprint("SUCCESS: Puppet data generated and saved to puppet-data.txt");
  ns.spawn("03-generateTargets.js");
}
