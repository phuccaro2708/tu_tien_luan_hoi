# Báo cáo phase P1a – Nhân vật kiếp 1, kỹ năng, thọ nguyên

Ngày: 2026-10-25 · Nhánh: `feat/p1-character` (tách từ `main` 90b0504)

## 1. File thay đổi

- **Mới:**
  - `src/data/character.ts`
  - `src/systems/character.ts`, `src/systems/skills.ts`, `src/systems/lifespan.ts`
  - `tests/unit/character.test.ts`
  - `docs/technical/IMPLEMENTATION_STATUS.md`
- **Sửa:**
  - `src/types/game.ts`, `src/data/content.ts`, `src/data/registry.ts`
  - `src/core/state.ts`, `src/core/engine.ts`
  - `src/systems/conditions.ts`, `src/systems/effects.ts`, `src/systems/actions.ts`
  - `src/utils/save.ts`, `src/App.tsx`
  - `tests/fixtures/content.ts`, `tests/unit/{core,systems,regressions,save-offline}.test.ts`, `tests/integration/engine.test.ts`

## 2. Tóm tắt công việc

- **Khởi tạo kiếp 1** (D04, PROGRESSION §3):
  - Thứ tự rút từ RNG có seed: linh căn Ngũ 35 / Tứ 50 / Tam 15 → các hệ → ngộ tính [0.85, 1.15) → xuất thân (1/3 mỗi loại) → thiên phú bậc I (1/6 mỗi loại).
  - Xuất thân cộng vốn và cấp kỹ năng khởi đầu.
  - `[GIẢ ĐỊNH]` các hệ được chọn đều theo tổ hợp.
- **Kỹ năng** (PROGRESSION §5):
  - 6 kỹ năng, lưu XP cộng dồn. `XP(L→L+1) = round(10 × max(1,L)^1.6)`, tối đa cấp 50.
  - Hệ số XP = Ngộ (Văn Tự, Thảo Dược, Thổ Nạp) × thiên phú.
  - Thêm condition `skillAtLeast` và effect `addSkillXp`. Effect áp nguyên khối: tài nguyên không đủ thì không cộng XP.
- **Thọ nguyên** (PROGRESSION §6):
  - `60 + min(6, floor(Thể Phách/5)) + thiên phú`.
  - Kiểm tra ở cuối mỗi tick (bước 8 của pipeline).
  - Cảnh báo khi còn 10/5/1 năm sẽ tạm dừng game và ghi đè điểm dừng thường.
  - Cái chết là điểm dừng `death` đúng tick, tất định, ghi đè mọi điểm dừng khác. Sau khi chết, engine từ chối mọi lệnh. UI ẩn nút "Tiếp tục".
- **Save v2:**
  - Thêm `character` và `skillXp`, có bảng migrate tuần tự.
  - v1→v2 tung kiếp 1 từ `rng` của save v1, cho ra đúng kiếp 1 của game mới cùng seed.
  - `validateState` kiểm tra đầy đủ các trường mới, chống khóa prototype.
- **Dữ liệu nhân vật** tách sang `src/data/character.ts`. Lý do: fixture test dùng chung dữ liệu này, trong khi store test lại mock `src/data/content`. Nếu không tách sẽ có vòng import khiến test treo.

## 3. Kết quả test/lint/build

| Lệnh                   | Kết quả                                                  |
| ---------------------- | -------------------------------------------------------- |
| `npm run lint`         | Sạch (0 lỗi, 0 cảnh báo)                                 |
| `npm run test`         | 184/184 PASS, 8 file (118 cũ + 53 mới + 13 case dữ liệu) |
| `npm run build`        | OK (`tsc -b` + Vite, 241.77 kB JS)                       |
| `npm run format:check` | OK                                                       |

Không có test nào bị bỏ qua hay xóa. Có 3 test cũ phải sửa:

- Test replay tính `van` cộng thêm vốn xuất thân.
- Các test ghim `version: 1` đổi sang `SAVE_VERSION`.
- Các lời gọi `evaluateCondition`/`firstUnmet` thêm tham số `content`.

## 4. Vấn đề còn lại

- **Câu hỏi cho người dùng:**
  - D06 nói "không chết khi offline", nhưng S13 nói offline phải cho kết quả giống online. Bản cài đặt theo S13: chết đúng tick, kể cả khi offline. Phần offline còn lại chuyển thành Tích Thời nhưng không dùng được sau khi chết.
  - Bảng XP trong PROGRESSION §5:
    - Cấp 30 ghi 2305, nhưng công thức cho 2309.
    - Cột cộng dồn không nhất quán: cấp 1 = 10, nhưng các giá trị 190/1337 lại bỏ bước L=0.
    - Code đang theo công thức. Cần xác nhận.
  - D05 (tên, giới tính) chưa rõ giá trị nên chưa làm.
  - Thiên phú Chất phác bậc II chưa ghi hệ số XP. Chỉ ảnh hưởng P6.
- **Nợ kỹ thuật:**
  - Dữ liệu thật chưa có hành động nào cộng XP (chờ S2/D23).
  - Hiệu ứng Tinh lực tối đa (Cường tráng) và thiện cảm (Chất phác) chưa áp.
  - Thọ nguyên chưa có phần LK và phần đã mất.
  - R03 vẫn mở.

## 5. Đề xuất bước tiếp theo

1. Codex review nhánh này, tập trung vào migrate v1→v2, thứ tự rút RNG và quy tắc ghi đè điểm dừng.
2. Người dùng trả lời các câu hỏi ở mục 4 và duyệt D23.
3. Sau đó làm P1b: kinh tế phàm nhân (S2, Đói, nợ).
