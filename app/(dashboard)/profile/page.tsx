'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Settings, Edit3, Image as ImageIcon, Save, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { SectionHeader } from '@/components/ui/section-header';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('Aarav');
  const [bio, setBio] = useState('Just another anime enthusiast exploring new worlds.');

  const handleSave = () => {
    setIsEditing(false);
    // In Phase 4, we will send this to Supabase/Prisma
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Profile Header (Banner & Avatar) */}
      <div className="relative rounded-2xl overflow-hidden bg-card/50 border border-border">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary/40 via-primary/10 to-background relative group">
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button variant="secondary" size="sm" className="gap-2">
               <ImageIcon className="w-4 h-4" /> Change Cover
             </Button>
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="px-6 pb-8 md:px-10 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-background ring-2 ring-primary/20 rounded-full overflow-hidden">
                <Avatar name="Aarav" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav" />
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-transform">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-1 mb-2">
              {isEditing ? (
                <div className="space-y-4 max-w-md bg-background/50 p-4 rounded-xl backdrop-blur-sm border border-border">
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="Display Name" 
                    className="text-lg font-bold"
                  />
                  <Input 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Tell us about yourself..." 
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="gap-2">
                      <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{displayName}</h1>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="md:hidden">
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  </div>
                  <p className="text-muted-foreground max-w-lg">{bio}</p>
                </>
              )}
            </div>
            
            {!isEditing && (
              <div className="hidden md:flex gap-3 mb-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card/50 border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Overall Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Total Watched</span>
                <span className="font-semibold text-lg text-foreground">1,248</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-muted-foreground">Hours Spent</span>
                <span className="font-semibold text-lg text-foreground">523h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Join Date</span>
                <span className="font-medium text-foreground">July 2026</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-8">
          <SectionHeader title="Favorite Titles" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Mock favorites */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-muted/20 border border-border/50 flex flex-col items-center justify-center text-muted-foreground gap-2 hover:bg-muted/30 transition-colors cursor-pointer">
                 <ImageIcon className="w-6 h-6 opacity-50" />
                 <span className="text-sm font-medium">Add Favorite</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
