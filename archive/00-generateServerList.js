/** @param {NS} ns */
export async function main(ns) {
	let servers = await getAllServers(ns, 'home');
	let serverData = servers.map(server => ({
			hostname: server,
			maxMoney: ns.getServerMaxMoney(server),
			minSecurityLevel: ns.getServerMinSecurityLevel(server),
			moneyThresh: ns.getServerMaxMoney(server) * 0.75,
			securityThresh: ns.getServerMinSecurityLevel(server) + 5,
			target: false,
			currentSecurityLevel: ns.getServerSecurityLevel(server),
			requiredHackingLevel: ns.getServerRequiredHackingLevel(server)
	}));

	// Mark target servers
	markTargetServers(serverData, ns.getHackingLevel(), ns);

	// Sort and reindex server data
	serverData.sort((a, b) => a.requiredHackingLevel - b.requiredHackingLevel);
	serverData.forEach((server, index) => server.index = index);

	await ns.write('00-servers.txt', JSON.stringify(serverData, null, 2), 'w');
}

// Updated function to mark target servers
function markTargetServers(serverData, playerHackingLevel, ns) {
	// VARIABLE TARGET HACKING LEVEL
	const minTargetLevel = 1;
	const maxTargetLevel = playerHackingLevel;

	serverData.forEach(server => {
			if (server.maxMoney > 0 &&
					server.hostname !== 'home' && 
					server.hostname !== 'darkweb' && 
					server.requiredHackingLevel <= playerHackingLevel &&
					server.requiredHackingLevel >= minTargetLevel && 
					server.requiredHackingLevel <= maxTargetLevel &&
					ns.hasRootAccess(server.hostname) &&
					ns.getServerMoneyAvailable(server.hostname) > 0) {
						server.target = true;
			}
	});
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

// Helper function to format large numbers with suffixes
function formatLargeNumber(num) {
	if (num >= 1e9) {
			return (num / 1e9).toFixed(2) + 'B';
	} else if (num >= 1e6) {
			return (num / 1e6).toFixed(2) + 'M';
	}
	return num.toString();
}

// Helper function to round a number to two decimal places
function roundToTwoDecimals(num) {
	return Math.round(num * 100) / 100;
}
