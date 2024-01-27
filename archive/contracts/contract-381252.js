export async function main(ns) {
	const triangle = [
		[6],
	 [6,3],
	[5,1,5],
 [1,1,6,1],
[8,7,7,2,5],
[9,8,9,3,2,7],
[7,2,4,1,5,1,3],
[1,8,5,8,2,8,7,9],
[1,2,8,1,3,1,7,3,2],
[8,7,1,1,6,7,5,4,4,8],
[2,7,7,4,2,8,8,8,7,3,7],
[2,6,6,1,7,4,1,2,3,2,3,8]
];

	const n = triangle.length;
	const minPathSum = new Array(n);
	
	// Initialize the last row of minPathSum
	for (let i = 0; i < n; i++) {
			minPathSum[i] = triangle[n - 1][i];
	}

	// Bottom-up calculation
	for (let layer = n - 2; layer >= 0; layer--) {
			for (let i = 0; i <= layer; i++) {
					minPathSum[i] = Math.min(minPathSum[i], minPathSum[i + 1]) + triangle[layer][i];
			}
	}

	ns.tprint("The minimum path sum is " + minPathSum[0]);
}
