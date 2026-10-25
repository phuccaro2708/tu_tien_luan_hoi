# Implementation Status

Cập nhật: 2026-10-25 · Nhánh: `feat/p1-character` · Nguồn phase: `IMPLEMENTATION_PLAN.md` §2.

Trạng thái: `NOT_STARTED` / `IN_PROGRESS` / `IMPLEMENTED` (code + test, chưa review độc lập) / `VERIFIED` (tiêu chí thoát có bằng chứng chạy được) / `BLOCKED` (chờ quyết định Draft).

Lần chạy kiểm tra gần nhất (2026-10-25, nhánh này): `npm run lint` sạch, `npm run test` 184/184 PASS (8 file), `npm run build` OK, `npm run format:check` OK.

## P0 – Khung engine + harness — `VERIFIED`

- **Dependencies:** không có (không dùng quyết định Draft).
- **Files:** `src/core/*`, `src/systems/{actions,conditions,effects,resources,offline}.ts`, `src/utils/save.ts`, `src/stores/gameStore.ts`, `src/hooks/useGameLoop.ts`, `src/App.tsx`, `tests/integration/harness.ts`.
- **Tests:** mỗi tiêu chí thoát có test đang PASS.
  - (1) chia frame → `core.test.ts` "different frame splits…"
  - (2) 5× = 5 × 1× → "speed scales ticks…"
  - (3) RNG 1 000 số → "same seed → same 1000 numbers…"
  - (4) save round-trip / save hỏng → `save-offline.test.ts`, `engine.test.ts` "boot…"
  - (5) ESLint chặn React trong engine → `engine.test.ts` "architecture guard"
  - (6) 10 000 tick < 1 giây → "harness runs 10 000 ticks…"
  - Đã merge vào `main` (PR #1) sau 3 vòng `/code-review` và audit N01–N09 (`docs/reports/phase/2026-10-24-*.md`).
- **Known issues:** R03 (thứ tự hành động → ngày) còn mở, chờ P1 kinh tế.

## P1a – Nhân vật kiếp 1, kỹ năng, thọ nguyên (S1 phần thọ nguyên + khởi tạo kiếp 1, S3) — `IMPLEMENTED`

- **Dependencies:** D04, PROGRESSION §3/§5/§6 (đã duyệt v0.1); P0.
- **Files:**
  - `src/data/character.ts`, `src/data/content.ts`, `src/data/registry.ts`, `src/types/game.ts`
  - `src/systems/{character,skills,lifespan,conditions,effects,actions}.ts`
  - `src/core/{state,engine}.ts`, `src/utils/save.ts` (v2 + migrate v1→v2), `src/App.tsx`
- **Tests:**
  - `tests/unit/character.test.ts` (53): tung kiếp 1 (tất định, golden seed 1, phân phối 10 000 seed), xuất thân, bảng XP, Ngộ/thiên phú, trần cấp 50, unlock `skillAtLeast` qua action, effect nguyên khối, cảnh báo 10/5/1, chết đúng tick, chặn lệnh sau khi chết, offline dừng khi chết, save v2/migrate, `validateState`.
  - `tests/unit/core.test.ts`: 13 case dữ liệu nội dung sai.
  - Tiêu chí thoát P1 (5) "cùng seed → cùng kiếp 1" đã có test. Các tiêu chí (2)–(4) thuộc phần kinh tế.
- **Known issues:**
  - Chưa có hành động nào trong dữ liệu thật cộng XP. Nguồn XP đến từ S2 (P1 kinh tế).
  - Các phần thọ nguyên còn thiếu: `3 × tầng LK`, thọ nguyên đã mất (S9, P3/P4).
  - Hiệu ứng của thiên phú chưa áp: Tinh lực tối đa (Cường tráng), thiện cảm (Chất phác).
  - Xuất thân chưa có rìu/giỏ thuốc (S10) và nợ (chờ D23).
  - Cái chết chỉ là điểm dừng `death`, chưa có Vong Xuyên (P4).
  - UI chưa hiển thị linh căn, ngộ, kỹ năng, thọ nguyên.
  - Tên và giới tính (D05) chưa làm.
  - Câu hỏi GDD mở: xem báo cáo phase 2026-10-25.

## P1b – Kinh tế phàm nhân (S2 hành động nhóm phàm, thu nhập trước phí, Đói, nợ) — `BLOCKED`

- **Dependencies:** D23 (Draft), P1a.
- **Files / Tests:** chưa có.
- **Known issues:** R03 sẽ được quyết định cùng phần này.

## P2 – Thế giới, tri thức, sự kiện — `BLOCKED`

- **Dependencies:** D21, D24; P1.

## P3 – NPC, chiến đấu, tới LK1 — `BLOCKED`

- **Dependencies:** D18, D25; P2.

## P4 – Lát cắt dọc hai kiếp — `NOT_STARTED`

- **Dependencies:** P3. Dùng điểm dừng `death` của P1a làm cửa vào Vong Xuyên.

## P5 – Môn phái, vật phẩm, chuỗi trung hạn — `BLOCKED`

- **Dependencies:** D20; P4.

## P6 – Luân hồi đầy đủ + Trúc Cơ — `BLOCKED`

- **Dependencies:** D17, D19; P5. Thiên phú bậc II/III, Song/Thiên linh căn thêm ở đây.

## P7 – Offline, cân bằng, nội dung — `NOT_STARTED`

- **Dependencies:** P6.
- Phần offline + Tích Thời cơ bản đã có từ P0.

## P8 – QA & hoàn thiện — `NOT_STARTED`

- **Dependencies:** P7.

## Module tiếp theo đề xuất

**P1b – Kinh tế phàm nhân**, sau khi người dùng duyệt **D23**. Đây là module duy nhất mở khóa được tiêu chí thoát P1 (2)–(4) và cung cấp nguồn XP cho kỹ năng. Nếu D23 chưa duyệt kịp, có thể làm bảng nhân vật chỉ đọc (linh căn, ngộ, kỹ năng, thọ nguyên). Việc này không cần quyết định mới, nhưng phần tên/giới tính phải đợi D05 rõ.
