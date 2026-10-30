// Official 2026-06 membership schedule: +10/3h regular, +15/3h membership.
// KST refill boundaries: 02,05,08,11,14,17,20,23 (community schedule).
// This module is shared by the D1 Worker and browser to avoid divergent estimates.
export const OD1_INPUT_MAX = 840;
export const OD2_INPUT_MAX = 999999999;
export const OD_RECOVERY_INTERVAL_SECONDS = 3 * 60 * 60;
const KST_OFFSET_SECONDS = 9 * 60 * 60;
const FIRST_KST_RECOVERY_HOUR = 2;
const RECOVERY_OFFSET_SECONDS = KST_OFFSET_SECONDS - FIRST_KST_RECOVERY_HOUR * 60 * 60;

export function nextOdRecoveryAt(nowSeconds) {
  const now = Math.floor(Number(nowSeconds));
  if (!Number.isFinite(now)) throw new Error('Invalid current time');
  return (Math.floor((now + RECOVERY_OFFSET_SECONDS) / OD_RECOVERY_INTERVAL_SECONDS) + 1)
    * OD_RECOVERY_INTERVAL_SECONDS - RECOVERY_OFFSET_SECONDS;
}

export function estimatedOd1(base, baselineSeconds, membership, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (base === null || base === undefined) return null;
  const starting = Number(base);
  if (!Number.isSafeInteger(starting) || starting < 0) return null;
  // Unknown membership / old baseline: preserve the manually entered amount, no retroactive recovery.
  if ((membership !== 0 && membership !== 1) ||
      !Number.isSafeInteger(Number(baselineSeconds)) || baselineSeconds == null) return starting;
  const now = Math.floor(Number(nowSeconds));
  const at = Number(baselineSeconds);
  if (!Number.isFinite(now) || now <= at) return starting;
  const ticks = Math.max(0,
    Math.floor((now + RECOVERY_OFFSET_SECONDS) / OD_RECOVERY_INTERVAL_SECONDS)
    - Math.floor((at + RECOVERY_OFFSET_SECONDS) / OD_RECOVERY_INTERVAL_SECONDS));
  const capacity = membership === 1 ? 840 : 560;
  const increment = membership === 1 ? 15 : 10;
  // Changing from membership to regular should not erase manually held amounts above 560.
  if (starting >= capacity) return starting;
  return Math.min(capacity, starting + ticks * increment);
}
