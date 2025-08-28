export type SortablePRKey = "date" | "distance" | "time";
export type SortDirection = "ascending" | "descending";

export interface PersonalRecord {
  id?: string;
  user_id?: string;
  distance: number;
  time: string;
  timeInSeconds?: number;
  pace?: string;
  date: string;
  notes?: string;
  location?: string;
  weather?: {
    temperature?: number;
    conditions?: string;
    humidity?: number;
    windSpeed?: number;
  };
  heartRate?: {
    average?: number;
    max?: number;
    min?: number;
  };
  elevation?: {
    gain?: number;
    loss?: number;
    maxAltitude?: number;
  };
  splits?: Array<{
    distance: number;
    time: string;
    pace: string;
  }>;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PRStats {
  totalRecords: number;
  bestOverallPace: number;
  longestDistance: number;
  recentRecords: PersonalRecord[];
  distanceBreakdown: Array<{
    distance: number;
    time: number;
    date: string;
  }>;
  recordsByDistance: Record<number, PersonalRecord>;
}

export interface PRState {
  // États
  originalPRs: PersonalRecord[];
  processedPRs: PersonalRecord[];
  sortConfig: { key: SortablePRKey; direction: SortDirection } | null;
  distanceFilter: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions API (avec async)
  getAllRecords: (
    distance?: string,
    sort?: SortablePRKey,
    order?: "asc" | "desc",
    limit?: number
  ) => Promise<PersonalRecord[]>;
  getRecordById: (id: string) => Promise<PersonalRecord>;
  createRecord: (prData: PersonalRecord) => Promise<PersonalRecord>;
  updateRecord: (pr: PersonalRecord) => Promise<PersonalRecord>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsStats: () => Promise<any>;
  getBestRecordByDistance: (distance: number) => Promise<PersonalRecord>;

  // Actions UI (sans async)
  addPR: (pr: PersonalRecord) => Promise<void>;
  updatePR: (pr: PersonalRecord) => Promise<void>;
  deletePR: (id: string) => Promise<void>;
  setSortConfig: (key: SortablePRKey, direction?: SortDirection) => void;
  setDistanceFilter: (filter: string | null) => void;
  clearError: () => void;
}
