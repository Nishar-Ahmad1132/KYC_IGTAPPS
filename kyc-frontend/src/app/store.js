import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useKycStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      ocrData: null,
      similarity: null,
      kycStatus: null,

      // =========================
      // SETTERS
      // =========================
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setOcrData: (data) => set({ ocrData: data }),
      setSimilarity: (score) => set({ similarity: score }),
      setKycStatus: (status) => set({ kycStatus: status }),

      // =========================
      // LOGOUT
      // =========================
      logout: () =>
        set({
          user: null,
          token: null,
          ocrData: null,
          similarity: null,
          kycStatus: null,
        }),
    }),
    {
      name: "kyc-storage", // stored in localStorage
    },
  ),
);
