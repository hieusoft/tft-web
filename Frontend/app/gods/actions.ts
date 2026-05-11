'use server';

import apiClient from '@/lib/api-client'; 

export async function fetchGodDetailAction(slug: string) {
  try {
    const data = await apiClient.getGod(slug);
    return data;
  } catch (error) {
    console.error("Lỗi fetch chi tiết God:", error);
    return null;
  }
}