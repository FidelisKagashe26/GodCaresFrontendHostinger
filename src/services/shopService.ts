export interface ShopProductApi {
  id: number;
  title: string;
  price: number;
  original_price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  sold: number;
  is_choice: boolean;
  free_shipping: boolean;
  description: string;
  colors: string[];
  specs: string[];
}

export interface ShopOrderItemApi {
  title: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface ShopOrderTrackApi {
  tracking_code: string;
  full_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: ShopOrderItemApi[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");

export const getShopProducts = async (): Promise<ShopProductApi[]> => {
  const response = await fetch(`${API_BASE_URL}/api/shop/products/`);
  if (!response.ok) {
    throw new Error("Imeshindikana kupata bidhaa.");
  }
  return (await response.json()) as ShopProductApi[];
};

export const trackShopOrder = async (code: string): Promise<ShopOrderTrackApi> => {
  const response = await fetch(`${API_BASE_URL}/api/shop/track/?code=${encodeURIComponent(code)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.detail || "Imeshindikana kupata oda.");
  }
  return (await response.json()) as ShopOrderTrackApi;
};

