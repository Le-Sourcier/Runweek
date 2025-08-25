interface TimeAgoOptions {
  showSeconds?: boolean;
  precise?: boolean;
}

export const formatTimeAgo = (
  timestamp: string,
  options: TimeAgoOptions = {}
): string => {
  const { showSeconds = false, precise = false } = options;
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (showSeconds && diffInSeconds < 60) {
    if (diffInSeconds < 10) return "À l'instant";
    if (diffInSeconds < 30) return "Il y a quelques secondes";
    return "Il y a 30 secondes";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (precise && diffInMinutes <= 10) {
      return diffInMinutes === 1
        ? "Il y a 1 minute"
        : `Il y a ${diffInMinutes} minutes`;
    }
    if (diffInMinutes === 1) return "Il y a 1 minute";
    return `Il y a ${diffInMinutes} minutes`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (precise && diffInHours <= 6) {
      return diffInHours === 1
        ? "Il y a 1 heure"
        : `Il y a ${diffInHours} heures`;
    }
    if (diffInHours === 1) return "Il y a 1 heure";
    return `Il y a ${diffInHours} heures`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    if (diffInDays === 1) return "Hier";
    if (diffInDays <= 3) return `Il y a ${diffInDays} jours`;
    return `Il y a ${diffInDays} jours`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    if (diffInWeeks === 1) return "Il y a 1 semaine";
    return `Il y a ${diffInWeeks} semaines`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    if (diffInMonths === 1) return "Il y a 1 mois";
    return `Il y a ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  if (diffInYears === 1) return "Il y a 1 an";
  return `Il y a ${diffInYears} ans`;
};

// Utilisation :
// formatTimeAgo("2023-12-01T10:00:00Z") // Basique
// formatTimeAgo("2023-12-01T10:00:00Z", { showSeconds: true }) // Avec secondes
// formatTimeAgo("2023-12-01T10:00:00Z", { precise: true }) // Plus précis
