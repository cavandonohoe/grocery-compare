import type { StoreProduct } from "@/types/store";

export const mockProducts: StoreProduct[] = [
  {
    externalId: "ralphs-milk-1",
    storeSlug: "ralphs",
    name: "2% Reduced Fat Milk",
    brand: "Kroger",
    size: "1 gal",
    category: "Dairy",
    price: 4.49,
    unitPrice: 4.49
  },
  {
    externalId: "vons-milk-1",
    storeSlug: "vons",
    name: "2% Reduced Fat Milk",
    brand: "Lucerne",
    size: "1 gal",
    category: "Dairy",
    price: 4.79,
    unitPrice: 4.79
  },
  {
    externalId: "ralphs-eggs-1",
    storeSlug: "ralphs",
    name: "Large Grade AA Eggs",
    brand: "Kroger",
    size: "12 ct",
    category: "Dairy",
    price: 3.99,
    unitPrice: 0.33
  },
  {
    externalId: "vons-eggs-1",
    storeSlug: "vons",
    name: "Large Grade AA Eggs",
    brand: "Signature Select",
    size: "12 ct",
    category: "Dairy",
    price: 3.49,
    unitPrice: 0.29
  },
  {
    externalId: "ralphs-bread-1",
    storeSlug: "ralphs",
    name: "Sourdough Bread",
    brand: "Private Selection",
    size: "24 oz",
    category: "Bakery",
    price: 4.99,
    unitPrice: 0.21
  },
  {
    externalId: "vons-bread-1",
    storeSlug: "vons",
    name: "Sourdough Bread",
    brand: "Signature Select",
    size: "24 oz",
    category: "Bakery",
    price: 5.49,
    unitPrice: 0.23
  },
  {
    externalId: "ralphs-bananas-1",
    storeSlug: "ralphs",
    name: "Bananas",
    size: "1 lb",
    category: "Produce",
    price: 0.69,
    unitPrice: 0.69
  },
  {
    externalId: "vons-bananas-1",
    storeSlug: "vons",
    name: "Bananas",
    size: "1 lb",
    category: "Produce",
    price: 0.79,
    unitPrice: 0.79
  },
  {
    externalId: "ralphs-yogurt-1",
    storeSlug: "ralphs",
    name: "Plain Greek Yogurt",
    brand: "Kroger",
    size: "32 oz",
    category: "Dairy",
    price: 5.79,
    unitPrice: 0.18
  },
  {
    externalId: "vons-yogurt-1",
    storeSlug: "vons",
    name: "Plain Greek Yogurt",
    brand: "Open Nature",
    size: "32 oz",
    category: "Dairy",
    price: 5.49,
    unitPrice: 0.17
  }
];
