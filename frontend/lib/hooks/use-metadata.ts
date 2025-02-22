import { create } from 'zustand';

export type MetaData = {
  people_in: number;
  people_out: number;
  currently_inside: number;
  currently_outside: number;
  frame_width: number;
  frame_height: number;
};

interface MetadataState {
  metadata: MetaData ;
  setMetadata: (data: MetaData) => void;
}

export const useMetadataStore = create<MetadataState>((set) => ({
  metadata: {
    people_in: 0,
    people_out: 0,
    currently_inside: 0,
    currently_outside: 0,
    frame_width: 0,
    frame_height: 0
  },
  setMetadata: (data) => set({ metadata: data }),
}));
