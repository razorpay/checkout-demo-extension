export type CTAVariant = 'disabled' | 'shadowless' | '';

export type CTAState = {
  showAmount?: boolean;
  showAmountVariant?: 'loading' | '';
  show?: boolean;
  label?: string;
  disabled?: boolean;
  labelData?: Record<string, string>;
  variant?: CTAVariant;
  onSubmit?: (...args: any) => void;
  onViewDetailsClick?: () => void;
};
