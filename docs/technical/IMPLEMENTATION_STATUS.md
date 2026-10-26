# Implementation Status

Cập nhật: 2026-10-25 · Nhánh: `feat/p1-character` · Nguồn phase: `IMPLEMENTATION_PLAN.md` §2.

Trạng thái:

- `NOT_STARTED`
- `IN_PROGRESS`
- `IMPLEMENTED`: có code và test, chưa review độc lập.
- `VERIFIED`: tiêu chí thoát có bằng chứng chạy được.
- `BLOCKED`: chờ quyết định đang ở Draft.

Kết quả kiểm tra mới nhất: xem `docs/reports/phase/2026-10-25-p1a-qa-fixes.md` §3.

## P0 – Khung engine + harness

- **Status:** `VERIFIED`
- **Dependencies:** không có (không dùng quyết định Draft).
- **Files:**
  - `src/core/*`
  - `src/systems/{actions,conditions,effects,resources,offline}.ts`
  - `src/utils/save.ts`, `src/stores/gameStore.ts`, `src/hooks/useGameLoop.ts`, `src/App.tsx`
  - `tests/integration/harness.ts`
- **Tests:** mỗi tiêu chí thoát có test đang PASS.
  - (1) chia frame khác nhau → `core.test.ts` "different frame splits…"
  - (2) 5× = 5 × 1× → "speed scales ticks…"
  - (3) RNG 1 000 số → "same seed → same 1000 numbers…"
  - (4) save round-trip / save hỏng → `save-offline.test.ts`, `engine.test.ts` "boot…"
  - (5) ESLint chặn React trong engine → `engine.test.ts` "architecture guard"
  - (6) 10 000 tick < 1 giây → "harness runs 10 000 ticks…"
  - Đã merge vào `main` (PR #1) sau 3 vòng `/code-review` và audit N01–N09 (`docs/reports/phase/2026-10-24-*.md`).
- **Known issues:** R03 (thứ tự hành động → ngày) còn mở, chờ P1b.
- **Next recommended module:** P1a.

## P1a – Nhân vật kiếp 1, kỹ năng, thọ nguyên (S1 phần thọ nguyên + khởi tạo kiếp 1, S3)

- **Status:** `IMPLEMENTED` (đã sửa QA-01, QA-02 của lượt review 2026-10-25; chờ review lại)
- **Dependencies:** D04, PROGRESSION §3/§5/§6 (đã duyệt v0.1); D31, D32, D35 (duyệt 2026-10-25); P0.
- **Files:**
  - Dữ liệu và kiểu: `src/data/character.ts`, `src/data/content.ts`, `src/data/registry.ts`, `src/types/game.ts`
  - Hệ thống: `src/systems/{character,skills,lifespan,stamina,conditions,effects,actions,offline}.ts`
  - Engine và save: `src/core/{state,engine}.ts`, `src/utils/save.ts` (v2 + migrate v1→v2)
  - Store và UI: `src/stores/gameStore.ts` (`newLife`), `src/App.tsx`
- **Tests:**
  - `tests/unit/character.test.ts` bao phủ:
    - tung kiếp 1: tất định, golden seed 1, phân phối trên 10 000 seed; xuất thân;
    - bảng XP, Ngộ/thiên phú, trần cấp 50;
    - unlock `skillAtLeast` qua action; effect nguyên khối;
    - cảnh báo 10/5/1, chết đúng tick, chặn lệnh sau khi chết, offline dừng khi chết;
    - save v2/migrate, kể cả save v1 đã quá thọ nguyên hoặc đã lão hóa; save v1 hỏng (thiếu/sai `rng`, Tinh lực sai kiểu hoặc vượt trần v1) bị từ chối, không throw (QA-01); `validateState`;
    - danh tính (D32): chờ `chooseIdentity`, tên hợp lệ/không hợp lệ, không cộng Tích Thời khi chưa chọn;
    - Tinh lực tối đa (D35): công thức, lão hóa, kẹp ở sinh nhật (trước hành động, QA-02) và khi effect cộng, save Cường tráng.
  - `tests/unit/save-offline.test.ts`: save v1 hỏng ở khóa chính → boot → autosave, backup tốt vẫn còn và bản hỏng được cách ly (QA-01).
  - `tests/unit/core.test.ts`: case dữ liệu `identity`, `stamina` sai.
  - `tests/integration/store.test.ts`: `newLife` (D31).
  - Smoke test trình duyệt 2026-10-25: chọn danh tính → thời gian chạy; chết → "Bắt đầu kiếp mới" → kiếp mới được lưu.
  - Tiêu chí thoát P1 (5) "cùng seed → cùng kiếp 1" đã có test. Tiêu chí (2)–(4) thuộc P1b.
- **Known issues:**
  - Save v2 tạo từ commit 59843b3 trở về trước thiếu `identity` nên bị cách ly khi mở. Nhánh chưa merge nên không migrate; QA cần xóa localStorage.
  - Chưa có hành động nào trong dữ liệu thật cộng XP. Nguồn XP đến từ S2 (P1b).
  - Thọ nguyên chưa có phần `3 × tầng LK` và phần đã mất (S9, P3/P4).
  - Thiện cảm của Chất phác chưa áp (S7, P3). Chất phác bậc II/III làm ở P6.
  - Xuất thân chưa có rìu/giỏ thuốc (S10) và nợ (P1b).
  - UI chưa hiển thị linh căn, ngộ, kỹ năng, thọ nguyên, Tinh lực.
  - "Bắt đầu kiếp mới" là lối tạm (D31), P4 thay bằng Vong Xuyên.
- **Next recommended module:** P1b.

## P1b – Kinh tế phàm nhân (S2 hành động nhóm phàm, thu nhập trước phí, Đói, nợ)

- **Status:** `NOT_STARTED`
- **Dependencies:** D23 (đã duyệt 2026-10-25); P1a.
- **Files:** —
- **Tests:** —
- **Known issues:** R03 sẽ được quyết định cùng phần này.
- **Next recommended module:** P2.

## P2 – Thế giới, tri thức, sự kiện

- **Status:** `BLOCKED`
- **Dependencies:** D21, D24; P1.
- **Files:** —
- **Tests:** —
- **Known issues:** —
- **Next recommended module:** P3.

## P3 – NPC, chiến đấu, tới LK1

- **Status:** `BLOCKED`
- **Dependencies:** D18, D25; P2.
- **Files:** —
- **Tests:** —
- **Known issues:** —
- **Next recommended module:** P4.

## P4 – Lát cắt dọc hai kiếp

- **Status:** `NOT_STARTED`
- **Dependencies:** P3. Dùng điểm dừng `death` của P1a làm lối vào Vong Xuyên, thay cho nút "Bắt đầu kiếp mới" tạm thời (D31).
- **Files:** —
- **Tests:** —
- **Known issues:** —
- **Next recommended module:** P5.

## P5 – Môn phái, vật phẩm, chuỗi trung hạn

- **Status:** `BLOCKED`
- **Dependencies:** D20; P4.
- **Files:** —
- **Tests:** —
- **Known issues:** —
- **Next recommended module:** P6.

## P6 – Luân hồi đầy đủ + Trúc Cơ

- **Status:** `BLOCKED`
- **Dependencies:** D17, D19; P5. Thiên phú bậc II/III, Song/Thiên linh căn được thêm ở phase này.
- **Files:** —
- **Tests:** —
- **Known issues:** — (Chất phác bậc II đã có hệ số Giao Tế ×0,9, D36.)
- **Next recommended module:** P7.

## P7 – Offline, cân bằng, nội dung

- **Status:** `NOT_STARTED`
- **Dependencies:** P6.
- **Files:** Phần offline + Tích Thời cơ bản đã có từ P0 (`src/systems/offline.ts`).
- **Tests:** `save-offline.test.ts` (phần cơ bản).
- **Known issues:** —
- **Next recommended module:** P8.

## P8 – QA & hoàn thiện

- **Status:** `NOT_STARTED`
- **Dependencies:** P7.
- **Files:** —
- **Tests:** —
- **Known issues:** —
- **Next recommended module:** —

## Module tiếp theo đề xuất

**P1b – Kinh tế phàm nhân**. D23 đã duyệt 2026-10-25 nên không còn bị chặn. Đây là module duy nhất mở được tiêu chí thoát P1 (2)–(4) và đem lại nguồn XP cho kỹ năng.
