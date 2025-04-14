/* eslint-disable no-constant-condition */
/**
 * @param {NS} ns
 *
 * This script solves a Caesar cipher.
 *
 * Contract description:
 * Substitution cipher in which each letter in the plaintext is replaced by a
 * letter some fixed number of positions down the alphabet. For example, with
 * a left shift of 3, D would be replaced by A, E would become B, and A would
 * become X (because of rotation).
 *
 * You are given an array with two elements:
 *  ["ARRAY QUEUE CACHE PASTE FRAME", 24]
 * The first element is the plaintext, the second element is the left shift value.
 * Return the ciphertext as uppercase string. Spaces remains the same.
 *
 * Returns: CTTCA SWGWG ECEJG RCUVG HTCOG
 */

export async function main(ns) {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // alphabet
	const ciphertext = "ARRAY QUEUE CACHE PASTE FRAME"; // ciphertext
	const shiftvalue = 24; // left shift value

	const plaintext = caesar(ciphertext, shiftvalue);
	ns.tprint(plaintext);

	function caesar(ciphertext, shiftvalue) {
		let result = "";

		// check each character in the ciphertext
		for (let i = 0; i < ciphertext.length; i++) {
			const char = ciphertext[i];

			// if the character is a space, add a space to the result and continue
			if (char === " ") {
				result += " ";
				continue;
			}

			// find the index of the character in the alphabet
			const index = alphabet.indexOf(char);
			// shift the index by the shiftvalue
			let shiftedIndex = (index - shiftvalue) % alphabet.length;
			// if the shifted index is negative, add the length of the alphabet to it
			if (shiftedIndex < 0) {
				shiftedIndex += alphabet.length;
			}

			// add the shifted character to the result
			result += alphabet[shiftedIndex];
		}

		return result;
	}
}
