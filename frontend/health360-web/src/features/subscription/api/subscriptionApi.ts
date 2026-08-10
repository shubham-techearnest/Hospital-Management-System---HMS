export interface HospitalSubscription {
  status: string;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  plan: {
    id: string;
    code: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    billingCycle: string;
  };
  usage: Record<string, { used: number; limit: number; remaining: number }>;
  features: Record<string, boolean>;
}
