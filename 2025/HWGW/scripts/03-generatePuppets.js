/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("INFO: Reading server data and identifying potential puppets...");
  const allServerData = JSON.parse(ns.read('serverData.txt'));

  const programs = [
    { filename: "BruteSSH.exe", open: ns.brutessh },
    { filename: "FTPCrack.exe", open: ns.ftpcrack },
    { filename: "relaySMTP.exe", open: ns.relaysmtp },
    { filename: "HTTPWorm.exe", open: ns.httpworm },
    { filename: "SQLInject.exe", open: ns.sqlinject }
  ];

  const availablePrograms = programs.filter(p => ns.fileExists(p.filename, "home"));
  let newPuppets = 0;

  // Rooting Phase
  for (const server of allServerData) {
    if (server.hasAdminRights || server.numOpenPortsRequired > availablePrograms.length) {
      continue;
    }
    ns.tprint(`INFO: Attempting to root ${server.hostname}...`);
    for (const program of availablePrograms) {
      try { program.open(server.hostname); } catch { /* ignore errors */ }
    }
    ns.nuke(server.hostname);
    server.hasAdminRights = ns.hasRootAccess(server.hostname);
    if (server.hasAdminRights) {
      newPuppets++;
      ns.tprint(`SUCCESS: Gained root access on ${server.hostname}.`);
    }
  }

  // Puppet Provisioning Phase
  const allRootedServers = allServerData.filter(s => s.hasAdminRights && s.maxRam > 0);
  const workerPuppets = allRootedServers.filter(p => !(p.hostname === 'home' && p.maxRam <= 8));
  const puppetData = [];
  const workerScripts = ["hack.js", "grow.js", "weaken.js"];
  let totalRAM = 0;

  for (const puppet of workerPuppets) {
    await ns.scp(workerScripts, puppet.hostname, "home");
    totalRAM += puppet.maxRam;
    puppetData.push({
      hostname: puppet.hostname,
      maxRam: puppet.maxRam,
      cpuCores: ns.getServer(puppet.hostname).cpuCores
    });
  }

  // Save Data and Spawn Next Script
  await ns.write('serverData.txt', JSON.stringify(allServerData, null, 2), 'w');
  await ns.write('puppetData.txt', JSON.stringify(puppetData, null, 2), 'w');

  ns.tprint(`SUCCESS: Provisioned ${workerPuppets.length} total worker puppets (${newPuppets} new).`);
  ns.tprint(`INFO: Total RAM across worker puppets: ${totalRAM} GB.`);
  ns.tprint("INFO: Updated serverData.txt and created puppetData.txt.");
  ns.tprint("INFO: Spawning target data generator...");
  ns.spawn('04-generateTargets.js');
}