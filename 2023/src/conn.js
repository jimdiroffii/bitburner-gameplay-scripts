/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script connects to servers and roots them.
 */

export async function main(ns) {
	if (!ns.fileExists("servers.txt")) {
		ns.tprint("servers.txt not found. Run scanToFile.js first.");
	}

	if (!ns.fileExists("excludedServers.txt")) {
		ns.tprint("excludedServers.txt not found.");
	}

	const serverData = ns.read("servers.txt");
	const servers = JSON.parse(serverData);

	const excludedServersData = ns.read("excludedServers.txt");
	const excludedServers = JSON.parse(excludedServersData);

	while (true) {
		for (const server of servers) {
			/* exclude unique servers */
			if (excludedServers.includes(server)) {
				continue;
			}

			/* exclude servers that are already rooted */
			if (ns.hasRootAccess(server)) {
				continue;
			}

			/* exclude servers that are too high level */
			if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(server)) {
				continue;
			}

			const portsRequired = ns.getServerNumPortsRequired(server);

			/* exclude servers with too many ports */
			if (portsRequired >= 3) {
				continue;
			}

			if (portsRequired >= 1 && ns.fileExists("bruteSSH.exe", "home")) {
				ns.brutessh(server);
			}

			if (portsRequired >= 2 && ns.fileExists("FTPCrack.exe", "home")) {
				ns.ftpcrack(server);
			}

			ns.nuke(server);
		}

		// sleep for a cycle
		await ns.sleep(10000); // 10 seconds
	}
}
