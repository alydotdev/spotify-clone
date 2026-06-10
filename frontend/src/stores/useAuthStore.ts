import { axiosInstance } from "@/lib/axios";
import {create} from "zustand";
interface AuthStore {
    isAdmin : boolean;
    isLoading: boolean;
    error: string | null;
    checkAdminStatus: ()=> Promise<void>;
    reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
     isAdmin: false,
     isLoading: false,
     error: null,
     checkAdminStatus: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/admin/check");
            set({ isAdmin: response.data.isAdmin });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            set({
                isAdmin: false,
                error: err.response?.data?.message ?? err.message ?? "Failed to verify admin access",
            });
        } finally {
            set({ isLoading: false });
        }
     },
     reset: () => set({isAdmin: false, isLoading: false, error: null}),
}))