/**
 * Returns an array of all server hostnames in the game.
 * @param {NS} ns
 * @returns {string[]} An array of all server hostnames.
 */
export function getServers(ns) {
  const allServers = new Set(['home']);
  const serversToScan = ['home'];

  while (serversToScan.length > 0) {
    const currentServer = serversToScan.shift();
    const connectedServers = ns.scan(currentServer);

    for (const server of connectedServers) {
      if (!allServers.has(server)) {
        allServers.add(server);
        serversToScan.push(server);
      }
    }
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
      server.hasAdmin &&
      server.hostname !== "home" &&
      server.hostname !== "darkweb"
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
    if (ns.getServerRequiredHackingLevel(puppet.hostname) <= ns.getHackingLevel()) {
      targets.add(puppet.hostname);
    }
  }

  return [...targets];
}
