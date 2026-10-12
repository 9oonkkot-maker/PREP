export type Numeric = number | string;
export interface Menu { menu_id: string; name: string; price: Numeric; category: string; recipe_version: string }
export interface Material { material_id: string; name: string; unit: string; pack_quantity: Numeric; base_pack_price: Numeric; lead_days: number; safety_days: number; supplier_id: string }
export interface Recipe { recipe_version: string; menu_id: string; material_id: string; quantity: Numeric; unit: string; channel_only?: string }
export interface Price { material_id: string; effective_date: string; pack_price: Numeric; pack_quantity: Numeric }
export interface Calendar { date: string; is_open: boolean; record_complete: boolean; weather: string; note: string }
export interface Sale { sale_id: string; date: string; menu_id: string; channel: '매장' | '포장'; quantity: number; unit_price: Numeric; discount_amount: Numeric; net_sales: Numeric; payment_fee: Numeric | null; recipe_version: string; unit_food_cost_snapshot: Numeric | null; unit_packaging_cost_snapshot: Numeric | null }
export interface InventoryEvent { event_id: string; date: string; material_id: string; event_type: string; quantity: Numeric; unit: string; counted_quantity?: Numeric; [key: string]: unknown }
export interface Dataset { meta: Record<string, unknown>; settings: Record<string, unknown>; suppliers: { supplier_id: string; name: string; data_class?: string }[]; materials: Material[]; menus: Menu[]; recipes: Recipe[]; price_history: Price[]; calendar: Calendar[]; sales: Sale[]; opening_inventory: {material_id: string; date: string; quantity: Numeric; unit: string}[]; inventory_events: InventoryEvent[]; expenses: {expense_id: string; date: string; category: string; amount: Numeric; recognition: string; [key: string]: unknown}[]; monthly_expense_plan: {month: string; category: string; amount: Numeric}[] }
export interface Draft { date: string; menu_id: string; channel: '매장' | '포장'; quantity: string; unit_price: string; discount_amount: string; payment_fee: string }
export interface AppMeta { id: string; initialized: boolean; revision: number; savedAt: string; rulesVersion: number }
