# Balance

> **Trạng thái: Draft v0.2 – 2026-10-23** (sửa theo review Codex, chờ duyệt). Bản v0.1 đã Approved 2026-10-23; phần không gắn `[CẦN DUYỆT D17–D26]` giữ nguyên. **Trước playtest:** mọi số liệu là giả thuyết, đã kiểm bằng mô phỏng Monte Carlo (§10); sẽ chỉnh lại bằng harness headless (từ P0) và playtest. Đối chiếu: `docs/reports/GDD_REVIEW_RESOLUTION.md`.
>
> **Bổ sung 2026-10-25:** D23 đã duyệt (§3); D35 Tinh lực tối đa (§3); D34 chết khi vắng mặt (§7). Xem GDD §12.

## 1. Thang thời gian `[ĐÃ DUYỆT D02]`

| Đơn vị                                   | Giá trị                               |
| ---------------------------------------- | ------------------------------------- |
| 1 tick                                   | 1 ngày game                           |
| Tốc độ thường (1×)                       | 2 tick / giây thực                    |
| 1 năm game                               | 360 ngày = 180 giây = **3 phút thực** |
| 1 giờ thực                               | 7 200 ngày = **20 năm game**          |
| Một đời kiếp 1 điển hình (14 → ~88 tuổi) | ≈ 3,7 giờ thực                        |
| Offline tối đa                           | 8 giờ thực = 57 600 tick              |

### Tăng tốc `[ĐÃ DUYỆT D14]`

| Mức | Tick / giây | 1 năm game | Kiếp 1 Tứ linh căn (~74 năm) |
| --- | ----------- | ---------- | ---------------------------- |
| 1×  | 2           | 3 phút     | ≈ 3,7 giờ                    |
| 2×  | 4           | 90 giây    | ≈ 1,85 giờ                   |
| 3×  | 6           | 60 giây    | ≈ 74 phút                    |
| 5×  | 10          | 36 giây    | ≈ 44 phút                    |

- Có từ đầu, miễn phí, đổi bất cứ lúc nào kể cả khi đang tạm dừng. Tốc độ chỉ đổi số tick mỗi giây thực; engine **không đọc** tốc độ. Cách xử lý sự kiện nhỏ là một trường riêng trong `GameState` (SYSTEMS S1, S6) `[CẦN DUYỆT D21]`, nên đổi tốc độ không đổi kết quả mô phỏng.
- Mọi mốc thời gian thực trong tài liệu tính ở 1×. Thiết kế không giả định người chơi dùng tốc độ nào.

## 2. Pacing mục tiêu

Người chơi tham chiếu: chơi chủ động vừa phải, không tối ưu tuyệt đối.

| Mốc         | Tuổi (kiếp)                  | Trạng thái mong đợi                                                                                                                                                           | Cảm xúc mục tiêu                       |
| ----------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **10 phút** | 17 (kiếp 1)                  | Đã trả nợ hoặc chịu hậu quả; Thể Phách ~8, Văn Tự ~6, Thảo Dược ~5; biết tiên nhân có thật; biết hội tuyển; vừa gặp Lục hoặc đang chờ hội tuyển                               | Tò mò: "thế giới lớn hơn cái làng này" |
| **30 phút** | 24 (kiếp 1)                  | Luyện Khí 1–2 (nhánh Lục: LK1 ở ~22–24 phút) hoặc vừa nhập đạo (nhánh môn phái ~32 phút, nhánh Mộc bá ≤ 40 phút); bảng Tu luyện mở; đã có quyết định lớn về mẹ, Lục, môn phái | Thỏa mãn: "mình đã bước vào con đường" |
| **2 giờ**   | 54 (kiếp 1)                  | Luyện Khí 6–7; đã qua nút thắt 3→4 và đang ở nút thắt 6→7; đã đổi công pháp vì trần LK6; Lục đã mất (năm thế giới ~31); thọ nguyên còn ~30 năm                                | Áp lực: "thời gian không đủ"           |
| ~3,7 giờ    | ~88                          | Chết ở LK7–8 (Tam linh căn có thể chạm LK9); lần luân hồi đầu tiên                                                                                                            | Mất mát + hiểu ra luật chơi lớn        |
| **~7 giờ**  | Kiếp 2, tuổi ~78–83          | ~70% seed thử Trúc Cơ lần đầu (Tam/Song linh căn kiếp 2); khoảng một nửa thành công                                                                                           | Thành tựu dài hạn                      |
| **10 giờ**  | Kiếp 2 cuối hoặc kiếp 3 giữa | Trung vị seed đã thử Trúc Cơ ít nhất một lần; seed Tứ linh căn kiếp 2 cần thêm kiếp 3                                                                                         | Thành tựu dài hạn                      |

