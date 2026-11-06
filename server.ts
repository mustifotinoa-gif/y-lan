import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

interface RemotePlayer {
  id: string;
  name: string;
  skin: string;
  x: number;
  y: number;
  angle: number;
  body: Array<{ x: number; y: number }>;
  length: number;
  score: number;
  isBoosting: boolean;
  isAlive: boolean;
  isRealHuman: true;
  lastPing: number;
  ws?: WebSocket;
}

interface Room {
  id: string;
  name: string;
  players: Map<string, RemotePlayer>;
  chatLog: Array<{ id: string; sender: string; text: string; time: number }>;
}

const rooms = new Map<string, Room>();

function getOrCreateRoom(roomId: string = 'global'): Room {
  const cleanId = roomId.trim().toUpperCase() || 'GLOBAL';
  if (!rooms.has(cleanId)) {
    rooms.set(cleanId, {
      id: cleanId,
      name: cleanId === 'GLOBAL' ? 'Genel Canlı Arena' : `Özel Oda: ${cleanId}`,
      players: new Map(),
      chatLog: [],
    });
  }
  return rooms.get(cleanId)!;
}

// Global default room
getOrCreateRoom('GLOBAL');

// API Health & Rooms Info
app.get('/api/health', (req, res) => {
  let totalPlayers = 0;
  rooms.forEach((r) => (totalPlayers += r.players.size));
  res.json({ status: 'ok', totalPlayers, roomsCount: rooms.size });
});

app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
    playerCount: r.players.size,
  }));
  res.json({ rooms: roomList });
});

