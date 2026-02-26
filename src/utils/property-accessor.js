const _ = require("lodash");

/**
 * Retrieves values from an object using a path.
 * Supports traversing arrays: if a property in the path is an array,
 * the rest of the path is applied to each element, and results are flattened.
 *
 * Example:
 * data = { items: [{id: 1}, {id: 2}] }
 * getValues(data, 'items.id') => [1, 2]
 *
 * @param {object} obj
 * @param {string} path
 * @returns {any} Single value, Array of values, or undefined
 */
function getValues(obj, path) {
  if (!obj) return undefined;
  if (!path) return obj;

  // Use lodash if path is simple and no arrays are involved in the path prefix
  // But we don't know if arrays are involved without traversing.
  // So we implement traversal.

  const parts = _.toPath(path);
  let current = [obj]; // Start with the root object as a list of one

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const next = [];

    for (const item of current) {
      if (item === undefined || item === null) continue;

      const val = item[key];
      if (val === undefined) continue;

      if (Array.isArray(val)) {
        // If the value itself is an array, we spread it into the next set
        // UNLESS distinct index access was used?
        // _.toPath('a[0]') -> ['a', '0']
        // item['a'] is array. Next iteration key is '0'.
        // So if we just spread 'val', next iteration will access index '0'.
        // If path is 'items.id', and items is array.
        // key is 'items'. val is [{id:1}].
        // We add val to next?
        // If we add val (array) to next.
        // Next iteration key is 'id'.
        // val['id'] is undefined on array.

        // We need to differentiate between "accessing a property that IS an array"
        // vs "iterating over an array".
        // In 'items.id', 'items' returns an array. The NEXT key 'id' should be applied to its elements.
        // So if 'val' is an array, we should spread it IF we are not at the end?
        // Or wait.
        // If I have { tags: ["a", "b"] }, path "tags".
        // key "tags". val ["a", "b"].
        // End of path. Result should be ["a", "b"].

        // If { items: [{id:1}] }, path "items.id".
        // key "items". val [{id:1}].
        // Next key "id".
        // We want to access "id" on {id:1}.

        // So, if `val` is an array:
        // We should add its elements to `next`?
        // If we do that, `key` was just used.
        // The loop continues to `nextKey`.
        // `nextKey` will be accessed on the elements.

        // Case: a[0].
        // key "a". val is array.
        // If we spread `val` into `next`.
        // Next key is "0".
        // We access "0" on elements of `val`? No.
        // "0" is the key implementation of `a[0]`.
        // If we spread, we lose the array structure.

        // This "simple" smart getter is tricky specifically because of indices vs mapping.
        // However, the user request "items.id" implies mapping.

        // Strategy:
        // If `val` is an array, and the NEXT part of the path is NOT an integer index:
        // Then we treat it as "map over this array".
        // If the next part IS an integer, we treat it as specific access (standard).

        // Check next part
        const nextPart = parts[i + 1];
        const isNextIndex = nextPart && /^\d+$/.test(nextPart);

        if (!isNextIndex) {
          // Spread array elements to apply next path to them
          for (const v of val) next.push(v);
        } else {
          // Keep the array as is, so next "0" can access the index
          next.push(val);
        }
      } else {
        next.push(val);
      }
    }
    current = next;
    if (current.length === 0) return undefined;
  }

  // current is now an array of values found.
  // If it has 0, undefined.
  // If it has 1, return strict value?
  // If > 1, return array.
  // But consistent array return is better for validation logic?
  // The constraints I updated handle arrays.
  // If I return [1] for single value, constraints work.
  // If I return 1, constraints work.
  // Let's return unwrapped if length 1 to minimize overhead?
  // Or simpler: always return array if it was technically a map operation?
  // User wants "consultar dentro de un array".

  // Let's refine the logic. `current` collects all leaf values.
  // If { items: [ {id:1}, {id:2} ] } -> current = [1, 2]
  // If { a: 1 } -> current = [1]

  if (current.length === 0) return undefined;
  if (current.length === 1) return current[0];
  return current;
}

module.exports = { getValues };