Các mốc trên dùng seed chuẩn (Tứ linh căn) và bảng ngưỡng v0.2 (PROGRESSION §2) `[CẦN DUYỆT D17]`. Ở 5× chia thời gian thực cho 5: 10 phút → 2 phút, 30 phút → 6 phút, 2 giờ → 24 phút, 10 giờ → 2 giờ.

**Chênh lệch theo linh căn kiếp 1** `[ĐÃ DUYỆT D04]` (mô phỏng §10):

| Linh căn kiếp 1 (xác suất) | LK1 (phút ở 1×, nhánh Lục) | Cảnh giới khi chết                    | Chết (tuổi / giờ thực) |
| -------------------------- | -------------------------- | ------------------------------------- | ---------------------- |
| Tam (15%)                  | ~22                        | LK9 (65%), thử Trúc Cơ 20%, thành 10% | ~91 / 3,8 h            |
| Tứ (50%)                   | ~22                        | LK8 (79%), còn lại LK7                | ~88 / 3,7 h            |
| Ngũ (35%)                  | ~23                        | LK7 (76%), còn lại LK6                | ~85 / 3,6 h            |

Linh căn ít ảnh hưởng 30 phút đầu (chủ yếu là cốt truyện phàm nhân) nhưng quyết định cảnh giới cuối kiếp 1. Theo bảng Hồn dưỡng căn (PROGRESSION §8.4), kiếp 2 có tỉ lệ có trọng số **Tứ ~23% · Tam ~59% · Song ~19%**, nên không softlock dài hạn.

`[GIẢ ĐỊNH]` Mục tiêu "thử Trúc Cơ trong khoảng 10 giờ" áp dụng cho **trung vị** các seed, không áp dụng cho mọi seed. Seed có Tứ linh căn ở kiếp 2 (~23%) cần thêm một kiếp.

Kiểm tra pacing tự động: §10.

## 3. Hành động & sinh hoạt phí

### Sinh hoạt phí (văn/ngày)

| Nơi                                | Phí | Ghi chú                                                            |
| ---------------------------------- | --- | ------------------------------------------------------------------ |
| Làng (ở nhà)                       | 8   |                                                                    |
| Trấn Lạc Thủy                      | 15  |                                                                    |
| Rừng, Hắc Thạch Cốc, động phủ      | 6   | Trả bằng **lương khô** mua trước (6 văn/phần); hết lương khô → Đói |
| Thanh Vân Môn (tạp dịch/ngoại môn) | 0   | Môn phái bao ăn                                                    |

Đói: XP ×0.5, tu vi ×0.5, Tinh lực hồi ×0.5; không gây chết. Luôn có Làm thuê (khu dân cư) hoặc Hái quả rừng (nơi hoang) để thoát.

**Quy tắc thanh toán** `[ĐÃ DUYỆT D23 – 2026-10-25]` (sửa F05):

- Trong một tick, **thu nhập của hành động được cộng trước**, sinh hoạt phí trừ sau (IMPLEMENTATION_PLAN §1).
- Nếu tiền (hoặc lương khô) không đủ trả phí ngày đó: không trừ gì, không phát sinh nợ, nhân vật bị **Đói** đúng ngày đó.
- Ràng buộc dữ liệu: ở **mọi** khu dân cư, `thu Làm thuê × tỉ lệ làm − phí nơi đó > 0`. Validator dữ liệu kiểm tra ràng buộc này.

### Tinh lực

Tối đa 100 (+1 mỗi cấp Thể Phách, trần +30; Cường tráng +10/+20/+30; lão hóa −2 mỗi năm tuổi sau 80% thọ nguyên – công thức PROGRESSION §6) `[ĐÃ DUYỆT D35 – 2026-10-25]`. Kiếp mới bắt đầu với Tinh lực đầy. Nghỉ ngơi +30/ngày. Quy tắc mặc định: nghỉ khi < 20, làm lại khi ≥ 90. Tỉ lệ ngày làm việc ≈ `30 / (30 + chiPhíTL)`.

### Bảng hành động (giá trị gốc, cấp kỹ năng 0)

