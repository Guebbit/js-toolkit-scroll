import levenshteinDistance from "./levenshteinDistance";

/**
 * Match if 2 strings are similar
 * If distance === 0 then they must be the same
 *
 * @param {string} check - check with match
 * @param {string} match - same as above, equal role
 * @param {boolean} sensitive - if case sensitive or not
 * @param {number} distance - max levenshtein distance
 *  -2: They can be substring one of another
 *  -1: {check} can be substring of {match} (default)
 *  0: then they must be the same
 *  1+: maximum distance to be accepted
 */
export default (check = '', match = '', sensitive = false, distance = -1) :boolean => {
  // Since they are not objects I can change them without worrying about unwanted changes
  check = check.trim();
  match = match.trim();
  // if case insensitive
  if(!sensitive){
    check = check.toLowerCase();
    match = match.toLowerCase();
  }
  // (2-way) if they are the same
  if(check === match)
    return true;
  // (2-way) is one a substring of the other
  if(distance === -2 && (check.indexOf(match) !== -1 || match.indexOf(check) !== -1))
    return true;
  // (1-way) if {check} is substring of {match}
  if(distance === -1 && match.indexOf(check) !== -1)
    return true;
  // (2-way) fuzzy search: levenshtein distance must be lower or equal the requested distance
  return distance > 0 && levenshteinDistance(check, match) <= distance;
}
