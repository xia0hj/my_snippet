//@ts-check

import * as assert from "node:assert";

assert.deepStrictEqual(
  mergeAndRemoveInterval(
    [[0, 5], [2, 3], [10, 20], [7, 13], [30, 40], [35]],
    [
      [0, 3],
      [6, 6],
      [6, 7],
      [10, 13],
    ],
  ),
  [[4, 5], [8, 9], [14, 20], [30]],
);

console.log(mergeAndRemoveInterval(undefined, undefined));

/**
 * @param {number[][]|undefined} targetInterval
 * @param {number[][]|undefined} removedInterval
 */
export function mergeAndRemoveInterval(targetInterval, removedInterval) {
  let interval =
    !Array.isArray(targetInterval) || targetInterval.length === 0
      ? [[0]]
      : targetInterval;
  let removed = Array.isArray(removedInterval) ? removedInterval : [];

  interval = preprocessInterval(interval);
  removed = preprocessInterval(removed);

  // 取 removed 的补集
  const complementary = [];
  let curMin = 0;
  removed.forEach(([removeMin, removeMax]) => {
    if (curMin < removeMin) {
      complementary.push([curMin, removeMin - 1]);
      curMin = removeMax + 1;
    } else if (curMin >= removeMin && curMin <= removeMax) {
      curMin = removeMax + 1;
    }
  });
  if (Number.isFinite(curMin)) {
    complementary.push([curMin, Number.POSITIVE_INFINITY]);
  }

  // 双指针取 interval 和 complementary 的交集
  const result = [];
  let i1 = 0;
  let i2 = 0;
  while (i1 < interval.length && i2 < complementary.length) {
    let [start1, end1] = interval[i1];
    let [start2, end2] = complementary[i2];

    if (end1 >= start2 && end2 >= start1) {
      result.push([Math.max(start1, start2), Math.min(end1, end2)]);
    }
    if (end1 < end2) {
      i1++;
    } else {
      i2++;
    }
  }

  console.log("区间", interval);
  console.log("移除区间", removed);
  console.log("移除区间的补集", complementary);
  console.log("最终结果", result);

  // 对最终结果做处理
  return result.map(([min, max]) => {
    if (Number.isFinite(max)) {
      return [min, max];
    } else {
      return [min];
    }
  });
}

/**
 * 预处理后的区间保证不重叠，按区间最小值排序，且 undefined 替换为 INFINITY
 * @param {number[][]} interval
 */
function preprocessInterval(interval) {
  if (interval.length === 0) {
    return [];
  }

  const sortByMin = interval.sort((a, b) => a[0] - b[0]);
  const result = [];

  let prevInterval = [...sortByMin[0]];
  for (let i = 1; i < sortByMin.length; i++) {
    const [curMin, curMax = Number.POSITIVE_INFINITY] = sortByMin[i];
    const [prevMin, prevMax = Number.POSITIVE_INFINITY] = prevInterval;

    if (prevMax >= curMin) {
      prevInterval[1] = Math.max(prevMax, curMax);
    } else {
      result.push([prevMin, prevMax]);
      prevInterval = [curMin, curMax];
    }
  }

  result.push([prevInterval[0], prevInterval[1]]);

  return result;
}
