/** @param {NS} ns */
export async function main(ns) {
	// const servers = ns.scan();
	if (!ns.fileExists("servers.js")) {
		ns.scp("servers.js", ns.getHostname(), "home");
	}

	var serverData = ns.read("servers.js");
	var servers = JSON.parse(serverData);

	var moneyThresh = 0;
	var securityThresh = 0;

	// while (true) {
	for (const server of servers) {
		if (server === "home" || server === "darkweb") {
			continue;
		}

		moneyThresh = ns.getServerMaxMoney(server) * 0.75;
		securityThresh = ns.getServerMinSecurityLevel(server) + 5;

		if (ns.getServerSecurityLevel(server) > securityThresh) {
			await ns.weaken(server);
		} else if (ns.getServerMoneyAvailable(server) < moneyThresh) {
			await ns.grow(server);
		} else {
			await ns.hack(server);
		}
	}
	// }
}
