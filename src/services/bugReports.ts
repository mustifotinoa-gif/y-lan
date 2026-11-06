export interface BugReport {
  id: string;
  senderName: string;
  senderEmail?: string;
  category: string;
  description: string;
  deviceInfo?: string;
  gameMode?: string;
  createdAt: string;
  status: 'NEW' | 'READ' | 'RESOLVED';
  developerNotes?: string;
}

const LOCAL_STORAGE_KEY = 'cybersnake_bug_reports_cache';

export const DEVELOPER_EMAIL = 'mustifotinoa@gmail.com';

export const bugReportsService = {
  /**
   * Fetch all bug reports from server with localStorage fallback
   */
  async getReports(): Promise<{ reports: BugReport[]; unreadCount: number }> {
    try {
      const res = await fetch('/api/bug-reports');
      if (res.ok) {
        const data = await res.json();
        const reports: BugReport[] = data.reports || [];
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
        } catch {}
        return {
          reports,
          unreadCount: data.unreadCount ?? reports.filter((r) => r.status === 'NEW').length,
        };
      }
    } catch (err) {
      console.warn('Network error fetching bug reports, reading local cache:', err);
    }

    // Fallback to local storage
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const reports: BugReport[] = JSON.parse(cached);
        return {
          reports,
          unreadCount: reports.filter((r) => r.status === 'NEW').length,
        };
      }
    } catch {}

    return { reports: [], unreadCount: 0 };
  },

  /**
   * Submit a new bug report directly to developer
   */
  async submitReport(payload: {
    senderName?: string;
    senderEmail?: string;
    category: string;
    description: string;
    gameMode?: string;
  }): Promise<{ success: boolean; report?: BugReport; error?: string }> {
    const deviceInfo = typeof window !== 'undefined'
      ? `${navigator.userAgent.includes('Mobile') ? '📱 Mobil' : '💻 Masaüstü'} · ${window.innerWidth}x${window.innerHeight}`
      : 'Bilinmiyor';

    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          deviceInfo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, report: data.report };
      }
    } catch (err) {
      console.warn('Network request failed, caching locally:', err);
    }

    // Local offline save fallback
    const offlineReport: BugReport = {
      id: `report-offline-${Date.now()}`,
      senderName: payload.senderName || 'Oyuncu',
      senderEmail: payload.senderEmail || '',
      category: payload.category || 'Genel Hata',
      description: payload.description,
      deviceInfo,
      gameMode: payload.gameMode || 'SOLO',
      createdAt: new Date().toISOString(),
      status: 'NEW',
    };

    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      const list: BugReport[] = existing ? JSON.parse(existing) : [];
      list.unshift(offlineReport);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return { success: true, report: offlineReport };
    } catch {
      return { success: false, error: 'Kayıt başarısız oldu' };
    }
  },

  /**
   * Update report status (NEW, READ, RESOLVED)
   */
  async updateStatus(id: string, status: 'NEW' | 'READ' | 'RESOLVED', developerNotes?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/bug-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, developerNotes }),
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Failed to update status on server:', err);
    }

    // Local update
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (existing) {
        const list: BugReport[] = JSON.parse(existing);
        const target = list.find((r) => r.id === id);
        if (target) {
          target.status = status;
          if (developerNotes !== undefined) target.developerNotes = developerNotes;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          return true;
        }
      }
    } catch {}

    return false;
  },

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/bug-reports/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch (err) {
      console.warn('Failed to delete on server:', err);
    }

    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (existing) {
        const list: BugReport[] = JSON.parse(existing);
        const filtered = list.filter((r) => r.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
        return true;
      }
    } catch {}

    return false;
  },
};
