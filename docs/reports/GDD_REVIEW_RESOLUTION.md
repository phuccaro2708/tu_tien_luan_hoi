# GDD Review Resolution – v0.1 → v0.2

> Ngày: 2026-10-23 · Người xử lý: Claude Code (Lead Developer, Game Designer) · Nhánh `docs/gdd-v0.1`
>
> **Nguồn review:** báo cáo audit của Codex được người dùng **dán trực tiếp vào phiên làm việc**. Báo cáo **không có trong repository** (`docs/reports/review/` chưa tồn tại). Tài liệu này không sửa và không tái tạo báo cáo đó; mọi finding dưới đây trích từ bản được dán, mã F01–F13 giữ nguyên theo Codex. Không có finding nào do tôi tự tạo dưới tên Codex. Phát hiện riêng của tôi được tách ở §3.

## 1. Tóm tắt

| Phân loại          | Số lượng | Finding                                          |
| ------------------ | -------- | ------------------------------------------------ |
| Accepted           | 10       | F01, F02, F03, F04, F05, F06, F07, F08, F09, F11 |
| Partially Accepted | 3        | F10, F12, F13                                    |
| Rejected           | 0        | –                                                |

Codex không nêu P0. Cả 6 finding P1 (F01–F06) đều được xác minh lại trên GDD và đã sửa. 7 finding P2 đều được xử lý, trong đó 3 finding chỉ chấp nhận một phần. Không bác bỏ hẳn finding nào, nhưng **có bác bỏ một số đề xuất cụ thể** của Codex (§2, F06, F13). Hai finding mà Codex báo nhẹ hơn thực tế (F02, F07) được ghi rõ.

Toàn bộ thay đổi được gắn thẻ `[CẦN DUYỆT D17–D26]`. Các file đã sửa chuyển từ `Approved` về `Draft v0.2`. Những phần không gắn thẻ giữ nguyên hiệu lực của bản v0.1 đã duyệt.

## 2. Từng finding

### F01 – P1 – Pacing Trúc Cơ bỏ qua phần tích tu vi LK9 → **Accepted**

- **Xác minh:** đúng. Bảng v0.1 ghi Tam tán tu đạt LK9 ở 85,4 tuổi, trong khi LK9 còn phải tích 8 000 tu vi, mất khoảng 42 năm ở tốc độ của chính mô hình đó.
- **Nguyên nhân gốc (Codex không nêu):** sim v0.1 bỏ sót Thổ Nạp (+1%/cấp, tới khoảng +30%) và Bế quan/Bồ đoàn. Khi thêm lại các hệ số này, **đường cong cũ lại quá nhanh**: kiếp 1 Tam linh căn đạt Trúc Cơ ở khoảng 70% số lượt chạy, trái với D07 ("kiếp 2–3").
- **Sửa (D17):**
  - Ngưỡng tu vi `100 × 1.85^(n−1)`.
  - Tầng 9 → Trúc Cơ cần 3 000, thay cho phần còn lại của 8 000.
  - Thổ Nạp giảm xuống +0,5%/cấp.
  - Mốc "đầy LK9 → lần thử đầu" có trong mọi bảng pacing.
- **Mô phỏng:** Monte Carlo N = 300 mỗi kịch bản, tính cả kinh tế, đan, thất bại và thọ nguyên trên cùng lịch (BALANCE §10). Lưới tham số ở §10.3 cho thấy 1.85 / 0,5% là điểm duy nhất thỏa cả hai điều kiện:

  | Điều kiện                         | Kết quả                 |
  | --------------------------------- | ----------------------- |
  | Kiếp 1 Tam thành Trúc Cơ          | 10%                     |
  | Kiếp 2 Tam tán tu: thử / thành    | 88% / 47%               |
  | Kiếp 2 Tam ngoại môn: thử / thành | 95% / 66%               |
  | Seed thử được Trúc Cơ ở kiếp 2    | ~70% (khoảng giờ thứ 7) |

- **Tài liệu:** PROGRESSION §2, BALANCE §2, §8, §10.

### F02 – P1 – Lịch sống NPC không khớp thọ nguyên → **Accepted (nặng hơn báo cáo)**

