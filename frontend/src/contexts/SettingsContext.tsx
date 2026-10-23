import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface Settings {
  shopName: string;
  shopAddress: string;
  phone: string;
  email: string;
  currencySymbol: string;
  currencyPosition: string;
  invoicePrefix: string;
  invoiceNotes?: string;
  signatureImage?: string;
  yearlyInvoiceReset?: boolean;
  allowEditSaleInvoice?: boolean;
  allowEditPurchaseInvoice?: boolean;
  enableCustomerRates?: boolean;
}

interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  formatCurrency: (amount: number | string) => string;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
  formatCurrency: (amount: number | string) => `RM ${Number(amount).toFixed(2)}`,
});

export const useSettings = () => useContext(SettingsContext);

const normalizeCurrencyValue = (amount: number | string) => {
  const num = Number(amount) || 0;
  if (!Number.isFinite(num)) {
    return 0;
  }
  return Math.trunc(num * 100) / 100;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!localStorage.getItem('token'), // Prevent fetching when not logged in
  });

  const formatCurrency = (amount: number | string) => {
    const num = normalizeCurrencyValue(amount);
    const formatted = num.toFixed(2);
    const symbol = settings?.currencySymbol || 'RM';
    const position = settings?.currencyPosition || 'before';
    
    if (position === 'after') {
      return `${formatted} ${symbol}`;
    }
    return `${symbol} ${formatted}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};
