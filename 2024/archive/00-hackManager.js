/** @param {NS} ns */
export async function main(ns) {
	const serverData = JSON.parse(await ns.read('00-servers.txt'));
	const targetServers = serverData.filter(server => server.target);
	const purchasedServers = ns.getPurchasedServers();
	let purchasedServerIndex = 0; // To cycle through purchased servers
	
	rootServers(serverData, ns);

	//let usableServerIndex = 0; // To cycle through usable servers
	const usableServers = getUsableServers(serverData, ns);
	//ns.tprint("Usable servers: " + usableServers.join(', '));
/*
	for (const targetServer of targetServers) {
			// Select the next purchased server for the operation
			const executingServer = purchasedServers[purchasedServerIndex % purchasedServers.length];
			purchasedServerIndex++;

			// Check if a script is already running on the target server
			if (ns.scriptRunning('00-hack.js', executingServer) || 
					ns.scriptRunning('00-grow.js', executingServer) || 
					ns.scriptRunning('00-weaken.js', executingServer)) {
					continue;
			}

			// Determine the appropriate action: hack, grow, or weaken
			let scriptToRun = determineScriptToRun(ns, targetServer);

			// Copy and execute the script
			await ns.scp(scriptToRun, executingServer);
			ns.exec(scriptToRun, executingServer, Math.floor(ns.getServerMaxRam(executingServer) / ns.getScriptRam(scriptToRun)), targetServer.hostname);
	}
*/
	let targetServerIndex = 0;
	for (const usableServer of usableServers) {
		const executingServer = usableServer;
		
		//ns.tprint("ExecutingServer: " + executingServer);
		//usableServerIndex++;

		// Check if a script is already running on the executing server
		if (ns.scriptRunning('00-hack.js', executingServer) || 
		ns.scriptRunning('00-grow.js', executingServer) || 
		ns.scriptRunning('00-weaken.js', executingServer)) {
			continue;
		}

		// Select the next target server for the operation
		//ns.tprint("targetIndex: " + targetServerIndex);
		const targetServer = targetServers[targetServerIndex++]
		//ns.tprint("targetServer: " + targetServer.hostname);
		if (targetServerIndex >= targetServers.length) {
			targetServerIndex = 0;
		}

		
		// Determine the appropriate action: hack, grow, or weaken
		//await ns.sleep(3000);
		//for (let i = 0; i < 1000000; ++i) {}
		let scriptToRun = determineScriptToRun2(ns, targetServer);
		
		// Copy and execute the script
		await ns.scp(scriptToRun, executingServer);
		await ns.exec(scriptToRun, executingServer, Math.floor(ns.getServerMaxRam(executingServer) / ns.getScriptRam(scriptToRun)), targetServer.hostname);
	}
}

function rootServers(serverData, ns) {
	for (const server of serverData) {
		//ns.tprint(server.hostname);

		if (server.hostname === 'home' || server.hostname === 'darkweb') {
			continue;
		}

		if (!ns.hasRootAccess(server.hostname)) {
			let portsRequired = ns.getServerNumPortsRequired(server.hostname);
			let portsOpened = 0;

			if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(server.hostname); portsOpened++; }
			if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(server.hostname); portsOpened++; }
			if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(server.hostname); portsOpened++; }
			if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(server.hostname); portsOpened++; }
			if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(server.hostname); portsOpened++; }

			if (portsOpened < portsRequired) continue;

			ns.nuke(server.hostname);
		}
	}
}

function getUsableServers(serverData, ns) {
	return serverData
			.filter(server => 
					//server.maxMoney > 0 && // Server should have money (thus hackable)
					server.hostname != 'home' &&
					ns.getServerMaxRam(server.hostname) >= 2 && // Server should have at least 8GB of RAM
					ns.hasRootAccess(server.hostname) // Server should be nuked (root access obtained)
			)
			.map(server => server.hostname); // Extract only the hostnames
}

function determineScriptToRun(ns, server) {
	if (ns.getServerSecurityLevel(server.hostname) > server.securityThresh) {
			return '00-weaken.js';
	} else if (ns.getServerMoneyAvailable(server.hostname) > server.moneyThresh) {
			return '00-hack.js';
	} else {
			return '00-grow.js';
	}
}

function determineScriptToRun2(ns, server) {
	const currentSecurity = ns.getServerSecurityLevel(server.hostname);
	const minSecurity = ns.getServerMinSecurityLevel(server.hostname);
	const currentMoney = ns.getServerMoneyAvailable(server.hostname);
	const maxMoney = ns.getServerMaxMoney(server.hostname);

	// Adjust thresholds dynamically
	const securityThreshold = minSecurity + (minSecurity * 0.2); // 20% above minimum
	const moneyThreshold = maxMoney * 0.75; // 75% of maximum money

	// Fine-tuned decision-making
	if (currentSecurity > securityThreshold) {
			// Security too high, prioritize weakening
			return '00-weaken.js';
	} else if (currentMoney < moneyThreshold && currentMoney > 0) {
			// Money below threshold, prioritize growing
			return '00-grow.js';
	} else if (currentMoney >= moneyThreshold) {
			// Good condition for hacking
			return '00-hack.js';
	} else {
			// Fallback scenario
			return determineFallbackScript(ns, server);
	}
}

function determineFallbackScript(ns, server) {
	// Fallback logic, could be based on available resources, historical data, etc.
	// For simplicity, this example just alternates between grow and weaken.
	return (Math.random() < 0.5) ? '00-grow.js' : '00-weaken.js';
}
