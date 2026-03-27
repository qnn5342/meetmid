# MeetMid — Technical Architecture

## 1. Tech Stack Decision

| Layer | Choice | Lý do |
|-------|--------|-------|
| **Frontend** | Next.js 15 (App Router) | Web app mobile-first, không cần app store approval, share link dễ, SSR cho SEO/OG tags |
| **UI** | Tailwind CSS + shadcn/ui | Nhanh, responsive, component library tốt |
| **Map** | Google Maps JavaScript API + @vis.gl/react-google-maps | Official React wrapper, full control |
| **Places** | Google Places API (New) | Autocomplete + nearby search |
| **Realtime** | Supabase Realtime | Group flow sync, free tier generous (500 concurrent) |
| **Database** | Supabase PostgreSQL | Lưu rooms cho group flow |
| **Hosting** | Vercel | Zero-config deploy cho Next.js |
| **State** | Zustand | Lightweight, không boilerplate |

## 2. System Architecture

```
┌─────────────────────────────────────────────┐
│                  Client                      │
│         Next.js App (Mobile-first)           │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Map View │ │ List View│ │ Input Panel  │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       └─────────────┼──────────────┘         │
│                     │                        │
│              ┌──────┴───────┐                │
│              │  Zustand     │                │
│              │  Store       │                │
│              └──────┬───────┘                │
└─────────────────────┼────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
   ┌────────────┐ ┌────────┐ ┌──────────┐
   │ Google Maps│ │Google  │ │ Supabase │
   │ JS API     │ │Places  │ │ Realtime │
   │            │ │API     │ │ + DB     │
   └────────────┘ └────────┘ └──────────┘
```

## 3. Data Models

### Room (Supabase — group flow only)

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,    -- share code (e.g., "ABCD1234")
  host_id VARCHAR(36) NOT NULL,       -- anonymous session id
  status VARCHAR(20) DEFAULT 'waiting', -- waiting | searching | done
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE TABLE room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  session_id VARCHAR(36) NOT NULL,
  name VARCHAR(50),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  joined_at TIMESTAMPTZ DEFAULT now()
);
```

### Client State (Zustand)

```typescript
interface AppState {
  // Locations
  locations: Location[];  // 2-4 locations
  myLocation: Location | null;

  // Results
  midpoint: LatLng | null;
  places: Place[];
  filter: 'restaurant' | 'cafe' | 'all';
  sortBy: 'rating' | 'distance';
  resultCount: 5 | 10 | 20;
  radius: number; // meters

  // Group
  room: Room | null;
  members: Member[];

  // UI
  view: 'input' | 'results';
}

interface Location {
  id: string;
  lat: number;
  lng: number;
  label: string;
  source: 'gps' | 'pin' | 'link' | 'search';
}

interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  distanceFromMidpoint: number;
  type: 'restaurant' | 'cafe';
  photoUrl?: string;
}
```

## 4. Key Algorithms

### 4.1 Midpoint Calculation

```typescript
function calculateMidpoint(locations: Location[]): LatLng {
  // Centroid: average of all lat/lng
  const lat = locations.reduce((sum, l) => sum + l.lat, 0) / locations.length;
  const lng = locations.reduce((sum, l) => sum + l.lng, 0) / locations.length;
  return { lat, lng };
}
```

### 4.2 Smart Radius Expansion

```typescript
async function searchWithExpansion(midpoint: LatLng, radius: number): Promise<Place[]> {
  const maxRadius = 5000; // 5km max
  let currentRadius = radius;

  while (currentRadius <= maxRadius) {
    const results = await searchNearby(midpoint, currentRadius);
    if (results.length >= 3) return results;
    currentRadius += 500; // expand 500m each step
  }

  return []; // no results within max radius
}
```

### 4.3 Google Maps Link Parser

```typescript
function parseGoogleMapsLink(url: string): LatLng | null {
  // Full link: https://www.google.com/maps/place/.../@10.123,106.456,17z
  // Short link: https://maps.app.goo.gl/xxxxx (need to follow redirect)
  // Plus code: handled by Places API

  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,          // @lat,lng
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,      // !3dlat!4dlng
    /q=(-?\d+\.\d+),(-?\d+\.\d+)/,          // q=lat,lng
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }

  return null; // fallback: resolve short link server-side
}
```

## 5. API Routes (Next.js)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/rooms` | POST | Tạo room mới |
| `/api/rooms/[code]` | GET | Lấy room info |
| `/api/rooms/[code]/join` | POST | Join room + gửi location |
| `/api/resolve-link` | POST | Resolve Google Maps short link → tọa độ |

## 6. Page Routes

| Route | Page |
|-------|------|
| `/` | Home — Solo mode input |
| `/room/[code]` | Group mode — join room |
| `/results` | Results page (map + list) — hoặc render trong cùng page |

## 7. Google Maps API Usage & Cost Control

| API | Usage | Free tier |
|-----|-------|-----------|
| Maps JavaScript API | Map display | $200 credit/month |
| Places API (New) - Autocomplete | Text search input | $200 credit/month |
| Places API (New) - Nearby Search | Tìm quán gần midpoint | $200 credit/month |
| Geocoding API | Resolve addresses | $200 credit/month |

**Cost control:**
- Cache Places results trong session (Zustand)
- Debounce autocomplete (300ms)
- Limit nearby search calls (chỉ khi user bấm "Tìm quán")
- $200 free credit/month = ~khoảng 10,000-40,000 requests tuỳ API

## 8. Project Structure

```
meetmid/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Home / Solo mode
│   │   ├── room/[code]/page.tsx  # Group mode join
│   │   └── api/
│   │       ├── rooms/route.ts
│   │       ├── rooms/[code]/route.ts
│   │       ├── rooms/[code]/join/route.ts
│   │       └── resolve-link/route.ts
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.tsx
│   │   │   ├── MidpointMarker.tsx
│   │   │   └── PlaceMarker.tsx
│   │   ├── input/
│   │   │   ├── LocationInput.tsx
│   │   │   ├── GpsButton.tsx
│   │   │   ├── LinkParser.tsx
│   │   │   └── PlaceSearch.tsx
│   │   ├── results/
│   │   │   ├── PlaceList.tsx
│   │   │   ├── PlaceCard.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── RadiusSlider.tsx
│   │   └── group/
│   │       ├── CreateRoom.tsx
│   │       ├── JoinRoom.tsx
│   │       └── MemberList.tsx
│   ├── lib/
│   │   ├── midpoint.ts           # Midpoint calculation
│   │   ├── google-maps.ts        # Google Maps helpers
│   │   ├── link-parser.ts        # Parse Google Maps links
│   │   └── supabase.ts           # Supabase client
│   ├── store/
│   │   └── useAppStore.ts        # Zustand store
│   └── types/
│       └── index.ts
├── public/
├── .env.local                    # API keys
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 9. Environment Variables

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
