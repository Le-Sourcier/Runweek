export const timeStringToSeconds = (timeString: string): number => {
  const parts = timeString.split(':').map(Number);
  let seconds = 0;
  if (parts.length === 3) { // HH:MM:SS
    seconds += parts[0] * 3600;
    seconds += parts[1] * 60;
    seconds += parts[2];
  } else if (parts.length === 2) { // MM:SS
    seconds += parts[0] * 60;
    seconds += parts[1];
  } else if (parts.length === 1) { // SS
    seconds += parts[0];
  } else {
    return NaN;
  }
  return isNaN(seconds) ? NaN : seconds; // Ensure NaN propagates if any part was NaN
};

export const calculatePace = (distanceKm: number, totalSeconds: number): string => {
  if (isNaN(distanceKm) || distanceKm <= 0 || isNaN(totalSeconds) || totalSeconds <= 0) {
    return "N/A";
  }
  const paceInSecondsPerKm = totalSeconds / distanceKm;
  const paceMinutes = Math.floor(paceInSecondsPerKm / 60);
  const paceSeconds = Math.round(paceInSecondsPerKm % 60);
  const formattedPaceSeconds = paceSeconds < 10 ? `0${paceSeconds}` : `${paceSeconds}`;
  return `${paceMinutes}:${formattedPaceSeconds} /km`;
};

export const metersToKilometers = (distanceMeters: number): number => {
  if (isNaN(distanceMeters)) return NaN;
  return distanceMeters / 1000;
};
