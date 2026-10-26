# Event Schema – dữ liệu sự kiện, Nhật ký, chính sách sự kiện nhỏ

**Trạng thái: Draft – 2026-10-25.** Chờ người dùng duyệt D21, D24, D26 (GDD §11). Tài liệu chỉ định nghĩa kiểu dữ liệu và quy tắc; chưa có code. Nguồn: SYSTEMS S1, S4, S6; CORE_LOOP §3; WORLD_LORE §6.

## 1. Thời gian

- `day`: số ngày kể từ lúc bắt đầu kiếp (đã có trong `GameState`). Một năm = `calendar.daysPerYear` = 360 ngày.
- `tuoi` = `startAgeYears + floor(day / daysPerYear)` (hàm `ageYears` hiện có).
- `ngayTrongNam` = `day mod daysPerYear`, từ 0 đến 359.
- Cách viết trong tài liệu: "tuổi 15·150" nghĩa là `tuoi = 15`, `ngayTrongNam = 150`; "14·40" nghĩa là `tuoi = 14`, `ngayTrongNam = 40`.
- Engine tự quy đổi từ `day`; dữ liệu sự kiện không ghi `day` tuyệt đối.

## 2. Định nghĩa sự kiện (`EventDef`)

| Trường          | Kiểu                     | Ý nghĩa                                                                                                |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `id`            | string                   | Duy nhất.                                                                                              |
| `chuoi`         | string                   | ID chuỗi (§6). Sự kiện lẻ để trống.                                                                    |
| `quanTrong`     | `'lon' \| 'nho'`         | Lớn: luôn tạm dừng và chờ người chơi. Nhỏ: theo `chinhSachSuKienNho` (§4).                             |
| `motLan`        | boolean                  | Xảy ra tối đa một lần mỗi save (không lặp ở kiếp sau). Sự kiện nhỏ lặp lại dùng `hoiChieu` thay vì cờ. |
| `trigger`       | `Condition[]`            | Mọi điều kiện đều đúng thì sự kiện hợp lệ (§3).                                                        |
| `lich`          | `{ tuoi, ngayTrongNam }` | Tùy chọn. Sự kiện cố định theo lịch: kích hoạt đúng tick đó, bỏ qua xác suất.                          |
| `xacSuat`       | số 0–1 mỗi ngày          | Dùng khi không có `lich`. Có thể phụ thuộc hành động (VD Thám hiểm 4%/ngày) qua `trigger`.             |
| `trongSo`       | số > 0                   | Chọn giữa các sự kiện cùng hợp lệ ở một tick.                                                          |
| `hoiChieu`      | số ngày                  | Không kích hoạt lại trong N ngày sau lần gần nhất.                                                     |
| `luaChon`       | `ChoiceDef[]` (≥ 1)      | Các lựa chọn.                                                                                          |
| `macDinhAnToan` | id một lựa chọn          | Bắt buộc với sự kiện nhỏ; lựa chọn này không có `yeuCau`. Sự kiện lớn không dùng.                      |
| `vanBan`        | `{ chung, phamNhan? }`   | Văn bản. `phamNhan` là biến thể "góc nhìn phàm nhân" khi chưa có tri thức (S4).                        |

`ChoiceDef`: `{ id, ten, yeuCau: Condition[], hauQua: Effect[] }`. Hệ quả áp dụng nguyên khối như `ActionDef.effects`.

## 3. Điều kiện và hệ quả cần thêm vào `src/types/game.ts`

Hiện có 3 `Condition` (`resourceAtLeast`, `flag`, `skillAtLeast`) và 3 `Effect` (`addResource`, `setFlag`, `addSkillXp`). P2 thêm:

| Loại      | Tên                              | Ý nghĩa                                |
| --------- | -------------------------------- | -------------------------------------- |
| Condition | `ageBetween { min, max }`        | `tuoi` trong [min, max].               |
| Condition | `knows { id }`                   | Đã có tri thức (S4).                   |
| Condition | `atLocation { id }`              | Đang ở địa điểm hoặc điểm con.         |
| Condition | `doingAction { id }`             | Hành động đang chọn.                   |
| Condition | `dayOfYear { from, to }`         | `ngayTrongNam` trong khoảng.           |
| Effect    | `addKnowledge { id }`            | Thêm tri thức.                         |
| Effect    | `moveTo { id, days }`            | Đổi địa điểm sau `days` ngày đi đường. |
| Effect    | `logLine { text }`               | Ghi một dòng Nhật ký (§5).             |
| Effect    | `setExplore { location, delta }` | Cộng tiến độ thám hiểm.                |