| Hành động             | Nơi            | Yêu cầu             | TL/ngày                 | Thu (văn/ngày)          | XP/ngày                       | Tỉ lệ làm | Ròng ở làng* |
| --------------------- | -------------- | ------------------- | ----------------------- | ----------------------- | ----------------------------- | --------- | ------------ |
| Làm thuê              | Mọi khu dân cư | –                   | 10                      | Làng 15 · Trấn 25       | Thể Phách 1,5                 | 75%       | +3,3         |
| Đốn củi               | Làng/Rừng      | Rìu                 | 12                      | 20 (+0,5%/Thể Phách)    | Thể Phách 2,5                 | 71%       | +6,3         |
| Học việc hiệu thuốc   | Làng           | –                   | 6                       | 5                       | Thảo Dược 3                   | 83%       | −3,8         |
| Hái thuốc             | Rừng           | Thảo Dược 3         | 9                       | 12 + 1,5 × Thảo Dược    | Thảo Dược 2                   | 77%       | —            |
| Học chữ               | Làng           | Tô tiên sinh mở lớp | 4                       | −10 (học phí)           | Văn Tự 3                      | 88%       | −16,8        |
| Học chữ ở Thư xá      | Trấn           | –                   | 4                       | −12 (học phí)           | Văn Tự 3                      | 88%       | —            |
| Bổ củi đổi chữ        | Làng           | Thiện cảm Tô ≥ 10   | 12                      | 0                       | Văn Tự 1,5 + Thể Phách 1      | 71%       | −8           |
| Tiểu nhị quán trà     | Trấn           | –                   | 7                       | 24 + 0,5 × Giao Tế      | Giao Tế 2,5                   | 81%       | —            |
| Khuân vác bến sông    | Trấn           | Thể Phách 5         | 15                      | 30 (+2%/Thể Phách)      | Thể Phách 2                   | 67%       | —            |
| Luyện quyền (võ quán) | Trấn           | –                   | 15                      | −20                     | Quyền Cước 3 + Thể Phách 1    | 67%       | —            |
| Tự luyện quyền        | Mọi nơi        | Quyền Cước 5        | 15                      | 0                       | Quyền Cước 1,5                | 67%       | —            |
| Hái quả rừng          | Nơi hoang      | –                   | 8                       | 1,3 phần lương thực     | Thảo Dược 0,5                 | 79%       | —            |
| Thám hiểm             | Nơi hoang      | –                   | 10                      | 0                       | Thể Phách 0,5                 | 75%       | —            |
| Tu luyện              | Mọi nơi        | Công pháp           | 3                       | 0                       | Thổ Nạp 2, thuần thục 1 × Ngộ | 91%       | —            |
| Đào linh thạch vụn    | Hắc Thạch Cốc  | Tri thức mỏ         | 14                      | 0,04 linh thạch         | Thể Phách 1                   | 68%       | —            |
| Hái linh thảo         | Hắc Thạch Cốc  | Thảo Dược 10        | 9                       | ≈ 0,03 linh thạch (bán) | Thảo Dược 2,5                 | 77%       | —            |
| Tạp dịch              | Thanh Vân      | Hợp đồng            | (60% thời gian cố định) | 1 cống hiến             | Thể Phách 1                   | —         | —            |

\* Ròng = thu × tỉ lệ làm − sinh hoạt phí làng (8).

Ròng ở trấn (phí 15): Làm thuê 25 × 75% − 15 = **+3,75** · Tiểu nhị 24 × 81% − 15 = **+4,4** · Khuân vác 30 × 67% − 15 = **+5,1**. Hái quả rừng cho 1,3 phần/ngày làm × 79% ≈ 1,03 phần/ngày, đủ ăn cả ngày nghỉ; lương thực hái được không bán được nên không thành nguồn tiền. (v0.1: Làm thuê ở trấn ròng −3,75, Tiểu nhị −0,4, tức vòng nghèo không thoát được.)

**Bài toán nợ đầu game:** nợ 800 văn, hạn 360 ngày. Chỉ đốn củi: 800 / 6,3 ≈ 127 ngày → còn ~230 ngày để học. Người chơi phải cân "học" và "trả nợ" nhưng không bị ép tối ưu.

## 4. Giá & vật phẩm

| Vật phẩm             | Giá                           | Hiệu ứng                                              | Đan Độc |
| -------------------- | ----------------------------- | ----------------------------------------------------- | ------- |
| Lương khô            | 6 văn/phần                    | 1 ngày ăn ở nơi hoang                                 | –       |
| Hồi Xuân Tán         | 60 văn                        | Rút ngắn bị thương 50%                                | –       |
| Linh thạch (chợ đêm) | Mua 1 200 văn · bán 800 văn   | Tiền tệ tu sĩ; hấp thu 1 viên = 15 tu vi trong 5 ngày | –       |
| Tụ Khí Đan           | 1 linh thạch · 120 cống hiến  | Tu vi ×(1 + 1,0 × (1 − Độc/100)) trong 60 ngày        | +25     |
| Phá Cảnh Đan         | 6 linh thạch · 300 cống hiến  | +0,15 × (1 − Độc/100) xác suất đột phá                | +30     |
| Trúc Cơ Đan          | 600 cống hiến (LK9) · sự kiện | +0,25 × (1 − Độc/100) cho Trúc Cơ                     | +40     |
| Diên Thọ Quả         | Không bán                     | +2 năm thọ nguyên, 1 lần/kiếp                         | –       |