// ==========================================
// DEVELOPER INBOX & BUG REPORTING SYSTEM
// Target Developer: mustifotinoa@gmail.com
// ==========================================
interface BugReport {
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

const DATA_DIR = path.join(__dirname, 'data');
const BUG_REPORTS_FILE = path.join(DATA_DIR, 'bug-reports.json');

function loadBugReports(): BugReport[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(BUG_REPORTS_FILE)) {
      const content = fs.readFileSync(BUG_REPORTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to load bug reports file:', err);
  }

  // Initial welcome developer mail for mustifotinoa@gmail.com
  const initialReports: BugReport[] = [
    {
      id: 'report-welcome-1',
      senderName: 'Sistem Yöneticisi',
      senderEmail: 'mustifotinoa@gmail.com',
      category: 'Sistem',
      description:
        'Mustafa Kemal Siber Arena geliştirici posta kutunuz başarıyla aktif edildi! Oyuncuların bildirdiği tüm hata, öneri ve bug raporları anında bu kutuda toplanacaktır.',
      deviceInfo: 'Siber Arena v2.5 / Sunucu',
      gameMode: 'GLOBAL',
      createdAt: new Date().toISOString(),
      status: 'READ',
      developerNotes: 'Hoş geldiniz! Raporları buradan çözüldü olarak işaretleyebilir veya silebilirsiniz.',
    },
  ];
  saveBugReports(initialReports);
  return initialReports;
}

function saveBugReports(reports: BugReport[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BUG_REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save bug reports file:', err);
  }
}

let inMemoryBugReports: BugReport[] = loadBugReports();

// GET all reports
app.get('/api/bug-reports', (req, res) => {
  const unreadCount = inMemoryBugReports.filter((r) => r.status === 'NEW').length;
  res.json({
    reports: inMemoryBugReports,
    unreadCount,
    recipientEmail: 'mustifotinoa@gmail.com',
  });
});

// POST new bug report from player
app.post('/api/bug-reports', (req, res) => {
  try {
    const { senderName, senderEmail, category, description, deviceInfo, gameMode } = req.body;
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Açıklama boş olamaz' });
    }

    const newReport: BugReport = {
      id: `report-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderName: (senderName && String(senderName).trim()) || 'Anonim Oyuncu',
      senderEmail: (senderEmail && String(senderEmail).trim()) || '',
      category: category || 'Genel Hata',
      description: String(description).trim(),
      deviceInfo: deviceInfo || '',
      gameMode: gameMode || 'SOLO',
      createdAt: new Date().toISOString(),
      status: 'NEW',
    };

    inMemoryBugReports.unshift(newReport);
    saveBugReports(inMemoryBugReports);

    // Broadcast new bug report to connected developer client
    const notifyPayload = JSON.stringify({
      type: 'new_bug_report',
      report: newReport,
      unreadCount: inMemoryBugReports.filter((r) => r.status === 'NEW').length,
    });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(notifyPayload);
      }
    });

    console.log(`📩 Yeni Hata Raporu Alındı: "${newReport.category}" - ${newReport.senderName} (${newReport.description.substring(0, 40)}...)`);

    res.status(201).json({
      success: true,
      report: newReport,
      message: 'Hata raporunuz geliştiriciye (mustifotinoa@gmail.com) başarıyla iletildi!',
    });
  } catch (err) {
    console.error('Error creating bug report:', err);
    res.status(500).json({ error: 'Rapor kaydedilemedi' });
  }
});

// PATCH update report status (read/resolved/notes)
app.patch('/api/bug-reports/:id', (req, res) => {
  const { id } = req.params;
  const { status, developerNotes } = req.body;

  const target = inMemoryBugReports.find((r) => r.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Rapor bulunamadı' });
  }

  if (status && ['NEW', 'READ', 'RESOLVED'].includes(status)) {
    target.status = status;
  }
  if (developerNotes !== undefined) {
    target.developerNotes = String(developerNotes);
  }

  saveBugReports(inMemoryBugReports);
  const unreadCount = inMemoryBugReports.filter((r) => r.status === 'NEW').length;
  res.json({ success: true, report: target, unreadCount });
});

// DELETE report
app.delete('/api/bug-reports/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = inMemoryBugReports.length;
  inMemoryBugReports = inMemoryBugReports.filter((r) => r.id !== id);

  if (inMemoryBugReports.length === initialLength) {
    return res.status(404).json({ error: 'Rapor bulunamadı' });
  }

  saveBugReports(inMemoryBugReports);
  const unreadCount = inMemoryBugReports.filter((r) => r.status === 'NEW').length;
  res.json({ success: true, unreadCount });
});

// WebSocket Connection Management
wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentPlayerId: string | null = null;

  ws.on('message', (rawData: string) => {
    try {
      const data = JSON.parse(rawData.toString());

      if (data.type === 'join') {
        const roomId = data.roomId ? String(data.roomId).trim().toUpperCase() : 'GLOBAL';
        const room = getOrCreateRoom(roomId);
        currentRoomId = roomId;

        const playerId = data.id || `human-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        currentPlayerId = playerId;

        const player: RemotePlayer = {
          id: playerId,
          name: (data.name || 'Oyuncu').substring(0, 16),
          skin: data.skin || 'SKIN_DEFAULT',
          x: data.x || 1000 + (Math.random() - 0.5) * 400,
          y: data.y || 1000 + (Math.random() - 0.5) * 400,
          angle: data.angle || 0,
          body: data.body || [],
          length: data.length || 15,
          score: data.score || 0,
          isBoosting: false,
          isAlive: true,
          isRealHuman: true,
          lastPing: Date.now(),
          ws,
        };

        room.players.set(playerId, player);

        // Notify the joining player
        ws.send(
          JSON.stringify({
            type: 'joined',
            playerId,
            roomId,
            roomName: room.name,
            playerCount: room.players.size,
          })
        );

        // Broadcast player joined to others in room
        broadcastToRoom(room, {
          type: 'player_joined',
          player: sanitizePlayer(player),
          playerCount: room.players.size,
        });
      } else if (data.type === 'update' && currentRoomId && currentPlayerId) {
        const room = rooms.get(currentRoomId);
        if (room && room.players.has(currentPlayerId)) {
          const p = room.players.get(currentPlayerId)!;
          p.x = data.x ?? p.x;
          p.y = data.y ?? p.y;
          p.angle = data.angle ?? p.angle;
          p.body = data.body ?? p.body;
          p.length = data.length ?? p.length;
          p.score = data.score ?? p.score;
          p.isBoosting = !!data.isBoosting;
          p.isAlive = data.isAlive !== false;
          p.lastPing = Date.now();
        }
      } else if (data.type === 'chat' && currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          const msg = {
            id: `msg-${Date.now()}-${Math.random()}`,
            sender: (data.sender || 'Oyuncu').substring(0, 16),
            text: (data.text || '').substring(0, 100),
            time: Date.now(),
          };
          room.chatLog.push(msg);
          if (room.chatLog.length > 50) room.chatLog.shift();

          broadcastToRoom(room, {
            type: 'chat',
            message: msg,
          });
        }
      } else if (data.type === 'kill' && currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          broadcastToRoom(room, {
            type: 'kill',
            victimId: data.victimId,
            killerId: data.killerId,
            victimName: data.victimName,
            killerName: data.killerName,
            x: data.x,
            y: data.y,
          });
        }
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
      }
    } catch {
      // Ignore malformed messages
    }
  });

  const handleDisconnect = () => {
    if (currentRoomId && currentPlayerId) {
      const room = rooms.get(currentRoomId);
      if (room && room.players.has(currentPlayerId)) {
        room.players.delete(currentPlayerId);
        broadcastToRoom(room, {
          type: 'player_left',
          playerId: currentPlayerId,
          playerCount: room.players.size,
        });

        // Clean up empty custom rooms after a while
        if (room.players.size === 0 && currentRoomId !== 'GLOBAL') {
          setTimeout(() => {
            if (rooms.get(currentRoomId!)?.players.size === 0) {
              rooms.delete(currentRoomId!);
            }
          }, 30000);
        }
      }
    }
  };

  ws.on('close', handleDisconnect);
  ws.on('error', handleDisconnect);
});

function sanitizePlayer(p: RemotePlayer) {
  return {
    id: p.id,
    name: p.name,
    skin: p.skin,
    x: p.x,
    y: p.y,
    angle: p.angle,
    body: p.body,
    length: p.length,
    score: p.score,
    isBoosting: p.isBoosting,
    isAlive: p.isAlive,
    isRealHuman: true,
  };
}

function broadcastToRoom(room: Room, messageObj: any, excludeWs?: WebSocket) {
  const json = JSON.stringify(messageObj);
  room.players.forEach((p) => {
    if (p.ws && p.ws !== excludeWs && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(json);
    }
  });
}

// Real-Time Room Tick Loop (20 updates/second to clients)
setInterval(() => {
  rooms.forEach((room) => {
    if (room.players.size === 0) return;

    const playersData = Array.from(room.players.values()).map(sanitizePlayer);
    const tickPayload = JSON.stringify({
      type: 'tick',
      players: playersData,
      count: playersData.length,
    });

    room.players.forEach((p) => {
      if (p.ws && p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(tickPayload);
      }
    });
  });
}, 50);

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CyberSnake Full-Stack Multi-User Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
