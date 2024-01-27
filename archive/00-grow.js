/** @param {NS} ns */
export async function main(ns) {
	//const sleepDuration = getRandomSleepDuration();
	// Use sleepDuration with your sleep function
	//await ns.sleep(sleepDuration);
	let target = ns.args[0];
	await ns.grow(target);
}

function getRandomSleepDuration() {
	const min = 30; // minimum time in seconds
	const max = 60; // maximum time in minutes converted to seconds

	// Generate a random number between min and max
	const randomSeconds = Math.floor(Math.random() * (max - min + 1)) + min;

	// Convert seconds to milliseconds
	return randomSeconds * 1000;
}