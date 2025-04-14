/** @param {NS} ns */
export async function main(ns) {
	// init a counter to control the timing of function calls
	let counter = 0;

	while (true) {
			// Reset counter to prevent overflow
			if (counter > 100) {
				counter = 0;
			}

			// Display a summary of the current status
			if (counter % 2 === 0) {
					await ns.run('00-displayStatusSummary.js');
					await ns.sleep(2000);
			}

			// Update server list
			//if (counter % 4 === 0) {
					await ns.run('00-generateServerList.js');
					await ns.sleep(2000);
			//}

			await ns.run('00-purchaseManager.js');
			await ns.sleep(30000);

			// Execute the hack manager script
			await ns.run('00-hackManager.js');
			await ns.sleep(10000);

			// Placeholder for other tasks

			counter++;
			await ns.sleep(5000); // Sleep for 5 seconds
	}
}