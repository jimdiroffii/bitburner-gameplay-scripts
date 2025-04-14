/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script executes hacks for newly purchased servers.
 */

export async function main(ns) {
	var serverData = ns.read("servers.txt");
	var servers = JSON.parse(serverData);

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

			await ns.hack(server);
		}

		/* slow down per cycle */
		await ns.sleep(10000);
	}
}
