export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Customer";
}

export interface Asset {
  id: number;
  name: string;
  asset_type: "Stock" | "Bond" | "Real Estate" | "Crypto" | "Fixed Deposit";
  risk_score: number;
  expected_return: number;
}

export interface AllocationItem {
  id: number;
  asset_class_id: number;
  asset: Asset;
  percentage: number;
  amount: number;
}

export interface Portfolio {
  id: number;
  capital: number;
  risk_level: number;
  name?: string;
  description?: string;
  allocations: AllocationItem[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CreateAssetPayload {
  name: string;
  asset_type: "Stock" | "Bond" | "Real Estate" | "Crypto" | "Fixed Deposit";
  risk_score: number;
  expected_return: number;
}

export interface UpdateAssetPayload {
  name?: string;
  asset_type?: "Stock" | "Bond" | "Real Estate" | "Crypto" | "Fixed Deposit";
  risk_score?: number;
  expected_return?: number;
}

export interface CreatePortfolioPayload {
  capital: number;
  risk_level: number;
}
