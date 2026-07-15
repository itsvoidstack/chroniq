'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSupabase } from '@/lib/providers/supabase-provider';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2 } from 'lucide-react';

interface List {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isDefault: boolean;
  created_at: string;
}

export default function ListsPage() {
  const { user } = useSupabase();
  const supabase = createClient();
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    const fetchLists = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setLists(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, [user, supabase]);

  const createList = async () => {
    if (!newListName.trim() || !user) return;

    try {
      const { error } = await supabase.from('lists').insert({
        user_id: user.id,
        name: newListName.trim(),
      });

      if (error) throw error;
      setNewListName('');
      // Refresh lists
      const { data } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id);
      if (data) setLists(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      const { error } = await supabase.from('lists').delete().eq('id', listId);
      if (error) throw error;
      setLists(lists.filter(l => l.id !== listId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Lists</h1>
        <p className="text-muted-foreground">Create and manage custom lists</p>
      </div>

      <div className="flex gap-4">
        <Input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter list name"
          onKeyDown={(e) => e.key === 'Enter' && createList()}
        />
        <Button onClick={createList}>
          <Plus className="w-4 h-4 mr-2" />
          Create List
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading lists...</div>
      ) : lists.length > 0 ? (
        <div className="grid gap-4">
          {lists.map((list) => (
            <Card key={list.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{list.name}</CardTitle>
                  {list.description && (
                    <CardDescription>{list.description}</CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteList(list.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed rounded-xl border-border">
          <p className="text-muted-foreground">No lists yet. Create your first list!</p>
        </div>
      )}
    </div>
  );
}