- **Xác minh:** đúng, và nặng hơn Codex nêu:
  - Bà Từ 70 tuổi là bất khả theo công thức phàm nhân (trần 71).
  - Mộc bá 62 tuổi sẽ mất khoảng năm thứ 9, tức **trước** khi walkthrough cần ông (tuổi 20–21 của người chơi).
  - Đỗ "140 tuổi ở kiếp 2" mâu thuẫn với việc kiếp 1 có thể ngắn hoặc dài.
- **Sửa (D18):**
  - Thêm khái niệm **năm thế giới**, năm 0 là năm nhân vật kiếp 1 tròn 14 tuổi.
  - `namSinh` và `thoNguyen` của NPC là dữ liệu.
  - Mộc bá 52, Bà Từ 60.
  - Bảng năm mất của 8 NPC (WORLD_LORE §3.1).
  - Tuổi ở kiếp sau suy ra từ năm chết thực tế + 30.
  - Validator kiểm tra mỗi chuỗi chỉ dùng NPC còn sống, hoặc có nhánh "đã mất".
- **Tài liệu:** WORLD_LORE §3, §3.1, §6; SYSTEMS S7; PROGRESSION §8.6.

### F03 – P1 – Có thể mất nguồn học chữ/công pháp ở kiếp sau → **Accepted**

- **Xác minh:** đúng. Lớp Tô và hiệu thuốc Mộc phụ thuộc cờ kiếp trước, và kiểm thử "≥ 2 nguồn trong dữ liệu" không bảo đảm đường đi thực sự tồn tại.
- **Sửa (D19):**
  - Mỗi mốc then chốt có ≥ 2 nguồn, trong đó **≥ 1 nguồn không phụ thuộc cờ hay NPC còn sống**.
  - Thêm **Thư xá** ở trấn Lạc Thủy (12 văn/ngày, luôn mở).
  - Hiệu thuốc trấn nhận học việc khi không có cờ.
  - Đỗ để lại **di thư** khi đã mất. Nhánh di thư cho kết quả giống nhánh gặp trực tiếp.
  - Bảng khả đạt cho từng mốc nằm ở SYSTEMS S4.
- **Kiểm thử:** chạy cho kiếp 1, kiếp 2 xấu nhất và kiếp 3 xấu nhất. Từ kiếp 3 không còn NPC gốc nào, nên cấu hình kiếp 3 đại diện cho mọi kiếp sau, đúng yêu cầu "ít nhất ba kiếp" của Codex.
- **Tài liệu:** SYSTEMS S4, S12; WORLD_LORE §3.2, §6; BALANCE §3, §9.

### F04 – P1 – Tốc độ và chế độ sự kiện chưa có hợp đồng replay → **Accepted**

- **Xác minh:** đúng. v0.1 suy ra cách xử lý sự kiện nhỏ từ tốc độ, mà tốc độ lại nằm ngoài GameState.
- **Sửa (D21):** cách xử lý sự kiện nhỏ là trường `chinhSachSuKienNho ∈ {hoi, tuDong}` trong GameState.
  - Chỉ đổi được qua lệnh `datChinhSachSuKienNho`, và lệnh này có ghi log.
  - Engine **không đọc tốc độ**.
  - UI mặc định gửi lệnh `tuDong` khi người chơi chuyển lên 3×/5×; người chơi có thể tắt hành vi này.
  - Replay = seed + nhật ký lệnh. Test so hash state ở bốn tốc độ và offline.
- Tôi chọn cách "policy là đầu vào xác định" thay vì ghi mọi lựa chọn tự động thành command, vì log nhỏ hơn và engine vẫn thuần.
- **Tài liệu:** SYSTEMS S1, S6; CORE_LOOP §3; BALANCE §1.

### F05 – P1 – Hành động cứu hộ kinh tế không bảo đảm phục hồi → **Accepted**

- **Xác minh:** đúng. Ở trấn, Làm thuê ròng −3,75 văn/ngày và Tiểu nhị ≈ −0,41. Pipeline v0.1 lại trừ phí trước khi cộng thu nhập.
- **Sửa (D23):**
  - Thu nhập cộng **trước** phí.
  - Không đủ tiền thì vào trạng thái Đói, không ghi nợ.
  - Lương mới: Làm thuê ở làng 15, ở trấn 25; Tiểu nhị 24; Khuân vác 30.
  - Thêm hành động Hái quả rừng (ra lương thực, không cần tiền).
  - Validator: Làm thuê ròng > 0 ở mọi khu dân cư.
  - Kiểm thử hồi phục: từ 0 văn và 0 lương khô thoát được Đói ở mọi địa điểm. Đây là kiểm tra có chuỗi hành động thực, không chỉ kiểm tra "có nút".
