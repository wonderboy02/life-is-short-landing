// Supabase Database Types

export interface Group {
  id: string;
  comment: string;
  contact: string;
  password_hash: string;
  share_code: string | null;
  creator_nickname: string;
  created_at: string;
  updated_at: string;
  video_status: 'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null;
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
  createdAt: string;
  videoStatus: 'pending' | 'requested' | 'processing' | 'completed' | 'failed' | null;
  token: string;
}

export interface VideoRequestResponse {
  videoStatus: string;
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

// Worker System Types

export interface VideoTask {
  id: string;
  batch_id: string | null; // 사용 안 함 (nullable for backward compatibility)
  group_id: string;
  photo_id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  leased_until: string | null;
  worker_id: string | null;
  error_message: string | null;
  retry_count: number;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  generated_video_url: string | null;
  veo_operation_id: string | null;
  is_email_sent: boolean | null;
  frame_num: number | null; // 프레임 수 (24 * 초 + 1, null이면 기본값 121)
  created_at: string;
  updated_at: string;
}

export interface TaskAddRequest {
  group_id: string;
  tasks: Array<{
    photo_id: string;
    prompt: string;
    repeat_count: number; // 1 이상
    duration_seconds?: number; // 영상 길이 (초), null이면 기본값 5초
  }>;
}

export interface TaskQueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface TaskItem {
  id: string;
  prompt: string;
  status: string;
  worker_id: string | null;
  generated_video_url: string | null;
  error_message: string | null;
  created_at: string;
}

export interface PhotoGroup {
  photo_id: string;
  photo_url: string;
  tasks: TaskItem[];
}

export interface GroupTasksResponse {
  group_id: string;
  stats: TaskQueueStats;
  photos: PhotoGroup[];
}

export interface WorkerNextTaskResponse {
  item_id: string;
  group_id: string;
  photo_id: string;
  prompt: string;
  leased_until: string;
  photo_storage_path: string;
  frame_num: number | null; // 프레임 수 (null이면 Worker가 기본값 121 사용)
}
