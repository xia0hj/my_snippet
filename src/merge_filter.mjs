//@ts-check

import assert from "assert";
import { mergeAndRemoveInterval } from "./merge_and_remove_interval.mjs";
import { preprocessResolution } from "./merge_and_remove_resolution.mjs";

assert.deepStrictEqual(
  processFilter({
    exclude: {
      size: [[10, 100], [200]],
      resolution: [[{ width: 0, height: 0 }]],
    },
  }),
  {
    rules_origin: {
      size: [[0]],
      resolution: [[{ width: 0, height: 0 }]],
    },
    rules_union: {
      size: [
        [0, 9],
        [101, 199],
      ],
      resolution: [],
    },
  },
);

/**
 *
 * @typedef {{width:number, height:number}} Resolution
 *
 * @typedef {{size?: number[][], resolution?: Resolution[][]}} SizeResolution
 *
 * @typedef {{ files?: SizeResolution, exclude?: SizeResolution}} Filter
 */

/**
 * @param {Filter} filter
 * @return {{rules_origin: SizeResolution, rules_union: SizeResolution}}
 */
function processFilter(filter) {
  // 不填 files 表示全集，不填 exclude 表示空集
  const filesSize =
    !Array.isArray(filter.files?.size) || filter.files.size.length === 0
      ? [[0]]
      : filter.files.size;
  const filesResolution =
    !Array.isArray(filter.files?.resolution) ||
    filter.files.resolution.length === 0
      ? [[{ width: 0, height: 0 }]]
      : filter.files.resolution;
  const excludeSize = filter.exclude?.size ?? [];
  const excludeResolution = filter.exclude?.resolution ?? [];

  const rulesOriginSize = [...filesSize];
  const rulesOriginResolution = [...filesResolution];
  const rulesUnionSize = mergeAndRemoveInterval(filesSize, excludeSize);

  const { widthInterval, heightInterval } =
    preprocessResolution(filesResolution);
  const {
    widthInterval: removedWidthInterval,
    heightInterval: removedHeightInterval,
  } = preprocessResolution(excludeResolution);

  const rulesUnionWidth = mergeAndRemoveInterval(
    widthInterval,
    removedWidthInterval,
  );
  const rulesUnionHeight = mergeAndRemoveInterval(
    heightInterval,
    removedHeightInterval,
  );
  assert.strictEqual(rulesUnionWidth.length, rulesUnionHeight.length);

  /** @type {Resolution[][]} */
  const rulesUnionResolution = [];
  for (let i = 0; i < rulesUnionWidth.length; i++) {
    const [minWidth, maxWidth] = rulesUnionWidth[i];
    const [minHeight, maxHeight] = rulesUnionHeight[i];

    /**
     * @type {Resolution[]}
     */
    const resolutionInterval = [
      {
        width: minWidth,
        height: minHeight,
      },
    ];

    // 不存在只填了 {maxWidth} 或 {maxHeight} 的情况
    if (maxWidth != null && maxHeight != null) {
      resolutionInterval.push({
        width: maxWidth,
        height: maxHeight,
      });
    }

    rulesUnionResolution.push(resolutionInterval);
  }

  const processedFilter = {
    rules_origin: {
      size: rulesOriginSize,
      resolution: rulesOriginResolution,
    },
    rules_union: {
      size: rulesUnionSize,
      resolution: rulesUnionResolution,
    },
  };

  console.log("processedFilter", processedFilter);

  return processedFilter;
}
