# Implementation Status

Cập nhật: 2026-10-25 · Nhánh: `feat/p1-character` · Nguồn phase: `IMPLEMENTATION_PLAN.md` §2.

Trạng thái:

- `NOT_STARTED`
- `IN_PROGRESS`
- `IMPLEMENTED`: có code và test, chưa review độc lập.
- `VERIFIED`: tiêu chí thoát có bằng chứng chạy được.
- `BLOCKED`: chờ quyết định đang ở Draft.

Kết quả kiểm tra mới nhất: xem `docs/reports/phase/2026-10-25-p1a-character.md` §3.

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

- **Status:** `IMPLEMENTED` (chờ Codex review)
- **Dependencies:** D04, PROGRESSION §3/§5/§6 (đã duyệt v0.1); P0.
- **Files:**
  - Dữ liệu và kiểu: `src/data/character.ts`, `src/data/content.ts`, `src/data/registry.ts`, `src/types/game.ts`
  - Hệ thống: `src/systems/{character,skills,lifespan,conditions,effects,actions}.ts`
  - Engine và save: `src/core/{state,engine}.ts`, `src/utils/save.ts` (v2 + migrate v1→v2)
  - UI: `src/App.tsx`
- **Tests:**
  - `tests/unit/character.test.ts` (54 test) bao phủ:
    - tung kiếp 1: tất định, golden seed 1, phân phối trên 10 000 seed; xuất thân;
    - bảng XP, Ngộ/thiên phú, trần cấp 50;
    - unlock `skillAtLeast` qua action; effect nguyên khối;
    - cảnh báo 10/5/1, chết đúng tick, chặn lệnh sau khi chết, offline dừng khi chết;
    - save v2/migrate, kể cả save v1 đã quá thọ nguyên; `validateState`.
  - `tests/unit/core.test.ts`: 13 case dữ liệu nội dung sai.
  - Tiêu chí thoát P1 (5) "cùng seed → cùng kiếp 1" đã có test. Tiêu chí (2)–(4) thuộc P1b.
- **Known issues:**
  - **Softlock sau khi chết:**
    - Bản build hiện chưa có hành động nào, thọ nguyên 60 năm, nên nhân vật chết sau khoảng 2,3 giờ chơi ở 1× (khoảng 28 phút ở 5×, hoặc sau vài lần offline dài).
    - Khi đã chết, mọi lệnh bị từ chối và không có đường chơi lại tới khi có Vong Xuyên (P4). Chỉ thoát được bằng cách xóa localStorage.
    - Save P0 đã chơi ≥ 46 năm game sẽ chết ngay ở tick đầu sau khi migrate.
    - Cần người dùng quyết định có thêm nút "Chơi lại" tạm thời hay không.
  - Chưa có hành động nào trong dữ liệu thật cộng XP. Nguồn XP đến từ S2 (P1b).
  - Thọ nguyên chưa có phần `3 × tầng LK` và phần đã mất (S9, P3/P4).
  - Hiệu ứng thiên phú chưa áp: Tinh lực tối đa (Cường tráng), thiện cảm (Chất phác).
  - Xuất thân chưa có rìu/giỏ thuốc (S10) và nợ (chờ D23).
  - UI chưa hiển thị linh căn, ngộ, kỹ năng, thọ nguyên.
  - D05 (tên, giới tính) chưa làm.
- **Next recommended module:** P1b.

## P1b – Kinh tế phàm nhân (S2 hành động nhóm phàm, thu nhập trước phí, Đói, nợ)

- **Status:** `BLOCKED`
- **Dependencies:** D23 (Draft); P1a.
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
- **Dependencies:** P3. Dùng điểm dừng `death` của P1a làm lối vào Vong Xuyên; xử lý luôn softlock sau khi chết.
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
- **Known issues:** Thiên phú Chất phác bậc II chưa có hệ số XP trong GDD.
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

**P1b – Kinh tế phàm nhân**, sau khi người dùng duyệt **D23**. Đây là module duy nhất mở được tiêu chí thoát P1 (2)–(4) và đem lại nguồn XP cho kỹ năng.

Nếu D23 chưa duyệt kịp, có thể làm bảng nhân vật chỉ đọc (linh căn, ngộ, kỹ năng, thọ nguyên): không cần quyết định mới. Riêng phần tên/giới tính phải đợi D05 rõ.
