/** @param {NS} ns **/
export async function main(ns) {
	await ns.sleep(5000);
	/** 
	 * Buy Programs
	 */
	

	/** 
	 *  Find all the servers.
	 **/
	const allServers = findAllServers(ns, 'home');
	//ns.tprint(allServers);

	/** 
	 * Copy hack files to all servers
	 **/ 
	for (const server of allServers) {
		if (server === 'home') {
			continue;
		}

		await copyFiles(ns, server);
	}

	/** 
	 * Create list of hackable servers as targets
	 **/ 
	const targetServers = findAllTargetServers(ns, allServers);
	targetServers.sort((a, b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b));
	
	let targetData = targetServers.map(target => ({
		hostname: target,
		minSecurityLevel: ns.getServerMinSecurityLevel(target),
		maxMoney: ns.getServerMaxMoney(target),
		requiredHackLevel: ns.getServerRequiredHackingLevel(target),
		target: false
	}));

	for (const target of targetData) {
		//ns.tprint(target.hostname);
	}

	/**
	 * Create list of executing servers
	 **/
	const executingServers = findAllExecutingServers(ns, allServers);
	executingServers.sort((a, b) =>ns.getServerMaxRam(a) - ns.getServerMaxRam(b));

	for (const executingServer of executingServers) {
		//ns.tprint(executingServer);
	}

	let executingServerData = executingServers.map(executingServer => ({
		hostname: executingServer,
		maxRam: ns.getServerMaxRam(executingServer),
		requiredHackLevel: ns.getServerRequiredHackingLevel(executingServer),
		execute: false
	}));

	for (const executingServer of executingServerData) {
		//ns.tprint(executingServer);
	}

	/**
	 * Select Targets
	 */
	targetData = selectTargets(ns, targetData);
	for (const target of targetData) {
		ns.tprint(target);
	}
}

function findAllServers(ns, startServer) {
	let visited = new Set();
	let stack = [startServer];

	while (stack.length > 0) {
			let current = stack.pop();
			visited.add(current);

			let neighbors = ns.scan(current);
			for (const neighbor of neighbors) {
					if (!visited.has(neighbor)) {
							stack.push(neighbor);
					}
			}
	}

	return Array.from(visited);
}

async function copyFiles(ns, targetServer) {
	if (!ns.fileExists("420-weaken.js", targetServer)) {
		await ns.scp("420-weaken.js", targetServer, 'home');
	}
	if (!ns.fileExists("420-grow.js", targetServer)) {
		await ns.scp("420-grow.js", targetServer, 'home');
	}
	if (!ns.fileExists("420-hack.js", targetServer)) {
		await ns.scp("420-hack.js", targetServer, 'home');
	}
}

function findAllTargetServers(ns, allServers) {
	let targets = new Set();
	let purchasedServers = ns.getPurchasedServers();

	for (const server of allServers) {
		if (server === 'home' || server === 'darkweb') {
			continue;
		}
		else if (purchasedServers.includes(server)) {
			continue;
		}
		else if (ns.getServerMaxMoney(server) < 100000) {
			continue;
		}

		//ns.tprint("target: " + server);
		//ns.tprint("max money: " + ns.getServerMaxMoney(server));
		targets.add(server);
	}

	return Array.from(targets);
}

function findAllExecutingServers(ns, allServers) {
	let executingServers = new Set();

	for (const server of allServers) {
		if (server === 'home' || server === 'darkweb') {
			continue;
		}
		else if (ns.getServerMaxRam(server) < 1) {
			continue;
		}

		//ns.tprint("target: " + server);
		//ns.tprint("max money: " + ns.getServerMaxMoney(server));
		executingServers.add(server);
	}

	return Array.from(executingServers);
}

function selectTargets(ns, targetData) {
	const playerHackingLevel = ns.getHackingLevel();

	for (const target of targetData) {
		if (target.requiredHackLevel > playerHackingLevel) {
			continue;
		}

		target.target = true;
	}

	return targetData;
}