/** @param {NS} ns */
/*****
 * BitBurner Gameplay Scripts
 * @ jimdiroffii
 * 
 * NS is the BitBurner class or namespace used for Bitburner
 **/
export async function main(ns) {
	/**
	 * Main Program Loop
	 * 
	 * The point of this loop is to control execution of 
	 * the main loop program. This allows the main program
	 * to be edited, without needing to constantly restart
	 * the scripts.
	 */
	while (true) {
		
		await ns.exec('controller.js', 'home', 1);

		/**
		 * Functions that take time must be used with `await`
		 * Sleep time is in milliseconds
		 * 
		 * This particular sleep time controls the frequency
		 * of timing to launch the main program. This can't be
		 * edited without restarting this script.
		 */
		await ns.sleep(10000);
	}
}