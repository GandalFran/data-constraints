/**
 * Generates all possible data scenarios by unfolding arrays at specified keys.
 *
 * @param {object} rootObject - Object to process.
 * @param {string[]} paths - Array of key paths to be unfolded.
 * @returns {object[]} Array of scenario objects.
 */
function generateScenarios(rootObject, paths) {
  function recursiveUnfold(currentObj, path) {
    const segments = path.split(".");
    const head = segments[0];
    const tail = segments.slice(1);

    if (
      currentObj === undefined ||
      currentObj === null ||
      !Object.prototype.hasOwnProperty.call(currentObj, head)
    ) {
      return [currentObj];
    }

    const value = currentObj[head];

    if (tail.length === 0) {
      // Unfold this key if it's an array
      if (Array.isArray(value)) {
        return value.map((item) => ({
          ...currentObj,
          [head]: [item], // Preserve structure
        }));
      }
      return [currentObj];
    } else {
      // Dive deeper
      if (Array.isArray(value)) {
        // Array of objects -> unfold each
        const unfoldedArray = value.flatMap((item) =>
          recursiveUnfold(item, tail.join(".")),
        );
        return unfoldedArray.map((unfoldedItem) => ({
          ...currentObj,
          [head]: [unfoldedItem],
        }));
      } else if (typeof value === "object" && value !== null) {
        const unfoldedItems = recursiveUnfold(value, tail.join("."));
        return unfoldedItems.map((item) => ({
          ...currentObj,
          [head]: item,
        }));
      } else {
        return [currentObj];
      }
    }
  }

  let accumulator = [rootObject];
  for (const path of paths) {
    accumulator = accumulator.flatMap((item) => recursiveUnfold(item, path));
  }
  return accumulator;
}

/**
 * Interpolates a template string by replacing {{placeholders}}.
 *
 * @param {string} templateStr
 * @param {Object} contextMap
 * @returns {any}
 */
function interpolateTemplate(templateStr, contextMap) {
  // If the template string is EXACTLY a single variable, preserve its type
  const exactMatch = templateStr.match(/^{{([a-zA-Z0-9_.]+)}}$/);
  if (exactMatch) {
    const key = exactMatch[1];
    if (Object.prototype.hasOwnProperty.call(contextMap, key)) {
      return contextMap[key] === undefined || contextMap[key] === null
        ? null
        : contextMap[key];
    }
  }

  return Object.entries(contextMap).reduce((currentStr, [key, val]) => {
    const replacement =
      val === undefined || val === null
        ? "null"
        : typeof val === "object"
          ? JSON.stringify(val)
          : String(val);
    const regex = new RegExp(`{{${key}}}`, "g");
    return currentStr.replace(regex, replacement);
  }, templateStr);
}

/**
 * Interpolates a query object with values.
 * @param {object} queryObj
 * @param {object} contextMap
 * @returns {object}
 */
function interpolateQuery(queryObj, contextMap) {
  if (Array.isArray(queryObj)) {
    return queryObj.map((item) => interpolateQuery(item, contextMap));
  } else if (typeof queryObj === "object" && queryObj !== null) {
    const newObj = {};
    for (const [k, v] of Object.entries(queryObj)) {
      newObj[k] = interpolateQuery(v, contextMap);
    }
    return newObj;
  } else if (typeof queryObj === "string") {
    return interpolateTemplate(queryObj, contextMap);
  }
  return queryObj;
}

module.exports = { generateScenarios, interpolateTemplate, interpolateQuery };
