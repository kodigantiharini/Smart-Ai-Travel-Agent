import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, FolderPlus, Edit2, ArrowLeft, Check, Bookmark } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await api.getCollections();
      if (res.data) setCollections(res.data);
    } catch (err) {
      console.warn('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCollections();
    else setLoading(false);
  }, [user]);

  const handleStartRename = (idx: number, name: string) => {
    setEditingIndex(idx);
    setRenameValue(name);
  };

  const handleConfirmRename = async (oldName: string) => {
    if (!renameValue.trim() || renameValue === oldName) {
      setEditingIndex(null);
      return;
    }

    try {
      await api.renameCollection(oldName, renameValue.trim());
      setEditingIndex(null);
      await fetchCollections();
    } catch (err) {
      console.error('Rename collection failed:', err);
    }
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    if (collections.includes(newCollectionName.trim())) {
      alert('A collection with this name already exists.');
      return;
    }
    setCollections((prev) => [...prev, newCollectionName.trim()]);
    setNewCollectionName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/saved"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Saved Places
        </Link>
        <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white">
          Manage Travel Collections
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize saved places into themed collections for your upcoming trips.
        </p>
      </div>

      {/* New Collection Input */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <FolderPlus className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New collection name (e.g., European Summer, Hidden Waterfalls)..."
            className="w-full bg-transparent text-base sm:text-sm focus:outline-none min-h-[44px]"
          />
        </div>
        <button
          onClick={handleCreateCollection}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-sm shrink-0 min-h-[44px] flex items-center justify-center"
        >
          Add Collection
        </button>
      </div>

      {/* Collections List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {collections.map((col, idx) => (
          <div
            key={idx}
            className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>

              {editingIndex === idx ? (
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="px-2 py-1 text-sm font-semibold rounded-lg border border-teal-500 bg-white dark:bg-slate-900 focus:outline-none"
                />
              ) : (
                <div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white">{col}</h3>
                  <Link
                    to={`/saved?collection=${encodeURIComponent(col)}`}
                    className="text-[11px] text-teal-600 hover:underline"
                  >
                    View Places in Collection &rarr;
                  </Link>
                </div>
              )}
            </div>

            {editingIndex === idx ? (
              <button
                onClick={() => handleConfirmRename(col)}
                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <Check className="w-4 h-4" />
              </button>
            ) : (
              col !== 'All Favorites' && (
                <button
                  onClick={() => handleStartRename(idx, col)}
                  title="Rename Collection"
                  className="p-2 rounded-xl text-slate-400 hover:text-navy-900 dark:hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
