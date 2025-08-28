import { ApiError } from "../types";
import { Language, MessageCode } from "../types/message";

export const MESSAGE_MAPPINGS = {
  "en": {
    "DISTANCE_MUST_BE_NUMBER": "The distance value must be a valid numeric value. Please enter a number without any letters or special characters.",
    "DISTANCE_MUST_BE_POSITIVE": "Distance must be a positive number greater than zero. Negative values or zero are not accepted for distance measurements.",
    "DISTANCE_REQUIRED": "Distance field is required and cannot be empty. Please provide the distance value for your activity.",
    "INVALID_TIME_FORMAT": "Invalid time format detected. Please use the format HH:MM:SS for hours, minutes, seconds or MM:SS for minutes and seconds only.",
    "TIME_REQUIRED": "Time field is required and cannot be empty. Please provide the duration of your activity.",
    "INVALID_DATE_FORMAT": "The date format provided is not valid. Please check the date and try again.",
    "DATE_MUST_BE_ISO_FORMAT": "Date must be provided in the ISO 8601 format (YYYY-MM-DD). For example: 2023-12-25 for December 25th, 2023.",
    "DATE_REQUIRED": "Date field is required and cannot be empty. Please provide the date when the activity took place.",
    "NOTES_TOO_LONG": "Notes exceed the maximum allowed length of 500 characters. Please shorten your notes to continue.",
    "LOCATION_TOO_LONG": "Location name exceeds the maximum allowed length of 100 characters. Please provide a shorter location name.",
    "TEMPERATURE_MUST_BE_NUMBER": "Temperature must be a valid numeric value. Please enter a number without any letters or special characters.",
    "CONDITIONS_MUST_BE_STRING": "Weather conditions must be provided as text. Please describe the weather conditions using words rather than numbers or symbols.",
    "HUMIDITY_MUST_BE_NUMBER": "Humidity percentage must be a valid numeric value between 0 and 100. Please enter a number without any letters or special characters.",
    "HUMIDITY_TOO_LOW": "Humidity percentage cannot be less than 0%. Please provide a value between 0 and 100.",
    "HUMIDITY_TOO_HIGH": "Humidity percentage cannot exceed 100%. Please provide a value between 0 and 100.",
    "WINDSPEED_MUST_BE_NUMBER": "Wind speed must be a valid numeric value. Please enter a number without any letters or special characters.",
    "WINDSPEED_TOO_LOW": "Wind speed cannot be a negative value. Please provide a positive number or zero.",
    "WEATHER_MUST_BE_OBJECT": "Weather data must be provided as an object containing temperature, conditions, humidity, and wind speed properties.",
    "HR_AVG_MUST_BE_NUMBER": "Average heart rate must be a valid numeric value. Please enter a number without any letters or special characters.",
    "HR_AVG_TOO_LOW": "Average heart rate cannot be below 40 beats per minute. Please provide a value between 40 and 220.",
    "HR_AVG_TOO_HIGH": "Average heart rate cannot exceed 220 beats per minute. Please provide a value between 40 and 220.",
    "HR_MAX_MUST_BE_NUMBER": "Maximum heart rate must be a valid numeric value. Please enter a number without any letters or special characters.",
    "HR_MAX_TOO_LOW": "Maximum heart rate cannot be below 40 beats per minute. Please provide a value between 40 and 220.",
    "HR_MAX_TOO_HIGH": "Maximum heart rate cannot exceed 220 beats per minute. Please provide a value between 40 and 220.",
    "HR_MIN_MUST_BE_NUMBER": "Minimum heart rate must be a valid numeric value. Please enter a number without any letters or special characters.",
    "HR_MIN_TOO_LOW": "Minimum heart rate cannot be below 40 beats per minute. Please provide a value between 40 and 220.",
    "HR_MIN_TOO_HIGH": "Minimum heart rate cannot exceed 220 beats per minute. Please provide a value between 40 and 220.",
    "HEARTRATE_MUST_BE_OBJECT": "Heart rate data must be provided as an object containing average, max, and min heart rate properties.",
    "ELEVATION_GAIN_MUST_BE_NUMBER": "Elevation gain must be a valid numeric value. Please enter a number without any letters or special characters.",
    "ELEVATION_GAIN_TOO_LOW": "Elevation gain cannot be a negative value. Please provide a positive number or zero.",
    "ELEVATION_LOSS_MUST_BE_NUMBER": "Elevation loss must be a valid numeric value. Please enter a number without any letters or special characters.",
    "ELEVATION_LOSS_TOO_LOW": "Elevation loss cannot be a negative value. Please provide a positive number or zero.",
    "MAX_ALTITUDE_MUST_BE_NUMBER": "Maximum altitude must be a valid numeric value. Please enter a number without any letters or special characters.",
    "ELEVATION_MUST_BE_OBJECT": "Elevation data must be provided as an object containing gain, loss, and maxAltitude properties.",
    "SPLIT_DISTANCE_MUST_BE_NUMBER": "Split distance must be a valid numeric value. Please enter a number without any letters or special characters.",
    "SPLIT_DISTANCE_MUST_BE_POSITIVE": "Split distance must be a positive number greater than zero. Negative values or zero are not accepted.",
    "SPLIT_TIME_MUST_BE_STRING": "Split time must be provided as text in the format HH:MM:SS or MM:SS.",
    "SPLIT_PACE_MUST_BE_STRING": "Split pace must be provided as text in the format MM:SS per unit distance.",
    "SPLIT_ITEM_MUST_BE_OBJECT": "Each split must be provided as an object containing distance, time, and pace properties.",
    "SPLITS_MUST_BE_ARRAY": "Splits must be provided as an array of split objects.",
    "TAG_MUST_BE_STRING": "Each tag must be provided as text. Please use words rather than numbers or symbols for tags.",
    "TAGS_MUST_BE_ARRAY": "Tags must be provided as an array of text values.",
    "RECORD_CREATED": "Personal record added successfully",
    "RECORD_DELETED": "Personal record deleted successfully",
    "DATE_CANNOT_BE_PAST": "Date cannot be in the past",
    "DATE_TOO_FAR_FUTURE": "Date cannot be more than 2 months in the future"
  },
  "fr": {
    "DISTANCE_MUST_BE_NUMBER": "La distance doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "DISTANCE_MUST_BE_POSITIVE": "La distance doit être un nombre positif supérieur à zéro. Les valeurs négatives ou nulles ne sont pas acceptées pour les mesures de distance.",
    "DISTANCE_REQUIRED": "Le champ distance est obligatoire et ne peut pas être vide. Veuillez fournir la valeur de distance pour votre activité.",
    "INVALID_TIME_FORMAT": "Format de temps invalide détecté. Veuillez utiliser le format HH:MM:SS pour les heures, minutes, secondes ou MM:SS pour les minutes et secondes uniquement.",
    "TIME_REQUIRED": "Le champ temps est obligatoire et ne peut pas être vide. Veuillez fournir la durée de votre activité.",
    "INVALID_DATE_FORMAT": "Le format de date fourni n'est pas valide. Veuillez vérifier la date et réessayer.",
    "DATE_MUST_BE_ISO_FORMAT": "La date doit être fournie au format ISO 8601 (AAAA-MM-JJ). Par exemple : 2023-12-25 pour le 25 décembre 2023.",
    "DATE_REQUIRED": "Le champ date est obligatoire et ne peut pas être vide. Veuillez fournir la date à laquelle l'activité a eu lieu.",
    "NOTES_TOO_LONG": "Les notes dépassent la longueur maximale autorisée de 500 caractères. Veuillez raccourcir vos notes pour continuer.",
    "LOCATION_TOO_LONG": "Le nom du lieu dépasse la longueur maximale autorisée de 100 caractères. Veuillez fournir un nom de lieu plus court.",
    "TEMPERATURE_MUST_BE_NUMBER": "La température doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "CONDITIONS_MUST_BE_STRING": "Les conditions météorologiques doivent être fournies sous forme de texte. Veuillez décrire les conditions météorologiques en utilisant des mots plutôt que des chiffres ou des symboles.",
    "HUMIDITY_MUST_BE_NUMBER": "Le pourcentage d'humidité doit être une valeur numérique valide entre 0 et 100. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "HUMIDITY_TOO_LOW": "Le pourcentage d'humidité ne peut pas être inférieur à 0%. Veuillez fournir une valeur entre 0 et 100.",
    "HUMIDITY_TOO_HIGH": "Le pourcentage d'humidité ne peut pas dépasser 100%. Veuillez fournir une valeur entre 0 et 100.",
    "WINDSPEED_MUST_BE_NUMBER": "La vitesse du vent doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "WINDSPEED_TOO_LOW": "La vitesse du vent ne peut pas être une valeur négative. Veuillez fournir un nombre positif ou zéro.",
    "WEATHER_MUST_BE_OBJECT": "Les données météorologiques doivent être fournies sous forme d'objet contenant les propriétés température, conditions, humidité et vitesse du vent.",
    "HR_AVG_MUST_BE_NUMBER": "La fréquence cardiaque moyenne doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "HR_AVG_TOO_LOW": "La fréquence cardiaque moyenne ne peut pas être inférieure à 40 battements par minute. Veuillez fournir une valeur entre 40 et 220.",
    "HR_AVG_TOO_HIGH": "La fréquence cardiaque moyenne ne peut pas dépasser 220 battements par minute. Veuillez fournir une valeur entre 40 et 220.",
    "HR_MAX_MUST_BE_NUMBER": "La fréquence cardiaque maximale doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "HR_MAX_TOO_LOW": "La fréquence cardiaque maximale ne peut pas être inférieure à 40 battements par minute. Veuillez fournir une valeur entre 40 et 220.",
    "HR_MAX_TOO_HIGH": "La fréquence cardiaque maximale ne peut pas dépasser 220 battements par minute. Veuillez fournir une valeur entre 40 et 220.",
    "HR_MIN_MUST_BE_NUMBER": "La fréquence cardiaque minimale doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "HR_MIN_TOO_LOW": "La fréquence cardiaque minimale ne peut pas être inférieure à 40 battements par minute. Veuillez provide une valeur entre 40 et 220.",
    "HR_MIN_TOO_HIGH": "La fréquence cardiaque minimale ne peut pas dépasser 220 battements par minute. Veuillez fournir une valeur entre 40 et 220.",
    "HEARTRATE_MUST_BE_OBJECT": "Les données de fréquence cardiaque doivent être fournies sous forme d'objet contenant les propriétés moyenne, max et min de fréquence cardiaque.",
    "ELEVATION_GAIN_MUST_BE_NUMBER": "Le dénivelé positif doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "ELEVATION_GAIN_TOO_LOW": "Le dénivelé positif ne peut pas être une valeur négative. Veuillez fournir un nombre positif ou zéro.",
    "ELEVATION_LOSS_MUST_BE_NUMBER": "Le dénivelé négatif doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "ELEVATION_LOSS_TOO_LOW": "Le dénivelé négatif ne peut pas être une valeur négative. Veuillez fournir un nombre positif ou zéro.",
    "MAX_ALTITUDE_MUST_BE_NUMBER": "L'altitude maximale doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "ELEVATION_MUST_BE_OBJECT": "Les données d'altitude doivent être fournies sous forme d'objet contenant les propriétés gain, perte et altitudeMax.",
    "SPLIT_DISTANCE_MUST_BE_NUMBER": "La distance du split doit être une valeur numérique valide. Veuillez entrer un nombre sans lettres ni caractères spéciaux.",
    "SPLIT_DISTANCE_MUST_BE_POSITIVE": "La distance du split doit être un nombre positif supérieur à zéro. Les valeurs négatives ou nulles ne sont pas acceptées.",
    "SPLIT_TIME_MUST_BE_STRING": "Le temps du split doit être fourni sous forme de texte au format HH:MM:SS ou MM:SS.",
    "SPLIT_PACE_MUST_BE_STRING": "L'allure du split doit être fournie sous forme de texte au format MM:SS par unité de distance.",
    "SPLIT_ITEM_MUST_BE_OBJECT": "Chaque split doit être fourni sous forme d'objet contenant les propriétés distance, temps et allure.",
    "SPLITS_MUST_BE_ARRAY": "Les splits doivent être fournis sous forme de tableau d'objets split.",
    "TAG_MUST_BE_STRING": "Chaque tag doit être fourni sous forme de texte. Veuillez utiliser des mots plutôt que des chiffres ou des symboles pour les tags.",
    "TAGS_MUST_BE_ARRAY": "Les tags doivent être fournis sous forme de tableau de valeurs textuelles.",
    "RECORD_CREATED": "Record personnel ajouté avec succès",
    "RECORD_DELETED": "Record personnel supprimé avec succès",
    "DATE_CANNOT_BE_PAST": "La date ne peut pas être dans le passé",
    "DATE_TOO_FAR_FUTURE": "La date ne peut pas dépasser 2 mois dans le futur"
  }
};

export const getBaseMessage = (language: Language, code: MessageCode) => {
  console.log("code:", code, "language:", language);
  return (
    MESSAGE_MAPPINGS[language][code] ||
    MESSAGE_MAPPINGS["en"][code] ||
    "Unknown error"
  );
};

export function extractErrorMessage(err: unknown) {
  const error = err as ApiError;
  return { message: error.message as MessageCode, code: error.status };
}
