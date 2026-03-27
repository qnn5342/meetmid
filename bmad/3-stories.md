# MeetMid — Epic & Story Breakdown

## Epic 1: Project Setup
- **S1.1** Init Next.js 15 project + Tailwind + shadcn/ui
- **S1.2** Setup Google Maps API key + provider component
- **S1.3** Setup Supabase project + database schema
- **S1.4** Setup Zustand store với initial state
- **S1.5** Mobile-first layout (header, main content area)

## Epic 2: Location Input (Solo Mode)
- **S2.1** GPS auto-detect → fill vị trí ô 1
- **S2.2** Map component — hiển thị map, cho phép tap để pin
- **S2.3** Google Maps link parser (full link + short link resolve)
- **S2.4** Text search với Places Autocomplete
- **S2.5** Location input panel — 2 ô input, switch giữa 4 input methods
- **S2.6** Hiển thị 2 markers trên map khi đã có cả 2 vị trí

## Epic 3: Midpoint & Search
- **S3.1** Midpoint calculation (centroid)
- **S3.2** Google Places Nearby Search — query quán ăn/cafe quanh midpoint
- **S3.3** Smart radius expansion khi không có kết quả
- **S3.4** Nút "Tìm quán" — trigger search flow

## Epic 4: Results Display
- **S4.1** Map view — midpoint marker + place markers
- **S4.2** List view — PlaceCard (tên, rating, reviews, khoảng cách)
- **S4.3** Filter bar — Quán ăn / Cafe / Tất cả
- **S4.4** Sort — Rating (default) / Khoảng cách
- **S4.5** Result count selector — 5 / 10 / 20
- **S4.6** Radius slider
- **S4.7** Tap quán → mở Google Maps navigate

## Epic 5: Group Flow
- **S5.1** Tạo room — API + UI (nút "Tạo nhóm")
- **S5.2** Share link — generate + copy link
- **S5.3** Join room page — bấm link → GPS → auto share location
- **S5.4** Realtime member list — host thấy ai đã join
- **S5.5** Host pin hộ member (fallback)
- **S5.6** "Tìm quán" cho group — midpoint từ tất cả members

## Epic 6: Polish
- **S6.1** Loading states + error handling
- **S6.2** Empty states (không có kết quả)
- **S6.3** PWA setup (installable, splash screen)
- **S6.4** OG tags cho share link (preview đẹp trên Zalo/Messenger)

---

## Implementation Order

```
Epic 1 (Setup)
  → Epic 2 (Input) + Epic 3 (Midpoint) — song song
    → Epic 4 (Results)
      → Epic 5 (Group)
        → Epic 6 (Polish)
```

**Estimated MVP:** Epic 1-4 = Solo mode hoàn chỉnh. Epic 5 = Group mode. Epic 6 = Ship-ready.
