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
            [14,17,33, 8,38,43,49,35,40,17, 1],
            [11,18,49,38, 5,45, 6,27,27,30, 7],
            [ 1,45, 9,28,32, 5,44,36,45,12,33],
            [ 7,19, 6,38,43,21,19, 7, 7,19,17],
            [44,30,36,49,47,18,29,30, 4, 1,14],
            [40,48,24,42,33, 4,42, 1, 4,10,42],
            [39,33,33,16, 7,31,34,40,25,43,22],
            [37,35, 5,10,19,17,33,11,50,45,12],
            [36,43,34,16, 6,28,41, 3, 6,22,35],
            [28,42, 5, 9,25, 6,42,41,34,33, 1],
        ]

    result = spiral_order(matrix)
    print(result)

if __name__ == "__main__":
    main()
