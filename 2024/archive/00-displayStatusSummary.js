/** @param {NS} ns */
export async function main(ns) {
	await displayStatusSummary(ns);
}

async function displayStatusSummary(ns) {
	const hackerLevel = ns.getHackingLevel();
	const allServers = await getAllServers(ns, 'home');
	const nukedServers = allServers.filter(s => ns.hasRootAccess(s)).length;
	const purchasedServers = ns.getPurchasedServers();
	const largestServerSize = purchasedServers.length > 0 
														? Math.max(...purchasedServers.map(s => ns.getServerMaxRam(s))) 
														: 0;

	let totalScriptsRunning = 0;
	for (const server of allServers) {
			totalScriptsRunning += ns.ps(server).length;
	}

	// Get target servers
	const serverData = JSON.parse(await ns.read('00-servers.txt'));
	const targetServers = serverData.filter(server => server.target).map(server => server.hostname);
	const targetServersString = targetServers.join(', ');

	ns.tprint(`=== Status Summary ===`);
	ns.tprint(`Current Player Hacker Level: ${hackerLevel}`);
	ns.tprint(`Number of Nuked Servers: ${nukedServers}`);
	ns.tprint(`Number of Purchased Servers: ${purchasedServers.length}`);
	ns.tprint(`Largest Purchased Server Size: ${largestServerSize > 0 ? largestServerSize + "GB" : "None"}`);
	ns.tprint(`Total Number of Scripts Running: ${totalScriptsRunning}`);
	ns.tprint(`Target Servers: ${targetServersString}`);
	ns.tprint(`=======================\n`);
}

// Recursive function to build a unique list of all servers
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