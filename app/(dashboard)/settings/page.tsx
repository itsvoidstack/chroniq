'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupabase } from '@/lib/providers/supabase-provider';
import { createClient } from '@/lib/supabase/client';
import { User, Camera } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const { user, isLoading } = useSupabase();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    if (!isLoading && user) {
      fetchProfile();
    }
  }, [user, isLoading, supabase]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile || !user) return;

    setIsUploadingAvatar(true);
    setError('');
    setSuccess('');

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setSuccess('Avatar updated successfully!');
      setAvatarFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, display_name: displayName, bio } : null);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="h-64 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-muted-foreground text-lg mb-8">Manage your Chroniq account settings</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label htmlFor="avatar-upload">
                <Button variant="outline" className="cursor-pointer">
                  <Camera className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </label>
              {avatarFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">{avatarFile.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAvatarFile(null)}
                    className="h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAvatar}
                    disabled={isUploadingAvatar}
                    size="sm"
                    className="h-8 px-3"
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium mb-2">
              Display Name
            </label>
            <Input
              id="display-name"
              type="text"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              placeholder="Tell us a little about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              rows={4}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your tracking data or import from a backup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Button variant="outline" onClick={() => window.open('/api/user-content/export?format=json', '_blank')}>
              Export as JSON
            </Button>
            <Button variant="outline" onClick={() => window.open('/api/user-content/export?format=csv', '_blank')}>
              Export as CSV
            </Button>
            <div className="relative flex-1 max-w-xs">
              <Input type="file" accept=".json" className="cursor-pointer" />
            </div>
            <Button variant="secondary">Import JSON</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Note: Importing data is not fully implemented yet in this version.</p>
        </CardContent>
      </Card>
    </div>
  );
}