Đan Độc giảm 0,5/ngày; ≥ 80 không thể dùng đan.

Tụ Khí Đan giá 120 cống hiến (v0.1: 80) `[CẦN DUYỆT D20]`.

**Giá trị đan tính bằng ngày:** một viên Tụ Khí Đan (1 linh thạch ≈ 1 200 văn ≈ 45 ngày hái thuốc ròng, đã trừ lương khô 6/ngày: 42 × 77% − 6 ≈ 26 văn/ngày) cho thêm ≈ 60 ngày tu luyện. Lãi ròng ≈ 15 ngày mỗi viên, nhưng Đan Độc +25 cần 50 ngày để tan. Nhịp hợp lý là một viên mỗi 60 ngày, tăng hiệu suất ròng khoảng 15% (15 ngày lãi trên ~105 ngày cả kiếm tiền lẫn tu luyện), đổi lại phải dành thêm thời gian kiếm tiền. Đây là đánh đổi có lợi nhưng không áp đảo.

## 5. Sổ cái nguồn ↔ tiêu thụ

### Theo năm game – kiếp 1, giai đoạn tán tu ở Hắc Thạch Cốc (LK2–6)

Sổ cái **khép kín 360 ngày** (sửa F07: bản v0.1 đã chi đủ 360 ngày mà vẫn cộng +0,8 linh thạch không tốn ngày nào). Cả năm ở cốc/rừng, nên mọi ngày đều ăn lương khô.

| Dòng                                               | Ngày    | Văn/năm  | Linh thạch/năm           |
| -------------------------------------------------- | ------- | -------- | ------------------------ |
| Tu luyện (kể cả nghỉ)                              | 198     |          |                          |
| **Nguồn:** hái thuốc 96 ngày × 42 × 77%            | 96      | +3 104   |                          |
| **Nguồn:** đào linh thạch vụn 30 ngày × 68% × 0,04 | 30      |          | +0,82                    |
| Đi lại (cốc ↔ trấn bán hàng, mua lương khô)        | 36      |          |                          |
| **Tiêu thụ:** lương khô 360 ngày × 6               |         | −2 160   |                          |
| **Tổng**                                           | **360** | **+944** | **+0,82**                |
| Quy đổi (mua linh thạch 1 200 văn)                 |         | ≈ 0,79   | **≈ 1,6 linh thạch/năm** |

Dùng: ~1,6 Tụ Khí Đan/năm, hoặc tiết kiệm ~4 năm cho một Phá Cảnh Đan ở nút thắt. Tỉ lệ thời gian tu luyện f = 198/360 = 0,55. Tiền không bao giờ dư thừa vô hạn vì mọi nguồn đều tốn ngày.

**Cách tính hệ số đan:** mỗi viên Tụ Khí Đan nhân đôi tu vi trong 60 ngày (bỏ qua Đan Độc), nên hệ số trung bình cả năm ≈ `1 + số viên × 60 / 360 = 1 + số viên / 6`. Tán tu: 1 + 1,6/6 ≈ ×1,27.

### Theo năm game – Thanh Vân Môn

| Dòng               | Tạp dịch (3 năm đầu) | Ngoại môn (từ LK4 + 200 cống hiến)    |
| ------------------ | -------------------- | ------------------------------------- |
| Thời gian bị chiếm | 60%                  | **55%** (v0.1: 50%) `[CẦN DUYỆT D20]` |
| Cống hiến          | +216                 | +99 (0,5/ngày nhiệm vụ)               |
| Linh thạch         | 0                    | 0                                     |
| Sinh hoạt phí      | 0                    | 0                                     |
| Tốc độ gốc¹        | 0,40 × 1,5 = 0,60    | 0,45 × 1,5 = 0,68                     |

¹ Tỉ lệ thời gian rảnh × D. Tán tu ở cốc: 0,55 × 1,0 = 0,55.

**So sánh có tính đan** (hệ số đan = 1 + số viên/6; tán tu 1,6 viên/năm; tạp dịch 216/120 = 1,8; ngoại môn 99/120 ≈ 0,8):

| Con đường | Gốc  | Hệ số đan | Kèm đan (v0.2) | Kèm đan với giá v0.1 |
| --------- | ---- | --------- | -------------- | -------------------- |
| Tán tu    | 0,55 | ×1,27     | 0,70           | 0,70                 |
| Tạp dịch  | 0,60 | ×1,30     | 0,78           | 0,87                 |
| Ngoại môn | 0,68 | ×1,14     | 0,77           | 0,89                 |

