/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script copies and executes hacks on remote servers.
 */

export async function main(ns) {
	/* check for the servers list */
	if (!ns.fileExists("servers.txt")) {
		ns.tprint("servers.txt not found. Run scanToFile.js first.");
	}

	var serverData = ns.read("servers.txt");
	var servers = JSON.parse(serverData);

	/* check for the excluded servers list */
	if (!ns.fileExists("excludedServers.txt")) {
		ns.tprint("excludedServers.txt not found.");
	}

	var excludedServersData = ns.read("excludedServers.txt");
	var excludedServers = JSON.parse(excludedServersData);

	/* primary loop */
	while (true) {
		for (const server of servers) {
			/* exclude unique servers */
			if (excludedServers.includes(server)) {
				continue;
			}

			/* exclude servers that are not already rooted */
			if (!ns.hasRootAccess(server)) {
				continue;
			}

			/* check if the hack script is already running on the server */
			if (ns.scriptRunning("basicHack.js", server)) {
				continue;
			}

			/* check if the hack script exists on the server */
			if (!ns.fileExists("basicHack.js", server)) {
				await ns.scp("basicHack.js", server);
			}

			/* run the hack script on the server */
			const maxRam = ns.getServerMaxRam(server);
			const scriptRam = ns.getScriptRam("basicHack.js");
			const threads = Math.floor(maxRam / scriptRam);
			await ns.exec("basicHack.js", server, threads);

			/* slow down per server check */
			await ns.sleep(1000);
		}

		/* slow down per cycle */
		await ns.sleep(5000);
	}
}
