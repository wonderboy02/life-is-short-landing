// Supabase Database Types

export interface Group {
  id: string;
  comment: string;
  password_hash: string;
  share_code: string;
  creator_nickname: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  group_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploader_nickname: string;
  description: string | null;
  created_at: string;
}

export interface PhotoWithUrl extends Photo {
  url: string;
}

// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GroupCreateResponse {
  shareCode: string;
  groupId: string;
  comment: string;
  creatorNickname: string;
}

export interface GroupVerifyResponse {
  groupId: string;
  comment: string;
  creatorNickname: string;
  token: string;
}

export interface PhotoUploadResponse {
  photoId: string;
  url: string;
}

export interface PhotoListResponse {
  photos: PhotoWithUrl[];
  total: number;
}

export interface VerifyPasswordResponse {
  valid: boolean;
}
