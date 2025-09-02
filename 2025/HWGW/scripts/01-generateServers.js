/**
 * Scans the entire network to discover all servers.
 * @param {NS} ns - The netscript interface.
 * @returns {string[]} An array of all server hostnames found on the network.
 */
function getServers(ns) {
  const allServers = new Set(['home']);
  const serversToScan = ['home'];

  while (serversToScan.length > 0) {
    const currentServer = serversToScan.shift();
    const connectedServers = ns.scan(currentServer);

    const files = ns.ls(currentServer, '.cct');
    for (const contractFile of files) {
      ns.tprint(`INFO: Found contract '${contractFile}' on server '${currentServer}'`);
    }

    for (const server of connectedServers) {
      if (!allServers.has(server)) {
        allServers.add(server);
        serversToScan.push(server);
      }
    }
  }

  return [...allServers];
}

/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Starting network scan to map all servers...");
  const allHostnames = getServers(ns);
  const serverData = [];

  for (const hostname of allHostnames) {
    const server = {
      hostname: hostname,
      hasAdminRights: ns.hasRootAccess(hostname),
      requiredHackingLevel: ns.getServerRequiredHackingLevel(hostname),
      numOpenPortsRequired: ns.getServerNumPortsRequired(hostname),
      maxRam: ns.getServerMaxRam(hostname),
      maxMoney: ns.getServerMaxMoney(hostname),
      serverGrowth: ns.getServerGrowth(hostname),
      minDifficulty: ns.getServerMinSecurityLevel(hostname),
      baseDifficulty: ns.getServerBaseSecurityLevel(hostname),
    };
    serverData.push(server);
  }

  await ns.write('serverData.txt', JSON.stringify(serverData, null, 2), 'w');
  ns.tprint(`SUCCESS: Mapped ${serverData.length} servers. Data saved to serverData.txt.`);

  const homeRam = ns.getServerMaxRam('home');
  const ramThreshold = ns.getScriptRam('02-purchasePrograms.js');

  if (homeRam > ramThreshold) {
    ns.tprint(`INFO: Home RAM (${homeRam}GB) is sufficient. Spawning program purchasing script...`);
    ns.spawn('02-purchasePrograms.js');
  } else {
    ns.tprint(`INFO: Home RAM (${homeRam}GB) is insufficient for purchasing. Skipping to puppet generation...`);
    ns.spawn('03-generatePuppets.js');
  }
}