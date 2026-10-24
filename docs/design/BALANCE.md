# Balance

> **Trạng thái: Draft – 2026-10-23** · **v0.1 – trước playtest.** Mọi số liệu là giả thuyết, đã kiểm sơ bộ bằng mô phỏng bảng tính (§10); sẽ được chỉnh lại bằng harness mô phỏng headless và playtest.

## 1. Thang thời gian `[CẦN DUYỆT D02]`

| Đơn vị                                   | Giá trị                               |
| ---------------------------------------- | ------------------------------------- |
| 1 tick                                   | 1 ngày game                           |
| Tốc độ thường                            | 2 tick / giây thực                    |
| 1 năm game                               | 360 ngày = 180 giây = **3 phút thực** |
| 1 giờ thực                               | 7 200 ngày = **20 năm game**          |
| Một đời kiếp 1 điển hình (14 → ~84 tuổi) | ≈ 3,5 giờ thực                        |
| Offline tối đa                           | 8 giờ thực = 57 600 tick              |

## 2. Pacing mục tiêu

Người chơi tham chiếu: chơi chủ động vừa phải, không tối ưu tuyệt đối.

| Mốc         | Tuổi (kiếp)                  | Trạng thái mong đợi                                                                                                                             | Cảm xúc mục tiêu                       |
| ----------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **10 phút** | 17 (kiếp 1)                  | Đã trả nợ hoặc chịu hậu quả; Thể Phách ~8, Văn Tự ~6, Thảo Dược ~5; biết tiên nhân có thật; biết hội tuyển; vừa gặp Lục hoặc đang chờ hội tuyển | Tò mò: "thế giới lớn hơn cái làng này" |
| **30 phút** | 24 (kiếp 1)                  | Luyện Khí 1 (nhánh nhanh) hoặc sắp nhập đạo (nhánh chậm, ≤ 45 phút); bảng Tu luyện mở; đã có quyết định lớn về mẹ, Lục, môn phái                | Thỏa mãn: "mình đã bước vào con đường" |
| **2 giờ**   | 54 (kiếp 1)                  | Luyện Khí 6 (tán tu) hoặc 6–7 (môn phái); đã qua nút thắt 3→4; đang đổi công pháp vì trần LK6; Lục đã mất; thọ nguyên còn ~25 năm               | Áp lực: "thời gian không đủ"           |
| ~3,5 giờ    | ~84                          | Chết ở LK7 (có thể LK8 nếu tối ưu); lần luân hồi đầu tiên                                                                                       | Mất mát + hiểu ra luật chơi lớn        |
| **10 giờ**  | Kiếp 2 cuối hoặc kiếp 3 giữa | Đã thử Trúc Cơ ít nhất một lần; người chơi tốt đạt Trúc Cơ (kết thúc nội dung MVP)                                                              | Thành tựu dài hạn                      |

Kiểm tra pacing tự động: §10.

## 3. Hành động & sinh hoạt phí

### Sinh hoạt phí (văn/ngày)

| Nơi                                | Phí | Ghi chú                                                            |
| ---------------------------------- | --- | ------------------------------------------------------------------ |
| Làng (ở nhà)                       | 8   |                                                                    |
| Trấn Lạc Thủy                      | 15  |                                                                    |
| Rừng, Hắc Thạch Cốc, động phủ      | 6   | Trả bằng **lương khô** mua trước (6 văn/phần); hết lương khô → Đói |
| Thanh Vân Môn (tạp dịch/ngoại môn) | 0   | Môn phái bao ăn                                                    |

Đói: XP ×0.5, tu vi ×0.5, Tinh lực hồi ×0.5; không gây chết. Luôn có Làm thuê hoặc Hái quả rừng (0 văn, đủ ăn, TL 8) để thoát.

### Tinh lực

Tối đa 100 (+Thể Phách, thiên phú). Nghỉ ngơi +30/ngày. Quy tắc mặc định: nghỉ khi < 20, làm lại khi ≥ 90. Tỉ lệ ngày làm việc ≈ `30 / (30 + chiPhíTL)`.

### Bảng hành động (giá trị gốc, cấp kỹ năng 0)

