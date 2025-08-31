/** @param {NS} ns */

import { getServers } from "utils.js";

export async function main(ns) {
  ns.tprint("INFO: Generating servers...");
  const serverNames = getServers(ns);

  const serverData = serverNames.map(server => {
    return {
      hostname: server,
      hasAdmin: ns.hasRootAccess(server),
      portsRequired: ns.getServerNumPortsRequired(server)
    };
  });

  await ns.write('server-data.txt', JSON.stringify(serverData, null, 2), 'w');
  ns.tprint("SUCCESS: Server data generated and saved to server-data.txt");
  ns.spawn("02-generatePuppets.js");
}
