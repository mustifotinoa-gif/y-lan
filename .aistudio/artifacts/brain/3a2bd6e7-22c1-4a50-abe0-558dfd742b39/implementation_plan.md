# Neon Cyberpunk Yılan Oyunu (CyberSnake)

Estetik, akıcı ve profesyonel bir siberpunk görsel kimliğine sahip, 3 can hakkı sistemi, yerel High Score liderlik tablosu, özel güçlendiriciler (hız, yavaşlatma, mıknatıs, 2x çarpan), Web Audio API tabanlı dinamik ses efektleri ve hem klavye hem de dokunmatik kontroller içeren modern bir Yılan (Snake) oyunu.

## Kullanıcı Tercihleri ve Alınan Kararlar

> [!IMPORTANT]
> Kullanıcının ilk aşamadaki sorulara verdiği yanıtlar doğrultusunda belirlenen tasarım kuralları:

- **Görsel Tema**: Neon Siberpunk — Derin koyu zemin (`#0a0b10` / `#0f172a`), ışıltılı neon yeşili yılan gövdesi, siber mavi ve mor vurgular, grid çizgileri ve pürüzsüz animasyonlar.
- **Can Mekaniği**: 3 Can (`❤❤❤`) — Duvara veya kendi kuyruğuna çarptığında 1 can kaybedilir, kısa bir geçici hasar almazlık (invulnerability blink) ile oyun devam eder. Canlar sıfırlanınca Game Over ekranı gelir.
- **Güçlendiriciler (Power-ups)**: Standart neon elmaların yanı sıra belirli sürelerde çıkan Altın Elma (+50 puan), Mıknatıs (yemleri çeker), Hız Ayarlayıcı (Yavaşlatma / Hızlandırma) ve 2x Skor Çarpanı.
- **Kontroller**: Hem masaüstü oyuncuları için Klavye (Yön Tuşları / WASD / Space ile Duraklatma) hem de mobil/tablet oyuncuları için ergonomik ekran üzeri dokunmatik D-Pad.
- **İlerleme & Zorluk**: Yılan uzadıkça ve yem topladıkça kademeli artan dinamik hızlanma, seri yem toplama kombo çarpanları.
- **Ses & Görsel Efektler**: Web Audio API ile harici dosya bağımlılığı olmadan sentezlenen retro-fütüristik ses efektleri (yeme, güçlendirici alma, hasar/çarpma, rekor kırma), partikül patlamaları ve hafif ekran sarsıntısı (screen shake).
- **High Score Tablosu**: `localStorage` tabanlı kalıcı liderlik tablosu; oyuncu adı girişi, skor, ulaşılan yılan uzunluğu, süre ve tarih kaydı, filtreleme ve sıralama.

---

## 1. Genel Bakış ve Oyun Döngüsü

CyberSnake, geleneksel yılan oyunu deneyimini çağdaş web teknolojileri, pürüzsüz HTML5 Canvas render döngüsü ve profesyonel UI tasarımıyla birleştirir.

```
┌────────────────────────────────────────────────────────┐
│                   CyberSnake Top HUD                   │
│   [SKOR: 1,420]   [KOMBO: x2]   [CAN: ❤❤❤]   [REKOR: 2,800]│
└────────────────────────────────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────┐
│             HTML5 Canvas Oyun Alanı                    │
│   ┌────────────────────────────────────────────────┐   │
│   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│   │ ░░░  ●●●●●●> (Yılan Başı + Parlama)      ░░░   │   │
│   │ ░░░             ★ (Özel Güçlendirici)    ░░░   │   │
│   │ ░░░     ◆ (Neon Yem)                     ░░░   │   │
│   │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│         Alt Kontrol & Liderlik Tablosu Paneli          │
│   [Sanal D-Pad Kontrolleri]     [🏆 Liderlik Tablosu]   │
│   [Ses Aç/Kapat]                [⏸ Duraklat / Yeniden]  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Kullanıcı Deneyimi ve Görsel Tasarım

### A. Renk Paleti ve Siber Atmosfer
- **Arka Plan (Canvas & Zemin)**: `%60` Koyu Kozmik Zemin (`#090a0f`, `#0d1117`), hafif altıgen/ızgara kılavuz çizgileri.
- **Yapısal Yüzeyler**: `%30` Slate/Çinko paneller (`rgba(15, 23, 42, 0.85)`), 1px neon borderlar (`rgba(56, 189, 248, 0.2)`), kart gölgeleri.
- **Vurgu Renkleri**: `%10` Neon Zümrüt (`#10b981` / `#00ff88` yılan), Elektrik Cyan (`#06b6d4` / `#38bdf8`), Neon Pembe/Kırmızı (`#f43f5e` hasar ve can göstergesi), Siber Altın (`#f59e0b` altın elma).

