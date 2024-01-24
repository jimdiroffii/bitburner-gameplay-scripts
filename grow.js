/** @param {NS} ns */
/*****
 * BitBurner Gameplay Scripts
 * @ jimdiroffii
 * 
 * grow()
 **/
export async function main(ns) {
	const target = ns.args[0];
	await ns.grow(target);
}