- **Tài liệu:** SYSTEMS S2; BALANCE §3; IMPLEMENTATION_PLAN §1.

### F06 – P1 – Chết bằng Liều mạng né hình phạt Tự vẫn → **Accepted, cách sửa khác**

- **Xác minh:** đúng. Đạt LK1 rồi chủ động Liều mạng để chết thì nhận đủ Tàn Niệm và vẫn khắc được thiên phú.
- **Sửa (D22):** "Liều mạng" chỉ có trong trận của sự kiện lớn gắn `quanTrong` hoặc `motLan`. Trận thường luôn rút lui được.
- **Bác bỏ hướng "phạt mọi cái chết trong chiến đấu":** cách này phạt cả thất bại hợp lệ, đúng điều Codex tự cảnh báo. Vì sự kiện `motLan` chỉ xảy ra một lần, không lặp lại được để làm chiến lược reset.
- PROGRESSION §8.7 khẳng định không còn đường chết chủ động nào né được phạt.
- **Tài liệu:** SYSTEMS S8; PROGRESSION §6, §8.7; BALANCE §9.

### F07 – P2 – Sổ cái tán tu vượt ngân sách 360 ngày → **Accepted (chênh lệch thật lớn hơn)**

- **Xác minh:** đúng. Sổ cái v0.1 dùng đủ 360 ngày nhưng vẫn cộng thêm 0,8 linh thạch.
- **Sổ cái khép kín:** tu luyện 198, hái thuốc 96, đào 30, đi lại 36 ngày, tổng đúng 360. Kết quả +944 văn và 0,82 linh thạch, tương đương khoảng 1,6 linh thạch/năm.
- **Chênh lệch thật:** với giá v0.1, môn phái nhanh hơn tán tu khoảng **1,27×**, không phải 1,08× như GDD ghi. Codex chỉ ra lỗi phép tính nhưng chưa định lượng mức sai.
- **Sửa (D20):** Tụ Khí Đan 120 cống hiến (cũ 80); ngoại môn chiếm 55% thời gian (cũ 50%). Tốc độ hiệu dụng sau sửa:

  | Con đường | Tốc độ hiệu dụng |
  | --------- | ---------------- |
  | Tán tu    | 0,70             |
  | Tạp dịch  | 0,78             |
  | Ngoại môn | 0,77             |

  Môn phái nhanh hơn tán tu khoảng 1,11×. Bù lại, tán tu có tự do, chợ đêm và Hàn Thủy Quyết.

- **Tài liệu:** BALANCE §4; SYSTEMS S11.

### F08 – P2 – Hỏa Cầu mâu thuẫn linh căn ngẫu nhiên → **Accepted**

- **Xác minh:** đúng. Khoảng 84% nhân vật kiếp 1 có Hỏa.
- **Sửa:** điều kiện dùng Hỏa Cầu là "linh căn có hệ Hỏa". Ghi chú "thiếu Hỏa" chỉ áp dụng cho seed walkthrough.
- **Tài liệu:** PROGRESSION §4.

### F09 – P2 – Hệ số gốc công pháp không có trong công thức → **Accepted, kèm thiếu M**

- **Xác minh:** đúng. Ngoài ra Bế quan (×1,10) và Bồ đoàn (×1,05) cũng không có trong công thức, dù được nhắc ở nơi khác.
- **Sửa (D17):** công thức đầy đủ `0.5 × D × R × C × P × (1 + 0.005 × ThổNạp) × E × Q × B × M`.

  | Hệ số         | Giá trị                                    |
  | ------------- | ------------------------------------------ |
  | C (công pháp) | Dẫn Khí 1,0 · Thanh Vân 1,1 · Hàn Thủy 1,0 |
  | M             | Bế quan ×1,10 · Bồ đoàn ×1,05              |
  | Q             | Lấy giá trị nhỏ nhất (min)                 |

  Công thức ghi rõ đây là toàn bộ hệ số. Ví dụ tính được làm lại.

- **Tài liệu:** PROGRESSION §2, §4; SYSTEMS S9.