Thiện cảm (`addAffinity`) và chiến đấu (`startBattle`) thuộc P3 (S7, S8). Xem §7 về cờ stub.

## 4. Chính sách sự kiện nhỏ `[CẦN DUYỆT D21]`

`GameState.chinhSachSuKienNho ∈ { 'hoi', 'tuDong' }`, giá trị ban đầu `hoi`.

- Lệnh `datChinhSachSuKienNho { chinhSach }` nhận đúng hai giá trị trên, ghi vào nhật ký lệnh như mọi lệnh. Nhận cả khi `stop` đang mở (không thuộc nhóm lệnh bị chặn khi dừng).
- Hiệu lực từ tick kế tiếp. Ngoại lệ: nếu có một sự kiện nhỏ đang chờ trả lời và đổi sang `tuDong`, sự kiện đó được giải ngay bằng `macDinhAnToan` và ghi Nhật ký. Đổi sang `hoi` không làm gì với sự kiện đã giải.
- `hoi`: sự kiện nhỏ mở điểm dừng `event` và chờ lựa chọn. `tuDong`: lấy `macDinhAnToan`, ghi một dòng Nhật ký kèm tên lựa chọn, không dừng.
- Offline (S13) và Tích Thời dùng đúng giá trị đang lưu, không có ngoại lệ (giữ offline ≡ online, D34). Offline với `hoi` dừng ở sự kiện nhỏ đầu tiên.
- Tốc độ vẫn nằm ngoài `GameState` và engine không đọc tốc độ. UI có tùy chọn "tự xử lý khi tua ≥ 3×" (CORE_LOOP §3); khi người chơi đổi tốc độ, UI gửi lệnh tại tick hiện tại. Tùy chọn này là cài đặt giao diện, lưu cùng save nhưng nằm ngoài `GameState`.
- Thêm trường vào `GameState` nên **tăng version save** (v2 → v3) và thêm migrate v2 → v3 (đặt `chinhSachSuKienNho = 'hoi'`, Nhật ký rỗng).
- Định nghĩa nhỏ/lớn: lớn nếu `quanTrong = 'lon'`; mọi sự kiện có lựa chọn không thể hoàn tác (chiến đấu, đổi địa điểm lớn, mất vật phẩm quan trọng, đổi cờ thế giới) phải là lớn. Validator kiểm điều này (§8).

## 5. Nhật ký `[CẦN DUYỆT D24]`

- Lưu trong `GameState.nhatKy`, mảng dòng, **tối đa 200 dòng**; vượt thì cắt dòng cũ nhất.
- Dòng: `{ day, tuoi, loai, text }` với `loai ∈ 'suKien' | 'tuDong' | 'triThuc' | 'heThong'`.
- Cắt dòng cũ không ảnh hưởng mô phỏng (engine không đọc nội dung Nhật ký để quyết định).
- Bản tóm tắt "trong năm qua" (CORE_LOOP §3) lấy các dòng có `day` trong 360 ngày gần nhất; vì giới hạn 200 dòng, đây là các dòng còn lại, không bảo đảm đủ nếu năm đó có hơn 200 dòng.
- Nhật ký tri thức (manh mối đang theo, điều đã biết) là giao diện của S4, đọc từ tập tri thức, không phải từ `nhatKy`.

## 6. Mười hai chuỗi `[CẦN DUYỆT D24]`

Sáu Hồi (WORLD_LORE §6) cộng sáu chuỗi trung hạn. Phase là nơi sự kiện lớn của chuỗi được triển khai.

| #   | ID chuỗi         | Nội dung                              | Phase | Phụ thuộc                                                       |
| --- | ---------------- | ------------------------------------- | ----- | --------------------------------------------------------------- |
| 1   | `hoi0_no`        | Hồi 0 – Sinh tồn, trả nợ              | P2    | nợ theo xuất thân (P1b); đồ khởi đầu rìu/giỏ (S10) dùng cờ stub |
| 2   | `hoi1_tin_don`   | Hồi 1 – Ánh kiếm đêm, Mộc bá say rượu | P2    | thiện cảm (S7): cờ stub `moc_ba_than_thien`                     |
| 3   | `hoi1_soi`       | Hồi 1 – Sói ở bìa rừng                | P3    | chiến đấu (S8)                                                  |
| 4   | `hoi2_gap_go`    | Hồi 2 – Kẻ lạ trong hang, hội tuyển   | P3    | thiện cảm, NPC (S7)                                             |
| 5   | `hoi3_thuc_tinh` | Hồi 3 – Lục đo linh căn               | P3    | S7                                                              |
| 6   | `hoi4_chuan_bi`  | Hồi 4 – Văn Tự, lời mẹ                | P3    | S7                                                              |
| 7   | `hoi5_dan_khi`   | Hồi 5 – Hắc Thạch Cốc, Thiết Bối Lang | P3    | S8, S9                                                          |
| 8   | `hac_phong`      | Hắc Phong trại                        | P5    | S8, S10                                                         |
| 9   | `vu_chay`        | Vụ cháy dược viên                     | P5    | S7, S11                                                         |
| 10  | `to_len_tinh`    | Tô tiên sinh lên tỉnh                 | P5    | S7                                                              |
| 11  | `tan_bia`        | Tàn Bia                               | P5    | S4, S12                                                         |
| 12  | `di_san_luc`     | Di sản Lục                            | P5    | S7, S12                                                         |