### B. Tipografi & Sayısal Tablolar
- Başlıklar: Modern geometrik sans (`system-ui`, modern neo-grotesque).
- Skor ve Veri Tabloları: `tabular-nums` ve `font-mono` ile dikey hizalı, parlamayan temiz metinler.
- Kural: Hiçbir statik metin anlamsız hap (pill) kapsüllere sarılmaz; temiz tipografik hiyerarşi (`·` ve `/` ayraçları) uygulanır.

### C. Ekran Durumları (State Machine)
1. **TITLE_MENU**: Oyun logosu, "Oyunu Başlat" butonu, kontrollerin özeti ve liderlik tablosu önizlemesi.
2. **PLAYING**: 60 FPS HTML5 Canvas tabanlı yılan renderı, anlık skor, kombo barı, can göstergesi, aktif güçlendirici süre sayacı.
3. **PAUSED**: Oyun alanını donduran yarı saydam overlay, "Devam Et" ve "Yeniden Başlat" butonları.
4. **LIFE_LOST (Geçici Efekt)**: Can azaldığında kırmızı parıltı + hafif sarsıntı efekti, yılan 2 saniye yarı saydam yanıp söner ve kaldığı yerden devam eder.
5. **GAME_OVER**: 3 can bittiğinde detaylı oyun sonu modalı: Son skor, toplanan yem sayısı, hayatta kalınan süre. Yeni rekor kırıldıysa High Score tablosuna isim kaydetme formu.
6. **LEADERBOARD_MODAL**: İlk 10 skor, oyuncu isimleri, tarihler ve başarı rozetleri (rookie, master, cyber legend).

---

## 3. Temel Sistem Mimarisi ve Veri Akışı

```
                     ┌──────────────────┐
                     │   React Root     │
                     │    (App.tsx)     │
                     └────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
   ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
   │ Audio Engine│     │ Game Canvas │     │ Leaderboard │
   │ (Web Audio) │     │ (Game Loop) │     │(localStorage│
   └─────────────┘     └──────┬──────┘     └─────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
     ┌──────▼──────┐                     ┌──────▼──────┐
     │ Snake State │                     │  Power-Ups  │
     │ - Cells     │                     │  - Magnet   │
     │ - Direction │                     │  - 2x Multi │
     │ - Lives: 3  │                     │  - Speed    │
     │ - Invuln    │                     │  - Golden   │
     └─────────────┘                     └─────────────┘
```

### Veri Modelleri

```typescript
interface HighScoreEntry {
  id: string;
  playerName: string;
  score: number;
  length: number;
  durationSeconds: number;
  date: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'MAGNET' | 'SLOW' | 'DOUBLE_POINTS' | 'GOLDEN_APPLE';
  durationMs: number;
  expiresAt: number;
}
```

---

## 4. Uygulama Adımları

1. **Görsel & Stil Hazırlığı**:
   - `index.html` başlığını "CyberSnake - Neon Yılan Oyunu" olarak güncelleme, meta açıklamaları senkronize etme.
   - `metadata.json` dosyasını yapılandırma.
2. **Ses Sentezleyici Motoru (`audio.ts`)**:
   - Web Audio API tabanlı sentetik ses efektleri: Yem yeme (arp tonu), güçlendirici (fütüristik yükseliş), hasar/can kaybı (alçak bass glitch), oyun sonu jingle'ı.
3. **Oyun Mantığı & Canvas Engine (`useSnakeGame.ts` / `CanvasRenderer.ts`)**:
   - Grid tabanlı hareket mantığı (24x24 veya 20x20 ızgara).
   - 3 can yönetimi, çarpışma tespiti (duvar ve kendi kuyruğu).
   - Yem üretimi, altın elma ve 4 farklı güçlendirici mekaniği.
   - Parçacık motoru (Canvas particles): Yem yendiğinde kıvılcım patlamaları.
4. **Liderlik Tablosu & Depolama (`useLeaderboard.ts`)**:
   - `localStorage` entegrasyonu.
   - İlk başlangıçta rekabet hissi verecek estetik varsayılan siber skorlar.
   - Yeni rekor ekleme, silme ve dışa aktarma imkanı.
5. **Arayüz ve Kontroller**:
   - Üst HUD: Can barı (`❤❤❤`), anlık skor, kombo çarpanı, aktif güçlendirici göstergesi.
   - Masaüstü klavye dinleyicisi (Arrow, WASD, Space).
   - Mobil için parmak dostu dokunmatik D-Pad ve butonlar.
   - Estetik Cyberpunk Game Over & High Score modal pencereleri.
6. **Doğrulama**:
   - TypeScript derlemesi (`compile_applet`) ve akıcı 60 FPS test kontrolü.
