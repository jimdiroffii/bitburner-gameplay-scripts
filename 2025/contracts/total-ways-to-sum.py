#!/usr/bin/env python3
"""
Count the number of distinct ways to write n as a sum of at least two
positive integers (order doesn't matter).

Example: n=4 -> 4 ways:
  3+1, 2+2, 2+1+1, 1+1+1+1
"""

import argparse

def partitions_at_least_two(n: int) -> int:
    """
    Return the number of unordered partitions of n using at least two parts.
    This equals the partition number p(n) minus 1 (excluding the single-part {n}).
    Uses a 1D DP identical to counting combinations with unlimited coins 1..n.
    """
    if n < 2:
        return 0

    # dp[x] = number of ways to form sum x using parts from processed set
    dp = [0] * (n + 1)
    dp[0] = 1

    # For each part size (like a coin) from 1..n, update combinations
    for part in range(1, n + 1):
        for x in range(part, n + 1):
            dp[x] += dp[x - part]

    # Exclude the trivial partition {n}
    return dp[n] - 1

def main():
    parser = argparse.ArgumentParser(
        description="Count distinct sums of n using at least two positive integers (order doesn't matter)."
    )
    parser.add_argument("n", nargs="?", type=int, default=68, help="target integer (default: 68)")
    args = parser.parse_args()

    # Quick sanity check against the example: p(4)-1 == 4
    if args.n == 4:
        assert partitions_at_least_two(4) == 4

    ways = partitions_at_least_two(args.n)
    print(ways)

if __name__ == "__main__":
    main()