| Hành động             | Nơi            | Yêu cầu             | TL/ngày                 | Thu (văn/ngày)          | XP/ngày                       | Tỉ lệ làm | Ròng ở làng* |
| --------------------- | -------------- | ------------------- | ----------------------- | ----------------------- | ----------------------------- | --------- | ------------ |
| Làm thuê              | Mọi khu dân cư | –                   | 10                      | 15                      | Thể Phách 1,5                 | 75%       | +3,3         |
| Đốn củi               | Làng/Rừng      | Rìu                 | 12                      | 20 (+2%/Thể Phách)      | Thể Phách 2,5                 | 71%       | +6,3         |
| Học việc hiệu thuốc   | Làng           | –                   | 6                       | 5                       | Thảo Dược 3                   | 83%       | −3,8         |
| Hái thuốc             | Rừng           | Thảo Dược 3         | 9                       | 12 + 1,5 × Thảo Dược    | Thảo Dược 2                   | 77%       | —            |
| Học chữ               | Làng           | Tô tiên sinh mở lớp | 4                       | −10 (học phí)           | Văn Tự 3                      | 88%       | −16,8        |
| Bổ củi đổi chữ        | Làng           | Thiện cảm Tô ≥ 10   | 12                      | 0                       | Văn Tự 1,5 + Thể Phách 1      | 71%       | −8           |
| Tiểu nhị quán trà     | Trấn           | –                   | 7                       | 18 + 0,5 × Giao Tế      | Giao Tế 2,5                   | 81%       | —            |
| Khuân vác bến sông    | Trấn           | Thể Phách 5         | 15                      | 26 (+2%/Thể Phách)      | Thể Phách 2                   | 67%       | —            |
| Luyện quyền (võ quán) | Trấn           | –                   | 15                      | −20                     | Quyền Cước 3 + Thể Phách 1    | 67%       | —            |
| Tự luyện quyền        | Mọi nơi        | Quyền Cước 5        | 15                      | 0                       | Quyền Cước 1,5                | 67%       | —            |
| Thám hiểm             | Nơi hoang      | –                   | 10                      | 0                       | Thể Phách 0,5                 | 75%       | —            |
| Tu luyện              | Mọi nơi        | Công pháp           | 3                       | 0                       | Thổ Nạp 2, thuần thục 1 × Ngộ | 91%       | —            |
| Đào linh thạch vụn    | Hắc Thạch Cốc  | Tri thức mỏ         | 14                      | 0,04 linh thạch         | Thể Phách 1                   | 68%       | —            |
| Hái linh thảo         | Hắc Thạch Cốc  | Thảo Dược 10        | 9                       | ≈ 0,03 linh thạch (bán) | Thảo Dược 2,5                 | 77%       | —            |
| Tạp dịch              | Thanh Vân      | Hợp đồng            | (60% thời gian cố định) | 1 cống hiến             | Thể Phách 1                   | —         | —            |

\* Ròng = thu × tỉ lệ làm − sinh hoạt phí làng (8).

**Bài toán nợ đầu game:** nợ 800 văn, hạn 360 ngày. Chỉ đốn củi: 800 / 6,3 ≈ 127 ngày → còn ~230 ngày để học. Người chơi phải cân "học" và "trả nợ" nhưng không bị ép tối ưu.

## 4. Giá & vật phẩm

| Vật phẩm             | Giá                           | Hiệu ứng                                              | Đan Độc |
| -------------------- | ----------------------------- | ----------------------------------------------------- | ------- |
| Lương khô            | 6 văn/phần                    | 1 ngày ăn ở nơi hoang                                 | –       |
| Hồi Xuân Tán         | 60 văn                        | Rút ngắn bị thương 50%                                | –       |
| Linh thạch (chợ đêm) | Mua 1 200 văn · bán 800 văn   | Tiền tệ tu sĩ; hấp thu 1 viên = 15 tu vi trong 5 ngày | –       |
| Tụ Khí Đan           | 1 linh thạch · 80 cống hiến   | Tu vi ×(1 + 1,0 × (1 − Độc/100)) trong 60 ngày        | +25     |
| Phá Cảnh Đan         | 6 linh thạch · 300 cống hiến  | +0,15 × (1 − Độc/100) xác suất đột phá                | +30     |
| Trúc Cơ Đan          | 600 cống hiến (LK9) · sự kiện | +0,25 × (1 − Độc/100) cho Trúc Cơ                     | +40     |
| Diên Thọ Quả         | Không bán                     | +2 năm thọ nguyên, 1 lần/kiếp                         | –       |