Với giá v0.1 (Tụ Khí Đan 80 cống hiến, ngoại môn 50%) và sổ cái đã sửa, môn phái nhanh hơn tán tu **~1,27×**, không phải ~1,08× như v0.1 đã ghi. Đề xuất v0.2 hạ còn **~1,11×** `[CẦN DUYỆT D20]`. Tán tu có Thủy linh căn dùng Hàn Thủy Quyết (C × E = 1,25 so với 1,1 của Thanh Vân Dưỡng Khí Quyết) đạt 0,70 × 1,25 ≈ 0,88, ngang ngoại môn 0,77 × 1,1 ≈ 0,85. Ngoại môn còn phải để dành 600 cống hiến cho Trúc Cơ Đan, tức là bớt Tụ Khí Đan.

Khác biệt chính nằm ở **loại phần thưởng**: môn phái cho cống hiến, linh địa D 1,5 (+0,05 đột phá) và Trúc Cơ Đan; tán tu cho sự kiện, chợ đêm, chuỗi Lục, Hàn Thủy Quyết. Harness kiểm tra tỉ lệ tốc độ môn phái / tán tu nằm trong khoảng 1,0–1,25× (§10).

## 6. Chiến đấu

```
KhíHuyết = 50 + 5 × ThểPhách + 40 × tầng
Công     = 5 + QuyềnCước + vũKhí + 8 × tầng
Thủ      = floor(ThểPhách / 2) + 4 × tầng
LinhLực  = 20 × tầng            (pháp thuật tốn 10)
SátThương = max(1, round(Công × u − Thủ_địch × 0.5)),   u ∈ [0.9, 1.1] theo RNG
BỏChạy   = clamp(0.5 + 0.01 × QuyềnCước + 0.1 × (tầng − tầngĐịch), 0.1, 0.95)
```

| Địch                  | Khí huyết | Công | Thủ | Ghi chú                              |
| --------------------- | --------- | ---- | --- | ------------------------------------ |
| Sói xám               | 60        | 10   | 2   | Bìa rừng                             |
| Thổ phỉ               | 90        | 12   | 4   | Đường, Hắc Phong                     |
| Thiết Bối Lang        | 180       | 22   | 12  | Hắc Thạch Cốc                        |
| Tu sĩ Hắc Phong (LK1) | 150       | 20   | 6   | Linh Đạn Thuật                       |
| Đoạn Ngạc (LK3)       | 320       | 36   | 14  | Linh Đạn Thuật, đánh cùng Lục nếu có |

### TTK mẫu (số lượt trung bình)

| Trận                                            | Người chơi              | Người chơi hạ địch | Địch hạ người chơi | Kết quả mong đợi                                                                              |
| ----------------------------------------------- | ----------------------- | ------------------ | ------------------ | --------------------------------------------------------------------------------------------- |
| Thiếu niên 15 tuổi (TP 5, QC 3, rìu) vs Sói xám | KH 75, Công 10, Thủ 2   | 7                  | 9                  | Thắng sát nút hoặc bỏ chạy (Thận trọng)                                                       |
| LK1 (TP 15, QC 8, đoản đao) vs Thiết Bối Lang   | KH 165, Công 26, Thủ 11 | 9                  | 10                 | 50/50 → khuyến khích dùng cỏ Xú Long hoặc né                                                  |
| LK3 (TP 20, QC 12, Thiết kiếm) vs Đoạn Ngạc     | KH 270, Công 50, Thủ 22 | 8                  | 11                 | Thắng nếu chuẩn bị; Lục hỗ trợ giảm còn ~4–5 lượt; Thanh Phong Kiếm (mua 4 linh thạch) còn ~7 |

## 7. Offline & Tích Thời `[ĐÃ DUYỆT D06]`

```
vắngMặt   = clamp(now − lastSave, 0, 8 giờ)
mô phỏng từng tick cho tới khi hết vắngMặt hoặc gặp điểm dừng
TíchThời  = min(8 giờ, TíchThời + phầnVắngMặtChưaDùng)
```

- **Dùng Tích Thời** khi online = **tua nhanh tức thì**: engine mô phỏng ngay (cùng đường chạy với offline) lượng Tích Thời đang có, dừng ở điểm dừng đầu tiên; phần chưa dùng được giữ lại. 1 giờ Tích Thời = 7 200 tick = 20 năm game. Không dùng dạng "chạy ×2" vì đã có nút tốc độ miễn phí (§1).
- Điểm dừng như online (CORE_LOOP §3). Bế quan có ít điểm dừng nhất → hợp với offline dài.
- Không có hiệu suất giảm khi offline: offline vẫn tiêu thọ nguyên như online, nên không có lợi thế khi đóng game (không khai thác được).
- Vì 8 giờ = 160 năm game, gần như mọi lần offline dài đều dừng ở điểm dừng sớm; Tích Thời bảo đảm người chơi không mất phần còn lại.
- **Chết khi vắng mặt** `[ĐÃ DUYỆT D34 – 2026-10-25]`: cảnh báo 10/5/1 năm là điểm dừng, nên vắng mặt chỉ có thể kết thúc bằng cái chết khi người chơi đã tự bấm qua cảnh báo 1 năm. Không thêm điểm dừng riêng cho offline.

