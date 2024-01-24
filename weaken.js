/** @param {NS} ns */
/*****
 * BitBurner Gameplay Scripts
 * @ jimdiroffii
 * 
 * weaken()
 **/
export async function main(ns) {
	const target = ns.args[0];
	await ns.weaken(target);
}