/** @param {NS} ns */
export function getServers(ns) {
  const allServers = new Set(['home']);
  const serversToScan = ['home'];
  let contractsFound = 0;

  while (serversToScan.length > 0) {
    const currentServer = serversToScan.shift();
    const connectedServers = ns.scan(currentServer);

    // Check for contract files on the current server
    const files = ns.ls(currentServer, '.cct');

    for (const contractFile of files) {
      contractsFound++;
      ns.tprint(`INFO: Found contract '${contractFile}' on server '${currentServer}'`);
    }

    // Continue scanning for connected servers
    for (const server of connectedServers) {
      if (!allServers.has(server)) {
        allServers.add(server);
        serversToScan.push(server);
      }
    }
  }

  if (contractsFound > 0) {
    ns.tprint(`INFO: Network scan complete. Found ${contractsFound} contract(s) across the network.`);
  }

  return [...allServers];
}

export async function getPuppets(ns) {
  const allServerData = JSON.parse(ns.read('server-data.txt'));
  ns.print(`DEBUG: Loaded ${allServerData.length} servers from server-data.txt`);
  const puppets = new Set();
  const programs = [
    { file: "BruteSSH.exe", open: ns.brutessh },
    { file: "FTPCrack.exe", open: ns.ftpcrack },
    { file: "RelaySMTP.exe", open: ns.relaysmtp },
    { file: "HTTPWorm.exe", open: ns.httpworm },
    { file: "SQLInject.exe", open: ns.sqlinject }
  ];

  const availablePrograms = programs.filter(p => ns.fileExists(p.file, "home"));
  ns.print("DEBUG: Available hacking programs: " + availablePrograms.map(p => p.file).join(", "));

  for (const server of allServerData) {
    // ns.print(`DEBUG: Checking ${server.hostname}`);
    if (!server.hasAdmin && server.portsRequired <= availablePrograms.length) {
      ns.print(`INFO: Attempting to root ${server.hostname}`);
      availablePrograms.forEach(program => program.open(server.hostname));
      ns.nuke(server.hostname);
      server.hasAdmin = true;
      ns.print(`SUCCESS: Rooted ${server.hostname}`);
    }

    if (
      server.hasAdmin
    ) {
      puppets.add(server.hostname);
    }
  }

  // Update server-data.txt with rooted servers
  await ns.write('server-data.txt', JSON.stringify(allServerData, null, 2), 'w');
  return [...puppets];
}

export function getTargets(ns) {
  const allPuppetData = JSON.parse(ns.read('puppet-data.txt'));
  const targets = new Set();
  for (const puppet of allPuppetData) {
    if (ns.getServerRequiredHackingLevel(puppet.hostname) <= ns.getHackingLevel() && ns.getServerMaxMoney(puppet.hostname) > 0) {
      targets.add(puppet.hostname);
    }
  }

  return [...targets];
}

// Helper function to check server purchase opportunities
export async function checkServerPurchases() {
  const maxServers = ns.getPurchasedServerLimit();
  const purchasedServers = ns.getPurchasedServers();
  const funds = ns.getServerMoneyAvailable('home');

  // Check if we can buy new servers (starting with 8GB)
  if (purchasedServers.length < maxServers) {
    const serverCost = ns.getPurchasedServerCost(8);
    if (funds > serverCost * 4) { // Keep 4x cost as buffer
      ns.tprint(`UPDATE: Can purchase new server for $${ns.nFormat(serverCost, '0.00a')} (${purchasedServers.length}/${maxServers} owned)`);
    }
  }
  // Check if we can upgrade existing servers
  else if (purchasedServers.length > 0) {
    const firstServer = purchasedServers[0];
    const currentRam = ns.getServerMaxRam(firstServer);
    const nextRam = currentRam * 2;
    const upgradeCost = ns.getPurchasedServerCost(nextRam);

    if (nextRam <= ns.getPurchasedServerMaxRam() && funds > upgradeCost * 4) {
      ns.tprint(`UPDATE: Can upgrade servers from ${currentRam}GB to ${nextRam}GB for $${ns.nFormat(upgradeCost, '0.00a')}`);
    }
  }
}