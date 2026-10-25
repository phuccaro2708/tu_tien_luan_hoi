# P0 – Xử lý `/code-review` lượt 3 (10 finding)

Ngày: 2026-10-24 · Nhánh: `feat/p0-core-engine`

## 1. File thay đổi

- `src/stores/gameStore.ts`
- `src/App.tsx`
- `tests/integration/store.test.ts`
- `tests/integration/engine.test.ts`
- `tests/integration/harness.ts`

## 2. Tóm tắt công việc

| #   | Finding                                                                                                                                        | Xử lý                                                                                                                                                                                                                                                                                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tab tải (hoặc nhận khóa) khi đang ẩn mất toàn bộ thời gian tới frame đầu: clock chỉ được tạo ở frame đầu.                                      | **Sửa.** `boot()` tạo clock tại `performance.now()`. Bỏ cờ `ready` (clock khác null nghĩa là đã boot). Test: `a tab booted while hidden counts the time before its first frame`.                                                                                                                                                                                 |
| 2   | Autosave trong `frame()` gọi `settle(…, Infinity)`, chạy hết nợ trong một frame, trái SYSTEMS S1.                                              | **Sửa.** Frame chạm `MAX_TICKS_PER_FRAME` thì hoãn autosave tới khi chạy bù xong. Theo quyết định của người dùng, việc hoãn có trần: tối đa 5 × `AUTOSAVE_MS` (2,5 phút) tính từ lúc bắt đầu bù. Ẩn tab hoặc `pagehide` vẫn hạch toán hết, vì không thì mất thời gian (quyết định 4.1 trong `2026-10-24-p0-audit-n01-n09.md`). Test B02/S1 và N03 cập nhật theo. |
| 3   | Khoảng autosave đo bằng đồng hồ hệ thống; chỉnh đồng hồ lùi thì autosave ngừng.                                                                | **Sửa.** Đo bằng `clock.lastMs` (đơn điệu). Test: `autosave keeps running when the system clock is set back`.                                                                                                                                                                                                                                                    |
| 4   | `savedAt` theo đồng hồ hệ thống còn online theo `performance.now()`; máy ngủ trên hệ điều hành dừng `performance.now()` thì mất thời gian ngủ. | **Sửa theo quyết định của người dùng (2026-10-24): tính là offline.** `catchSleep()` lấy phần đồng hồ hệ thống chạy hơn clock (trên 5 giây) cho qua `simulateAway`, nên có trần 8 giờ và phần dư thành Tích Thời. Đồng hồ lùi thì bỏ qua. Test: `sleep that pauses the frame clock counts as offline`.                                                           |
| 5   | Lệnh chơi thành công đặt `error: null`, xóa luôn lỗi ghi save (VD hết quota).                                                                  | **Sửa.** Thêm trường riêng `saveError`: ghi được thì xóa, App hiện "Lưu thất bại: …". Test: `a failed write stays reported after a successful command`.                                                                                                                                                                                                          |
| 6   | Trang HTTP (VD preview qua IP LAN) không có Web Locks, nhưng thông báo lại bảo cập nhật trình duyệt.                                           | **Sửa thông báo.** `isSecureContext === false` thì báo nguyên nhân là HTTPS/localhost. Vẫn chặn ghi theo quyết định 4.2 trong `2026-10-24-p0-audit-n01-n09.md`. Test: `R01: on plain HTTP…`.                                                                                                                                                                     |
| 7   | Cấp phát O(n²) trong `applyResourceDeltas` / `resolveEffects`.                                                                                 | **Không sửa ở P0.** n = 3 tài nguyên và vài hiệu ứng mỗi hành động; test hiệu năng 10 000 ngày vẫn nhanh. Spread hiện có giữ an toàn với khóa prototype. Xem lại khi P1 tăng số tài nguyên.                                                                                                                                                                      |
| 8   | `bootSave` parse/validate mỗi save hai lần.                                                                                                    | **Không sửa.** Chỉ chạy một lần mỗi lần mở game, save cỡ vài KB.                                                                                                                                                                                                                                                                                                 |
| 9   | Chống khóa prototype bằng `own()` ở từng chỗ đọc thay vì một lần tại ranh giới tin cậy.                                                        | **Hoãn sang P1** (nợ kỹ thuật, mục 4.2). Hướng sửa: `createContent` / `parseSave` dựng record `Object.create(null)`.                                                                                                                                                                                                                                             |
| 10  | `runScript` dừng sớm mà không báo lỗi.                                                                                                         | **Sửa một phần.** Dừng mà còn lệnh của ngày sau chưa áp thì báo lỗi. Lệnh `resume` cùng ngày nhưng đứng trước điểm chặn vẫn áp theo đúng thứ tự viết; state trả về có `stop` và `day` để test kiểm tra. Test: `runScript fails loudly…`.                                                                                                                         |

