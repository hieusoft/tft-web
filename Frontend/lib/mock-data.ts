// Mock data for TFT comps, champions, items, augments (Vietnamese)

export const MOCK_COMPS = [
  {
    id: "1",
    name: "Jinx - Phản Loạn",
    tier: "S",
    avgPlacement: 3.76,
    pickRate: 0.28,
    winRate: 13.8,
    top4Rate: 65.6,
    difficulty: "Dễ",
    level: 7,
    traits: ["Phản Loạn", "Thợ Săn", "Đồ Tể"],
    champions: [
      { name: "Jinx", cost: 4, stars: 2 },
      { name: "Ekko", cost: 3, stars: 2 },
      { name: "Vi", cost: 2, stars: 2 },
      { name: "Jayce", cost: 1, stars: 2 },
      { name: "Caitlyn", cost: 5, stars: 1 },
      { name: "Silco", cost: 3, stars: 2 },
      { name: "Vander", cost: 2, stars: 2 },
      { name: "Ambessa", cost: 4, stars: 2 },
    ],
  },
  {
    id: "2",
    name: "Viktor - Viễn Kiến",
    tier: "S",
    avgPlacement: 4.18,
    pickRate: 0.21,
    winRate: 17.0,
    top4Rate: 55.2,
    difficulty: "Trung Bình",
    level: 8,
    traits: ["Viễn Kiến", "Phù Thủy", "Sứ Thần"],
    champions: [
      { name: "Viktor", cost: 5, stars: 1 },
      { name: "Mel", cost: 3, stars: 2 },
      { name: "Heimerdinger", cost: 2, stars: 2 },
      { name: "Ekko", cost: 3, stars: 2 },
      { name: "Jayce", cost: 1, stars: 2 },
      { name: "Orianna", cost: 4, stars: 2 },
      { name: "Singed", cost: 2, stars: 2 },
    ],
  },
  {
    id: "3",
    name: "Nami - Groove Không Gian",
    tier: "S",
    avgPlacement: 4.19,
    pickRate: 0.28,
    winRate: 17.3,
    top4Rate: 54.7,
    difficulty: "Khó",
    level: 8,
    traits: ["Huyền Thoại", "Phù Thủy", "Thợ Săn"],
    champions: [
      { name: "Nami", cost: 4, stars: 2 },
      { name: "Caitlyn", cost: 5, stars: 1 },
      { name: "Jinx", cost: 4, stars: 2 },
      { name: "Vi", cost: 2, stars: 2 },
      { name: "Silco", cost: 3, stars: 2 },
    ],
  },
  {
    id: "4",
    name: "Ambessa - Chinh Phục",
    tier: "A",
    avgPlacement: 4.27,
    pickRate: 0.06,
    winRate: 14.2,
    top4Rate: 54.1,
    difficulty: "Khó",
    level: 9,
    traits: ["Chinh Phục", "Thách Đấu", "Hướng Dẫn"],
    champions: [
      { name: "Ambessa", cost: 4, stars: 2 },
      { name: "Vi", cost: 2, stars: 2 },
      { name: "Caitlyn", cost: 5, stars: 1 },
      { name: "Garen", cost: 1, stars: 2 },
      { name: "Rell", cost: 4, stars: 2 },
    ],
  },
  {
    id: "5",
    name: "Silco - Nam Tước Hóa Học",
    tier: "A",
    avgPlacement: 4.35,
    pickRate: 0.15,
    winRate: 11.1,
    top4Rate: 51.8,
    difficulty: "Trung Bình",
    level: 8,
    traits: ["Nam Tước Hóa Học", "Phục Kích", "Nhà Giả Kim"],
    champions: [
      { name: "Silco", cost: 3, stars: 2 },
      { name: "Jinx", cost: 4, stars: 2 },
      { name: "Sevika", cost: 4, stars: 2 },
      { name: "Warwick", cost: 1, stars: 2 },
    ],
  },
  {
    id: "6",
    name: "LeBlanc - Hoa Hồng Đen",
    tier: "B",
    avgPlacement: 4.51,
    pickRate: 0.12,
    winRate: 9.8,
    top4Rate: 48.2,
    difficulty: "Khó",
    level: 8,
    traits: ["Hoa Hồng Đen", "Chinh Phục", "Quan Sát"],
    champions: [
      { name: "LeBlanc", cost: 4, stars: 2 },
      { name: "Elise", cost: 2, stars: 2 },
      { name: "Vladimir", cost: 1, stars: 2 },
      { name: "Swain", cost: 5, stars: 1 },
    ],
  },
];

