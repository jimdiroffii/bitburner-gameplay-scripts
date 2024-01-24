export async function scanNetwork(ns, startServer = 'home', foundServers = []) {
	let servers = ns.scan(startServer);
	for (let server of servers) {
			if (!foundServers.includes(server)) {
					foundServers.push(server);
					// Use await and pass the same foundServers array
					await scanNetwork(ns, server, foundServers); 
			}
	}
	return foundServers;
}

export async function nukeServers(ns, servers) {
	for (const server of servers) {
		if (
			//ns.hasRootAccess(server) ||
			server === 'home' || 
			server === 'darkweb' ||
			ns.getHackingLevel() < ns.getServerRequiredHackingLevel(server)
		) {
			continue;
		}

		let portsRequired = ns.getServerNumPortsRequired(server);
		let portsOpened = 0;

		if (ns.fileExists("BruteSSH.exe", 'home')) { ns.brutessh(server); ++portsOpened; }
		if (ns.fileExists("FTPCrack.exe", 'home')) { ns.ftpcrack(server); ++portsOpened; }
		if (ns.fileExists("relaySMTP.exe", 'home')) { ns.relaysmtp(server); ++portsOpened; }
		if (ns.fileExists("HTTPWorm.exe", 'home')) { ns.httpworm(server); ++portsOpened; }
		if (ns.fileExists("SQLInject.exe", 'home')) { ns.sqlinject(server); ++portsOpened; }
		
		if (portsOpened < portsRequired) continue;

		ns.nuke(server);
		const files = ["weaken.js", "grow.js", "hack.js"];
		await (ns.scp(files, server, 'home'));
	}
}

export async function filterHosts(ns, servers) {
	let hosts = [];

	for (const server of servers) {
		if (
			ns.hasRootAccess(server) &&
			ns.getServerMaxRam(server) > 0 
		) {
			hosts.push(server);
		}
	}

	return hosts;
}

export async function filterTargets(ns, servers, singleTarget = false, thisTarget = '') {
	/**
	 * Change these values to set a variable hack level or target
	 * particular servers
	 */
	const minHackLevel = 1;
	const maxHackLevel = ns.getHackingLevel();
	
	//let singleTarget = true;
	//let thisTarget = "joesguns";
	
	let targets = [];

	for (const server of servers) {
		if ((!singleTarget &&
			ns.hasRootAccess(server) &&
			ns.getServerMaxMoney(server) > 0 &&
			ns.getServerRequiredHackingLevel(server) >= minHackLevel &&
			ns.getServerRequiredHackingLevel(server) <= maxHackLevel) ||
			(server === thisTarget)
		) {
				targets.push(server);
		}
	}

	return targets;
}

export async function executeBasicHacks(ns, hosts, targets) {
	let i = 0;
	for (const host of hosts) {
		//ns.print(host);
		const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);

		var moneyThresh = ns.getServerMaxMoney(targets[i]) * 0.75;
		var securityThresh = ns.getServerMinSecurityLevel(targets[i]) + 5;

		if (ns.getServerSecurityLevel(targets[i]) > securityThresh) {
				//weaken(targets[i]);
				const threads = Math.floor(availableRam / ns.getScriptRam('weaken.js'));
				if (threads != 0) {
					ns.exec('weaken.js', host, threads, targets[i]);
				}
		} else if (ns.getServerMoneyAvailable(targets[i]) < moneyThresh) {
				//grow(targets[i]);
				const threads = Math.floor(availableRam / ns.getScriptRam('grow.js'));
				if (threads != 0) {
					ns.exec('grow.js', host, threads, targets[i]);
				}
		} else {
				//hack(targets[i]);
				const threads = Math.floor(availableRam / ns.getScriptRam('hack.js'));
				if (threads != 0) {
					ns.exec('hack.js', host, threads, targets[i]);
				}
		}
		
		i = i + 1;
		if (i >= targets.length) {
			i = 0;
		}
	}	
}