## 8. Giảm grind vô nghĩa

| Biện pháp                           | Cách hoạt động                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| Mỗi hành động có nhiều đầu ra       | Tiền + XP + cơ hội sự kiện + tiến độ thám hiểm → không có ngày "chỉ để cày"             |
| Lịch trình tự động                  | Quy tắc nghỉ, tự làm thuê khi hết tiền, Bế quan có hạn định → không cần thao tác lặp    |
| Mốc mở khóa dày ở đầu game          | Kỹ năng mở hành động ở cấp 3/5/8/10; ~1 mốc mỗi 1–2 phút trong 30 phút đầu              |
| Ký ức kỹ năng ×3                    | Kiếp sau học lại nhanh phần đã từng học                                                 |
| Lợi suất giảm dần có kiểm soát      | XP `L^1.6`; ngưỡng tu vi `1,85^n` → người chơi tự đổi trọng tâm thay vì cày một thứ mãi |
| Không có nội dung "lặp lại 100 lần" | Sự kiện `motLan` cho cốt truyện; sự kiện lặp chỉ là nhỏ                                 |

## 9. Softlock, deadlock, chiến lược thống trị

### Softlock / deadlock

| Tình huống                                    | Bảo đảm                                                                                                                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hết tiền ở bất kỳ đâu                         | Làm thuê ròng > 0 ở mọi khu dân cư (validator); Hái quả rừng đủ ăn ở nơi hoang; Đói không gây chết, không phát sinh nợ (§3, test hồi phục S2)                                    |
| Mất rìu / công cụ                             | Làm thuê luôn mở; rìu mua lại 300 văn                                                                                                                                            |
| Bỏ lỡ Lục                                     | Hội tuyển mỗi 3 năm (tuổi 18, 21, 24…) + Mộc bá (thiện cảm 60)                                                                                                                   |
| Bỏ lỡ chỉ dẫn tới Hắc Thạch Cốc               | Bút ký Lý Viễn (lá thư của mẹ) · thám hiểm rừng 100% · môn phái thay thế linh địa                                                                                                |
| Kẹt trần Dẫn Khí Quyết (LK6)                  | Thanh Vân Dưỡng Khí Quyết (môn phái) · chợ đêm · Hàn Thủy Quyết (Lục)                                                                                                            |
| Không có Trúc Cơ Đan                          | p gốc 0,10 + chuẩn bị (tối đa 0,35 không có đan) vẫn cho phép thử                                                                                                                |
| Đột phá thất bại liên tục                     | Không rớt tầng, không mất tu vi dưới 0; chỉ mất thời gian                                                                                                                        |
| Bị cấm khỏi môn phái                          | Hết hạn sau 3 năm; tán tu vẫn đi tiếp                                                                                                                                            |
| Đan Độc đầy                                   | Tan 0,5/ngày; chỉ chặn đan, không chặn tu luyện                                                                                                                                  |
| Chết trước khi nhập đạo                       | Luân hồi vẫn xảy ra (R8 không cần tu vi); Tàn Niệm thấp nhưng có                                                                                                                 |
| Mọi NPC then chốt đã chết                     | Bảng kế thừa; mỗi mốc then chốt có ≥ 2 nguồn, trong đó ≥ 1 nguồn không phụ thuộc cờ thế giới, kiểm cho kiếp 1, kiếp 2 và kiếp 3 xấu nhất (kiểm thử khả đạt S4) `[CẦN DUYỆT D19]` |
| Chọn Liều mạng để chết "sạch" thay cho Tự vẫn | Liều mạng chỉ có trong trận của sự kiện lớn `quanTrong` + `motLan`, một lần mỗi save, không trước LK3 (SYSTEMS S8) `[CẦN DUYỆT D22]`                                             |

### Chiến lược thống trị và cách chặn

