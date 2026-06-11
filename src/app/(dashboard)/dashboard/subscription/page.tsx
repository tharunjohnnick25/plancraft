"use client";

import * as React from "react";
import { Check, X, Zap, Building, Users, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["5 AI generations", "2 projects", "500 MB storage", "Basic templates", "1 team seat"],
    missing: ["Advanced analytics", "Priority support", "Custom branding", "API access"],
    current: false,
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For professionals and small teams",
    features: ["Unlimited AI generations", "Unlimited projects", "10 GB storage", "All templates", "20 team seats", "Advanced analytics", "Priority support", "API access"],
    missing: [],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    description: "For large organizations",
    features: ["Everything in Pro", "Unlimited storage", "Unlimited team seats", "Custom branding", "Dedicated support", "SSO & SAML", "Audit logs", "Custom integrations"],
    missing: [],
    current: false,
    popular: false,
  },
];

const planComparison = [
  { feature: "AI Generations", free: "5/mo", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Projects", free: "2", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Storage", free: "500 MB", pro: "10 GB", enterprise: "Unlimited" },
  { feature: "Team Seats", free: "1", pro: "20", enterprise: "Unlimited" },
  { feature: "Templates", free: "Basic", pro: "All", enterprise: "All + Custom" },
  { feature: "Analytics", free: "—", pro: "Advanced", enterprise: "Advanced + Custom" },
  { feature: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated" },
  { feature: "API Access", free: "—", pro: "✓", enterprise: "✓" },
  { feature: "SSO/SAML", free: "—", pro: "—", enterprise: "✓" },
];

export default function SubscriptionPage() {
  const { addToast } = useUIStore();
  const [isAnnual, setIsAnnual] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showChangeModal, setShowChangeModal] = React.useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Subscription</h1>
        <p className="text-slate-500">Manage your plan and billing cycle.</p>
      </div>

      {/* Annual / Monthly Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-slate-400"}`}>Monthly</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAnnual ? "translate-x-8" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-slate-400"}`}>Annual <span className="text-success text-xs">Save 20%</span></span>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative rounded-2xl border p-6 lg:p-8 ${
              plan.current
                ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                : "border-slate-200 dark:border-slate-800 glass-card dark:glass-card-dark"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="info">Most Popular</Badge>
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 right-6">
                <Badge variant="success">Current Plan</Badge>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{isAnnual ? `$${Math.round(parseInt(plan.price.replace("$","")) * 10 * 0.8)}` : plan.price}</span>
                <span className="text-slate-400 text-sm">{isAnnual ? "/yr" : plan.period}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
              {plan.missing.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.current ? "outline" : plan.popular ? "primary" : "secondary"}
              onClick={() => {
                if (plan.current) {
                  setShowCancelModal(true);
                } else {
                  setShowChangeModal(plan.name);
                }
              }}
            >
              {plan.current ? "Cancel Subscription" : `Change to ${plan.name}`}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Plan Comparison Table */}
      <div>
        <h2 className="text-lg font-bold mb-4">Plan Comparison</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold text-primary">Pro</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {planComparison.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center text-slate-500">{row.free}</td>
                    <td className="p-4 text-center text-primary font-medium">{row.pro}</td>
                    <td className="p-4 text-center text-slate-500">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Subscription" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <p className="text-sm text-warning font-medium">Downgrading will remove access to Pro features immediately.</p>
          </div>
          <p className="text-sm text-slate-500">Are you sure you want to cancel your Pro subscription? You will lose access to advanced features, unlimited generations, and priority support.</p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => { addToast("Subscription cancelled. You'll be downgraded at end of billing period.", "info"); setShowCancelModal(false); }}>Confirm Cancel</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowCancelModal(false)}>Keep Plan</Button>
          </div>
        </div>
      </Modal>

      {/* Change Plan Modal */}
      <Modal isOpen={showChangeModal !== null} onClose={() => setShowChangeModal(null)} title={`Change to ${showChangeModal} Plan`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Are you sure you want to switch to the {showChangeModal} plan? Your next bill will reflect the new pricing.</p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => { addToast(`Successfully changed to ${showChangeModal} plan`, "success"); setShowChangeModal(null); }}>Confirm Change</Button>
            <Button variant="secondary" onClick={() => setShowChangeModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
