import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  company?: {
    _id: string;
    name: string;
  };
}

// Define the shape of the auth state
interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  activeProject: string | null; // This is the code (e.g. MOE)
  activeProjectId: string | null; // This is the ObjectId
  onLogin: (user: User) => void;
  onLogout: () => void;
  setActiveProject: (project: string | null) => void;
  setActiveProjectId: (projectId: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Create the Zustand store
const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  activeProject: null,
  activeProjectId: null,
  onLogin: (user) => set({ user, isAuthenticated: true, loading: false }),
  onLogout: () => set({ user: null, isAuthenticated: false, loading: false }),
  setActiveProject: (project) => set({ activeProject: project }),
  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
  setLoading: (loading: boolean) => set({ loading }),
}));

export default useAuthStore;
