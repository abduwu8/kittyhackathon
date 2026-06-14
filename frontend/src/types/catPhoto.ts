export type CatPhoto = {
  id: string;
  profileId: string;
  userId: string;
  storagePath: string;
  url: string;
  sortOrder: number;
  createdAt: string;
};

export type CatPhotoRecord = {
  id: string;
  profile_id: string;
  user_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
};
