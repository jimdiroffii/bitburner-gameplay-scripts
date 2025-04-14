/** @param {NS} ns **/
export async function main(ns) {
	let allServers = scanNetwork(ns);
	while (true) {
			for (let server of allServers) {
					if (isTargetable(ns, server)) {
							await manageServer(ns, server);
					}
			}
			await ns.sleep(1000); // Sleep to prevent constant loop without delay
	}
}

function scanNetwork(ns, startServer = 'home', foundServers = []) {
	let servers = ns.scan(startServer);
	for (let server of servers) {
			if (!foundServers.includes(server)) {
					foundServers.push(server);
					scanNetwork(ns, server, foundServers);
			}
	}
	return foundServers;
}

function isHackable(ns, server) {
	// Add your logic to determine if the server is hackable
	return ns.hasRootAccess(server) && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel();
}

function isTargetable(ns, server) {
	// Check if the server is hackable and has money to steal
	return ns.hasRootAccess(server) && 
				 ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() &&
				 ns.getServerMaxMoney(server) > 0;
}

async function manageServer(ns, server) {
	const securityThreshold = ns.getServerMinSecurityLevel(server) + 5;
	const moneyThreshold = ns.getServerMaxMoney(server) * 0.75;
	const currentSecurity = ns.getServerSecurityLevel(server);
	const currentMoney = ns.getServerMoneyAvailable(server);

	if (currentSecurity > securityThreshold) {
			await weakenServer(ns, server);
	} else if (currentMoney < moneyThreshold && currentMoney > 0) {
			await growServer(ns, server);
	} else if (currentMoney >= moneyThreshold) {
			await hackServer(ns, server);
	}

	ns.getServerSecurityLevel(server)
	ns.getServerMoneyAvailable(server);
	// The script will now return control to the main loop after managing the server once
}

async function weakenServer(ns, server) {
	//const threads = calculateWeakenThreads(ns, server);
	await ns.weaken(server); //, {threads: threads});
	//await ns.sleep(ns.getWeakenTime(server));
}

async function growServer(ns, server) {
	//const threads = calculateGrowThreads(ns, server);
	await ns.grow(server);//, {threads: threads});
	//await ns.sleep(ns.getGrowTime(server));
}

async function hackServer(ns, server) {
	//const threads = calculateHackThreads(ns, server);
	await ns.hack(server);//, {threads: threads});
	//await ns.sleep(ns.getHackTime(server));
}

function calculateWeakenThreads(ns, server) {
	// Calculate threads based on the difference in security levels and server capacity
	// Example calculation, adjust as needed
	return Math.ceil((ns.getServerSecurityLevel(server) - ns.getServerMinSecurityLevel(server)) / 0.05);
}

function calculateGrowThreads(ns, server) {
	let currentMoney = ns.getServerMoneyAvailable(server);
	if (currentMoney <= 0) {
			return 0;  // Return 0 threads if there's no money to grow
	}
	let growMultiplier = ns.getServerMaxMoney(server) / currentMoney;
	return Math.ceil(ns.growthAnalyze(server, growMultiplier));
}

function calculateHackThreads(ns, server) {
	// Calculate optimal threads for hacking based on server capacity and desired profit margin
	// Example calculation, adjust as needed
	return Math.floor(ns.hackAnalyzeThreads(server, ns.getServerMaxMoney(server) * 0.5));
}
