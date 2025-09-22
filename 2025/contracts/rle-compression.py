# Run-length encoding (RLE) compression
#
# A data compression technique which encodes data as a series of runs of a
# repeated single character. Runs are encoded as a length, followed by the
# character itself. Lengths are encoded as a single digit, so runs of 10 or
# more are split into multiple runs.

def rle_compress(s):
    if not s:
        return ""

    compressed = []
    count = 1
    prev_char = s[0]

    for char in s[1:]:
        if char == prev_char and count < 9:
            count += 1
        else:
            compressed.append(f"{count}{prev_char}")
            prev_char = char
            count = 1

    compressed.append(f"{count}{prev_char}")
    return ''.join(compressed)

if __name__ == "__main__":
    s = "8wwwwwwwwwwwwggZZZZZZZZZZZZZZw6BBBBBBkqqggggggggggggPP44CCCDmffff"
    print(rle_compress(s))