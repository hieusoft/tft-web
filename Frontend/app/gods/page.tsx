import apiClient from '@/lib/api-client';
import GodTierList from './GodTierList'; 

export const metadata = {
  title: 'Danh Sách Tầng Thần Thoại | TFT Meta',
  description: 'Bảng xếp hạng các vị thần trong Đấu Trường Chân Lý.',
};

export default async function GodTiersPage() {
  const godsList = await apiClient.getGods({ revalidate: 3600 });

  return (
    <main>
      <GodTierList initialGods={godsList} />
    </main>
  );
}