export const MOCK_CHAMPIONS = [
  { id: "1", name: "Caitlyn", cost: 5, tier: "S", traits: ["Thực Thi", "Xạ Thủ"], avgPlacement: 3.2, top4Rate: 67.5, winRate: 13.8 },
  { id: "2", name: "Viktor", cost: 5, tier: "S", traits: ["Viễn Kiến", "Phù Thủy"], avgPlacement: 3.4, top4Rate: 65.2, winRate: 17.0 },
  { id: "3", name: "Jinx", cost: 4, tier: "A", traits: ["Phản Loạn", "Phục Kích"], avgPlacement: 3.7, top4Rate: 60.1, winRate: 13.8 },
  { id: "4", name: "Silco", cost: 3, tier: "A", traits: ["Nam Tước Hóa Học", "Chinh Phục"], avgPlacement: 3.9, top4Rate: 57.3, winRate: 11.1 },
  { id: "5", name: "Ambessa", cost: 4, tier: "A", traits: ["Chinh Phục", "Thách Đấu"], avgPlacement: 4.0, top4Rate: 55.8, winRate: 14.2 },
  { id: "6", name: "Ekko", cost: 3, tier: "B", traits: ["Phản Loạn", "Phế Liệu"], avgPlacement: 4.2, top4Rate: 51.4, winRate: 9.8 },
  { id: "7", name: "Mel", cost: 3, tier: "B", traits: ["Sứ Thần", "Phù Thủy"], avgPlacement: 4.3, top4Rate: 50.2, winRate: 8.4 },
  { id: "8", name: "Vi", cost: 2, tier: "B", traits: ["Thực Thi", "Đấu Sĩ"], avgPlacement: 4.4, top4Rate: 48.9, winRate: 7.6 },
  { id: "9", name: "Warwick", cost: 1, tier: "C", traits: ["Nam Tước Hóa Học", "Đấu Sĩ"], avgPlacement: 4.6, top4Rate: 45.1, winRate: 5.2 },
  { id: "10", name: "Jayce", cost: 1, tier: "C", traits: ["Hướng Dẫn", "Biến Hình"], avgPlacement: 4.7, top4Rate: 44.3, winRate: 4.8 },
];

export const MOCK_ITEMS = [
  { id: "1", name: "Lưỡi Hút Máu", tier: "S", category: "combat", avgPlacement: 3.18, top4Rate: 66.2, description: "Hồi máu khi tấn công", imageUrl: "" },
  { id: "2", name: "Mũ Phù Thủy Rabadon", tier: "S", category: "magic", avgPlacement: 3.25, top4Rate: 64.8, description: "Tăng mạnh Sức Mạnh Kỹ Năng", imageUrl: "" },
  { id: "3", name: "Giáp Warmog", tier: "A", category: "tank", avgPlacement: 3.62, top4Rate: 60.3, description: "Tăng lượng HP khổng lồ", imageUrl: "" },
  { id: "4", name: "Ý Chí Titan", tier: "A", category: "combat", avgPlacement: 3.78, top4Rate: 58.1, description: "Tích lũy sức tấn công", imageUrl: "" },
  { id: "5", name: "Găng Tay Đính Đá", tier: "A", category: "magic", avgPlacement: 3.85, top4Rate: 56.9, description: "Kỹ năng có thể chí mạng", imageUrl: "" },
  { id: "6", name: "Móng Vuốt Rồng", tier: "B", category: "tank", avgPlacement: 4.1, top4Rate: 52.4, description: "Tăng kháng phép", imageUrl: "" },
];

