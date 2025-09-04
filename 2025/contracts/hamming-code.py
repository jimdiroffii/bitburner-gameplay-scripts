def decode_extended_hamming(binary_string):
    """
    Decode extended Hamming code following the specific rules given.
    
    Rules:
    - Parity bits at positions 0, 1, 2, 4, 8, 16, ... (0 and powers of 2)
    - Each parity bit at 2^k checks positions where bit k is set in binary representation
    - Position 0 checks all bits for overall parity
    - Data bits are MSB first, parity bits are LSB first
    """
    bits = [int(b) for b in binary_string]
    n = len(bits)
    
    print(f"Input: {binary_string}")
    print(f"Length: {n}")
    
    # Find parity positions
    parity_positions = set([0])  # Position 0 is overall parity
    power = 1
    while power < n:
        parity_positions.add(power)
        power *= 2
    
    print(f"Parity positions: {sorted(parity_positions)}")
    
    # Calculate syndrome by checking each parity bit
    syndrome = 0
    
    # Check parity bits 1, 2, 4, 8, ... (powers of 2, not including 0)
    power = 1
    while power < n:
        parity_sum = 0
        
        # Check all positions where this bit is set in the binary representation
        for pos in range(n):
            if pos & power:  # If bit 'power' is set in position 'pos'
                parity_sum += bits[pos]
        
        expected_parity = parity_sum % 2
        actual_parity = bits[power]
        
        print(f"Parity bit {power}: checks positions with bit {power.bit_length()-1} set")
        print(f"  Positions checked: {[pos for pos in range(n) if pos & power]}")
        print(f"  Sum: {parity_sum}, Expected: {expected_parity}, Actual: {actual_parity}")
        
        if actual_parity != expected_parity:
            syndrome += power
            
        power *= 2
    
    # Check overall parity (position 0)
    total_ones = sum(bits)
    overall_expected = total_ones % 2
    overall_actual = bits[0]
    
    print(f"Overall parity check: total_ones={total_ones}, expected={overall_expected}, actual={overall_actual}")
    
    # Determine and fix error
    corrected_bits = bits[:]
    
    if syndrome == 0 and overall_actual == overall_expected:
        print("✓ No errors detected")
    elif syndrome == 0 and overall_actual != overall_expected:
        print("✓ Error in overall parity bit (position 0)")
        corrected_bits[0] = 1 - corrected_bits[0]
    elif syndrome != 0 and overall_actual == overall_expected:
        print("✗ Double error detected - cannot correct")
    else:
        print(f"✓ Single error at position {syndrome}")
        corrected_bits[syndrome] = 1 - corrected_bits[syndrome]
    
    # Extract data bits (non-parity positions)
    data_positions = []
    data_bits = []
    for i in range(n):
        if i not in parity_positions:
            data_positions.append(i)
            data_bits.append(corrected_bits[i])
    
    print(f"Data positions: {data_positions}")
    print(f"Data bits: {data_bits}")
    
    # Convert to decimal (MSB first)
    decimal_value = 0
    for bit in data_bits:
        decimal_value = (decimal_value << 1) + bit
    
    return decimal_value, syndrome

# Test examples first
print("=== Example 1: '11110000' ===")
print("Positions: 01234567")
print("Bits:      11110000")
print("Expected data bits at positions 3,5,6,7: 1000 = 8")
result1, syndrome1 = decode_extended_hamming('11110000')
print(f"Result: {result1}\n")

print("=== Example 2: '1001101010' ===") 
print("Positions: 0123456789")
print("Bits:      1001101010")
print("After correction should give data bits: 10101 = 21")
result2, syndrome2 = decode_extended_hamming('1001101010')
print(f"Result: {result2}\n")

print("=== Main Problem ===")
binary_input = '0110000011001001001010000101011011110111111000111011001101000011'
result, syndrome = decode_extended_hamming(binary_input)
print(f"\nFinal Answer: {result}")