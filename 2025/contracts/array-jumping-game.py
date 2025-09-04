# Array Jumping Game
# Given an array of integers, each element in the array represents the maximum
# jump length at that position. If you are at position i, and your maximum jump
# is n, you can jump to any position from i to i+n. 
# The goal is to determine if you can reach the last index of the array
# Submit an answer of 1 or 0, representing true or false, respectively.
# This algorithm counts the minimum number of jumps required to reach the last 
# index, so any number returned other than 0 is considered true (1).

def minJumps(arr):
  n = len(arr)

  if nums[0] == 0:
    return 0
    
  maxReach = 0
  currReach = 0
  jump = 0

  for i in range(n):
    maxReach = max(maxReach, i + arr[i])
    if maxReach >= n - 1:
      return jump + 1
    
    if i == currReach:
      if i == maxReach:
        return 0
      else:
        jump += 1
        currReach = maxReach

  return 0

if __name__ == "__main__":
  nums = [1,6,7,3,7,9,2,8,10,1,0,8,6,8,10,0]
  print(minJumps(nums))