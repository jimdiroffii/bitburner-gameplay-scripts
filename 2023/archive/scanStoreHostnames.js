/** @param {NS} ns */
export async function main(ns) {
	var servers = ns.scan();
	var serverData = JSON.stringify(servers);
	ns.write("servers.js", serverData, "w");
	ns.tprint("Server data written to servers.js");
}
