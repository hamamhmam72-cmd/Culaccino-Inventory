import { InventoryItem, Transaction, Role, ItemCategory } from "../types/inventory";

export const ITEMS_KEY = "culaccino_items";
export const TRANSACTIONS_KEY = "culaccino_transactions";
export const ROLE_KEY = "culaccino_role";
export const PIN_KEY = "culaccino_pin";
export const DEFAULT_PIN = "1234";

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return false;
  const hashed = await hashPin(pin);
  return hashed === stored;
}

export async function setPin(pin: string): Promise<void> {
  const hashed = await hashPin(pin);
  localStorage.setItem(PIN_KEY, hashed);
}

export const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

export const setStorageData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};

export const initializeStorage = () => {
  if (!localStorage.getItem(ROLE_KEY)) {
    localStorage.setItem(ROLE_KEY, "employee");
  }
  if (!localStorage.getItem(PIN_KEY)) {
    setPin(DEFAULT_PIN); // async, sets default PIN "1234"
  }
};
