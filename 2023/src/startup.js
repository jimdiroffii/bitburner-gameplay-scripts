/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script starts up the other scripts.
 */

export async function main(ns) {
	/* check for the servers list */
	if (!ns.fileExists("servers.txt")) {
		ns.exec("scanToFile.js");
	}

	/* check for the excluded servers list */
	if (!ns.fileExists("excludedServers.txt")) {
		const excludedServers = ["home", "darkweb"];
		const excludedServersData = JSON.stringify(excludedServers);
		ns.write("excludedServers.txt", excludedServersData, "w");
	}

	ns.exec("conn.js", 1);
	ns.spawn("copyHacks.js", 1);
}
