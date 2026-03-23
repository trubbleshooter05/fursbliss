/**
 * Feature Unlock Days: Free users get temporary access to premium features
 * during "Premium Weekend" (first Saturday and Sunday of each month).
 */

export function isFeatureUnlockActive(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // First Saturday of the month: find the first day that is Saturday (6)
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  // Days until first Saturday: if Sunday(0)=6, Monday(1)=5, ..., Saturday(6)=0
  const daysUntilFirstSaturday =
    firstDayOfWeek === 0 ? 6 : firstDayOfWeek === 6 ? 0 : 6 - firstDayOfWeek;
  const firstSaturday = new Date(year, month, 1 + daysUntilFirstSaturday);
  const firstSunday = new Date(year, month, 2 + daysUntilFirstSaturday);

  const today = new Date(year, month, now.getDate());
  const isSaturday = today.getTime() === firstSaturday.getTime();
  const isSunday = today.getTime() === firstSunday.getTime();

  return isSaturday || isSunday;
}

export function getFeatureUnlockLabel(): string {
  if (!isFeatureUnlockActive()) return "";
  const now = new Date();
  const dayName = now.getDay() === 0 ? "Sunday" : "Saturday";
  return `Premium Weekend — free ${dayName} trial`;
}
