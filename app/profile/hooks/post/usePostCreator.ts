// hooks/usePostCreator.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { supabase } from '../../../../utils/supabase';

type PhotoAsset = { uri: string; fileName: string; type: string };

const MAX_CONCURRENT_UPLOADS = 2;
const DRAFT_KEY = 'pending_post_draft';

export function usePostCreator() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'failed'>('idle');

  // Save draft locally for network drop recovery
  const saveDraftLocally = async (draft: any) => {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const clearDraft = async () => {
    await AsyncStorage.removeItem(DRAFT_KEY);
  };

  // Upload 1 photo to Supabase Storage
  const uploadSinglePhoto = async (
    photo: PhotoAsset,
    postId: string,
    userId: string,
    index: number
  ) => {
    const fileExt = photo.fileName.split('.').pop();
    const path = `${userId}/${postId}/${Date.now()}_${index}.${fileExt}`;

    const { error } = await supabase.storage
      .from('job-photos')
      .upload(path, { uri: photo.uri, type: photo.type, name: path.split('/').pop() });

    if (error) throw error;

    const { data } = supabase.storage.from('job-photos').getPublicUrl(path);
    return { path, url: data.publicUrl, index };
  };

  // Core flow
  const createPostWithPhotos = async (
    postData: Omit<typeof postData, 'status'>,
    photos: PhotoAsset[]
  ) => {
    setStatus('uploading');
    setUploadProgress(0);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('Not authenticated');

      // 1. Create draft post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({ ...postData, user_id: user.user.id, status: 'draft_pending_photos' })
        .select()
        .single();

      if (postError) throw postError;

      // Save draft + pending photos locally for crash/network recovery
      await saveDraftLocally({ post, pendingPhotos: photos });

      // 2. Upload photos in controlled concurrency
      const uploadedPhotos = [];
      for (let i = 0; i < photos.length; i += MAX_CONCURRENT_UPLOADS) {
        const batch = photos.slice(i, i + MAX_CONCURRENT_UPLOADS);
        const results = await Promise.allSettled(
          batch.map((p, idx) => uploadSinglePhoto(p, post.post_id, user.user.id, i + idx))
        );

        // Filter successful uploads
        const success = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
          .map((r) => r.value);
        
        uploadedPhotos.push(...success);
        setUploadProgress(Math.round((uploadedPhotos.length / photos.length) * 100));
      }

      // 3. Insert photo records into DB
      if (uploadedPhotos.length > 0) {
        await supabase.from('post_photos').insert(
          uploadedPhotos.map((p) => ({
            post_id: post.post_id,
            storage_path: p.path,
            public_url: p.url,
            display_order: p.index,
            is_primary: p.index === 0,
          }))
        );
      }

      // 4. Mark post as open
      await supabase
        .from('posts')
        .update({ status: 'open' })
        .eq('post_id', post.post_id);

      // 5. Clear local draft
      await clearDraft();
      setStatus('success');
      return post;

    } catch (error) {
      console.error('Post creation failed:', error);
      setStatus('failed');
      // Draft remains in AsyncStorage for retry on next app launch
      throw error;
    }
  };

  // Call this on app launch to resume interrupted uploads
  const resumePendingUploads = async () => {
    const draft = await AsyncStorage.getItem(DRAFT_KEY);
    if (!draft) return;

    const { post, pendingPhotos } = JSON.parse(draft);
    try {
      await createPostWithPhotos(
        { title: post.title, description: post.description }, // Reconstruct from saved state
        pendingPhotos
      );
    } catch (e) {
      console.warn('Resume failed, keeping draft for manual retry');
    }
  };

  return { createPostWithPhotos, resumePendingUploads, uploadProgress, status };
} 