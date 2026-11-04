import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
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
