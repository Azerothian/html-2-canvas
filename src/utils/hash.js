//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
export function hashCode(s) {
  var hash = 0, i, chr;
  if (s.length === 0) {
    return hash;
  }
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
