"use client";

import * as React from "react";
import { CreditCard, Download, FileText, Plus, Receipt, Calendar, HardDrive, Users, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";

const invoices = [
  { id: "INV-2025-001", date: "Jun 1, 2025", amount: "$29.00", status: "Paid", plan: "Pro Monthly" },
  { id: "INV-2025-002", date: "May 1, 2025", amount: "$29.00", status: "Paid", plan: "Pro Monthly" },
  { id: "INV-2025-003", date: "Apr 1, 2025", amount: "$29.00", status: "Paid", plan: "Pro Monthly" },
  { id: "INV-2025-004", date: "Mar 1, 2025", amount: "$29.00", status: "Paid", plan: "Pro Monthly" },
  { id: "INV-2025-005", date: "Feb 1, 2025", amount: "$29.00", status: "Paid", plan: "Pro Monthly" },
  { id: "INV-2025-006", date: "Jan 1, 2025", amount: "$29.00", status: "Paid", plan: "Pro Monthly" },
];

const transactions = [
  { id: 1, description: "Pro Plan - Monthly Subscription", date: "Jun 1, 2025", amount: "$29.00", method: "Visa ending in 4242" },
  { id: 2, description: "Pro Plan - Monthly Subscription", date: "May 1, 2025", amount: "$29.00", method: "Visa ending in 4242" },
  { id: 3, description: "Marketplace: Ar. Priya Sharma Consultation", date: "Apr 28, 2025", amount: "$150.00", method: "Visa ending in 4242" },
  { id: 4, description: "Pro Plan - Monthly Subscription", date: "Apr 1, 2025", amount: "$29.00", method: "Visa ending in 4242" },
];

export default function BillingPage() {
  const { addToast } = useUIStore();
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Billing</h1>
        <p className="text-slate-500">Manage your billing information and view payment history.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Current Plan */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant="info">Active Plan</Badge>
                  <h2 className="text-xl font-bold mt-2">Pro Plan</h2>
                  <p className="text-sm text-slate-500">Unlimited AI generations, 20 team seats, priority support</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">$29<span className="text-lg text-slate-400 font-normal">/mo</span></p>
                  <p className="text-xs text-slate-500 mt-1">Next billing: Jul 1, 2025</p>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-primary w-3/4" />
              </div>
              <p className="text-xs text-slate-500">15 / 20 Team Seats Used</p>
            </div>
          </Card>

          {/* Payment History */}
          <div>
            <h2 className="text-lg font-bold mb-4">Payment History</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left p-4 font-semibold text-slate-500">Description</th>
                      <th className="text-left p-4 font-semibold text-slate-500">Date</th>
                      <th className="text-left p-4 font-semibold text-slate-500">Amount</th>
                      <th className="text-left p-4 font-semibold text-slate-500">Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <td className="p-4 font-medium">{tx.description}</td>
                        <td className="p-4 text-slate-500">{tx.date}</td>
                        <td className="p-4 font-medium">{tx.amount}</td>
                        <td className="p-4 text-slate-500">{tx.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Invoices */}
          <div>
            <h2 className="text-lg font-bold mb-4">Invoices</h2>
            <Card>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{inv.id}</p>
                        <p className="text-xs text-slate-500">{inv.date} - {inv.plan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{inv.amount}</span>
                      <Badge variant="success">{inv.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => addToast("Invoice downloaded successfully", "success")}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <div className="p-6">
              <h3 className="font-bold mb-4">Payment Method</h3>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl mb-4">
                <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center font-bold text-xs text-primary italic">VISA</div>
                <div>
                  <p className="font-semibold text-sm">Visa ending in 4242</p>
                  <p className="text-xs text-slate-500">Expires 12/28</p>
                </div>
              </div>
              <Button className="w-full" variant="outline" onClick={() => setShowPaymentModal(true)}>
                <Plus className="w-4 h-4" /> Update Payment Method
              </Button>
            </div>
          </Card>

          {/* Usage Summary */}
          <Card>
            <div className="p-6">
              <h3 className="font-bold mb-4">Usage Summary</h3>
              <div className="space-y-4">
                {[
                  { icon: Wand2, label: "AI Generations", value: "48 / 100", percent: 48, color: "bg-primary" },
                  { icon: HardDrive, label: "Storage", value: "2.4 / 10 GB", percent: 24, color: "bg-blue-500" },
                  { icon: Users, label: "Team Members", value: "5 / 20", percent: 25, color: "bg-purple-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Next Billing */}
          <Card>
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Next Billing Date</p>
                <p className="font-bold">July 1, 2025</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Update Payment Method" size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Number</label>
            <input type="text" placeholder="4242 4242 4242 4242" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry</label>
              <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CVC</label>
              <input type="text" placeholder="123" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => { addToast("Payment method updated successfully", "success"); setShowPaymentModal(false); }}>Save</Button>
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
