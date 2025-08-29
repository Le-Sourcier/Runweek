/**
 * Génère les initiales à partir d'un nom complet.
 * - Retourne la première lettre du prénom pour un nom simple (ex: "India" → "IN").
 * - Retourne les premières lettres du prénom et du dernier nom pour un nom composé (ex: "India Curtis" → "IC").
 * - Inclut la première lettre de chaque partie pour les noms avec plusieurs parties (ex: "India Curtis Paul" → "ICP").
 * @param name Le nom complet ou partiel
 * @returns Les initiales en majuscules
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Sépare le nom en parties, en supprimant les espaces multiples
  const nameParts = name.trim().split(/\s+/);

  // Si une seule partie, retourne la première lettre
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  // Pour plusieurs parties, prend la première lettre de chaque partie
  // mais limite à 3 initiales pour éviter des résultats trop longs
  return nameParts
    .slice(0, 3)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};