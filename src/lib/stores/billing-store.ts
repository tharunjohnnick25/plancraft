import { create } from "zustand";
import { mockInvoices, mockPaymentMethods, type Invoice, type PaymentMethod } from "@/lib/api/mock-db";

type Plan = "free" | "pro" | "enterprise";

interface BillingState {
  currentPlan: Plan;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  upgradeLoading: boolean;
  upgradePlan: (plan: Plan) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, "id" | "userId">) => Promise<void>;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  downloadInvoice: (id: string) => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  currentPlan: "pro",
  invoices: mockInvoices,
  paymentMethods: mockPaymentMethods,
  isLoading: false,
  upgradeLoading: false,

  upgradePlan: async (plan) => {
    set({ upgradeLoading: true });
    await new Promise(r => setTimeout(r, 1500));
    const newInvoice: Invoice = {
      id: `inv${Date.now()}`,
      userId: "u1",
      amount: plan === "pro" ? 2499 : 8299,
      currency: "INR",
      status: "paid",
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
      createdAt: new Date().toISOString(),
      dueAt: new Date().toISOString(),
      planName: plan.charAt(0).toUpperCase() + plan.slice(1),
    };
    set(state => ({
      currentPlan: plan,
      invoices: [newInvoice, ...state.invoices],
      upgradeLoading: false,
    }));
  },

  addPaymentMethod: async (method) => {
    await new Promise(r => setTimeout(r, 1000));
    const newMethod: PaymentMethod = {
      id: `pm${Date.now()}`,
      userId: "u1",
      ...method,
    };
    set(state => ({
      paymentMethods: [...state.paymentMethods, newMethod],
    }));
  },

  removePaymentMethod: (id) => {
    set(state => ({
      paymentMethods: state.paymentMethods.filter(pm => pm.id !== id),
    }));
  },

  setDefaultPaymentMethod: (id) => {
    set(state => ({
      paymentMethods: state.paymentMethods.map(pm => ({ ...pm, isDefault: pm.id === id })),
    }));
  },

  downloadInvoice: (id) => {
    const invoice = get().invoices.find(i => i.id === id);
    if (!invoice) return;
    const blob = new Blob([`Invoice ${id}\n${invoice.description}\nAmount: ₹${invoice.amount}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