| Chiến lược tiềm năng                | Vì sao không áp đảo                                                                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chỉ tu luyện                        | Sinh hoạt phí và lương khô buộc phải kiếm tiền; không tiền → Đói, tu vi ×0,5                                                                                                |
| Spam đan dược                       | Đan Độc làm giảm hiệu lực tuyến tính và chặn ở 80                                                                                                                           |
| Đột phá ngay khi đầy                | Ở nút thắt p 0,45–0,55; thất bại mất 30% + 1 năm thọ → chuẩn bị thường đáng giá                                                                                             |
| Chuẩn bị tối đa mọi lần             | Trần thưởng +0,25; Phá Cảnh Đan đắt; thời gian chuẩn bị là thọ nguyên                                                                                                       |
| Luôn vào môn phái                   | Mất 55–60% thời gian; tốc độ kèm đan hơn tán tu ~1,11× với giá v0.2 (§5); ít sự kiện, không có chuỗi Lục/Hàn Thủy Quyết (mạnh nhất cho Thủy linh căn)                       |
| Luôn tán tu                         | Không có Trúc Cơ Đan dễ dàng; tốn lương khô; rủi ro chiến đấu                                                                                                               |
| Hấp thu linh thạch thay vì tu luyện | 1 linh thạch = 15 tu vi ≈ 30 ngày tu luyện, nhưng kiếm 1 linh thạch tốn ≈ 45 ngày → chỉ đáng khi linh thạch đến từ chiến lợi phẩm                                           |
| Tự vẫn sớm để reroll linh căn       | Kiếp chưa nhập đạo → Hồn dưỡng căn cho 100% Ngũ (tệ nhất); Tàn Niệm ×0,5; không khắc thiên phú mới. Tự vẫn chỉ có ích để thoát kiếp "hỏng" `[ĐÃ DUYỆT D16]`                 |
| Cày thiên phú qua nhiều kiếp ngắn   | Chỉ khắc khi kiếp sống ≥ 40 tuổi hoặc đạt LK1 và không tự vẫn; nâng bậc tốn 6/12 Tàn Niệm (cạnh tranh với ký ức); bậc III cần từng đạt LK4; chỉ 1 ô hồn ấn `[ĐÃ DUYỆT D15]` |
| Dồn thiên phú bậc III               | Trần kiểm thử tĩnh: hệ số XP ≤ ×1,4 (≈ +14% cấp kỹ năng), thọ nguyên ≤ +5, không cộng dồn cùng thiên phú → ≤ khoảng +15% trên một trục                                      |
| Save-scum đột phá                   | RNG nằm trong save; tải lại cho cùng kết quả                                                                                                                                |

## 10. Mô phỏng sơ bộ

### 10.1 Mô hình (v0.2)

Mô phỏng Monte Carlo, bước 10 ngày, RNG có seed, 300 lượt mỗi kịch bản. Script là bản nháp, không nằm trong repo; mô hình ghi lại ở đây để harness (P0–P3) dựng lại.

| Thành phần   | Giả định                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tu vi/ngày   | Công thức đầy đủ PROGRESSION §1, gồm C, P và Thổ Nạp; E = 1; M = 1                                                                                                 |
| Thổ Nạp      | XP 2/ngày tu luyện, ngưỡng `10 × L^1,6`; kiếp 1 khởi đầu cấp 8; kiếp 2 có ký ức ×3 tới cấp 30                                                                      |
| Thuần thục P | Điểm thuần thục/ngày = 1 × (1 + 0,01 × Văn Tự); Văn Tự 12 (kiếp 1), 15 (kiếp 2)                                                                                    |
| Công pháp    | Kiếp 1: Dẫn Khí Quyết (C 1,0), đổi sang Thanh Vân Dưỡng Khí Quyết (C 1,1) ở trần LK6, mất 30 ngày và 10% tu vi, thuần thục về 0. Kiếp 2: nhớ văn bản, C 1,1 từ đầu |
| Đột phá      | pGốc PROGRESSION §5 + chuẩn bị 0,10 (+ cảm ngộ 0,10 ở kiếp 2 cho tầng đã vượt); 30 ngày/lần; thất bại mất 30% ngưỡng, Nội thương 60 ngày, nút thắt mất 1 năm thọ   |
| Trúc Cơ      | Đủ 3 000 tu vi ở tầng 9; p 0,45 (tán tu) / 0,50 (môn phái); 90 ngày/lần; thất bại mất 50%, Nội thương 180 ngày, mất 5 năm thọ                                      |
| Thọ nguyên   | 60 + 5 (Thể Phách 25) + 3 × tầng − phần mất                                                                                                                        |
| Con đường    | Tán tu: D 1,0, f 0,55, đan ×1,27. Ngoại môn: D 1,5, f 0,45, đan ×1,14 (§5)                                                                                         |

### 10.2 Kết quả (trung vị tuổi đạt mốc; % lượt đạt nếu < 100%)

