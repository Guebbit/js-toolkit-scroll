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
declare const _default: (check?: string, match?: string, sensitive?: boolean, distance?: number) => boolean;
export default _default;
//# sourceMappingURL=match.d.ts.map