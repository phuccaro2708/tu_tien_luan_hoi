# Implementation Plan

> **Trạng thái: Draft – 2026-10-23** · Chỉ bắt đầu code khi `docs/GDD.md` ở trạng thái `Approved`. Tài liệu này không chứa code gameplay.

## 1. Kiến trúc

```
src/
  core/      clock.ts (bước cố định), rng.ts (PRNG có seed), engine.ts (tick pipeline), state.ts (kiểu GameState + khởi tạo)
  systems/   time, actions, skills, knowledge, locations, events, npcs, combat, cultivation, items, sect, reincarnation, offline
  data/      địa điểm, hành động, sự kiện, NPC, vật phẩm, công pháp, địch (TS const có kiểu) + validators
  types/     kiểu dùng chung
  stores/    Zustand store: giữ GameState, gọi engine, không chứa luật chơi
  utils/     save (serialize, validate, migrate), format số/ngày
  components/, pages/, hooks/, styles/   React UI – chỉ đọc state và gửi lệnh
```

| Nguyên tắc (AGENTS.md) | Cách áp dụng                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine độc lập UI      | `core/`, `systems/`, `data/`, `types/` không import React, DOM, Zustand; ESLint `no-restricted-imports` cho các thư mục này                           |
| Một nguồn sự thật      | Toàn bộ trạng thái trong một `GameState` thuần dữ liệu (JSON được); UI chỉ suy diễn qua selector                                                      |
| Mô phỏng tất định      | Hệ là hàm thuần `(state, lệnh, ctx) => state`; RNG state nằm trong `GameState`; không dùng `Date.now`, `performance.now`, `Math.random` trong engine  |
| Clock tập trung        | `clock` nhận `now()` được inject; bộ tích lũy ms → số tick; tốc độ ×1/×2; React dùng `requestAnimationFrame` chỉ để đẩy thời gian vào clock và render |
| Không phụ thuộc FPS    | Tick cố định 500 ms ở ×1; số tick chỉ phụ thuộc thời gian thực đã trôi                                                                                |
| Data-driven            | Nội dung là dữ liệu có kiểu; validator viết tay (không thêm dependency) chạy trong test                                                               |
| Save có version        | `{ version, savedAt, state }`; migrate tuần tự `vN → vN+1`; validate trước và sau migrate                                                             |
| Offline có trần        | 8 giờ, chạy chính engine (BALANCE §7)                                                                                                                 |

### Pipeline một tick (thứ tự cố định)

1. Thời gian: ngày +1, tuổi, hết hạn trạng thái.
2. Sinh hoạt phí / lương khô.
3. Hành động hiện tại (gồm quy tắc nghỉ và tự làm thuê).
4. Tu luyện / đột phá đang diễn ra.
5. Đan Độc, hồi phục thương.
6. NPC (tuổi, chết theo lịch).
7. Sự kiện (lịch cố định → ngẫu nhiên có seed).
8. Kiểm tra điểm dừng; chết → chuyển sang trạng thái Vong Xuyên.

Các bước đọc state đầu vào của bước trước; thứ tự được ghi trong test để không đổi ngầm.

## 2. Các phase

Mỗi phase kết thúc bằng 4 lệnh kiểm tra và báo cáo 5 mục (AGENTS.md). Codex review sau mỗi phase; Antigravity QA từ P3.

| Phase                                        | Nội dung                                                                                                                                  | Tiêu chí thoát                                                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **P0 – Khung engine**                        | `GameState` tối thiểu, clock bước cố định, RNG có seed, engine tick rỗng, store, trang hiển thị ngày/tuổi, save/load v1                   | Test: chia frame khác nhau → cùng số tick; RNG cùng seed cùng chuỗi; round-trip save; ESLint chặn import React trong engine |
| **P1 – Vòng phàm nhân**                      | S1 thời gian/thọ nguyên, S2 hành động (nhóm phàm), S3 kỹ năng, sinh hoạt phí, nợ 800 văn                                                  | Test theo SYSTEMS S1–S3; mô phỏng 360 ngày đốn củi trả được nợ trong ±10% BALANCE §3                                        |
| **P2 – Thế giới & tri thức**                 | S4 tri thức + biến thể văn bản, S5 địa điểm/đi đường/thám hiểm, S6 sự kiện + validator dữ liệu, Nhật ký                                   | Test S4–S6; kiểm thử tĩnh cờ mồ côi và ≥ 2 nguồn tri thức; snapshot giao diện ban đầu không lộ từ khóa                      |
| **P3 – NPC & chiến đấu**                     | S7 NPC/thiện cảm, S8 chiến đấu tự động, chuỗi Hồi 0–3 (WORLD_LORE §6)                                                                     | Test S7–S8; bảng TTK tái hiện ±1 lượt; có thể chơi tới hội tuyển/gặp Lục                                                    |
| **P4 – Tu luyện**                            | S9: công pháp, tu vi, thuần thục, đột phá, Tâm cảnh, Bế quan, Hắc Thạch Cốc                                                               | Test S9; walkthrough 30 phút (CORE_LOOP §5) đạt LK1 bằng harness với chính sách "nhánh Lục"                                 |
| **P5 – Môn phái, vật phẩm, chuỗi trung hạn** | S10, S11, chợ đêm, chuỗi Hắc Phong / vụ cháy / Tô / Tàn Bia / di sản Lục                                                                  | Test S10–S11; mọi chuỗi trong WORLD_LORE §6 hoàn thành được                                                                 |
| **P6 – Luân hồi**                            | S12: Vong Xuyên, Tàn Niệm, ký ức, Hồn dưỡng căn, xuất thân, thế giới +30 năm, người kế thừa                                               | Test S12; replay hai kiếp tất định; kiếp 2 phản ánh cờ kiếp 1                                                               |
| **P7 – Offline, cân bằng, nội dung**         | S13 offline + Tích Thời; harness headless (`tests/integration/pacing`) chạy engine với chính sách chơi cố định; bổ sung sự kiện tới 60–80 | Test S13; harness: mốc tuổi trong ±15% BALANCE §10; 8 giờ offline < 1 giây                                                  |
| **P8 – QA & hoàn thiện**                     | Sửa lỗi từ Codex/Antigravity, kiểm tra tiêu chí MVP_SCOPE §4, build preview Cloudflare Pages                                              | Toàn bộ checklist MVP_SCOPE §4                                                                                              |

## 3. Chiến lược kiểm thử

- **Unit:** mỗi hệ một file test trong `tests/unit/`, theo tiêu chí "Tiêu chí kiểm thử" của SYSTEMS.md.
- **Dữ liệu:** validator chạy trên toàn bộ `src/data` (ID trùng, tham chiếu hỏng, cờ mồ côi, sự kiện lớn thiếu lựa chọn tự do).
- **Replay:** ghi `{ seed, danh sách lệnh theo tick }` → chạy lại → so sánh hash state.
- **Pacing:** harness headless dùng engine thật, không dùng React; chạy trong Vitest với timeout rộng.
- **Không test UI chi tiết trong MVP:** chỉ smoke test render và snapshot từ khóa bị khóa.

## 4. Giả định kỹ thuật

- `[GIẢ ĐỊNH]` Một save JSON < 200 KB (localStorage giới hạn ~5 MB).
- `[GIẢ ĐỊNH]` 57 600 tick mô phỏng < 1 giây nếu mỗi tick O(số sự kiện hợp lệ); nếu không đạt, lập chỉ mục sự kiện theo địa điểm/hành động.
- Không thêm dependency mới cho MVP; nếu cần (VD thư viện validate schema), hỏi người dùng trước.
