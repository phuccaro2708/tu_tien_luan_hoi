# Báo cáo – Hoàn thiện tài liệu thiết kế cho P2 (2026-10-25)

Trạng thái: **Draft**, chờ người dùng duyệt D21, D24, D26. Nhánh: `worktree-p2-design`. Lượt này chỉ sửa tài liệu, không đổi `src/` hay `tests/`.

## 1. File thay đổi

- Mới: `docs/technical/EVENT_SCHEMA.md` (kiểu `EventDef`, điều kiện/hệ quả cần thêm, chính sách D21, Nhật ký, 12 chuỗi, cờ stub, validator, từ khóa bị khóa, tri thức khởi đầu).
- `docs/GDD.md`: D14 (bỏ câu "3×/5× sự kiện nhỏ chỉ ghi nhật ký", trỏ sang D21), D24 ("3 điểm con").
- `docs/design/MVP_SCOPE.md` §2.1, `docs/design/SYSTEMS.md` (S1, S4, S5, S6), `docs/design/CORE_LOOP.md` §3, `docs/design/WORLD_LORE.md` §2.
- `docs/technical/IMPLEMENTATION_PLAN.md` §2 (tách P1a/P1b, tiêu chí thoát P2 mới, ghi chú D25), `docs/technical/IMPLEMENTATION_STATUS.md` (P2).
- Báo cáo này.

## 2. Tóm tắt công việc

| Mục                    | Quyết định của người dùng (2026-10-25)              | Nơi ghi                     |
| ---------------------- | --------------------------------------------------- | --------------------------- |
| D21 offline            | Theo giá trị `chinhSachSuKienNho` đang lưu          | EVENT_SCHEMA §4, S1         |
| D21 đổi giữa chừng     | Giải ngay sự kiện nhỏ đang chờ bằng `macDinhAnToan` | EVENT_SCHEMA §4, S1         |
| D21 mặc định           | `hoi` (đề xuất của tôi, chưa bị phản đối)           | EVENT_SCHEMA §4             |
| D24 điểm con           | 3: hang Lục, mỏ linh thạch, chỗ Diên Thọ Quả        | MVP_SCOPE §2.1, S5, GDD D24 |
| D24 12 chuỗi           | 6 Hồi + 6 trung hạn, có phase và phụ thuộc          | EVENT_SCHEMA §6             |
| Phụ thuộc P3           | Cờ stub cho thiện cảm; sự kiện Sói dời sang P3      | EVENT_SCHEMA §6–7           |
| Tiêu chí thoát P2 số 3 | So `hoi` với `tuDong`                               | IMPLEMENTATION_PLAN §2      |
| `trigger`              | Tuổi + ngày trong năm                               | EVENT_SCHEMA §1–2           |
| Nhật ký                | Trong state, 200 dòng, save v3                      | EVENT_SCHEMA §4–5           |

Phần tôi tự đề xuất (không có chỉ thị trực tiếp), cần bạn xem: danh sách `Condition`/`Effect` mới (§3), định dạng dòng Nhật ký, 4 tri thức khởi đầu, danh sách 7 từ khóa bị khóa, tên ID chuỗi, và quy tắc "sự kiện có lựa chọn không hoàn tác phải là lớn".

## 3. Kết quả test/lint/build

| Lệnh                   | Kết quả                          |
| ---------------------- | -------------------------------- |
| `npm run lint`         | Sạch                             |
| `npm run test`         | 239/239 PASS, 8 file (không đổi) |
| `npm run build`        | OK                               |
| `npm run format:check` | OK                               |

## 4. Vấn đề còn lại

- **Câu hỏi mở:** Hắc Phong trại và Động phủ Lục. Quyết định "3 điểm con" của S5 không gồm hai nơi này, trong khi MVP_SCOPE v0.2 cũ coi chúng là điểm con. Tôi đã ghi tạm: chúng là cảnh trong chuỗi `hac_phong` và `di_san_luc` (P5), không phải địa điểm bản đồ, đánh dấu `[CHỜ XÁC NHẬN]`. Nếu bạn muốn giữ chúng là địa điểm riêng, D24 phải đổi thành 7 địa điểm hoặc 5 + 5 điểm con.
- Chưa có phương án P2 nếu D24 bị từ chối (WORLD_LORE vẫn mô tả 7 địa điểm).
- Các thẻ `[CẦN DUYỆT]` của D21, D24, D26 vẫn giữ nguyên; tôi không tự đổi sang `[ĐÃ DUYỆT]`.
- P3 (D18, D22, D25) và P5–P6 (D17, D19, D20) chưa được hoàn thiện. Điểm cần xử lý ở P3: quy tắc "pháp thuật mạnh nhất" của D25 làm hỏng bảng TTK (pháp thuật yếu hơn đánh thường ở LK3), cơ chế bỏ chạy mơ hồ, trận Thiết Bối Lang xảy ra khi còn phàm.
- Bảng Monte Carlo BALANCE §10.3 chưa tái lập được vì engine chưa có.

## 5. Đề xuất bước tiếp theo

1. Bạn đọc `EVENT_SCHEMA.md`, trả lời câu hỏi mở ở mục 4, rồi duyệt D21, D24, D26. Tôi sẽ đổi thẻ và ghi GDD §12.
2. Làm P1b (đang mở, không phụ thuộc quyết định chưa duyệt), đồng thời chốt R03 (tick bị chặn có làm ngày trôi không).
3. Lượt tài liệu kế tiếp: hoàn thiện P3 (D18, D22, D25).