Đan Độc giảm 0,5/ngày; ≥ 80 không thể dùng đan.

**Giá trị đan tính bằng ngày:** một viên Tụ Khí Đan (1 linh thạch ≈ 1 200 văn ≈ 45 ngày hái thuốc ròng, đã trừ lương khô 6/ngày: 42 × 77% − 6 ≈ 26 văn/ngày) cho thêm ≈ 60 ngày tu luyện. Lãi ròng ≈ 15 ngày mỗi viên, nhưng Đan Độc +25 cần 50 ngày để tan. Nhịp hợp lý là một viên mỗi 60 ngày, tăng hiệu suất ròng khoảng 15% (15 ngày lãi trên ~105 ngày cả kiếm tiền lẫn tu luyện), đổi lại phải dành thêm thời gian kiếm tiền. Đây là đánh đổi có lợi nhưng không áp đảo.

## 5. Sổ cái nguồn ↔ tiêu thụ

### Theo năm game – kiếp 1, giai đoạn tán tu ở Hắc Thạch Cốc (LK2–6)

Phân bổ giả định: 55% thời gian tu luyện (kể cả nghỉ), 35% kiếm tiền (hái thuốc/linh thảo, Thảo Dược ~20), 10% đi lại.

| Dòng                                            | Văn/năm                              | Linh thạch/năm |
| ----------------------------------------------- | ------------------------------------ | -------------- |
| **Nguồn:** hái thuốc 126 ngày × 42 × 77%        | +4 070                               |                |
| **Nguồn:** đào linh thạch / linh thảo (xen kẽ)  |                                      | +0,8           |
| **Tiêu thụ:** lương khô 230 ngày ở cốc/rừng × 6 | −1 380                               |                |
| **Tiêu thụ:** ở làng 130 ngày × 8               | −1 040                               |                |
| **Ròng**                                        | **+1 650**                           | **+0,8**       |
| Quy đổi                                         | ≈ 1,4 + 0,8 = **2,2 linh thạch/năm** |                |

Dùng: ~2 Tụ Khí Đan/năm hoặc tiết kiệm ~3 năm cho một Phá Cảnh Đan ở nút thắt. Tiền không bao giờ dư thừa vô hạn vì mọi nguồn đều tốn ngày.

### Theo năm game – Thanh Vân Môn

| Dòng                       | Tạp dịch (3 năm đầu) | Ngoại môn (từ LK4 + 200 cống hiến) |
| -------------------------- | -------------------- | ---------------------------------- |
| Thời gian bị chiếm         | 60%                  | 50% (nhiệm vụ môn phái)            |
| Cống hiến                  | +216                 | +90 (0,5/ngày nhiệm vụ)            |
| Linh thạch                 | 0                    | 0                                  |
| Sinh hoạt phí              | 0                    | 0                                  |
| Tốc độ tu luyện hiệu dụng¹ | 0,4 × 1,5 = 0,60     | 0,5 × 1,5 = 0,75                   |

¹ Tỉ lệ thời gian rảnh × D. Tán tu ở cốc: 0,6 × 1,0 = 0,60.

**So sánh có tính đan** (mỗi Tụ Khí Đan ≈ +60 ngày tu luyện; tán tu ~2,2 viên/năm, tạp dịch 216/80 ≈ 2,7, ngoại môn 90/80 ≈ 1,1):

| Con đường | Gốc  | Kèm đan |
| --------- | ---- | ------- |
| Tán tu    | 0,60 | 0,82    |
| Tạp dịch  | 0,60 | 0,87    |
| Ngoại môn | 0,75 | 0,89    |

Chênh lệch tối đa ≈ 1,08× → không có con đường thống trị về tốc độ. Ngoại môn còn phải để dành 600 cống hiến cho Trúc Cơ Đan, tức là bớt Tụ Khí Đan. Khác biệt chính nằm ở **loại phần thưởng**: môn phái cho cống hiến, linh địa D 1,5 (+0,05 đột phá) và Trúc Cơ Đan; tán tu cho sự kiện, chợ đêm, chuỗi Lục, Hàn Thủy Quyết.

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

