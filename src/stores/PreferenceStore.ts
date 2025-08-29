import { create } from "zustand";
import { UserPreferences } from "../types/user";
import { ApiUrl } from "../utils/api-url";
import { apiUtils } from "../hooks/useApi";

interface PreferenceState {
	getPreference: () => Promise<UserPreferences>;
	updatePreference: (preference: UserPreferences) => Promise<void>;
	resetPreference: () => Promise<UserPreferences>;
	getPreferenceByAdmin: (userId: string) => Promise<UserPreferences>;
}

export const usePreferenceStore = create<PreferenceState>(() => ({
	getPreference: async () => {
		try {
			const { data } = await apiUtils.get<UserPreferences>(ApiUrl.GET_DATA_SHARING_PREFERENCE);
			return data;
		} catch (error) {
			throw error;
		}
	},
	updatePreference: async (preference: UserPreferences) => {
		console.log("preference:", preference);
		
		try {
			await apiUtils.put<UserPreferences>(ApiUrl.UPDATE_DATA_SHARING_PREFERENCE, preference);
		} catch (error) {
			throw error;
		}
	},
	resetPreference: async () => {
		try {
			const { data } = await apiUtils.get<UserPreferences>(ApiUrl.GET_DATA_SHARING_PREFERENCE);
			return data;
		} catch (error) {
			throw error;
		}
	},
	getPreferenceByAdmin: async (userId: string) => {
		try {
			const { data } = await apiUtils.get<UserPreferences>(
				ApiUrl.parameterized(
					ApiUrl.GET_DATA_SHARING_PREFERENCE_BY_ADMIN,
					{ userId }
				)
			);
			return data;
		} catch (error) {
			throw error;
		}
	},
}));