export const MOCK_AUGMENTS = [
  { id: "1", name: "Cấy Ghép Điều Khiển", tier: "S", category: "Bạc", avgPlacement: 3.1, top4Rate: 68.9, description: "Tướng có trang bị nhận thêm chỉ số" },
  { id: "2", name: "Đoàn Kết", tier: "S", category: "Vàng", avgPlacement: 3.3, top4Rate: 65.4, description: "Đồng đội nhận khiên khi đồng minh chết" },
  { id: "3", name: "Thiền Định", tier: "A", category: "Bạc", avgPlacement: 3.65, top4Rate: 59.7, description: "Tướng không có trang bị hồi phục mana" },
  { id: "4", name: "Nâng Cấp", tier: "A", category: "Vàng", avgPlacement: 3.82, top4Rate: 57.2, description: "Bán linh kiện để lấy vàng và ghép đồ" },
  { id: "5", name: "Người Bạn Lớn", tier: "B", category: "Bạc", avgPlacement: 4.08, top4Rate: 52.1, description: "Đồng minh kề bên nhận thêm HP" },
  { id: "6", name: "Trọng Lượng Nhẹ", tier: "B", category: "Huyền Thoại", avgPlacement: 4.15, top4Rate: 50.8, description: "Tướng 1 và 2 vàng tăng tốc độ tấn công" },
];

export type TraitType = "Origin" | "Class";

export interface MockTrait {
  id: string;
  name: string;
  type: TraitType;
  tier: "S" | "A" | "B" | "C";
  champions: number;       // số tướng có trait này
  breakpoints: number[];   // các mốc kích hoạt (2, 4, 6, ...)
  avgPlacement: number;
  top4Rate: number;
  winRate: number;
  pickRate: number;
  color: string;           // brand color hex
  icon: string;            // emoji đại diện
  description: string;
}

