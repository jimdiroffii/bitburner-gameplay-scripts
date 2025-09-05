#!/usr/bin/env python3
"""
Calculates the number of unique paths in an R x C grid from the top-left
to the bottom-right corner, moving only right or down.

The number of rows and columns are provided as command-line arguments.

Example Usage:
    python3 program.py 14 11
"""
import sys
import math

def unique_paths(rows: int, cols: int) -> int:
    """
    Calculates the number of unique paths using a combinatorial formula.

    To travel from the top-left to the bottom-right of an R x C grid,
    one must make exactly (rows - 1) 'down' moves and (cols - 1) 'right' moves.

    The total number of moves is (rows - 1) + (cols - 1). The problem is
    equivalent to finding the number of ways to choose which of these total
    moves are 'down' moves (the rest will be 'right' moves).

    This is a classic combination problem: C(total_moves, down_moves),
    which is calculated as C((rows + cols - 2), (rows - 1)).

    Args:
        rows: The number of rows in the grid (must be > 0).
        cols: The number of columns in the grid (must be > 0).

    Returns:
        The total number of unique paths as an integer.
    """
    # The math.comb() function is highly efficient for this calculation.
    # It avoids large intermediate numbers from factorials.
    if rows < 1 or cols < 1:
        return 0
    return math.comb(rows + cols - 2, rows - 1)

def main():
    """
    Parses command-line arguments for rows and columns and prints the
    number of unique paths.
    """
    # Expects 3 arguments: the script name, rows, and columns.
    if len(sys.argv) != 3:
        print(f"Usage: python3 {sys.argv[0]} <rows> <cols>", file=sys.stderr)
        sys.exit(1)

    try:
        # Convert arguments to integers.
        rows = int(sys.argv[1])
        cols = int(sys.argv[2])
    except ValueError:
        print("Error: Rows and columns must be valid integers.", file=sys.stderr)
        sys.exit(1)

    if rows <= 0 or cols <= 0:
        print("Error: Rows and columns must be positive integers.", file=sys.stderr)
        sys.exit(1)

    result = unique_paths(rows, cols)
    print(result)

if __name__ == "__main__":
    main()
