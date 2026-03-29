import { create } from "zustand";
import type {
  Location,
  LatLng,
  Place,
  Room,
  Member,
  PlaceFilter,
  SortBy,
  ResultCount,
  AppView,
} from "@/types";

interface AppState {
  // Locations
  locations: Location[];
  myLocation: Location | null;

  // Results
  midpoint: LatLng | null;
  places: Place[];
  filter: PlaceFilter;
  sortBy: SortBy;
  resultCount: ResultCount;
  radius: number;

  // Group
  room: Room | null;
  members: Member[];

  // UI
  view: AppView;
  isSearching: boolean;

  // Actions
  setMyLocation: (location: Location) => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  removeLocation: (id: string) => void;
  setMidpoint: (midpoint: LatLng | null) => void;
  setPlaces: (places: Place[]) => void;
  setFilter: (filter: PlaceFilter) => void;
  setSortBy: (sortBy: SortBy) => void;
  setResultCount: (count: ResultCount) => void;
  setRadius: (radius: number) => void;
  setView: (view: AppView) => void;
  setIsSearching: (searching: boolean) => void;
  setRoom: (room: Room | null) => void;
  setMembers: (members: Member[]) => void;
  reset: () => void;
}

const initialState = {
  locations: [],
  myLocation: null,
  midpoint: null,
  places: [],
  filter: "all" as PlaceFilter,
  sortBy: "distance" as SortBy,
  resultCount: 10 as ResultCount,
  radius: 1000,
  room: null,
  members: [],
  view: "input" as AppView,
  isSearching: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setMyLocation: (location) =>
    set((state) => {
      const existing = state.locations.findIndex((l) => l.id === location.id);
      const locations =
        existing >= 0
          ? state.locations.map((l) => (l.id === location.id ? location : l))
          : [location, ...state.locations.slice(0, 3)];
      return { myLocation: location, locations };
    }),

  addLocation: (location) =>
    set((state) => ({
      locations: [...state.locations, location].slice(0, 4),
    })),

  updateLocation: (id, updates) =>
    set((state) => ({
      locations: state.locations.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  removeLocation: (id) =>
    set((state) => ({
      locations: state.locations.filter((l) => l.id !== id),
    })),

  setMidpoint: (midpoint) => set({ midpoint }),
  setPlaces: (places) => set({ places }),
  setFilter: (filter) => set({ filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setResultCount: (count) => set({ resultCount: count }),
  setRadius: (radius) => set({ radius }),
  setView: (view) => set({ view }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  setRoom: (room) => set({ room }),
  setMembers: (members) => set({ members }),
  reset: () => set(initialState),
}));
