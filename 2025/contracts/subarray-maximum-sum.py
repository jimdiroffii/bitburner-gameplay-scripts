# You are attempting to solve a Coding Contract. You have 10 tries remaining,
# after which the contract will self-destruct.
#
# Given the following integer array, find the contiguous subarray (containing 
# at least one number) which has the largest sum and return that sum. 'Sum' 
# refers to the sum of all the numbers in the subarray.
#
# Example: 3,-8,-3,-3,-7,8,-7,6,-2,-3,1,-4,9,6,-3,-5,6

def max_subarray_sum(arr):
  max_sum = float('-inf')
  current_sum = 0

  for num in arr:
    current_sum += num
    if current_sum > max_sum:
      max_sum = current_sum
    if current_sum < 0:
      current_sum = 0

  print(max_sum)
  return max_sum


if __name__ == "__main__":
  arr = [3,-8,-3,-3,-7,8,-7,6,-2,-3,1,-4,9,6,-3,-5,6]
  max_subarray_sum(arr)
