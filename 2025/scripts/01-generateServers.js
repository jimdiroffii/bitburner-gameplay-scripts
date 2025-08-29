/** @param {NS} ns */

export async function main(ns) {
	const allServers = JSON.stringify(await getAllServers(ns, "home"));
	const excludedServers = JSON.stringify(["home", "darkweb"]);

	let serverData = allServers.map(server => ({
		hostname: server,
		maxMoney: ns.getServerMaxMoney(server),
		minSecurityLevel: ns.getServerMinSecurityLevel(server),
		maxMoney: ns.getServerMaxMoney(server),
		minSecurity: ns.getServerMinSecurityLevel(server),
		currentSecurity: ns.getServerSecurityLevel(server),
		reqHackLevel: ns.getServerRequiredHackingLevel(server),
		target: false
	}))

	return serverData;
}

// Recursive function to get all accessible servers
async function getAllServers(ns, currentServer, visitedServers = new Set()) {
	if (visitedServers.has(currentServer)) {
			return [];
	}

	visitedServers.add(currentServer);
	let connectedServers = ns.scan(currentServer);
	let servers = [currentServer];

	for (let server of connectedServers) {
			servers = servers.concat(await getAllServers(ns, server, visitedServers));
	}

	return servers;
}