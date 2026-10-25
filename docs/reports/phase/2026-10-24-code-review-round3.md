# P0 – Xử lý `/code-review` lượt 3 (10 finding)

Ngày: 2026-10-24 · Nhánh: `feat/p0-core-engine`

## 1. File thay đổi

- `src/stores/gameStore.ts`
- `src/App.tsx`
- `tests/integration/store.test.ts`
- `tests/integration/engine.test.ts`
- `tests/integration/harness.ts`

## 2. Tóm tắt công việc

| #   | Finding                                                                                                                                        | Xử lý                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tab tải (hoặc nhận khóa) khi đang ẩn mất toàn bộ thời gian tới frame đầu: clock chỉ được tạo ở frame đầu.                                      | **Sửa.** `boot()` tạo clock tại `performance.now()`. Bỏ cờ `ready` (clock khác null nghĩa là đã boot). Test: `a tab booted while hidden counts the time before its first frame`.                                                                  |
| 2   | Autosave trong `frame()` gọi `settle(…, Infinity)`, chạy hết nợ trong một frame, trái SYSTEMS S1.                                              | **Sửa.** Frame chạm `MAX_TICKS_PER_FRAME` thì hoãn autosave tới khi chạy bù xong. Ẩn tab hoặc `pagehide` vẫn hạch toán hết, vì không thì mất thời gian (quyết định 4.1 trong `2026-10-24-p0-audit-n01-n09.md`). Test B02/S1 và N03 cập nhật theo. |
| 3   | Khoảng autosave đo bằng đồng hồ hệ thống; chỉnh đồng hồ lùi thì autosave ngừng.                                                                | **Sửa.** Đo bằng `clock.lastMs` (đơn điệu). Test: `autosave keeps running when the system clock is set back`.                                                                                                                                     |
| 4   | `savedAt` theo đồng hồ hệ thống còn online theo `performance.now()`; máy ngủ trên hệ điều hành dừng `performance.now()` thì mất thời gian ngủ. | **Chưa sửa, cần quyết định** (mục 4.1).                                                                                                                                                                                                           |
| 5   | Lệnh chơi thành công đặt `error: null`, xóa luôn lỗi ghi save (VD hết quota).                                                                  | **Sửa.** Thêm trường riêng `saveError`: ghi được thì xóa, App hiện "Lưu thất bại: …". Test: `a failed write stays reported after a successful command`.                                                                                           |
| 6   | Trang HTTP (VD preview qua IP LAN) không có Web Locks, nhưng thông báo lại bảo cập nhật trình duyệt.                                           | **Sửa thông báo.** `isSecureContext === false` thì báo nguyên nhân là HTTPS/localhost. Vẫn chặn ghi theo quyết định 4.2 trong `2026-10-24-p0-audit-n01-n09.md`. Test: `R01: on plain HTTP…`.                                                      |
| 7   | Cấp phát O(n²) trong `applyResourceDeltas` / `resolveEffects`.                                                                                 | **Không sửa ở P0.** n = 3 tài nguyên và vài hiệu ứng mỗi hành động; test hiệu năng 10 000 ngày vẫn nhanh. Spread hiện có giữ an toàn với khóa prototype. Xem lại khi P1 tăng số tài nguyên.                                                       |
| 8   | `bootSave` parse/validate mỗi save hai lần.                                                                                                    | **Không sửa.** Chỉ chạy một lần mỗi lần mở game, save cỡ vài KB.                                                                                                                                                                                  |
| 9   | Chống khóa prototype bằng `own()` ở từng chỗ đọc thay vì một lần tại ranh giới tin cậy.                                                        | **Hoãn sang P1** (nợ kỹ thuật, mục 4.2). Hướng sửa: `createContent` / `parseSave` dựng record `Object.create(null)`.                                                                                                                              |
| 10  | `runScript` dừng sớm mà không báo lỗi.                                                                                                         | **Sửa một phần.** Dừng mà còn lệnh của ngày sau chưa áp thì báo lỗi. Lệnh `resume` cùng ngày nhưng đứng trước điểm chặn vẫn áp theo đúng thứ tự viết; state trả về có `stop` và `day` để test kiểm tra. Test: `runScript fails loudly…`.          |

5 test store mới đều fail khi chạy trên `src/` cũ và pass sau khi sửa.

## 3. Kết quả test/lint/build

- `npm run lint`: không lỗi.
- `npm run test`: 116/116 pass.
- `npm run build`: thành công.
- `npm run format:check`: sạch.

## 4. Vấn đề còn lại

1. **Finding 4: máy ngủ khi tab vẫn mở.** Người dùng đã quyết định thời gian máy ngủ tính như online. Nhưng trên hệ điều hành dừng `performance.now()` khi máy ngủ (thường là macOS), thời gian đó hiện bị bỏ. Có ba hướng, cần người dùng chọn:
   - (a) Chấp nhận mất thời gian ngủ trên các hệ điều hành đó.
   - (b) Phần đồng hồ hệ thống chạy hơn `performance.now()` tính là offline: trần 8 giờ, phần dư thành Tích Thời.
   - (c) Clock online dùng đồng hồ hệ thống: chỉnh đồng hồ tiến lên sẽ được thời gian online **không có trần**.
2. **Nợ kỹ thuật (finding 9):** mọi chỗ đọc record bằng khóa không tin cậy phải đi qua `own()` cho tới khi chuyển sang record không có prototype.
3. **Ẩn tab hoặc `pagehide` sau thời gian ẩn rất dài** vẫn chạy bù đồng bộ (hệ quả đã chấp nhận ở quyết định 4.1 trong `2026-10-24-p0-audit-n01-n09.md`). Đang chạy bù thì `dispatch`, `setSpeed`, `spendTichThoi` cũng hạch toán hết trước khi áp lệnh.
   - **Hệ quả của bản sửa finding 2: không autosave khi đang chạy bù.**
     - Ví dụ: ẩn 7 ngày ở 5× là khoảng 6 triệu tick. Bù khoảng 1 200 tick/giây thì mất hơn một giờ mà không autosave lần nào.
     - Crash trong lúc đó mất tiến độ kể từ lần lưu khi ẩn tab. Mở lại thì offline chỉ bù tối đa 8 giờ.
     - Nếu khoảng cách giữa các frame dài hơn 20 tick (ví dụ cách nhau hơn 2 giây ở 5×) thì nợ không bao giờ hết, nên không bao giờ autosave.
     - Có thể thêm trần: quá vài lần `AUTOSAVE_MS` thì vẫn lưu, chấp nhận một lần chạy đồng bộ. Cần người dùng chọn (mục 4.5).
4. **Trần cho việc hoãn autosave** (xem mục 4.3): cần người dùng quyết định.
5. **QA qua IP LAN (HTTP) không lưu được** (thiết kế). Antigravity nên dùng `localhost` hoặc HTTPS khi kiểm tra save.

## 5. Đề xuất bước tiếp theo

1. Người dùng chọn hướng cho mục 4.1 và 4.5.
2. Codex review lại trên commit này.
3. Antigravity QA trên `localhost`: tải game ở tab nền, ẩn/hiện tab lâu, máy ngủ.