## 7. Offline & Tích Thời `[CẦN DUYỆT D06]`

```
vắngMặt   = clamp(now − lastSave, 0, 8 giờ)
mô phỏng từng tick cho tới khi hết vắngMặt hoặc gặp điểm dừng
TíchThời  = min(8 giờ, TíchThời + phầnVắngMặtChưaDùng)
```

- Bật Tích Thời khi online: tốc độ ×2 (4 tick/giây); mỗi giây thực tiêu 1 giây Tích Thời. 8 giờ Tích Thời = 8 giờ chơi ở tốc độ gấp đôi.
- Điểm dừng như online (CORE_LOOP §3). Bế quan có ít điểm dừng nhất → hợp với offline dài.
- Không có hiệu suất giảm khi offline: offline vẫn tiêu thọ nguyên như online, nên không có lợi thế khi đóng game (không khai thác được).
- Vì 8 giờ = 160 năm game, gần như mọi lần offline dài đều dừng ở điểm dừng sớm; Tích Thời bảo đảm người chơi không mất phần còn lại.

## 8. Giảm grind vô nghĩa

| Biện pháp                           | Cách hoạt động                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| Mỗi hành động có nhiều đầu ra       | Tiền + XP + cơ hội sự kiện + tiến độ thám hiểm → không có ngày "chỉ để cày"             |
| Lịch trình tự động                  | Quy tắc nghỉ, tự làm thuê khi hết tiền, Bế quan có hạn định → không cần thao tác lặp    |
| Mốc mở khóa dày ở đầu game          | Kỹ năng mở hành động ở cấp 3/5/8/10; ~1 mốc mỗi 1–2 phút trong 30 phút đầu              |
| Ký ức kỹ năng ×3                    | Kiếp sau học lại nhanh phần đã từng học                                                 |
| Lợi suất giảm dần có kiểm soát      | XP `L^1.6`; ngưỡng tu vi `1,75^n` → người chơi tự đổi trọng tâm thay vì cày một thứ mãi |
| Không có nội dung "lặp lại 100 lần" | Sự kiện `motLan` cho cốt truyện; sự kiện lặp chỉ là nhỏ                                 |

## 9. Softlock, deadlock, chiến lược thống trị

### Softlock / deadlock

| Tình huống                      | Bảo đảm                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Hết tiền ở bất kỳ đâu           | Làm thuê ở khu dân cư; Hái quả rừng ở nơi hoang; Đói không gây chết               |
| Mất rìu / công cụ               | Làm thuê luôn mở; rìu mua lại 300 văn                                             |
| Bỏ lỡ Lục                       | Hội tuyển mỗi 3 năm (tuổi 18, 21, 24…) + Mộc bá (thiện cảm 60)                    |
| Bỏ lỡ chỉ dẫn tới Hắc Thạch Cốc | Bút ký Lý Viễn (lá thư của mẹ) · thám hiểm rừng 100% · môn phái thay thế linh địa |
| Kẹt trần Dẫn Khí Quyết (LK6)    | Thanh Vân Dưỡng Khí Quyết (môn phái) · chợ đêm · Hàn Thủy Quyết (Lục)             |
| Không có Trúc Cơ Đan            | p gốc 0,10 + chuẩn bị (tối đa 0,35 không có đan) vẫn cho phép thử                 |
| Đột phá thất bại liên tục       | Không rớt tầng, không mất tu vi dưới 0; chỉ mất thời gian                         |
| Bị cấm khỏi môn phái            | Hết hạn sau 3 năm; tán tu vẫn đi tiếp                                             |
| Đan Độc đầy                     | Tan 0,5/ngày; chỉ chặn đan, không chặn tu luyện                                   |
| Chết trước khi nhập đạo         | Luân hồi vẫn xảy ra (R8 không cần tu vi); Tàn Niệm thấp nhưng có                  |
| Mọi NPC then chốt đã chết       | Bảng kế thừa; tri thức then chốt luôn có ≥ 2 nguồn (kiểm thử tĩnh S4)             |

### Chiến lược thống trị và cách chặn