Ghi chú: mục 3 và 4–7 trước đây nằm chung trong "Hồi 1–5". Chuỗi Trúc Cơ Đan (WORLD_LORE §6, dòng cuối) là hệ quả của S11/S12 chứ không phải chuỗi sự kiện riêng; không đếm vào 12.

**Phạm vi P2:** chuỗi 1 và 2 (không có chiến đấu), cộng 2–3 sự kiện nhỏ lặp lại (VD sự kiện đường, sự kiện thám hiểm) để kiểm chính sách `hoi`/`tuDong`. Sự kiện Sói chuyển sang P3.

## 7. Cờ stub cho phụ thuộc P3

P2 chưa có S7 (thiện cảm) và S8 (chiến đấu). Quy tắc:

- Điều kiện thiện cảm được thay bằng cờ stub đặt tên theo NPC: `moc_ba_than_thien` (tương đương thiện cảm ≥ 20 của Mộc bá hoặc đã học việc 30 ngày). Cờ này do hệ quả khai báo trong dữ liệu đặt, không có tăng ngầm.
- Khi P3 thêm S7, cờ stub được thay bằng điều kiện thiện cảm thật; P3 phải có test chứng minh sự kiện Hồi 1 vẫn kích hoạt theo cùng lịch.
- Validator "không cờ mồ côi" (S6) áp dụng cả cờ stub: mỗi cờ stub phải có ít nhất một hệ quả đặt nó.

## 8. Validator dữ liệu (P2)

- Mọi cờ được đọc trong điều kiện đều được ghi ở ít nhất một hệ quả.
- Mọi sự kiện lớn có ít nhất một lựa chọn không có `yeuCau`.
- Mọi sự kiện nhỏ có `macDinhAnToan` trỏ tới đúng một lựa chọn không có `yeuCau`.
- Mọi id (`chuoi`, tri thức, địa điểm) được tham chiếu đều tồn tại.
- `lich.ngayTrongNam` nằm trong [0, `daysPerYear` − 1].
- Sự kiện có lựa chọn không thể hoàn tác phải là `lon` (§4).
- Văn bản phần giao diện ở trạng thái ban đầu không chứa từ khóa bị khóa (§9).

## 9. Từ khóa bị khóa và danh mục tri thức khởi đầu `[CẦN DUYỆT D24]`

**Từ khóa bị khóa** ở giao diện cho tới khi nhân vật có tri thức tương ứng: `linh khí`, `linh căn`, `tu vi`, `Luyện Khí`, `linh thạch` (SYSTEMS S4) cộng `cảnh giới`, `Trúc Cơ` (WORLD_LORE). Kiểm thử snapshot dùng cả 7 từ, so khớp không phân biệt hoa thường.

**Tri thức khởi đầu:** bốn tri thức dưới đây có phạm vi `kiep` (mất khi chết); S12 (P6) quyết định tri thức nào chuyển thành `linh_hon`.

| ID                    | Phạm vi | Cấp bởi                          |
| --------------------- | ------- | -------------------------------- |
| `biet_tien_nhan`      | `kiep`  | Ánh kiếm đêm (Hồi 1)             |
| `biet_linh_can`       | `kiep`  | Lục, Mộc bá, hội tuyển Thanh Vân |
| `duong_hac_thach_coc` | `kiep`  | Mộc bá, bút ký Lý Viễn, ký ức    |
| `cong_phap_dan_khi`   | `kiep`  | Lục, Tàng Kinh Các, chợ đêm      |

Danh mục đầy đủ (kể cả tri thức `linh_hon`) hoàn thiện ở P3 và P6 cùng S12. P2 chỉ cần bốn mục trên.
