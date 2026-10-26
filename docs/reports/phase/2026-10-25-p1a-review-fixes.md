# Báo cáo P1a – Xử lý kết quả `/code-review` (2026-10-25)

Ngày: 2026-10-25 · Nhánh: `feat/p1-character` · Nối tiếp `2026-10-25-p1a-qa-fixes.md`

`/code-review` trên nhánh (diff `5ad85e5^1...3a919b1`) cho 10 phát hiện chưa kiểm chứng. Người dùng quyết định: sửa #2, #3, #4, #5, #6, #9; #1 giữ nguyên vì bản P0 chưa phát hành; duyệt giả định #10 thành D37; #7, #8 không làm lúc này.

## 1. File thay đổi

- `src/App.tsx`: bỏ `maxLength` ở ô tên; chưa boot thì hiện "Đang mở save…" thay cho form; cảnh báo thọ nguyên hiện "Còn N năm thọ nguyên."
- `src/stores/gameStore.ts`: trường `ready`; `dispatch` lưu ngay sau `setIdentity` thành công (tham số `wallNow`, mặc định `Date.now()`).
- `src/systems/character.ts`: `parseIdentity` từ chối thêm `\p{Cf}`; thẻ linh căn đổi sang `[ĐÃ DUYỆT D37]`.
- `src/core/state.ts`, `src/utils/save.ts`: export `isObj` và dùng lại trong `migrateV1`.
- `docs/GDD.md` (§12 thêm D37, D32 thêm ký tự vô hình), `docs/design/PROGRESSION.md` §3, `docs/design/SYSTEMS.md` S1.
- `tests/unit/App.test.tsx`, `tests/unit/character.test.ts`, `tests/integration/store.test.ts`.
- `docs/technical/IMPLEMENTATION_STATUS.md`, báo cáo này.

## 2. Tóm tắt công việc

| #   | Phát hiện                                                             | Xử lý                                                                                                   |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Save P0 giữ `day` cũ → kiếp 1 chết ngay ở tick đầu                    | Không sửa: P0 chưa phát hành (người dùng xác nhận). Hành vi đã có test.                                 |
| 2   | `maxLength` cắt tên tiếng Việt dấu tổ hợp                             | Bỏ `maxLength`; engine (D32, đếm code point sau NFC) là nơi kiểm duy nhất.                              |
| 3   | Ký tự `Cf` (U+200B, U+202E) lọt qua kiểm tên                          | Từ chối `[\p{Cc}\p{Cf}]`. Cập nhật D32/S1 cho khớp.                                                     |
| 4   | Form danh tính hiện khi chưa có khóa save, bấm không có tác dụng      | `ready` = false tới khi boot; UI hiện "Đang mở save…".                                                  |
| 5   | Chọn danh tính chờ autosave 30 giây; tải lại trang tung nhân vật khác | Lưu ngay khi `setIdentity` thành công, giống `newLife`. Lệnh bị từ chối không ghi.                      |
| 6   | Cảnh báo thọ nguyên hiện enum thô, không có số năm                    | Hiện "Còn N năm thọ nguyên." từ `stop.detail`.                                                          |
| 7   | `migrateV1` dùng nhân vật giả + `validateStateExceptStaminaCap`       | Không làm lúc này: dùng lại đúng một bộ kiểm tra; xem lại nếu Codex nêu.                                |
| 8   | Mỗi tick tính lại cấp/thọ nguyên nhiều lần                            | Không làm: chưa có số đo chậm (10 000 tick < 1 giây vẫn qua; harness reviewer 3,3 triệu tick).          |
| 9   | Kiểm object viết lặp trong `migrateV1`                                | Dùng `isObj` export từ `core/state.ts`.                                                                 |
| 10  | Cách tung hệ linh căn là giả định chưa duyệt                          | Người dùng duyệt → D37 (mọi tổ hợp hệ xác suất như nhau, lưu theo thứ tự dữ liệu). Không đổi code/seed. |

## 3. Kết quả test/lint/build

| Lệnh                   | Kết quả                                   |
| ---------------------- | ----------------------------------------- |
| `npm run lint`         | Sạch                                      |
| `npm run test`         | 239/239 PASS, 8 file (trước lượt này 234) |
| `npm run build`        | OK                                        |
| `npm run format:check` | OK                                        |

Test mới: 2 case tên (`U+200B`, `U+202E`); store lưu ngay sau `setIdentity` và không ghi khi lệnh bị từ chối; `ready` false/true quanh lúc nhận khóa (R01); App ẩn form khi chưa có khóa, không có `maxlength`, hiện số năm khi cảnh báo thọ nguyên.

## 4. Vấn đề còn lại

- Chưa playtest lại trên trình duyệt; thay đổi UI được kiểm bằng render phía server.
- #7, #8 để lại như trên.
- Các vấn đề còn lại của báo cáo qa-fixes (R03 khi tick bị chặn, save v2 cũ thiếu `identity`) giữ nguyên.

## 5. Đề xuất bước tiếp theo

1. Codex review lại nhánh (gồm cả lượt sửa QA-01/QA-02).
2. Antigravity playtest: chọn danh tính rồi tải lại trang ngay → nhân vật giữ nguyên; mở hai tab → tab chờ hiện "Đang mở save…".
3. Sau khi review đạt: P1b – Kinh tế phàm nhân.