### F10 – P2 – Trạng thái gameplay chưa đủ đặc tả → **Partially Accepted**

- **Chấp nhận:** bổ sung quy tắc phân xử (D25), không thêm hệ thống mới:

  | Tình huống                     | Quy tắc                                                         |
  | ------------------------------ | --------------------------------------------------------------- |
  | Thứ tự lượt                    | Kiểm tra bỏ chạy → người chơi → địch                            |
  | Hết lượt 20                    | Rút lui, không tính thua, không có chiến lợi phẩm               |
  | Khí huyết ngoài trận           | Hồi 10%/ngày                                                    |
  | Thám hiểm                      | +1% mỗi ngày làm việc                                           |
  | Dùng đan                       | Kiểm tra độc → tính hiệu lực theo độc trước khi uống → cộng độc |
  | Buff                           | Uống lại làm mới thời hạn, không cộng dồn                       |
  | Nhiều trạng thái cùng lúc (Q)  | Lấy giá trị nhỏ nhất                                            |
  | Đột phá xong cùng tick hết thọ | Cộng thọ nguyên trước bước kiểm tra chết                        |
  | Thiện cảm                      | Chỉ đổi qua dữ liệu sự kiện/hành động                           |

- **Không chấp nhận:** yêu cầu một "bảng chuyển trạng thái" đầy đủ cho mọi tổ hợp. Phần lớn tổ hợp đã được quy tắc min của Q và thứ tự pipeline xác định. Bảng đầy đủ sẽ trùng với test ranh giới; test đó được liệt kê ở SYSTEMS S8–S10.
- **Tài liệu:** SYSTEMS S5, S8, S9, S10; IMPLEMENTATION_PLAN §1.

### F11 – P2 – Walkthrough không có ngân sách ngày → **Accepted**

- **Xác minh:** đúng. Khung phút 24–29 tương đương 600 ngày, trong khi phần việc thực chỉ cần khoảng 185 ngày.
- **Sửa:** walkthrough có bảng ngân sách ngày khép kín, tổng 2 545 ngày.
  - Người chơi tối ưu đạt LK1 ở khoảng 21 phút; người chơi thường ở 22–24 phút.
  - Phần còn lại tới phút 30 là LK1 → LK2, chợ đêm, và sự kiện Bà Từ mất (năm thế giới 10).
  - Các nhánh khác: môn phái khoảng phút 32, Mộc bá khoảng phút 38–40.
  - Tiêu chí MVP đổi từ "30–45 phút" sang "21–40 phút, đo bằng harness".
- **Phần còn lại:** thời gian đọc và chọn sự kiện của người thật chỉ đo được ở playtest P4.
- **Tài liệu:** CORE_LOOP §6; MVP_SCOPE §4.

### F12 – P2 – Hậu kỳ thành tối ưu tăng số → **Partially Accepted**

- **Chấp nhận:** đây là rủi ro thật và hiện chưa chứng minh được bằng tài liệu. Thêm chỉ số playtest **≥ 1 quyết định có ý nghĩa mỗi 30 phút sau LK6**, kèm danh sách nguồn quyết định đã có (CORE_LOOP §2).
- **Không chấp nhận:** thêm hệ thống mới hoặc rút ngắn hậu kỳ ngay lúc này. Đường cong D17 đã giảm tỉ lệ ngưỡng giữa các tầng. Rủi ro này cần dữ liệu playtest (P4) trước khi quyết định.

### F13 – P2 – Phạm vi lớn trước khi chứng minh vòng lõi → **Partially Accepted**

- **Chấp nhận (D26):**
  - Harness dựng **từ P0**, sớm hơn đề xuất P1 của Codex.
  - Lát cắt dọc hai kiếp ở **P4**, kèm playtest đầu tiên.
  - Mỗi phase có tiêu chí thoát kiểm thử được (IMPLEMENTATION_PLAN §2).
- **Đề xuất thu gọn (D24):** 30–40 sự kiện (Codex đề xuất 20–30); 5 địa điểm, với Hắc Phong trại và động phủ Lục thành điểm con.
- **Bác bỏ:**
  - Cắt xuống 2 công pháp. D12 đã duyệt trần LK6, và Hàn Thủy Quyết là lối thoát cùng bản sắc của con đường tán tu.
  - Hoãn thiên phú bậc II/III. D15 đã được duyệt, và chi phí chủ yếu nằm ở dữ liệu.
