/** @param {NS} ns **/
export async function main(ns) {
	// Adjust these thresholds as needed
	const minMaxMoney = 1; // Minimum max money to consider a server
	const playerHackingLevel = ns.getHackingLevel(); // Your hacking level

	// Function to calculate a score for each server
	function calculateScore(server) {
			// Heavily weigh the maxMoney, but still consider minSecLevel and growth
			const growthRate = ns.getServerGrowth(server.hostname);
			const serverMaxMoney = ns.getServerMaxMoney(server.hostname);
			const serverMinSecurityLevel = ns.getServerMinSecurityLevel(server.hostname);
			ns.tprint("server: " + server.hostname);
			ns.tprint("growth rate: " + growthRate);
			//ns.tprint("min sec lvl: " + serverMinSecurityLevel);
			const score = serverMaxMoney / serverMinSecurityLevel * growthRate;
			//ns.tprint("score: " + score);

			//return server.maxMoney / server.minSecLevel * ns.getServerGrowth(server.hostname);
			return score;
	}

	// Read server data from '04-servers.txt'
	const serverData = JSON.parse(await ns.read('00-servers.txt'));

	// Filter out servers based on hacking level and max money
	const hackableServers = serverData.filter(server => 
			server.hostname !== "home" &&
			server.hostname !== "darkweb" &&
			server.maxMoney >= minMaxMoney &&
			playerHackingLevel >= ns.getServerRequiredHackingLevel(server.hostname)
	);

	// Sort servers based on score and select top 5
	hackableServers.sort((a, b) => calculateScore(b) - calculateScore(a));
	const topTargets = hackableServers.slice(0, 5);

	// Set target flag
	serverData.forEach(server => {
			server.target = topTargets.includes(server);
	});

	// Write updated data to '04-servers.txt'
	//await ns.write('04-servers.txt', JSON.stringify(serverData, null, 2), 'w');

	// Output the top 5 targets
	ns.tprint("Top 5 current targets: " + topTargets.map(server => server.hostname).join(", "));
}