| Kịch bản                   | LK2  | LK4  | LK6  | LK7        | LK8        | LK9        | Thử Trúc Cơ (tỉ lệ / số lần) | Thành công | Tuổi thử đầu | Kết thúc |
| -------------------------- | ---- | ---- | ---- | ---------- | ---------- | ---------- | ---------------------------- | ---------- | ------------ | -------- |
| Kiếp 1 Ngũ, tán tu (21,5)  | 23,0 | 29,4 | 48,5 | 72,4 (76%) | –          | –          | 0%                           | 0%         | –            | ~85      |
| Kiếp 1 Tứ, tán tu (21,3)   | 22,3 | 26,5 | 38,8 | 56,0       | 78,7 (79%) | –          | 0%                           | 0%         | –            | ~88      |
| Kiếp 1 Tam, tán tu (21,2)  | 21,9 | 24,7 | 32,9 | 43,3       | 58,9       | 82,9 (65%) | 20% / 0,20                   | 10%        | ~91          | ~91      |
| Kiếp 1 Tứ, môn phái (24,5) | 25,4 | 29,5 | 41,5 | 57,8       | 78,7 (75%) | –          | 0%                           | 0%         | –            | ~88      |
| Kiếp 2 Tứ, tán tu (17)     | 17,9 | 21,8 | 32,3 | 44,6       | 65,9       | –          | 0%                           | 0%         | –            | ~88      |
| Kiếp 2 Tam, tán tu (17)    | 17,6 | 20,2 | 27,3 | 35,1       | 48,4       | 73,5 (96%) | 88% / 1,04                   | 47%        | ~83          | ~86      |
| Kiếp 2 Tam, ngoại môn (17) | 17,6 | 20,0 | 26,7 | 34,0       | 46,3       | 69,3 (99%) | 95% / 1,26                   | 66%        | ~78          | ~81      |
| Kiếp 2 Song, tán tu (16,5) | 16,9 | 18,7 | 23,7 | 29,1       | 37,8       | 54,5       | 100% / 1,94                  | 90%        | ~61          | ~65      |

Số trong ngoặc ở cột kịch bản là tuổi nhập đạo. Cột "Kết thúc" là tuổi chết hoặc tuổi Trúc Cơ thành công.

**Tổng hợp theo seed** (kiếp 2 có trọng số Tứ 23% · Tam 59% · Song 19%, §2):

- ~70% seed thử Trúc Cơ ở kiếp 2; tỉ lệ thành công trong kiếp 2 từ ~44% (tán tu) đến ~56% (ngoại môn).
- Lần thử đầu của Tam linh căn kiếp 2 ở tuổi ~78–83, tức ~3,2–3,5 giờ của kiếp 2. Cộng ~3,7 giờ kiếp 1 thì vào khoảng **giờ thứ 7**, sớm hơn mục tiêu 10 giờ, còn dư cho người chơi không tối ưu.
- Kiếp 1 Tam linh căn (15% seed) có 10% cơ hội Trúc Cơ ngay kiếp 1, tức ~1,5% tổng số seed. Chấp nhận như một bất ngờ hiếm.

### 10.3 Vì sao đổi so với v0.1 (F01)

Mô hình v0.1 bỏ sót Thổ Nạp (tới +50% tu vi) và giữ T9 = 8 000. Chạy lại đường cong v0.1 với Thổ Nạp tăng dần thì **kiếp 1 Tam linh căn đạt Trúc Cơ 70%**, trái trụ cột "không thiên tài". Còn nếu bỏ Thổ Nạp như v0.1 thì kiếp 2 Tam lên LK9 khi chỉ còn từ −7 đến +2 năm thọ, tức không thử được Trúc Cơ. Lưới đã thử:

| Tăng trưởng ngưỡng | Thổ Nạp/cấp | Kiếp 1 Tứ | Kiếp 1 Tam (thành Trúc Cơ) | Kiếp 2 Tam tán tu, T9 3 000 (thử / thành) | Nhận xét                   |
| ------------------ | ----------- | --------- | -------------------------- | ----------------------------------------- | -------------------------- |
| 1,75               | 1%          | LK8       | 70%                        | –                                         | v0.1: quá nhanh            |
| 1,75               | 0,5%        | LK8       | 57%                        | 100% / 79%                                | Kiếp 1 vẫn quá nhanh       |
| 1,85               | 1%          | LK8       | 30%                        | 98% / 61%                                 | Kiếp 1 Tam vẫn cao         |
| **1,85**           | **0,5%**    | **LK8**   | **7–10%**                  | **83–88% / 42–47%**                       | **Chọn** `[CẦN DUYỆT D17]` |
| 1,9                | 0,5%        | LK7       | 0%                         | 37% / 21%                                 | Kiếp 2 quá chậm            |

Với đường cong đã chọn, T9 = 4 000 hoặc 5 000 làm Tam linh căn kiếp 2 tán tu chỉ còn 71% / 57% số lượt được thử, nên chọn 3 000.

**Việc cần làm khi triển khai:** harness headless chạy engine thật với các "chính sách chơi" cố định, kiểm tra tuổi đạt mốc nằm trong ±15% bảng 10.2 và tỉ lệ tốc độ môn phái/tán tu trong 1,0–1,25×. Harness dựng từ P0 và mở rộng dần theo phase (IMPLEMENTATION_PLAN §2), không đợi tới cuối.
