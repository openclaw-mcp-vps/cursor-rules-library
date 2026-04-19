export type Rule = {
  slug: string;
  name: string;
  framework: string;
  language: string;
  tags: string[];
  description: string;
  content: string;
  updatedAt: string;
  featured: boolean;
  weeklyNew: boolean;
};

export type PurchaseRecord = {
  orderId: string;
  customerEmail: string;
  status: "paid" | "refunded" | "pending";
  productId?: string;
  variantId?: string;
  createdAt: string;
  updatedAt: string;
  sourceEvent: string;
};
