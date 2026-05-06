// Định nghĩa interface cho Tướng (Champion) dựa trên JSON của bạn
export interface ApiChampion {
  id: number;
  name: string;
  slug: string;
  cost: number;
  icon_path: string;
}

// Định nghĩa (tùy chọn) cho Milestone nếu cấu trúc của bạn cố định là unit & effect
export interface ApiMilestone {
  unit: number;
  effect: string;
  // Thêm các trường khác nếu có (ví dụ: count, desc, v.v.)
  [key: string]: any; 
}

// Cập nhật lại ApiTrait
export interface ApiTrait {
  id: number;
  name: string;
  slug: string;               // <-- Thêm mới
  description: string | null;
  tier: string | null;
  placement: number | null;
  top4: string | null;
  pick_count: string | null;
  pick_percent: string | null;
  image: string | null;
  milestones: Record<string, unknown>[] | ApiMilestone[]; // Có thể dùng ApiMilestone[] cho chuẩn xác
  champions: ApiChampion[];   // <-- Thêm mới
  created_at: string;         // <-- Thêm mới (thường API trả về chuỗi ISO)
  updated_at: string | null;  // <-- Thêm mới
}