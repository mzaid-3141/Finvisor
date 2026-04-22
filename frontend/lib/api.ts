import {
  User,
  Asset,
  Portfolio,
  LoginResponse,
  CreateAssetPayload,
  UpdateAssetPayload,
  CreatePortfolioPayload,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("finvisor_token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("finvisor_token");
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/users/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: "Admin" | "Customer"
): Promise<User> {
  return apiFetch<User>("/users/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/users/auth/me");
}

export async function getAssets(): Promise<Asset[]> {
  return apiFetch<Asset[]>("/assets/");
}

export async function getAsset(id: number): Promise<Asset> {
  return apiFetch<Asset>(`/assets/${id}`);
}

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  return apiFetch<Asset>("/assets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAsset(
  id: number,
  payload: UpdateAssetPayload
): Promise<Asset> {
  return apiFetch<Asset>(`/assets/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAsset(id: number): Promise<void> {
  return apiFetch<void>(`/assets/${id}`, {
    method: "DELETE",
  });
}

export async function getPortfolios(): Promise<Portfolio[]> {
  return apiFetch<Portfolio[]>("/portfolios/");
}

export async function createPortfolio(
  payload: CreatePortfolioPayload
): Promise<Portfolio> {
  return apiFetch<Portfolio>("/portfolios/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPortfolio(id: number): Promise<Portfolio> {
  return apiFetch<Portfolio>(`/portfolios/${id}`);
}

export async function deletePortfolio(id: number): Promise<void> {
  return apiFetch<void>(`/portfolios/${id}`, {
    method: "DELETE",
  });
}
