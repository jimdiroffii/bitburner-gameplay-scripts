/** @param {NS} ns */
export async function main(ns) {
	const value = 6407; // Given value
	const encodedBinary = encodeHamming(value);
	ns.tprint(`Encoded Binary: ${encodedBinary}`);
}

function encodeHamming(value) {
	let binary = value.toString(2); // Step 1: Convert to binary

	// Step 3: Calculate number of parity bits
	let r = 0;
	while (Math.pow(2, r) < binary.length + r + 1) {
			r++;
	}

	// Prepare array with positions for parity and data bits
	let arr = new Array(binary.length + r).fill(null);
	for (let i = 0; i < r; i++) {
			arr[Math.pow(2, i) - 1] = 'p'; // Mark parity bit positions
	}

	// Step 4: Fill in data bits (in original order, not reversed)
	let j = 0;
	for (let i = 0; i < arr.length; i++) {
			if (arr[i] === null) {
					arr[i] = binary[j++];
			}
	}

	// Step 5: Calculate parity bits
	for (let i = 0; i < r; i++) {
			let parity = 0;
			let position = Math.pow(2, i);
			for (let j = position - 1; j < arr.length; j += 2 * position) {
					for (let k = j; k < j + position && k < arr.length; k++) {
							if (arr[k] === '1') {
									parity++;
							}
					}
			}
			arr[position - 1] = (parity % 2 === 0) ? '0' : '1';
	}

	// Step 6: Calculate and set the overall parity bit
	let overallParity = arr.slice(1).filter(bit => bit === '1').length % 2 === 0 ? '0' : '1';
	arr[0] = overallParity;

	return arr.join('');
}
