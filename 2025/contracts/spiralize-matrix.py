#!/usr/bin/env python3
from ast import literal_eval
import sys

def spiral_order(matrix):
    """Return elements of 2D matrix in spiral order."""
    if not matrix or not matrix[0]:
        return []

    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        # left -> right
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1

        # top -> bottom
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1

        if top <= bottom:
            # right -> left
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1

        if left <= right:
            # bottom -> top
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1

    return res

def main():
    """
    Usage:
      - No args: runs with the sample matrix from the prompt.
      - One arg: pass a Python/JSON-style matrix string.
        e.g. python spiral.py "[[1,2,3],[4,5,6],[7,8,9]]"
    """
    if len(sys.argv) > 1:
        matrix = literal_eval(sys.argv[1])
    else:
        matrix = [
        [36,10],
        [30,14],
        [34, 1],
        [32,43],
        [43,46],
        [22,18],
        [ 8,21],
        [50,44],
        [13,21]
    ]

    result = spiral_order(matrix)
    print(result)

if __name__ == "__main__":
    main()
