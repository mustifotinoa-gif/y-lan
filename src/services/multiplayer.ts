export interface RemoteHumanPlayer {
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
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: number;
}

export type MultiplayerStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

class MultiplayerClient {
  private ws: WebSocket | null = null;
  private status: MultiplayerStatus = 'DISCONNECTED';
  private remotePlayers: Map<string, RemoteHumanPlayer> = new Map();
  private myPlayerId: string | null = null;
  private currentRoomId: string = 'GLOBAL';
  private statusListeners: Array<(status: MultiplayerStatus) => void> = [];
  private playerListeners: Array<(players: RemoteHumanPlayer[]) => void> = [];
  private chatListeners: Array<(msg: ChatMessage) => void> = [];
  private killListeners: Array<(killEvent: any) => void> = [];
  private shouldReconnect: boolean = false;
  private reconnectTimeout: any = null;
  private pingInterval: any = null;
  private currentPing: number = 24;

  public connect(roomId: string = 'GLOBAL', playerName: string = 'Mustafa Kemal', skinId: string = 'SKIN_DEFAULT') {
    this.currentRoomId = roomId.trim().toUpperCase() || 'GLOBAL';
    this.shouldReconnect = true;
    this.setStatus('CONNECTING');

    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('CONNECTED');
        this.sendJoin(playerName, skinId);

        // Ping loop
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping', time: performance.now() }));
          }
        }, 3000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch {}
      };

      this.ws.onclose = () => {
        this.setStatus('DISCONNECTED');
        clearInterval(this.pingInterval);
        if (this.shouldReconnect) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => {
            if (this.shouldReconnect) {
              this.connect(this.currentRoomId, playerName, skinId);
            }
          }, 2000);
        }
      };

      this.ws.onerror = () => {
        // Will trigger onclose
      };
    } catch {
      this.setStatus('DISCONNECTED');
    }
  }

  public disconnect() {
    this.shouldReconnect = false;
    clearTimeout(this.reconnectTimeout);
    clearInterval(this.pingInterval);
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.remotePlayers.clear();
    this.notifyPlayers();
    this.setStatus('DISCONNECTED');
  }

  private sendJoin(name: string, skin: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: 'join',
        name,
        skin,
        roomId: this.currentRoomId,
      })
    );
  }

  public sendUpdate(state: {
    x: number;
    y: number;
    angle: number;
    body: Array<{ x: number; y: number }>;
    length: number;
    score: number;
    isBoosting: boolean;
    isAlive?: boolean;
  }) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: 'update',
        ...state,
      })
    );
  }

  public sendChat(text: string, sender: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: 'chat',
        text,
        sender,
      })
    );
  }

  public sendKill(victimId: string, victimName: string, killerId: string, killerName: string, x: number, y: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: 'kill',
        victimId,
        victimName,
        killerId,
        killerName,
        x,
        y,
      })
    );
  }

  private handleMessage(data: any) {
    if (data.type === 'joined') {
      this.myPlayerId = data.playerId;
      this.currentRoomId = data.roomId;
    } else if (data.type === 'tick') {
      const playersList: RemoteHumanPlayer[] = data.players || [];
      this.remotePlayers.clear();
      playersList.forEach((p) => {
        // Exclude own player from remote players list to avoid rendering duplicate
        if (p.id !== this.myPlayerId) {
          this.remotePlayers.set(p.id, p);
        }
      });
      this.notifyPlayers();
    } else if (data.type === 'player_left') {
      this.remotePlayers.delete(data.playerId);
      this.notifyPlayers();
    } else if (data.type === 'chat') {
      this.chatListeners.forEach((cb) => cb(data.message));
    } else if (data.type === 'kill') {
      this.killListeners.forEach((cb) => cb(data));
    } else if (data.type === 'pong') {
      this.currentPing = Math.max(5, Math.round(performance.now() - (data.time || performance.now())));
    }
  }

  public getStatus(): MultiplayerStatus {
    return this.status;
  }

  public getPing(): number {
    return this.currentPing;
  }

  public getRoomId(): string {
    return this.currentRoomId;
  }

  public getMyPlayerId(): string | null {
    return this.myPlayerId;
  }

  public getRemotePlayers(): RemoteHumanPlayer[] {
    return Array.from(this.remotePlayers.values());
  }

  public onStatusChange(callback: (status: MultiplayerStatus) => void) {
    this.statusListeners.push(callback);
    callback(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  public onPlayersChange(callback: (players: RemoteHumanPlayer[]) => void) {
    this.playerListeners.push(callback);
    callback(Array.from(this.remotePlayers.values()));
    return () => {
      this.playerListeners = this.playerListeners.filter((cb) => cb !== callback);
    };
  }

  public onChat(callback: (msg: ChatMessage) => void) {
    this.chatListeners.push(callback);
    return () => {
      this.chatListeners = this.chatListeners.filter((cb) => cb !== callback);
    };
  }

  public onKill(callback: (killEvent: any) => void) {
    this.killListeners.push(callback);
    return () => {
      this.killListeners = this.killListeners.filter((cb) => cb !== callback);
    };
  }

  private setStatus(s: MultiplayerStatus) {
    this.status = s;
    this.statusListeners.forEach((cb) => cb(s));
  }

  private notifyPlayers() {
    const list = Array.from(this.remotePlayers.values());
    this.playerListeners.forEach((cb) => cb(list));
  }
}

export const multiplayer = new MultiplayerClient();
