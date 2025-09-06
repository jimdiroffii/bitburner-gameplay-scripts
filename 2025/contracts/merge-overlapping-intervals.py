# Given an array of arrays of numbers representing intervals, merge all 
# overlapping intervals. Intervals must be returns in ascending order. You can
# assume that in an interval, the first number will always be smaller than the
# second.
# Example: [[1,3],[8,10],[2,6],[10,16]]
# Returns: [[1,6],[8,16]]

def mergeIntervals(intervals):
  if not intervals:
    return []

  # Sort intervals based on the start time
  intervals.sort(key=lambda x: x[0])
  merged = [intervals[0]]

  for current in intervals[1:]:
    last = merged[-1]
    
    # If the current interval overlaps with the last merged interval, merge them
    if current[0] <= last[1]:
      last[1] = max(last[1], current[1])
    else:
      merged.append(current)

  return merged

if __name__ == "__main__":
  # intervals = [[1,3],[8,10],[2,6],[10,16]]
  #intervals = [[7,16],[15,23],[18,23],[25,27],[2,9],[17,19],[5,6],[22,27],[1,10]]
  intervals = [[5,14],[9,11],[6,15],[9,12],[6,15],[9,12],[3,8],[5,15],[7,8],[11,20]]
  print(mergeIntervals(intervals))