# How many different distinct ways can the number be written as a sum of 
# integers contained in the set:
#
# You may use each integer in the set zero or more times.
#
# Example: 115
# Example: [2,4,6,7,9,11,16,17,18,19]

def total_ways_to_sum(n, arr):
  # Create a list to store the number of ways to form each sum up to n
  ways = [0] * (n + 1)
  ways[0] = 1  # There's one way to form the sum of 0 (using no elements)

  # Iterate through each number in the array
  for num in arr:
    # Update the ways array for all sums that can include this number
    for i in range(num, n + 1):
      ways[i] += ways[i - num]

  return ways[n]

if __name__ == "__main__":
  n = 115
  arr = [2,4,6,7,9,11,16,17,18,19]
  print(total_ways_to_sum(n, arr))