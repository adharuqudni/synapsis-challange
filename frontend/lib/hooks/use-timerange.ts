import { create } from 'zustand';

export type TimeRange = {
  startDate: string;
  endDate: string;
};

interface TimeRangeState {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
}

export const useTimeRangeStore = create<TimeRangeState>((set) => ({
  timeRange: {
    startDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    endDate: new Date().toISOString(),
  },
  setTimeRange: (range) => set({ timeRange: range }),
}));
