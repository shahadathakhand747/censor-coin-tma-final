export interface CensorCoinUserState {
  schema_version: 1;
  membership_verified: boolean;
  reg_status: 'unregistered' | 'registered';
  referral_code: string;
  username: string;
  first_name: string;
  profile_photo_url: string | null;
  total_points: number;
  total_refers: number;
  today_tasks_completed: number;
  claim_codes_used: string[];
  youtube_task_completed: boolean;
  tiktok_task_completed: boolean;
  last_daily_reset: string;
  last_referral_check_date: string;
  ton_address: string;
  last_ton_address_change: string;
  language: 'en' | 'bn' | 'hi' | 'es' | 'ar' | 'de';
}

export const DEFAULT_USER_STATE: CensorCoinUserState = {
  schema_version: 1,
  membership_verified: false,
  reg_status: 'unregistered',
  referral_code: '',
  username: '',
  first_name: '',
  profile_photo_url: null,
  total_points: 0,
  total_refers: 0,
  today_tasks_completed: 0,
  claim_codes_used: [],
  youtube_task_completed: false,
  tiktok_task_completed: false,
  last_daily_reset: '',
  last_referral_check_date: '',
  ton_address: '',
  last_ton_address_change: '',
  language: 'en',
};

export const CLOUD_STORAGE_KEY = 'censorCoinUser_v1';
export const MAX_STORAGE_SIZE = 4096;

export const ALLOWED_CLAIM_PREFIXES = [
  'S9t', 'RSt', 'J9r', 'X4k', 'P7m', 'T2w', 'L5n', 'Q8v', 'Z3b', 'A6h',
  'B1f', 'C9g', 'D4y', 'E7p', 'F2c', 'G5x', 'H8d', 'I3e', 'K6j', 'M1r',
  'N4s', 'O7l', 'R2u', 'V5t', 'W8i',
];
