import { env } from "@/env"

interface AbacateResponse<T> {
  data: T
  error: string | null
  success: boolean
}

class AbacatePayClient {
  private baseUrl = "https://api.abacatepay.com/v2"
  private token = env.ABACATEPAY_API_KEY

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    const result = (await response.json()) as AbacateResponse<T>

    if (!result.success) {
      throw new Error(result.error || "Erro na chamada da AbacatePay")
    }

    return result.data
  }

  async createCustomer(body: any) {
    return this.request<any>("/customers/create", {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async createBilling(body: any) {
    return this.request<any>("/billing/create", {
      method: "POST",
      body: JSON.stringify(body),
    })
  }
}

export const abacatePay = new AbacatePayClient()