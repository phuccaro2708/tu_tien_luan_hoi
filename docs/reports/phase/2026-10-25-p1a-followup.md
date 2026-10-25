# Báo cáo P1a (bổ sung) – Xử lý các vấn đề còn lại

Ngày: 2026-10-25 · Nhánh: `feat/p1-character` · Nối tiếp `2026-10-25-p1a-character.md`

Người dùng chốt các quyết định D31–D36 và duyệt D23 ngày 2026-10-25. Báo cáo này ghi lại phần tài liệu và code đã làm theo các quyết định đó.

## 1. File thay đổi

- **Tài liệu** (commit a8dd804):
  - `docs/GDD.md`
  - `docs/design/{PROGRESSION,SYSTEMS,BALANCE}.md`
  - `docs/technical/IMPLEMENTATION_PLAN.md`
- **Danh tính – D32** (650aca3):
  - `src/types/game.ts`, `src/data/{character,registry}.ts`
  - `src/systems/{character,offline}.ts`, `src/core/{state,engine}.ts`
  - `src/utils/save.ts`, `src/App.tsx`
  - test: `tests/fixtures/content.ts`, `tests/integration/{harness,engine.test,store.test}.ts`, `tests/unit/*.test.ts`
- **Tinh lực tối đa – D35** (61c3c10):
  - mới: `src/systems/stamina.ts`
  - sửa: `src/types/game.ts`, `src/data/{character,content,registry}.ts`, `src/systems/lifespan.ts` (nhận `ageYears`), `src/core/{state,engine}.ts`, `src/utils/save.ts`, `src/App.tsx`
  - test: `tests/fixtures/content.ts` (thêm action `rest`), `tests/unit/{character,core,systems}.test.ts`
- **Kiếp mới – D31** (5ba6f59):
  - `src/stores/gameStore.ts`, `src/App.tsx`, `tests/integration/store.test.ts`
- **Tiến độ:** `docs/technical/IMPLEMENTATION_STATUS.md` và báo cáo này.

## 2. Tóm tắt công việc

- **Tài liệu:**
  - D23 đổi sang đã duyệt ở mọi nơi.
  - Thêm §12 (D31–D36) vào GDD.
  - Bảng XP sửa theo công thức (D33).
  - Công thức lão hóa (D35) ghi vào PROGRESSION §6 và BALANCE §3.
  - Chất phác II: Giao Tế ×0,9 (D36).
  - D34 ghi vào S13 và BALANCE §7.
- **Danh tính** (D32, SYSTEMS S1):
  - Game mới và save v1 sau khi migrate dừng ở stop `chooseIdentity`.
  - Engine chỉ nhận lệnh `setIdentity` cho tới khi chọn xong.
  - Tên: chuẩn hóa NFC, cắt khoảng trắng hai đầu, dài 1–16 ký tự (đếm theo code point), không chứa ký tự điều khiển. Giới tính: Nam/Nữ.
  - `validateState` giữ invariant: danh tính là `null` khi và chỉ khi stop là `chooseIdentity`.
  - `[GIẢ ĐỊNH, đã duyệt cùng plan]` Khi đang chờ chọn danh tính, thời gian vắng mặt không cộng vào Tích Thời.
- **Tinh lực tối đa** (D35, PROGRESSION §6):
  - Công thức: `max(0, 100 + min(30, cấp Thể Phách) + thiên phú − 2 × max(0, tuổi − floor(80% × thọ nguyên)))`. Cường tráng được +10.
  - Kẹp Tinh lực trong `step`, ngay sau khi sang ngày mới (pipeline bước 1). Effect cộng Tinh lực cũng bị kẹp trong cùng tick.
    - **Lệch khỏi plan:** plan định truyền map mức tối đa động vào `applyResourceDeltas`. Bản cài đặt giữ `applyResourceDeltas` kẹp theo trần tĩnh 140, rồi kẹp lại một lần trong `step`. Hai cách cho cùng kết quả vì `resolveEffects` gộp delta ròng của từng tài nguyên và chỉ gọi `applyResourceDeltas` một lần: `min(min(v, 140), m) = min(v, m)` với `m ≤ 140`. Diff nhỏ hơn, không phải sửa chữ ký hàm ở mọi chỗ gọi.
  - Kiếp mới bắt đầu với Tinh lực đầy.
  - Save v1 đã lão hóa: kẹp Tinh lực thay vì từ chối save.
  - Trần tuyệt đối của tài nguyên `tinhLuc` là 140. Registry kiểm tra trần này đủ chứa mức tối đa cao nhất có thể. `validateState` từ chối giá trị vượt mức tối đa hiện tại.
  - Mốc lão hóa lưu dưới dạng phần trăm nguyên (`agingFromPercent: 80`) để tránh sai số số thực.
