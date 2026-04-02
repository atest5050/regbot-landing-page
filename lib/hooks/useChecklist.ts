import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChecklistItem } from '@/lib/checklist';
import type { FormTemplate } from '@/lib/formTemplates';

export type StorageMode = 'supabase' | 'guest' | 'loading';

const GUEST_KEY = 'regbot_checklist_v2';

// ── Checklist state + CRUD, extracted from ChatPage ───────────────────────────
//
// Storage is dual-mode:
//   • Supabase (authenticated users) — optimistic local update, then API sync
//   • localStorage (guests) — local only, synced on every items change

export function useChecklist() {
  const [items, setItems]   = useState<ChecklistItem[]>([]);
  const [mode, setMode]     = useState<StorageMode>('loading');

  // ── Bootstrap: detect auth, load initial data ─────────────────────────────

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setMode('supabase');
        try {
          const res = await fetch('/api/checklist');
          if (res.ok) setItems((await res.json()).items ?? []);
        } catch {}
      } else {
        setMode('guest');
        try {
          const saved = localStorage.getItem(GUEST_KEY);
          setItems(saved ? JSON.parse(saved) : []);
        } catch {}
      }
    })();
  }, []);

  // ── Guest persistence ─────────────────────────────────────────────────────

  useEffect(() => {
    if (mode !== 'guest') return;
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(items)); } catch {}
  }, [items, mode]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const createItem = useCallback(async (partial: Omit<ChecklistItem, 'id' | 'createdAt'>) => {
    const optimistic: ChecklistItem = {
      ...partial,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, optimistic]);

    if (mode === 'supabase') {
      try {
        const res = await fetch('/api/checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partial),
        });
        if (res.ok) {
          const { item } = await res.json();
          // Swap the optimistic item for the server-assigned one
          setItems(prev => prev.map(i => i.id === optimistic.id ? item : i));
        }
      } catch {}
    }
  }, [mode]);

  const updateItem = useCallback(async (id: string, changes: Partial<ChecklistItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i));
    if (mode === 'supabase') {
      try {
        await fetch(`/api/checklist?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        });
      } catch {}
    }
  }, [mode]);

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (mode === 'supabase') {
      try { await fetch(`/api/checklist?id=${id}`, { method: 'DELETE' }); } catch {}
    }
  }, [mode]);

  // ── Bulk actions ──────────────────────────────────────────────────────────

  const markAllDone = useCallback(() => {
    setItems(prev => prev.map(i => i.status === 'done' ? i : { ...i, status: 'done' as const }));
  }, []);

  // Compute items to delete first, then update state, then fire API calls.
  // Avoids the anti-pattern of running side effects inside a setState updater.
  const clearCompleted = useCallback((currentItems: ChecklistItem[]) => {
    const toDelete = currentItems.filter(i => i.status === 'done');
    setItems(prev => prev.filter(i => i.status !== 'done'));
    if (mode === 'supabase') {
      toDelete.forEach(i => fetch(`/api/checklist?id=${i.id}`, { method: 'DELETE' }).catch(() => {}));
    }
  }, [mode]);

  const resetAll = useCallback((currentItems: ChecklistItem[]) => {
    if (mode === 'supabase') {
      currentItems.forEach(i => fetch(`/api/checklist?id=${i.id}`, { method: 'DELETE' }).catch(() => {}));
    }
    setItems([]);
  }, [mode]);

  // ── Derived helpers used by ChatPage ──────────────────────────────────────

  /**
   * Marks a completed form template as done in the checklist.
   * Upserts: if an item already exists for this template, marks it done;
   * otherwise creates a new "done" item.
   */
  const addFormEntry = useCallback(async (template: FormTemplate, currentItems: ChecklistItem[]) => {
    const text = `Complete and submit: ${template.name}`;
    const existing = currentItems.find(c => c.text === text);
    const changes = { status: 'done' as const, completedVia: 'RegBot AI Form Filler', formId: template.id };

    if (existing) {
      await updateItem(existing.id, changes);
    } else {
      await createItem({ text, fee: template.fee, ...changes });
    }
  }, [createItem, updateItem]);

  /**
   * Parses bullet lines from an AI response and adds unseen ones to the checklist.
   * Optionally links each bullet to a formId from the FORM_MAP via keyword matching.
   */
  const extractFromContent = useCallback((
    content: string,
    formMap: string[] | null | undefined,
    currentItems: ChecklistItem[],
  ) => {
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('- ')) return;
      const text = trimmed.slice(2).replace(/\[Learn More\]\([^)]+\)/g, '').trim();
      if (!text || currentItems.some(c => c.text === text)) return;
      const formId = formMap?.find(id => text.toLowerCase().includes(id.replace(/-/g, ' ')));
      createItem({ text, status: 'todo', formId });
    });
  }, [createItem]);

  return {
    items,
    storageMode: mode,
    createItem,
    updateItem,
    deleteItem,
    markAllDone,
    clearCompleted,
    resetAll,
    addFormEntry,
    extractFromContent,
  };
}
