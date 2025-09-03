import { create } from "zustand";
import { CalendarEventType } from "../pages/Calendar";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import { extractErrorMessage } from "../utils/error-handler";

interface CalendarState {
  events: CalendarEventType[];
  getEvents: () => Promise<void>;
  addEvent: (event: CalendarEventType) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  getEvents: async () => {
    try {
      const { data } = await apiUtils.get<CalendarEventType[]>(
        ApiUrl.EVENTS
      );
      console.log("data:", data);
      
      set({ events: data });
    } catch (error) {
      if (extractErrorMessage(error).message === "EVENT_NOT_FOUND") {
        set({ events: [] });
        return;
      }
      throw error;
    }
  },

  addEvent: async (event: CalendarEventType) => {
    try {
      const { id, ..._ } = event;
      const { data } = await apiUtils.post<CalendarEventType>(
        ApiUrl.EVENTS,
        _
      );
      set({ events: [...get().events, data] });
    } catch (error) {
      throw error;
    }
  },

  deleteEvent: async (eventId: string) => {
    try {
      await apiUtils.del(ApiUrl.parameterized(ApiUrl.DELETE_EVENT, eventId));
      set({ events: get().events.filter((_) => _.id !== eventId) });
    } catch (error) {
      throw error;
    }
  },
}))