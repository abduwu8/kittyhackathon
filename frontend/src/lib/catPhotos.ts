import { supabase } from './supabase';
import type { CatPhoto, CatPhotoRecord } from '../types/catPhoto';

const BUCKET = 'cat-photos';
export const MAX_CAT_PHOTOS = 10;

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

function getExtension(uri: string) {
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

function createStorageFileName(extension: string) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${unique}.${extension}`;
}

function getContentType(extension: string) {
  return MIME_BY_EXTENSION[extension] ?? 'image/jpeg';
}

function toCatPhoto(record: CatPhotoRecord): CatPhoto {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(record.storage_path);

  return {
    id: record.id,
    profileId: record.profile_id,
    userId: record.user_id,
    storagePath: record.storage_path,
    url: data.publicUrl,
    sortOrder: record.sort_order,
    createdAt: record.created_at,
  };
}

export async function fetchCatPhotos(profileId: string, userId: string): Promise<CatPhoto[]> {
  const { data, error } = await supabase
    .from('cat_photos')
    .select('*')
    .eq('profile_id', profileId)
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((record) => toCatPhoto(record as CatPhotoRecord));
}

export async function uploadCatPhoto(
  profileId: string,
  userId: string,
  localUri: string,
): Promise<{ photo: CatPhoto | null; error: string | null }> {
  const existing = await fetchCatPhotos(profileId, userId);

  if (existing.length >= MAX_CAT_PHOTOS) {
    return { photo: null, error: `you can add up to ${MAX_CAT_PHOTOS} photos.` };
  }

  const extension = getExtension(localUri);
  const storagePath = `${userId}/${createStorageFileName(extension)}`;
  const contentType = getContentType(extension);

  const response = await fetch(localUri);

  if (!response.ok) {
    return { photo: null, error: 'could not read the selected photo.' };
  }

  const fileData = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileData, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return { photo: null, error: uploadError.message };
  }

  const { data, error } = await supabase
    .from('cat_photos')
    .insert({
      profile_id: profileId,
      user_id: userId,
      storage_path: storagePath,
      sort_order: existing.length,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { photo: null, error: error.message };
  }

  return { photo: toCatPhoto(data as CatPhotoRecord), error: null };
}

export async function deleteCatPhoto(
  photoId: string,
  storagePath: string,
  userId: string,
): Promise<{ error: string | null }> {
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);

  if (storageError) {
    return { error: storageError.message };
  }

  const { error } = await supabase
    .from('cat_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
