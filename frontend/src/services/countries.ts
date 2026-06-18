export interface Country {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { name: 'India', flag: '🇮🇳', code: 'IN', dialCode: '+91' },
  { name: 'United States', flag: '🇺🇸', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB', dialCode: '+44' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA', dialCode: '+1' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU', dialCode: '+61' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG', dialCode: '+65' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE', dialCode: '+49' },
  { name: 'France', flag: '🇫🇷', code: 'FR', dialCode: '+33' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE', dialCode: '+971' },
  { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA', dialCode: '+966' },
  { name: 'South Africa', flag: '🇿🇦', code: 'ZA', dialCode: '+27' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR', dialCode: '+55' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP', dialCode: '+81' },
];
