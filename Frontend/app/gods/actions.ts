'use server';

import apiClient from '@/lib/api-client'; 

export async function fetchGodDetailAction(id: number) {
  try {
    const data = await apiClient.getGod(id);
    return data;
  } catch (error) {
    console.error("Lỗi fetch chi tiết God:", error);
    return null;
  }
}