- **Tài liệu:** MVP_SCOPE §2.1, §4, §5; IMPLEMENTATION_PLAN §2; GDD §9.

## 3. Phát hiện thêm (không có trong báo cáo Codex)

| #   | Phát hiện                                                                                                              | Xử lý                      |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| A1  | Sim v0.1 bỏ sót Thổ Nạp; thêm vào thì kiếp 1 Tam đạt Trúc Cơ khoảng 70%, phá D07                                       | D17 (đường cong + Thổ Nạp) |
| A2  | Bế quan và Bồ đoàn không có trong công thức                                                                            | D17 (hệ số M)              |
| A3  | Kiếp 2 Tứ linh căn không bao giờ đạt mức thử Trúc Cơ (tối đa LK8), cần kiếp 3; điều này khớp với D07 nhưng chưa ghi ra | Ghi rõ trong BALANCE §10.2 |
| A4  | Mộc bá chết trước khi walkthrough cần ông; Đỗ "140 tuổi" mâu thuẫn dòng thời gian                                      | D18 (xem F02)              |
| A5  | Chênh lệch môn phái/tán tu thật là 1,27×, không phải 1,08×                                                             | D20 (xem F07)              |

## 4. Quyết định cần người dùng duyệt

| Mã  | Nội dung                                                                          | Finding  | Nếu từ chối                                        |
| --- | --------------------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| D17 | Ngưỡng `100 × 1.85^(n−1)`; T9 → Trúc Cơ 3 000; Thổ Nạp +0,5%; công thức có C và M | F01, F09 | Kiếp 1 Tam đạt Trúc Cơ khoảng 70%, D07 mất ý nghĩa |
| D18 | Năm thế giới; tuổi và thọ NPC là dữ liệu; Mộc bá 52, Bà Từ 60                     | F02      | NPC chết trước sự kiện cần họ                      |
| D19 | ≥ 1 nguồn không phụ thuộc cờ; Thư xá; di thư Đỗ; kiểm thử khả đạt 3 kiếp          | F03      | Có thể kẹt progression ở kiếp sau                  |
| D20 | Tụ Khí Đan 120 cống hiến; ngoại môn 55%                                           | F07      | Môn phái nhanh hơn tán tu 1,27×, lựa chọn bị lệch  |
| D21 | `chinhSachSuKienNho` trong GameState, đổi qua lệnh                                | F04      | Replay không tất định                              |
| D22 | Liều mạng chỉ có trong trận sự kiện lớn `quanTrong`/`motLan`                      | F06      | Có đường né phạt Tự vẫn                            |
| D23 | Thu nhập trước phí; Đói không nợ; lương mới; Làm thuê ròng > 0                    | F05      | Có thể kẹt nghèo ở trấn                            |
| D24 | 30–40 sự kiện, 5 địa điểm + 2 điểm con                                            | F13      | Giữ 60–80 sự kiện, 7 địa điểm; tăng rủi ro tiến độ |
| D25 | Quy tắc phân xử chiến đấu/đan/đột phá                                             | F10      | Lập trình viên phải tự quyết luật                  |
| D26 | Kế hoạch phase mới: harness từ P0, lát cắt hai kiếp ở P4                          | F13, F11 | Harness ở P7, rủi ro phát hiện lỗi cân bằng muộn   |

**P0 không phụ thuộc vào phần Draft.** P0 (khung engine + harness) không dùng con số hay quy tắc nào trong D17–D25. Nếu D26 được duyệt, có thể bắt đầu P0 trong khi các quyết định khác còn đang xem xét.

## 5. Vấn đề còn lại

- Mọi con số v0.2 vẫn là "trước playtest". Sim Python (bước 10 ngày) là mô hình xấp xỉ; harness engine thật thay thế nó từ P0–P6.
- Thời gian đọc và chọn sự kiện của người thật chưa đo được (F11), chờ playtest P4.
- Nhịp quyết định ở hậu kỳ (F12) chưa chứng minh được, chờ playtest P4.
- Đề xuất cắt công pháp và thiên phú của Codex đã bị bác bỏ. Nếu người dùng muốn cắt mạnh hơn, cần mở lại D12/D15.