| Chiến lược tiềm năng                | Vì sao không áp đảo                                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Chỉ tu luyện                        | Sinh hoạt phí và lương khô buộc phải kiếm tiền; không tiền → Đói, tu vi ×0,5                                                                 |
| Spam đan dược                       | Đan Độc làm giảm hiệu lực tuyến tính và chặn ở 80                                                                                            |
| Đột phá ngay khi đầy                | Ở nút thắt p 0,45–0,55; thất bại mất 30% + 1 năm thọ → chuẩn bị thường đáng giá                                                              |
| Chuẩn bị tối đa mọi lần             | Trần thưởng +0,25; Phá Cảnh Đan đắt; thời gian chuẩn bị là thọ nguyên                                                                        |
| Luôn vào môn phái                   | Mất 50–60% thời gian; tốc độ kèm đan chỉ hơn tán tu ~1,08× (§5); ít sự kiện, không có chuỗi Lục/Hàn Thủy Quyết (mạnh nhất cho Thủy linh căn) |
| Luôn tán tu                         | Không có Trúc Cơ Đan dễ dàng; tốn lương khô; rủi ro chiến đấu                                                                                |
| Hấp thu linh thạch thay vì tu luyện | 1 linh thạch = 15 tu vi ≈ 30 ngày tu luyện, nhưng kiếm 1 linh thạch tốn ≈ 45 ngày → chỉ đáng khi linh thạch đến từ chiến lợi phẩm            |
| Chết sớm để luân hồi nhanh          | Tàn Niệm và Hồn dưỡng căn phụ thuộc cảnh giới đạt được; không thể tự kích hoạt luân hồi                                                      |
| Save-scum đột phá                   | RNG nằm trong save; tải lại cho cùng kết quả                                                                                                 |

## 10. Mô phỏng sơ bộ

Mô hình bảng tính (đã chạy khi soạn tài liệu): tu vi/ngày = 0,5 × D × R × 1,25 (thuần thục trung bình); tỉ lệ thời gian tu luyện f; mỗi lần đột phá thêm 30/p ngày; thất bại mất 30% ngưỡng (số lần thất bại kỳ vọng (1−p)/p); chuẩn bị +0,10; thọ nguyên 62 + 3 × tầng.

| Kịch bản                                       | LK2  | LK4  | LK6  | LK7  | LK8  | LK9  | Chết (tuổi / giờ thực) |
| ---------------------------------------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---------------------- |
| Kiếp 1, Tứ, cốc D 1,0, f 0,6, nhập đạo 24      | 25,0 | 30,2 | 44,7 | 63,8 | –    | –    | ~83 / 3,5 h            |
| Kiếp 1, Tứ, môn phái D 1,5, f 0,4 → 0,5 từ LK4 | 25,0 | 30,2 | 41,8 | 57,1 | 80,1 | –    | ~86 / 3,6 h            |
| Kiếp 2, Tam, cốc, f 0,65, nhập đạo 17          | 17,6 | 20,7 | 29,0 | 39,9 | 56,2 | 85,4 | ~89 / 3,8 h            |
| Kiếp 2, Tam, ngoại môn ngay, f 0,5             | 17,6 | 20,2 | 27,4 | 36,9 | 51,1 | 76,4 | ~89 / 3,8 h            |
| Kiếp 2, Song, cốc, f 0,65                      | 16,4 | 18,5 | 24,0 | 31,1 | 41,8 | 60,8 | ~89                    |

Mô hình chưa tính ký ức (×3 XP, cảm ngộ +0,10, biết đường từ đầu), Tụ Khí Đan và Hàn Thủy Quyết, nên kiếp 2 thực tế nhanh hơn bảng. Bảng không có đan nên thiên vị môn phái: tán tu có nhiều đan hơn ngoại môn (§5), và khi tính đan hai con đường gần ngang nhau (~1,08×). Kết luận v0.1: kiếp 1 dừng ở LK7 (môn phái tối ưu có thể chạm LK8 sát cuối đời) đúng ý đồ; kiếp 2 với Tam linh căn chạm LK9 và có 5–15 năm để thử Trúc Cơ.

**Việc cần làm khi triển khai:** harness headless chạy engine thật với các "chính sách chơi" cố định, kiểm tra tuổi đạt mốc nằm trong ±15% bảng trên (IMPLEMENTATION_PLAN Phase 7).
