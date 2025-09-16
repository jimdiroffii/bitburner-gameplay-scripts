def find_expressions(digits, target):
    """
    Find all possible ways to add +, -, * operators to a string of digits
    such that the expression evaluates to the target number.
    
    Args:
        digits (str): String containing only digits 0-9
        target (int): Target number to evaluate to
    
    Returns:
        list: List of valid expressions as strings
    """
    result = []
    
    def backtrack(index, path, value, prev_num):
        # Base case: we've processed all digits
        if index == len(digits):
            if value == target:
                result.append(path)
            return
        
        # Try all possible numbers starting from current index
        for i in range(index, len(digits)):
            # Extract current number substring
            num_str = digits[index:i+1]
            
            # Skip numbers with leading zeros (except single digit 0)
            if len(num_str) > 1 and num_str[0] == '0':
                break
                
            num = int(num_str)
            
            if index == 0:
                # First number, no operator needed
                backtrack(i + 1, num_str, num, num)
            else:
                # Try addition
                backtrack(i + 1, path + '+' + num_str, value + num, num)
                
                # Try subtraction
                backtrack(i + 1, path + '-' + num_str, value - num, -num)
                
                # Try multiplication
                # For multiplication, we need to handle operator precedence
                # Remove the effect of the previous number and add back the multiplied result
                new_value = value - prev_num + prev_num * num
                backtrack(i + 1, path + '*' + num_str, new_value, prev_num * num)
    
    backtrack(0, "", 0, 0)
    return result


if __name__ == "__main__":
    # Define the input data
    digits = "26614532309"
    target = 2
    
    # Call the function and print the result as an array
    print(find_expressions(digits, target))