- **Kiếp mới** (D31):
  - Khi chết, màn hình hiện "Kiếp này đã hết ở tuổi X (thọ nguyên Y)" kèm nút "Bắt đầu kiếp mới".
  - Bấm nút sẽ hiện `confirm`, cảnh báo kiếp cũ và Tích Thời mất hẳn.
  - Store action `newLife` tạo kiếp 1 mới (seed lấy từ đồng hồ, giống lúc boot) rồi lưu ngay. Khi nhân vật chưa chết, action này không làm gì.
  - Có comment `ponytail:` ghi rõ đây là lối tạm tới P4.

## 3. Kết quả test/lint/build

| Lệnh                   | Kết quả                                  |
| ---------------------- | ---------------------------------------- |
| `npm run lint`         | Sạch (0 lỗi, 0 cảnh báo)                 |
| `npm run test`         | 224/224 PASS, 8 file (trước đợt này 185) |
| `npm run build`        | OK (`tsc -b` + Vite, 245.90 kB JS)       |
| `npm run format:check` | OK                                       |

- **Smoke test trình duyệt** (Vite dev + Playwright):
  - Form danh tính hiện ra. Nhập " Lý Thanh Vân ", chọn Nữ → tên hiển thị đã được cắt khoảng trắng, ngày chạy ở 1×.
  - Sửa save thành đã chết rồi tải lại → hiện màn "Kiếp này đã hết", nút Tiếp tục và nút Tích Thời bị ẩn.
  - Bấm "Bắt đầu kiếp mới" và đồng ý → form danh tính hiện lại; save có day 0, Tích Thời 0, Tinh lực 100, stop `chooseIdentity`.
  - Lỗi console duy nhất là 404 `favicon.ico` (có từ trước).
- **Test cũ phải sửa:**
  - Các test có chạy tick chuyển sang helper `startGame`, vì game mới giờ dừng ở `chooseIdentity`.
  - Golden snapshot thêm `identity: null`.
  - Test migrate v1 kỳ vọng Tinh lực giữ 100 thay vì đầy.
  - Test kẹp overflow dùng trần 140.
  - Không test nào bị xóa hay bỏ qua.

## 4. Vấn đề còn lại

- **Save v2 cũ không tương thích:** save tạo từ commit 59843b3 trở về trước thiếu `identity`, nên bị cách ly khi mở và game mới được tạo. Nhánh chưa merge nên không viết migrate riêng. Antigravity/QA cần xóa localStorage trước khi playtest.
- **Kiếp mới không khôi phục được kiếp cũ:** save chính bị ghi đè ngay. Backup chỉ giữ bản đã chết tới lần autosave kế tiếp. Hộp xác nhận đã nói rõ điều này.
- **Hoãn sang phase sau:**
  - Thiện cảm của Chất phác (S7, P3).
  - Thọ nguyên theo tầng LK và phần thọ nguyên đã mất (S9, P3/P4).
  - Nguồn XP, R03, thu nhập và Khí huyết theo Thể Phách (P1b/P3).
  - Chất phác bậc II/III (P6).
- **UI** chưa hiển thị Tinh lực, linh căn, kỹ năng và thọ nguyên. Thuộc phần UI của các phase sau.

## 5. Đề xuất bước tiếp theo

1. Codex review các commit 650aca3, 61c3c10 và 5ba6f59. Nên tập trung vào:
   - invariant danh tính ↔ `chooseIdentity`;
   - kẹp Tinh lực khi migrate với dữ liệu chưa tin cậy;
   - `newLife` cùng khóa ghi save.
2. Antigravity playtest sau khi xóa localStorage: chọn tên, chơi tới khi chết (5× khoảng 28 phút), rồi bắt đầu kiếp mới.
3. Lượt sau: P1b – Kinh tế phàm nhân. D23 đã duyệt nên module này đã mở khóa.
