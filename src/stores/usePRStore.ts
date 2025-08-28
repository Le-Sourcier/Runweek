// stores/prStore.ts
import { create } from "zustand";
import { apiUtils } from "../hooks/useApi";
import { ApiError } from "../types";
import {
  PersonalRecord,
  PRState,
  SortablePRKey,
  SortDirection,
} from "../types/PsRecor";
import { extractErrorMessage } from "../utils/error-handler";
import { ApiUrl } from "../utils/api-url";

export const usePRStore = create<PRState>((set, get) => ({
  // États initiaux
  originalPRs: [],
  processedPRs: [],
  sortConfig: { key: "date", direction: "descending" },
  distanceFilter: null,
  isLoading: false,
  error: null,

  // Récupérer tous les records personnels
  getAllRecords: async (
    distance?: string,
    sort: SortablePRKey = "date",
    order: "asc" | "desc" = "desc",
    limit = 50
  ) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get<PersonalRecord[]>(
        ApiUrl.queryable(
          ApiUrl.PERSONAL_RECORDS,
          {
            distance: distance?.toString() || "",
            sort,
            order,
            limit: limit.toString(),
          }
        )
      );

      set({
        originalPRs: data,
        processedPRs: data,
        sortConfig: {
          key: sort,
          direction: order === "asc" ? "ascending" : "descending",
        },
        distanceFilter: distance || null,
        isLoading: false,
      });

      return data;
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
      throw new Error(
        error.message || "Erreur lors de la récupération des records"
      );
    }
  },

  // Récupérer un record spécifique
  getRecordById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await apiUtils.get<PersonalRecord>(
        `/personal-records/${id}`
      );
      set({ isLoading: false });
      return data;
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
      throw new Error(
        error.message || "Erreur lors de la récupération du record"
      );
    }
  },

  // Créer un nouveau record personnel
  createRecord: async (prData: PersonalRecord) => {
    try {
      set({ error: null });
      const { data } = await apiUtils.post<PersonalRecord>(
        "/personal-records",
        prData
      );

      set((state) => {
        const newOriginalPRs = [...state.originalPRs, data];
        const newProcessedPRs = applyFiltersAndSorting(
          newOriginalPRs,
          state.sortConfig,
          state.distanceFilter
        );

        return {
          originalPRs: newOriginalPRs,
          processedPRs: newProcessedPRs,
          isLoading: false,
        };
      });

      return data;
    } catch (err) {
      const error = err as ApiError;
      console.log("error.message:", extractErrorMessage(error));

      set({ error: error.message, isLoading: false });
      throw new Error(error.message || "Erreur lors de la création du record");
    }
  },

  // Mettre à jour un record
  updateRecord: async (pr: PersonalRecord) => {

    try {
      set({ error: null });
      const { data } = await apiUtils.put<PersonalRecord>(
        ApiUrl.parameterized(ApiUrl.PERSONAL_RECORDS_UPDATE, pr.id!),
        pr
      );

      set((state) => {
        const newOriginalPRs = state.originalPRs.map((item) =>
          item.id === pr.id ? data : item
        );
        const newProcessedPRs = applyFiltersAndSorting(
          newOriginalPRs,
          state.sortConfig,
          state.distanceFilter
        );

        return {
          originalPRs: newOriginalPRs,
          processedPRs: newProcessedPRs,
          isLoading: false,
        };
      });

      return data;
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message });
      throw new Error(
        error.message || "Erreur lors de la mise à jour du record"
      );
    }
  },

  // Supprimer un record
  deleteRecord: async (id: string) => {
    try {
      set({ error: null });
      await apiUtils.del(`/personal-records/${id}`);

      set((state) => {
        const newOriginalPRs = state.originalPRs.filter(
          (item) => item.id !== id
        );
        const newProcessedPRs = applyFiltersAndSorting(
          newOriginalPRs,
          state.sortConfig,
          state.distanceFilter
        );

        return {
          originalPRs: newOriginalPRs,
          processedPRs: newProcessedPRs,
          isLoading: false,
        };
      });
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message });
      throw new Error(
        error.message || "Erreur lors de la suppression du record"
      );
    }
  },

  // Ajouter un record (version simplifiée pour l'UI)
  addPR: (pr: PersonalRecord) => {
    set((state) => {
      const newOriginalPRs = [...state.originalPRs, pr];
      const newProcessedPRs = applyFiltersAndSorting(
        newOriginalPRs,
        state.sortConfig,
        state.distanceFilter
      );

      return {
        originalPRs: newOriginalPRs,
        processedPRs: newProcessedPRs,
      };
    });
  },

  // Mettre à jour un record (version simplifiée pour l'UI)
  updatePR: (pr: PersonalRecord) => {
    set((state) => {
      const newOriginalPRs = state.originalPRs.map((item) =>
        item.id === pr.id ? pr : item
      );
      const newProcessedPRs = applyFiltersAndSorting(
        newOriginalPRs,
        state.sortConfig,
        state.distanceFilter
      );

      return {
        originalPRs: newOriginalPRs,
        processedPRs: newProcessedPRs,
      };
    });
  },

  // Supprimer un record (version simplifiée pour l'UI)
  deletePR: (id: string) => {
    set((state) => {
      const newOriginalPRs = state.originalPRs.filter((item) => item.id !== id);
      const newProcessedPRs = applyFiltersAndSorting(
        newOriginalPRs,
        state.sortConfig,
        state.distanceFilter
      );

      return {
        originalPRs: newOriginalPRs,
        processedPRs: newProcessedPRs,
      };
    });
  },

  // Configurer le tri
  setSortConfig: (key: SortablePRKey, direction?: SortDirection) => {
    const newDirection =
      direction ||
      (get().sortConfig?.key === key &&
        get().sortConfig?.direction === "ascending"
        ? "descending"
        : "ascending");

    set((state) => {
      const newProcessedPRs = applyFiltersAndSorting(
        state.originalPRs,
        { key, direction: newDirection },
        state.distanceFilter
      );

      return {
        sortConfig: { key, direction: newDirection },
        processedPRs: newProcessedPRs,
      };
    });
  },

  // Configurer le filtre de distance
  setDistanceFilter: (filter: string | null) => {
    set((state) => {
      const newProcessedPRs = applyFiltersAndSorting(
        state.originalPRs,
        state.sortConfig,
        filter
      );

      return {
        distanceFilter: filter,
        processedPRs: newProcessedPRs,
      };
    });
  },

  // Récupérer les statistiques des records
  getRecordsStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await apiUtils.get("/personal-records/stats");
      set({ isLoading: false });
      return data;
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
      throw new Error(
        error.message || "Erreur lors de la récupération des statistiques"
      );
    }
  },

  // Récupérer le meilleur record pour une distance
  getBestRecordByDistance: async (distance: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await apiUtils.get(`/personal-records/best/${distance}`);
      set({ isLoading: false });
      return data;
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
      throw new Error(
        error.message || "Erreur lors de la récupération du meilleur record"
      );
    }
  },

  // Effacer les erreurs
  clearError: () => set({ error: null }),
}));

// Fonction utilitaire pour appliquer les filtres et le tri
function applyFiltersAndSorting(
  records: PersonalRecord[],
  sortConfig: { key: SortablePRKey; direction: SortDirection } | null,
  distanceFilter: string | null
): PersonalRecord[] {
  let filteredRecords = records;

  // Appliquer le filtre de distance
  if (distanceFilter && distanceFilter !== "all") {
    const distanceValue = parseFloat(distanceFilter);
    filteredRecords = filteredRecords.filter(
      (record) => record.distance === distanceValue
    );
  }

  // Appliquer le tri
  if (sortConfig) {
    filteredRecords = [...filteredRecords].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortConfig.key) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "distance":
          aValue = a.distance;
          bValue = b.distance;
          break;
        case "time":
          aValue = timeStringToSeconds(a.time);
          bValue = timeStringToSeconds(b.time);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  return filteredRecords;
}

// Fonction utilitaire pour convertir le temps en secondes
function timeStringToSeconds(timeString: string): number {
  const parts = timeString.split(":").map((part) => parseInt(part, 10));

  if (parts.length === 3) {
    // Format HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // Format MM:SS
    return parts[0] * 60 + parts[1];
  }

  return 0;
}
