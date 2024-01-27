/** @param {NS} ns */
export async function main(ns) {
	const inputString = "77777777777YYY2222222222IIIIIIIIIzzPP44444444444444hh4KKKXXXXXANNNNNNNNNNN";
	// result: 97273Y92129I2z2P94542h143K5X1A9N2N
	
	const result = runLengthEncoding(inputString);
	ns.tprint(result);
}

function runLengthEncoding(str) {
	let encoded = "";
	let count = 1;

	for (let i = 1; i <= str.length; i++) {
			if (str[i] === str[i - 1] && count < 9) {
					count++;
			} else {
					encoded += count + str[i - 1];
					count = 1; // reset count for the new character
			}
	}

	return encoded;
}