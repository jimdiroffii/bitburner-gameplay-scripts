/** @param {NS} ns */
export async function main(ns) {
	var servers = ns.scan();
	ns.tprint(servers);

	for (const server of servers) {
		ns.tprint("hacking: " + server);
		await ns.hack(server);
	}
}