7 test store mới đều fail khi chạy trên `src/` trước bản sửa và pass sau khi sửa.

## 3. Kết quả test/lint/build

- `npm run lint`: không lỗi.
- `npm run test`: 118/118 pass.
- `npm run build`: thành công.
- `npm run format:check`: sạch.

## 4. Vấn đề còn lại

Người dùng đã quyết định (2026-10-24):

- **Máy ngủ mà tab vẫn mở, trên hệ điều hành dừng `performance.now()`** (thường là macOS): tính là offline, có trần 8 giờ và Tích Thời. Đã chọn thay vì bỏ mất thời gian ngủ, hoặc dùng đồng hồ hệ thống cho online (chỉnh đồng hồ tiến lên sẽ được thời gian không có trần).
  - Trên hệ điều hành mà `performance.now()` vẫn chạy khi máy ngủ, thời gian đó vẫn là online như quyết định 4.1 trong `2026-10-24-p0-audit-n01-n09.md`.
  - Chỉnh đồng hồ tiến lên khi đang chơi cũng chỉ được tối đa 8 giờ, như khi đóng tab.
  - UI chưa báo "trong lúc vắng mặt" cho khoảng ngủ này.
- **Hoãn autosave khi chạy bù có trần:** tối đa 5 × `AUTOSAVE_MS` (2,5 phút) tính từ lúc bắt đầu bù. Quá trần thì lưu, chấp nhận UI khựng một lần do chạy hết nợ đồng bộ. Test: `autosave during a long catch-up is deferred at most 5 autosave intervals`.

Còn mở:

1. **Ngưỡng `SLEEP_SLACK_MS` = 5 giây** là giá trị kỹ thuật, không phải số cân bằng. Chênh lệch dưới ngưỡng này coi là sai số đo, nên mỗi lần ngủ mất tối đa 5 giây. Cần QA xác nhận ngưỡng này không bắt nhầm khi frame bị giật.
2. **Nợ kỹ thuật (finding 9):** mọi chỗ đọc record bằng khóa không tin cậy phải đi qua `own()` cho tới khi chuyển sang record không có prototype.
3. **Ẩn tab hoặc `pagehide` sau thời gian ẩn rất dài** vẫn chạy bù đồng bộ (hệ quả đã chấp nhận ở quyết định 4.1 trong `2026-10-24-p0-audit-n01-n09.md`). Đang chạy bù thì `dispatch`, `setSpeed`, `spendTichThoi` cũng hạch toán hết trước khi áp lệnh.
   - Trần hoãn autosave (2,5 phút) cũng gây một lần chạy đồng bộ như vậy.
4. **QA qua IP LAN (HTTP) không lưu được** (thiết kế). Antigravity nên dùng `localhost` hoặc HTTPS khi kiểm tra save.

## 5. Đề xuất bước tiếp theo

1. Ghi hai quyết định trên cùng quyết định 4.1 trong `2026-10-24-p0-audit-n01-n09.md` vào GDD S1/S13 ở lần cập nhật GDD tới.
2. Codex review lại trên commit này.
3. Antigravity QA trên `localhost`: tải game ở tab nền, ẩn/hiện tab lâu, máy ngủ (macOS và Windows).