export const MOCK_TRAITS: MockTrait[] = [
  // ── ORIGINS ──
  {
    id: "phan-loan", name: "Phản Loạn", type: "Origin", tier: "S",
    champions: 8, breakpoints: [2, 4, 6, 8],
    avgPlacement: 3.62, top4Rate: 65.4, winRate: 16.2, pickRate: 42.1,
    color: "#e74c3c", icon: "🔴",
    description: "Tướng Phản Loạn nhận thêm sát thương và kháng sát thương.",
  },
  {
    id: "vien-kien", name: "Viễn Kiến", type: "Origin", tier: "S",
    champions: 7, breakpoints: [2, 4, 6],
    avgPlacement: 3.74, top4Rate: 63.1, winRate: 15.8, pickRate: 38.5,
    color: "#9b59b6", icon: "🔮",
    description: "Viễn Kiến tạo ra nguồn năng lượng dựa trên sức mạnh kỹ năng.",
  },
  {
    id: "hoa-hong-den", name: "Hoa Hồng Đen", type: "Origin", tier: "A",
    champions: 5, breakpoints: [2, 3, 4],
    avgPlacement: 3.88, top4Rate: 60.7, winRate: 13.5, pickRate: 28.3,
    color: "#c0392b", icon: "🌹",
    description: "Hoa Hồng Đen áp đặt thương tích lên kẻ địch.",
  },
  {
    id: "nam-tuoc-hoa-hoc", name: "Nam Tước Hóa Học", type: "Origin", tier: "A",
    champions: 6, breakpoints: [3, 5],
    avgPlacement: 3.95, top4Rate: 58.2, winRate: 12.0, pickRate: 24.7,
    color: "#f39c12", icon: "☢️",
    description: "Nhận bình hồi phục mỗi khi tướng qua đời.",
  },
  {
    id: "groove-khong-gian", name: "Groove Không Gian", type: "Origin", tier: "A",
    champions: 5, breakpoints: [2, 4],
    avgPlacement: 4.02, top4Rate: 55.9, winRate: 11.4, pickRate: 22.0,
    color: "#1abc9c", icon: "🌌",
    description: "Nhảy theo nhịp điệu khi tấn công, tăng tốc độ.",
  },
  {
    id: "huong-dan", name: "Hướng Dẫn", type: "Origin", tier: "B",
    champions: 4, breakpoints: [2, 3, 4],
    avgPlacement: 4.23, top4Rate: 51.3, winRate: 9.2, pickRate: 16.4,
    color: "#3498db", icon: "📘",
    description: "Nhận kinh nghiệm bonus giúp lên cấp sớm hơn.",
  },
  {
    id: "su-than", name: "Sứ Thần", type: "Origin", tier: "B",
    champions: 4, breakpoints: [2, 4],
    avgPlacement: 4.31, top4Rate: 49.8, winRate: 8.6, pickRate: 14.9,
    color: "#ecf0f1", icon: "👑",
    description: "Tướng Sứ Thần triệu hồi quân tiếp viện mỗi giao đấu.",
  },
  {
    id: "phe-lieu", name: "Phế Liệu", type: "Origin", tier: "C",
    champions: 3, breakpoints: [2, 3],
    avgPlacement: 4.52, top4Rate: 44.1, winRate: 6.3, pickRate: 9.8,
    color: "#95a5a6", icon: "🔩",
    description: "Chế tạo linh kiện từ phế liệu chiến trường.",
  },

  // ── CLASSES ──
  {
    id: "phu-thuy", name: "Phù Thủy", type: "Class", tier: "S",
    champions: 9, breakpoints: [2, 4, 6, 8],
    avgPlacement: 3.58, top4Rate: 66.2, winRate: 17.1, pickRate: 45.6,
    color: "#8e44ad", icon: "🧙",
    description: "Phù Thủy tăng Sức Mạnh Kỹ Năng theo số lượng.",
  },
  {
    id: "dau-si", name: "Đấu Sĩ", type: "Class", tier: "A",
    champions: 7, breakpoints: [2, 4, 6],
    avgPlacement: 3.83, top4Rate: 61.4, winRate: 13.8, pickRate: 35.2,
    color: "#e67e22", icon: "⚔️",
    description: "Đấu Sĩ nhận thêm HP và giáp khi đạt mốc.",
  },
  {
    id: "xa-thu", name: "Xạ Thủ", type: "Class", tier: "A",
    champions: 6, breakpoints: [2, 4],
    avgPlacement: 3.91, top4Rate: 59.3, winRate: 12.5, pickRate: 30.1,
    color: "#27ae60", icon: "🏹",
    description: "Xạ Thủ tăng tầm đánh và tốc độ đánh.",
  },
  {
    id: "chinh-phuc", name: "Chinh Phục", type: "Class", tier: "A",
    champions: 5, breakpoints: [2, 3, 5],
    avgPlacement: 4.04, top4Rate: 56.8, winRate: 11.9, pickRate: 26.8,
    color: "#d35400", icon: "🛡️",
    description: "Chinh Phục tích lũy giáp và kháng phép qua từng giai đoạn.",
  },
  {
    id: "phu-kich", name: "Phục Kích", type: "Class", tier: "B",
    champions: 5, breakpoints: [2, 4],
    avgPlacement: 4.18, top4Rate: 53.5, winRate: 10.2, pickRate: 21.3,
    color: "#16a085", icon: "🗡️",
    description: "Phục Kích ra đòn chí mạng tăng cao từ phía sau.",
  },
  {
    id: "bien-hinh", name: "Biến Hình", type: "Class", tier: "B",
    champions: 3, breakpoints: [2, 3],
    avgPlacement: 4.29, top4Rate: 50.6, winRate: 9.0, pickRate: 18.7,
    color: "#2980b9", icon: "🔄",
    description: "Biến Hình chuyển trạng thái giữa hai dạng chiến đấu.",
  },
  {
    id: "quan-sat", name: "Quan Sát", type: "Class", tier: "C",
    champions: 4, breakpoints: [2, 4],
    avgPlacement: 4.47, top4Rate: 45.9, winRate: 7.1, pickRate: 12.4,
    color: "#7f8c8d", icon: "👁️",
    description: "Quan Sát tiết lộ vị trí kẻ địch và giảm giáp.",
  },
  {
    id: "thach-dau", name: "Thách Đấu", type: "Class", tier: "C",
    champions: 3, breakpoints: [2, 3],
    avgPlacement: 4.61, top4Rate: 42.7, winRate: 5.8, pickRate: 10.2,
    color: "#bdc3c7", icon: "🏆",
    description: "Thách Đấu tăng sát thương khi đối mặt 1v1.",
  },
];

