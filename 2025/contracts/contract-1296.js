//const string = "20922109214";
const string = "642412372";

// Generate a function that create an array of all valid IP addresses from a string
function generateIPAddresses(s) {
    const result = [];
    for (let i = 1; i < 4; i++) {
        for (let j = i + 1; j < i + 4; j++) {
            for (let k = j + 1; k < j + 4; k++) {
                const part1 = s.slice(0, i);
                const part2 = s.slice(i, j);
                const part3 = s.slice(j, k);
                const part4 = s.slice(k);
                if (isValid(part1) && isValid(part2) && isValid(part3) && isValid(part4)) {
                    result.push(`${part1}.${part2}.${part3}.${part4}`);
                }
            }
        }
    }
    console.log(result);
}

function isValid(part) {
    if (part.length > 3 || part.length === 0) return false;
    if (part[0] === '0' && part.length > 1) return false;
    return Number(part) <= 255;
}

generateIPAddresses(string);