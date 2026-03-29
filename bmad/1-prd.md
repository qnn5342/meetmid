# MeetMid — Product Requirements Document (PRD)

## 1. Product Overview

**MeetMid** là ứng dụng tìm điểm hẹn ở giữa cho 2-4 người, gợi ý quán ăn/cafe gần midpoint dựa trên Google Maps rating. Mục tiêu: giải quyết bài toán "hẹn ở đâu cho công bằng" một cách nhanh, đơn giản, không cần đăng ký.

## 2. Target Users

- Nhóm bạn 2-4 người muốn hẹn ăn/cafe
- Cặp đôi tìm điểm hẹn giữa 2 nơi
- Người dùng phổ thông, không cần tech-savvy
- Thị trường chính: Việt Nam (Zalo/Messenger là kênh share chính)

## 3. Core User Flows

### 3.1 Solo Mode (Default)

```
Mở app → GPS auto-fill vị trí mình
       → Nhập vị trí người kia (pin/link/search/GPS)
       → Bấm "Tìm quán"
       → Xem kết quả (map + list)
       → Chọn quán → Mở Google Maps navigate
```

**Không cần login. Không cần tạo account.**

### 3.2 Group Mode (2-4 người)

```
Host mở app → Tạo phòng → Nhận share link
           → Gửi link qua Zalo/Messenger
           → Bạn bấm link → Cho phép GPS → Auto share location
           → Host thấy realtime ai đã join
           → Đủ người → Bấm "Tìm quán"
           → Kết quả hiện cho tất cả
```

**Fallback:** Host có thể pin hộ bạn nếu bạn không bấm link.

## 4. Functional Requirements

### 4.1 Input Methods (4 cách nhập địa chỉ)

| Method | Mô tả | Priority |
|--------|--------|----------|
| GPS auto | Ô 1 pre-fill vị trí hiện tại | P0 |
| Pin trên map | Tap vào map để chọn điểm | P0 |
| Paste Google Maps link | Parse tọa độ từ URL (short link + full link) | P0 |
| Text search | Autocomplete từ Google Places API | P0 |

### 4.2 Smart Midpoint

- **MVP:** Trung điểm tọa độ (centroid cho group 3-4 người)
- **Auto-expand:** Nếu midpoint rơi vào vùng trống (sông, đồng, KCN) → tự mở rộng radius cho đến khi có kết quả
- **V2 (out of MVP):** Travel-time based midpoint

### 4.3 Results Display

- **Map view:** Midpoint marker + pin các quán xung quanh
- **List view (bên dưới map):**
  - Tên quán
  - Rating (stars)
  - Số reviews
  - Khoảng cách từ midpoint
- **Filter:** Quán ăn / Cafe
- **Sort:** Google Maps rating (default)
- **Result count:** 5 / 10 / 20 (default 10)
- **Radius slider:** Mở rộng/thu hẹp vùng tìm
- **Tap quán:** Mở Google Maps để navigate

### 4.4 Group Flow

- Tạo phòng (lightweight, không cần auth)
- Generate share link (unique URL)
- Realtime sync: host thấy members join
- Capacity: 2-4 người
- Fallback: host pin hộ member

## 5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Thời gian tìm quán | < 3 giây sau khi bấm "Tìm quán" |
| Supported locations | 2 người (solo) đến 4 người (group) |
| Platform | Web app (mobile-first responsive) |
| Auth | Không bắt buộc (solo). Lightweight session (group). |
| Offline | Không hỗ trợ (cần GPS + API) |

## 6. MVP Scope

### In Scope
- Multi-input (GPS, pin, Google Maps link, text search)
- 2-4 người
- Quán ăn + Cafe filter
- Google Maps rating sort
- Adjustable radius
- Flexible result count (5/10/20)
- Share link group flow
- Map view + list view
- Smart midpoint correction (auto-expand)
- Mobile-first responsive web

### Out of Scope (V2+)
- Swipe UI / Tinder-style chọn quán
- Travel time estimation / isochrone midpoint
- Bill splitting
- Account system / login
- Categories ngoài quán ăn/cafe
- Push notifications
- Lịch sử tìm kiếm
- Review/rating trong app

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Time-to-result (mở app → thấy kết quả) | < 30 giây (solo mode) |
| Group flow completion rate | > 60% (tất cả members join thành công) |
| Tap-to-navigate rate | > 40% users chọn quán và navigate |

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Goong API quota (1000 req/ngày) | Hết quota nếu viral | Cache results, debounce autocomplete, monitor usage |
| GPS không chính xác | Midpoint lệch | Cho phép user adjust pin sau khi GPS fill |
| Google Maps link format thay đổi | Parse fail | Regex flexible + fallback về text search |
| Group member không bấm link | Flow bị stuck | Fallback: host pin hộ |
| Midpoint rơi vào vùng trống | Không có kết quả | Auto-expand radius |

## 9. Monetization Strategy

### Phase 1 — MVP Launch
| Kênh | Mô tả | Revenue Model |
|------|--------|---------------|
| **Featured Listings** | Nhà hàng/cafe trả tiền để hiện đầu kết quả với tag "Tài trợ" | 500k-2M/tuần theo khu vực |
| **Freemium** | Free: 2 người, 5 kết quả, restaurant + cafe. Pro (49k/tháng): 4 người, 20 kết quả, thêm bar/karaoke/cinema, lưu lịch sử | Subscription |

### Phase 2 — Traction (1k+ DAU)
| Kênh | Mô tả | Revenue Model |
|------|--------|---------------|
| **Voucher/Deal partnerships** | Hợp tác ShopeeFood/Grab → voucher giảm giá tại quán gợi ý | Commission 5-15% per redemption |
| **Booking integration** | Nút "Đặt bàn" liên kết PasGo/TableNow | 10-20k/booking |
| **Group activity upsell** | Gợi ý đặt karaoke, book Grab đến điểm hẹn | Affiliate commission |

### Phase 3 — Scale (10k+ DAU)
| Kênh | Mô tả | Revenue Model |
|------|--------|---------------|
| **B2B API** | Bán API "tìm điểm giữa" cho dating apps, event planners | SaaS theo API calls |
| **Data insights** | Heatmap điểm hẹn phổ biến (ẩn danh) → bán cho F&B brands chọn vị trí mở quán | Data licensing |
| **MeetMid for Business** | Team lunch, client meeting planning, tích hợp Slack/Teams | 99k/user/tháng |

> **Key insight:** Featured Listings là money maker chính — nhà hàng VN sẵn sàng trả cho local traffic, và MeetMid user có purchase intent cực cao.

## 10. Open Questions

1. **Tech stack chốt?** Next.js web app hay React Native/Flutter native app?
2. **Backend cho group flow:** Serverless (Supabase/Firebase) hay custom server?
3. **Google Maps API billing:** Budget bao nhiêu/tháng cho MVP?
4. **Share link format:** Deep link (native) hay web URL?
