-- ══════════════════════════════════════════════════════════════════
-- Wuduh — Migration 002: Add UPDATE policy on storage.objects
-- Run this in: Supabase → SQL Editor → New query → Run
--
-- Fix: upsert: true on file uploads requires an UPDATE grant.
-- Without this, re-uploading a logo to the same path fails silently.
-- ══════════════════════════════════════════════════════════════════

create policy "Users can update files in their own folder"
  on storage.objects for update
  using (
    bucket_id = 'wuduh-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
