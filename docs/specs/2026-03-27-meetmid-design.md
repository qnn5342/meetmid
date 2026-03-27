# MeetMid — Design Spec

## Overview

App tim diem hen giua cho 2-4 nguoi, suggest quan an/cafe sort theo Google Maps rating. Input linh hoat (GPS, pin, link, text search). Group flow qua share link. UI toi gian.

## Core Flow

1. Mo app -> GPS auto-fill vi tri minh
2. Nhap vi tri nguoi kia (pin/link/search/GPS share)
3. Bam "Tim quan"
4. App tinh midpoint -> query Google Places
5. Map view: midpoint + cac quan hien thi tren map
6. List view ben duoi: sort theo rating
7. User chon quan -> mo Google Maps navigate

## Input Methods

4 cach nhap dia chi:
- **GPS auto** — o 1 pre-fill vi tri hien tai
- **Pin tren map** — tap vao map de chon
- **Paste Google Maps link** — parse toa do tu URL
- **Text search** — autocomplete tu Google Places API

## Modes

### Solo Mode (default)
- Nhap 2 dia chi, tim luon
- Khong can dang ky/login

### Group Mode (2-4 nguoi)
- Tao "phong" -> nhan share link
- Gui link qua Zalo/Messenger
- Ban bam link -> cho phep GPS -> auto share location
- Host thay realtime ai da join
- Fallback: host pin ho neu ban khong bam link
- Du nguoi -> bam "Tim quan"

## Results Display

- **Map view:** Midpoint marker + pin cac quan xung quanh
- **List view ben duoi:** Ten quan, rating, so reviews, khoang cach tu midpoint
- **Filter:** Quan an / Cafe
- **Sort:** Theo Google Maps rating (default)
- **Result count:** 5 / 10 / 20 (default 10)
- **Radius slider:** Mo rong/thu hep vung tim
- **Tap quan:** Mo Google Maps de navigate

## Smart Midpoint

- MVP: Trung diem toa do (centroid cho group)
- Neu midpoint roi vao vung trong -> tu mo rong radius cho den khi co ket qua
- V2: Upgrade len travel-time based midpoint

## Tech Stack (de xuat)

- **Frontend:** React Native / Flutter (cross-platform) hoac Web app (Next.js)
- **APIs:** Google Maps SDK + Google Places API
- **Backend:** Minimal — chi can cho group flow (tao phong, sync location)
- **Auth:** Khong bat buoc cho solo mode. Group mode can lightweight session.

## MVP Scope

### In
- Multi-input (GPS, pin, GG Maps link, text search)
- 2-4 nguoi
- Quan an + Cafe
- Google Maps rating sort
- Adjustable radius
- Flexible result count
- Share link group flow
- Map view + list view
- Smart midpoint correction

### Out
- Swipe UI
- Travel time estimation
- Bill splitting
- Account system (solo mode)
- Categories ngoai quan an/cafe

## Brainstorming Origin

| # | Idea | Source |
|---|------|--------|
| S1 | Multi-input: GG Maps link, pin, GPS | SCAMPER |
| S2 | Group 3-4 nguoi | SCAMPER |
| S3 | Quan an + Cafe only (MVP) | SCAMPER |
| C4 | Sort theo Google Maps rating | SCAMPER |
| M5 | Adjustable search radius | SCAMPER |
| M6 | Flexible result count (5/10/20) | SCAMPER |
| RP7 | GPS auto-fill o 1, chi nhap o 2 | Role Play |
| RP8 | Share link -> GPS auto cho group | Role Play |
| RP9 | Fallback nhap ho ban | Role Play |
| RP10 | Text search autocomplete (Google Places) | Role Play |
| RP11 | UI to, flow 2 buoc toi gian | Role Play |
| RB12 | Smart midpoint correction | Reverse Brainstorm |
