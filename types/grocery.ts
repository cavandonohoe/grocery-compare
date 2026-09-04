export type GroceryList = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GroceryListItem = {
  id: string;
  groceryListId: string;
  rawText: string;
  normalizedName: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  createdAt: Date;
};
