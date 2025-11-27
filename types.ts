export enum Category {
  // --- INCOME ---
  SALARY = 'Salary',
  ART_INCOME = 'Art Income', // Sales, exhibitions, workshops
  GRANTS = 'Grants & Scholarships',
  BONUS = 'Bonus & Allowance',
  INVESTMENT = 'Investment',
  GIFT_IN = 'Gifts Received',
  REFUNDS = 'Refunds',
  OTHER_INCOME = 'Other Income',

  // --- EXPENSE 1: Living Basic ---
  FOOD = 'Food & Drink',
  HOUSING = 'Housing & Utilities', // Rent, electricity, furniture
  TRANSPORT = 'Transport',

  // --- EXPENSE 2: Health ---
  MEDICAL = 'Medical',
  FITNESS = 'Fitness',
  SUPPLEMENTS = 'Supplements',

  // --- EXPENSE 3: Personal ---
  CLOTHING = 'Clothing',
  DAILY_SUPPLIES = 'Daily Supplies',
  CLEANING = 'Cleaning',
  ELECTRONICS = 'Electronics (3C)',
  PERSONAL_CARE = 'Personal Care',

  // --- EXPENSE 4: Learning ---
  EDUCATION = 'Education & Books',
  SOFTWARE = 'Software & Cloud',

  // --- EXPENSE 5: Art Creation ---
  ART_MATERIALS = 'Art Materials',
  EQUIPMENT = 'Equipment',
  MAINTENANCE = 'Maintenance',

  // --- EXPENSE 6: Project & Exhibition ---
  EXHIBITION_PROD = 'Exhibition Production',
  SPACE_LOGISTICS = 'Space & Logistics',
  LABOR = 'Labor & Outsource',

  // --- EXPENSE 7: Entertainment ---
  ENTERTAINMENT = 'Entertainment',
  TRAVEL = 'Travel',

  // --- EXPENSE 8: Finance ---
  FEES = 'Bank & Fees',
  INSURANCE_TAX = 'Insurance & Tax',
  TELECOM = 'Telecom & Internet',

  // --- EXPENSE 9: Family ---
  FAMILY = 'Family Support',
  GIFT_OUT = 'Gifts Given',

  OTHER_EXPENSE = 'Other Expense'
}

// Helper for UI Grouping
export const CATEGORY_GROUPS = {
  "Income Classification": [
    Category.SALARY, Category.ART_INCOME, Category.GRANTS, Category.BONUS, 
    Category.INVESTMENT, Category.GIFT_IN, Category.REFUNDS, Category.OTHER_INCOME
  ],
  "1. Living Basic": [Category.FOOD, Category.HOUSING, Category.TRANSPORT],
  "2. Health & Body": [Category.MEDICAL, Category.FITNESS, Category.SUPPLEMENTS],
  "3. Personal & Daily": [Category.CLOTHING, Category.DAILY_SUPPLIES, Category.CLEANING, Category.ELECTRONICS, Category.PERSONAL_CARE],
  "4. Learning & Tools": [Category.EDUCATION, Category.SOFTWARE],
  "5. Art Creation": [Category.ART_MATERIALS, Category.EQUIPMENT, Category.MAINTENANCE],
  "6. Project & Exhibition": [Category.EXHIBITION_PROD, Category.SPACE_LOGISTICS, Category.LABOR],
  "7. Leisure": [Category.ENTERTAINMENT, Category.TRAVEL],
  "8. Finance & Admin": [Category.FEES, Category.INSURANCE_TAX, Category.TELECOM],
  "9. Family & Social": [Category.FAMILY, Category.GIFT_OUT],
  "Other": [Category.OTHER_EXPENSE]
};

export const INCOME_CATEGORIES = CATEGORY_GROUPS["Income Classification"];

export interface TransactionItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface Project {
  id: string;
  name: string;
  budget: number;
  description?: string;
  status: 'active' | 'archived';
  startDate?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  merchant: string;
  amount: number;
  category: Category;
  items: TransactionItem[];
  tags: string[]; // Hashtags
  projectId?: string; // Link to a project
  note?: string;
  receiptImage?: string; // Base64
}

export interface Budget {
  category: Category;
  limit: number;
}

export type ViewState = 'auth' | 'dashboard' | 'projects' | 'scan' | 'insights' | 'settings' | 'list';

export interface ScanResult {
  merchant: string;
  date: string;
  total: number;
  category: Category;
  items: TransactionItem[];
  tags?: string[];
}