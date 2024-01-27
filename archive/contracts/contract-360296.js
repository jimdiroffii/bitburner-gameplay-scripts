/** @param {NS} ns **/
export async function main(ns) {
// 	Shortest Path in a Grid
// You are attempting to solve a Coding Contract. 
// You have 10 tries remaining, after which the contract will self-destruct.
// You are located in the top-left corner of the following grid:
//   [[0,0,0,0,0,0,0],
//    [0,0,0,0,0,1,1],
//    [0,0,0,1,0,0,0],
//    [0,0,0,0,0,0,0],
//    [1,1,1,0,0,0,0],
//    [0,1,1,0,0,0,0]]
// You are trying to find the shortest path to the bottom-right corner of 
// the grid, but there are obstacles on the grid that you cannot move onto.
// These obstacles are denoted by '1', while empty spaces are denoted by 0.
// Determine the shortest path from start to finish, if one exists. The 
// answer should be given as a string of UDLR characters, indicating 
// the moves along the path
// NOTE: If there are multiple equally short paths, any of them is 
// accepted as answer. If there is no path, the answer should be an 
// empty string.
// NOTE: The data returned for this contract is an 2D array of 
// numbers representing the grid.
// Examples:
//     [[0,1,0,0,0],
//      [0,0,0,1,0]]
// Answer: 'DRRURRD'
//     [[0,1],
//      [1,0]]
// Answer: ''
const grid = [
	[0,0,0,0,0,0,0],
	[0,0,0,0,0,1,1],
	[0,0,0,1,0,0,0],
	[0,0,0,0,0,0,0],
	[1,1,1,0,0,0,0],
	[0,1,1,0,0,0,0]
];

const path = findShortestPath(grid);
//console.log(path); // Outputs the path as a string of UDLR characters
ns.tprint(path);

}

function findShortestPath(grid) {
	const rows = grid.length;
	const cols = grid[0].length;
	const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Down, Right, Up, Left
	const directionSymbols = ['D', 'R', 'U', 'L']; // Corresponding symbols
	let queue = [{ row: 0, col: 0, path: '' }]; // Start from top-left corner
	let visited = new Set();

	while (queue.length > 0) {
			let { row, col, path } = queue.shift();

			// Check if we reached the destination
			if (row === rows - 1 && col === cols - 1) {
					return path;
			}

			for (let i = 0; i < directions.length; i++) {
					let newRow = row + directions[i][0];
					let newCol = col + directions[i][1];
					let position = newRow + ',' + newCol;

					// Check if the new position is within bounds and not an obstacle
					if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols &&
							grid[newRow][newCol] === 0 && !visited.has(position)) {
							queue.push({ row: newRow, col: newCol, path: path + directionSymbols[i] });
							visited.add(position);
					}
			}
	}

	// If no path is found
	return '';
}
