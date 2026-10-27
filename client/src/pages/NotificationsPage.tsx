import React, { useState, useEffect } from 'react';
import { Bell, Check, Sparkles, Calendar, Wallet, Info } from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.data) setNotifications(res.data);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifs();
    else setLoading(false);
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trip':
        return <Calendar className="w-5 h-5 text-teal-600" />;
      case 'recommendation':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'budget':
        return <Wallet className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-navy-900 dark:text-white">
            Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates regarding itinerary departures, recommended places, and budget milestones.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl text-xs font-bold glass-panel text-teal-600 hover:text-teal-700 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-4xl max-w-lg mx-auto space-y-3">
          <Bell className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold font-display text-navy-900 dark:text-white">
            All Caught Up!
          </h3>
          <p className="text-xs text-slate-500">
            You don't have any unread notifications or travel alerts at this moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const notifId = item._id || item.id || '';
            return (
              <div
                key={notifId}
                onClick={() => !item.read && handleMarkRead(notifId)}
                className={`glass-card p-5 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !item.read
                    ? 'border-teal-500/40 bg-teal-50/20 dark:bg-teal-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm shrink-0">
                    {getIcon(item.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-navy-900 dark:text-white">
                        {item.title}
                      </h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notifId);
                    }}
                    title="Mark as Read"
                    className="p-2 rounded-xl text-slate-400 hover:text-teal-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
