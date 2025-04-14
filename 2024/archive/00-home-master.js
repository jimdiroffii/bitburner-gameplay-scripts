/** @param {NS} ns **/
export async function main(ns) {
	const allServers = findAllServers(ns, 'home');
	//const masterScript = '00-remote-master.js';
	
	while (true) {
			for (const server of allServers) {
				// Check if the master script is already running on the server
				// if (!ns.isRunning(masterScript, server) && server !== 'home') {
				// 	// Copy the master script to the server if not already present
				// 	if (!ns.fileExists(masterScript, server)) {
				// 		await ns.scp(masterScript, server, 'home');
				// 	}
				// 	if (!ns.fileExists("00-weaken.js", server)) {
				// 		await ns.scp("00-weaken.js", server, 'home');
				// 	}
				// 	if (!ns.fileExists("00-grow.js", server)) {
				// 		await ns.scp("00-grow.js", server, 'home');
				// 	}
				// 	if (!ns.fileExists("00-hack.js", server)) {
				// 		await ns.scp("00-hack.js", server, 'home');
				// 	}
				// 	// Execute the master script on the server
				// 	ns.exec(masterScript, server, 1); // Assuming 1 thread is sufficient
				// }

				// Ensure the server is a valid target
				if (ns.getServerMaxMoney(server) <= 0 || ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) {
					continue;
				}
				await decideAndExecute(ns, server);
			}
			await ns.sleep(10000); // Sleep to avoid overwhelming the `home` server
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

async function decideAndExecute(ns, targetServer) {
	if (isScriptRunningOnHome(ns, targetServer)) {
			//ns.tprint("home already targeting " + targetServer);
			return; // Skip if any script is already targeting this server from `home`
	}

	// Decide which action to take based on the target server's state
	if (shouldWeaken(ns, targetServer)) {
		ns.exec('00-weaken.js', 'home', calculateThreads(ns, 'weaken', targetServer), targetServer);
	} else if (shouldGrow(ns, targetServer)) {
		ns.exec('00-grow.js', 'home', calculateThreads(ns, 'grow', targetServer), targetServer);
	} else if (shouldHack(ns, targetServer)) {
		ns.exec('00-hack.js', 'home', calculateThreads(ns, 'hack', targetServer), targetServer);
	}
}

function isScriptRunningOnHome(ns, targetServer) {
	return ns.ps('home').some(p => p.args.includes(targetServer));
}

function shouldHack(ns, server) {
	// Decide if hacking is the best action based on the server's available money and security level
	const maxMoney = ns.getServerMaxMoney(server);
	const currentMoney = ns.getServerMoneyAvailable(server);
	const securityLevel = ns.getServerSecurityLevel(server);
	const minSecurityLevel = ns.getServerMinSecurityLevel(server);

	// Ideal conditions for hacking: high money and low security
	const isMoneySufficient = currentMoney >= maxMoney * 0.75; // at least 75% of max money
	const isSecurityLow = securityLevel <= minSecurityLevel + 5; // not too much above minimum security

	return isMoneySufficient && isSecurityLow;
}

function shouldGrow(ns, server) {
	// Decide if growing is the best action based on the server's available money
	const maxMoney = ns.getServerMaxMoney(server);
	const currentMoney = ns.getServerMoneyAvailable(server);

	// Ideal condition for growing: money available is less than a threshold (e.g., 75% of max)
	return currentMoney < maxMoney * 0.75;
}

function shouldWeaken(ns, server) {
	// Decide if weakening is the best action based on the server's security level
	const securityLevel = ns.getServerSecurityLevel(server);
	const minSecurityLevel = ns.getServerMinSecurityLevel(server);

	// Ideal condition for weakening: security level is significantly above the minimum
	return securityLevel > minSecurityLevel + 5;
}

function calculateThreads(ns, scriptType, server) {
	// Calculate the maximum possible threads based on available RAM on 'home' and script RAM requirements
	const scriptRam = ns.getScriptRam(`00-${scriptType}.js`, 'home');
	const availableRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
	let maxPossibleThreads = Math.floor(availableRam / scriptRam);

	// Ensure that we always have a positive integer for threads
	maxPossibleThreads = Math.max(1, maxPossibleThreads);

	// Early return zero, may break things. Just added it to help prevent bug?
	if (maxPossibleThreads === 0) {
		return 0;
	}

	// Calculate a security scaling factor
	const securityLevel = ns.getServerSecurityLevel(server);
	const minSecurityLevel = ns.getServerMinSecurityLevel(server);

	// Prevent division by zero.
	if (minSecurityLevel === 0) {
		minSecurityLevel = 1;
	}

	const securityScalingFactor = Math.max(1, securityLevel / minSecurityLevel);

	// Further logic to refine thread count based on server parameters and script type
	switch (scriptType) {
			case 'hack':
					const hackPercentage = 0.1; // Example: percentage of money to steal
					const hackMoney = ns.getServerMoneyAvailable(server) * hackPercentage;
					const hackThreads = Math.floor(ns.hackAnalyzeThreads(server, hackMoney));
					// Scale hack threads
					//const scaledHackThreads = Math.ceil(hackThreads * securityScalingFactor);
					//return Math.min(scaledHackThreads, maxPossibleThreads);
					return Math.min(hackThreads, maxPossibleThreads);

			case 'grow':
					const growFactor = 1.05; // Example: target 5% growth
					const growThreads = Math.ceil(ns.growthAnalyze(server, growFactor));
					// Scale grow threads
					//const scaledGrowThreads = Math.ceil(growThreads * securityScalingFactor);
					//return Math.min(scaledGrowThreads, maxPossibleThreads);
					return Math.min(growThreads, maxPossibleThreads);

			case 'weaken':
					const weakenAmount = (securityLevel - minSecurityLevel) / ns.weakenAnalyze(1);
					const weakenThreads = Math.ceil(weakenAmount);
					// Scale weaken threads based on security level
					const scaledWeakenThreads = Math.ceil(weakenThreads * securityScalingFactor);
					// ns.tprint("weakenAmount: " + weakenAmount);
					// ns.tprint("weakenThreads: " + weakenThreads);
					// ns.tprint("scaledWeakenThreads: " + scaledWeakenThreads);
					return Math.min(scaledWeakenThreads, maxPossibleThreads);
					//return Math.min(weakenThreads, maxPossibleThreads);

			default:
					return 0; // No threads for unknown script types
	}
}

