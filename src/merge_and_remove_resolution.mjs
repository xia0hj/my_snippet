//@ts-check

import { mergeAndRemoveInterval } from "./merge_and_remove_interval.mjs";
import { deepStrictEqual } from "assert";

/**
 * @typedef {{width:number, height:number}} Resolution
 */

// deepStrictEqual(
//   mergeAndRemoveResolution(
//     [
//       [
//         { width: 0, height: 0 },
//         { width: 100, height: 100 },
//       ],
//       [
//         { width: 100, height: 100 },
//         { width: 150, height: 150 },
//       ],
//       [
//         { width: 100, height: 100 },
//         { width: 150, height: 150 },
//       ],
//       [
//         { width: 200, height: 200 },
//       ],
//     ],
//     [
//       [
//         { width: 0, height: 0 },
//         { width: 100, height: 100 },
//       ],
//       [
//         { width: 150, height: 150 },
//       ],
//     ],
//   ),
//   [],
// );

/**
 * 多加一个维度的 mergeAndRemoveInterval
 * @param {Resolution[][]} targetInterval
 * @param {Resolution[][]} removedInterval
 */
function mergeAndRemoveResolution(targetInterval, removedInterval) {
  const { widthInterval, heightInterval } =
    preprocessResolution(targetInterval);
  const {
    widthInterval: removedWidthInterval,
    heightInterval: removedHeightInterval,
  } = preprocessResolution(removedInterval);

  const widthResult = mergeAndRemoveInterval(
    widthInterval,
    removedWidthInterval,
  );

  console.log("widthResult", widthResult);
}

/**
 * 将 interval 分为 width 和 height 的两个 number[][]
 * @param {Resolution[][]|undefined} interval
 */
export function preprocessResolution(interval) {
  /** @type {number[][]} */
  const widthInterval = [];

  /** @type {number[][]} */
  const heightInterval = [];

  interval?.forEach(([minResolution, maxResolution]) => {
    const widthItem = [minResolution.width];
    const heightItem = [minResolution.height];
    if (maxResolution != null) {
      widthItem.push(maxResolution.width);
      heightItem.push(maxResolution.height);
    }
    widthInterval.push(widthItem);
    heightInterval.push(heightItem);
  });

  return {
    widthInterval,
    heightInterval,
  };
}
