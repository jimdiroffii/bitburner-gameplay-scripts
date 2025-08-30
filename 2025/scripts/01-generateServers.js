/** @param {NS} ns */

import { getServers } from "utils.js";

export async function main(ns) {
  ns.tprint("INFO: Generating servers...");
  const serverNames = getServers(ns);

  const serverData = serverNames.map(server => {
    if (!ns.hasRootAccess(server) && ns.getServerNumPortsRequired(server) === 0) {
      ns.nuke(server);
    }

    return {
      hostname: server,
      maxMoney: ns.getServerMaxMoney(server),
      minSecurity: ns.getServerMinSecurityLevel(server),
      reqHackLevel: ns.getServerRequiredHackingLevel(server),
      hasAdmin: ns.hasRootAccess(server),
      portsRequired: ns.getServerNumPortsRequired(server)
    };
  });

  await ns.write('server-data.txt', JSON.stringify(serverData, null, 2), 'w');
  ns.tprint("SUCCESS: Server data generated and saved to server-data.txt");
}
