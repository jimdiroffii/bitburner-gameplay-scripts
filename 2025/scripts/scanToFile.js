/** @param {NS} ns */

// Scan the network and write results to JSON
export async function main(ns) {
	const servers = ns.scan();
	const serverData = JSON.stringify(servers);
	ns.write("servers.txt", serverData, "w");
}