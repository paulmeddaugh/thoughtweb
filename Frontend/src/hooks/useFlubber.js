import { interpolate } from "flubber";
import { useTransform } from "framer-motion";
import { memoize } from "../scripts/utility/utility";

export const getIndex = (_, index) => index;

export function useFlubber(progress, paths) {
  return useTransform(progress, paths.map(getIndex), paths, {
    mixer: (a, b) => memoize(interpolate(a, b, { maxSegmentLength: 10 }))
  });
}