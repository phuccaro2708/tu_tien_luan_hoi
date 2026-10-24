# Core Loop

> **Trạng thái: Approved – 2026-10-23** · v0.1 – trước playtest. Số liệu tham chiếu `BALANCE.md`.

## 1. Ba phương án core loop

### Phương án A – "Đời người theo hành động"

Thời gian chạy liên tục theo ngày. Người chơi chọn **một hành động chính** (lao động, học, thám hiểm, tu luyện…) và quy tắc nghỉ ngơi; hành động sinh tiền, kinh nghiệm kỹ năng, tri thức và cơ hội sự kiện. Tuổi tăng, thọ nguyên giảm. Sự kiện xuất hiện theo điều kiện (nơi chốn, kỹ năng, quan hệ, cờ cốt truyện) và đòi hỏi lựa chọn.

| Tiêu chí          | Đánh giá                                                                      |
| ----------------- | ----------------------------------------------------------------------------- |
| Thú vị            | Cao. Mỗi ngày có giá trị; câu hỏi "dùng đời mình vào việc gì" luôn hiện diện. |
| Chiều sâu         | Cao. Kết hợp quản lý thời gian, kinh tế, rủi ro, quan hệ và luân hồi.         |
| Độ khó triển khai | Trung bình. Engine tick đơn giản; phần khó là dữ liệu sự kiện và cân bằng.    |
| Rủi ro            | Dễ thành "chờ thanh tiến độ" nếu hành động không mở ra lựa chọn mới.          |

### Phương án B – "Idle tu luyện + ải chiến đấu"

Thiền → tích linh khí → đột phá → dùng sức mạnh đánh ải/boss → nhận tài nguyên → thiền nhanh hơn.

| Tiêu chí          | Đánh giá                                                                          |
| ----------------- | --------------------------------------------------------------------------------- |
| Thú vị            | Trung bình ngắn hạn, thấp dài hạn; quen thuộc với hàng nghìn game idle tu tiên.   |
| Chiều sâu         | Thấp. Gần như chỉ một trục "số to hơn". Khó thể hiện xuất phát điểm phàm nhân.    |
| Độ khó triển khai | Thấp.                                                                             |
| Rủi ro            | Không có bản sắc; mâu thuẫn trụ cột "lựa chọn có ý nghĩa, không chỉ tăng chỉ số". |

### Phương án C – "Roguelite mỗi kiếp là chuỗi sự kiện"

Mỗi kiếp là một chuỗi thẻ sự kiện/lựa chọn kiểu BitLife/Reigns; thời gian nhảy theo năm; luân hồi là vòng roguelite.

| Tiêu chí          | Đánh giá                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| Thú vị            | Cao ở vài kiếp đầu, giảm khi lặp sự kiện.                                 |
| Chiều sâu         | Trung bình; phụ thuộc hoàn toàn vào khối lượng viết.                      |
| Độ khó triển khai | Cao về nội dung (hàng trăm sự kiện), khó cân bằng, gần như không có idle. |
| Rủi ro            | Không hợp thể loại incremental; một người khó sản xuất đủ nội dung.       |

### Phản biện & lựa chọn

- B bị loại vì phá trụ cột 1 và 4 dù rẻ nhất.
- C hấp dẫn về tự sự nhưng chi phí nội dung không bền và yếu phần idle.
- A tốt nhất nhưng có rủi ro "chờ thanh tiến độ". **Khắc phục bằng cách mượn hệ sự kiện nhân quả của C**: sự kiện không phải thẻ ngẫu nhiên mà được kích hoạt bởi những gì người chơi đã làm, nên hành động nào cũng có thể mở ra lựa chọn.
- Chiến đấu của B được giữ ở dạng tối giản, tự động, phục vụ thám hiểm và sự kiện.

**Quyết định đề xuất: A + sự kiện nhân quả** `[ĐÃ DUYỆT D01]`.

Phản biện lại chính lựa chọn này:

| Nghi vấn                                                            | Trả lời                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Có quá giống Your Chronicle?                                        | Khác ở ba điểm cốt lõi: (1) tri thức giới hạn giao diện – người chơi khám phá thế giới thay vì nhìn thấy cây kỹ năng từ đầu; (2) luân hồi giữ ký ức có chọn lọc và thế giới tiếp diễn với hậu quả, không phải prestige; (3) tu luyện phụ thuộc nơi chốn, công pháp, linh căn và rủi ro đột phá. |
| Thời gian chạy liên tục có làm người chơi lo "phí đời" khi đi vắng? | Offline tự dừng ở điểm dừng an toàn và quy đổi phần dư thành Tích Thời (§5).                                                                                                                                                                                                                    |
| Một hành động mỗi lúc có quá đơn điệu?                              | Một hành động chính, nhưng lịch trình có quy tắc nghỉ và quy tắc dừng; mỗi hành động có nhiều đầu ra (tiền + kỹ năng + cơ hội sự kiện + tri thức). Slot hành động thứ hai là ứng viên Post-MVP.                                                                                                 |

## 2. Vòng lặp ba tầng

### Ngắn hạn (30 giây – 5 phút)

```
Chọn hành động ──► ngày trôi ──► tiền / XP kỹ năng / tiến độ thám hiểm / tu vi
      ▲                                   │
      │                                   ▼
 mở hành động, nơi chốn, lựa chọn ◄── sự kiện (theo điều kiện) / mốc kỹ năng
```

- Mỗi hành động cho kết quả nhìn thấy được trong 5–30 giây (2 tick/giây).
- Mốc kỹ năng (cấp 3, 5, 8, 10, 15…) mở hành động hoặc lựa chọn sự kiện mới.

### Trung hạn (30 phút – 2 giờ)

```
Nghe tin đồn ─► tìm cơ duyên ─► nhập đạo ─► tích tu vi ─► chuẩn bị (đan, tâm cảnh, linh địa) ─► đột phá
                                                 ▲                                              │
                                                 └──── đổi nơi tu luyện / công pháp / phe ◄────┘
```

- Mỗi tầng Luyện Khí là một mục tiêu có chuẩn bị, không chỉ chờ đầy thanh.
- Hai nút thắt (tầng 3→4 và 6→7) buộc người chơi đưa ra quyết định lớn: gia nhập môn phái hay ở lại tán tu, công pháp nào.

### Dài hạn (nhiều phiên, 3–12 giờ)

```
Thọ nguyên cạn ─► chết ─► Vong Xuyên: chọn ký ức giữ lại (Tàn Niệm có hạn) ─► chọn xuất thân
       ▲                                                                            │
       └─────── kiếp mới: thế giới +30 năm, hậu quả kiếp trước, học lại nhanh ◄─────┘
```

- Mục tiêu dài hạn MVP: đột phá Trúc Cơ (dự kiến ở kiếp 2–3).

## 3. Active vs Idle

| Khía cạnh           | Khi chơi chủ động                                | Khi idle / offline                                                     |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| Hành động           | Đổi hành động theo mục tiêu, đi lại giữa các nơi | Hành động hiện tại lặp lại theo lịch trình                             |
| Nghỉ ngơi           | Tự quyết                                         | Quy tắc tự nghỉ (mặc định nghỉ khi Tinh lực < 20, làm lại khi ≥ 90)    |
| Sự kiện nhỏ         | Chọn trực tiếp                                   | Lấy lựa chọn mặc định an toàn đã đánh dấu trong dữ liệu                |
| Sự kiện lớn         | Chọn trực tiếp                                   | **Tạm dừng** game, chờ người chơi                                      |
| Đột phá             | Người chơi chủ động bắt đầu                      | Không bao giờ tự đột phá                                               |
| Tiền/lương thực cạn | Người chơi xử lý                                 | Tự chuyển sang "Làm thuê" nếu được bật quy tắc; nếu không thì tạm dừng |

Nguyên tắc: **không có cơ chế thưởng cho việc click**. Chơi chủ động mạnh hơn vì quyết định tốt hơn, không phải vì thao tác nhiều hơn. Idle không bị phạt hiệu suất; giới hạn duy nhất là các điểm dừng để người chơi không mất quyền quyết định.

Điểm dừng tự động (online và offline): sự kiện lớn; tu vi đủ để đột phá; thọ nguyên còn 10 / 5 / 1 năm; tiền hoặc lương khô bằng 0 (khi không bật tự làm thuê); bị thương nặng; hoàn thành thám hiểm một nơi.

**Tăng tốc** `[ĐÃ DUYỆT D14]`: người chơi chọn 1× / 2× / 3× / 5× bất cứ lúc nào (chi tiết `BALANCE.md` §1, `SYSTEMS.md` §S1).

- Điểm dừng vẫn tạm dừng ở mọi tốc độ; sau điểm dừng, tốc độ giữ nguyên mức đã chọn.
- Ở 3× và 5×, sự kiện nhỏ chỉ ghi vào nhật ký và lấy lựa chọn mặc định an toàn như khi idle; ở 1× và 2× vẫn bật hộp chọn.
- Khi đứng lại ở điểm dừng sau khi chạy 3×/5×, hiện bản tóm tắt "trong năm qua" để người chơi không bỏ lỡ diễn biến.

## 4. Lựa chọn có ý nghĩa

Mỗi lựa chọn dưới đây đổi **một thứ lấy một thứ khác**, không có đáp án đúng tuyệt đối.

| Lựa chọn                                               | Đánh đổi                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Đốn củi hay học chữ hay học việc hiệu thuốc            | Tiền ngay (trả nợ) ↔ khả năng đọc công pháp ↔ thảo dược & quan hệ Mộc bá                               |
| Cứu tán tu bị thương hay báo cho Hồ chưởng quỹ         | Cơ duyên nhập đạo nhanh + rủi ro bị thổ phỉ truy ↔ 500 văn + mất một con đường                         |
| Ở làng chăm mẹ hay vào Hắc Thạch Cốc                   | Quan hệ gia đình, chi phí thấp ↔ tốc độ tu luyện ×5                                                    |
| Gia nhập Thanh Vân Môn làm tạp dịch hay làm tán tu     | An toàn, linh khí 1.5, đường tới Trúc Cơ Đan nhưng mất 60% thời gian ↔ tự do, sự kiện, chợ đêm, rủi ro |
| Đột phá ngay hay chuẩn bị thêm                         | Tiết kiệm thời gian (thọ nguyên) ↔ tăng xác suất thành công                                            |
| Dùng đan dược hay tu luyện thuần                       | Nhanh hơn ↔ Đan độc tích tụ, giảm hiệu lực về sau                                                      |
| Công pháp Thanh Vân Dưỡng Khí Quyết hay Hàn Thủy Quyết | Ổn định, cân bằng ↔ mạnh nếu có Thủy linh căn, gắn với chuỗi Lục                                       |
| Khi chết: giữ ký ức nào                                | Kỹ năng học lại nhanh ↔ công pháp ↔ bí mật địa điểm ↔ cảm ngộ đột phá                                  |
| Chọn xuất thân kiếp sau                                | Gia cảnh, nơi sinh, thiên phú khác nhau; linh căn ẩn                                                   |
| Chôn giấu di vật trước khi chết                        | Mất vật phẩm kiếp này ↔ có thể lấy lại kiếp sau nếu nhớ chỗ chôn                                       |

## 5. Offline & Tích Thời (tóm tắt)

- Khi mở lại game, engine mô phỏng tối đa **8 giờ thực** đã vắng mặt, với cùng quy tắc như online, dừng ở điểm dừng đầu tiên.
- Phần thời gian chưa dùng (sau điểm dừng) được cộng vào **Tích Thời** (trần 8 giờ). Khi online, người chơi bấm "Dùng Tích Thời" để engine **tua nhanh tức thì** lượng thời gian đã tích, dừng ở điểm dừng đầu tiên; phần chưa dùng được giữ lại.
- Chi tiết công thức: `BALANCE.md` §7. `[ĐÃ DUYỆT D06]`

## 6. Walkthrough 30 phút đầu tiên

Giả định: người chơi chủ động vừa phải, theo con đường "Cứu tán tu", ở tốc độ 1×. 2 tick/giây → 1 phút thực = 120 ngày; 30 phút = 3 600 ngày = 10 năm. Tuổi bắt đầu 14.

Kiếp 1 ngẫu nhiên (D04, `PROGRESSION.md` §3). Walkthrough dưới đây dùng seed chuẩn: **xuất thân nhà tiều phu + Tứ linh căn**. Với seed khác, mạch chính giữ nguyên; chỉ khác:

- **Xuất thân:** đồ và kỹ năng khởi đầu, lý do mắc nợ (nhà bán hàng rong nợ 600 văn nên trả xong sớm hơn ~1 phút).
- **Linh căn:** đoạn tu luyện trong cốc (24:00–29:00) cần ≈ 165 ngày × 0,8 / R ngày tu luyện. Tam linh căn ≈ 102 ngày (sớm hơn ~0,5 phút); Ngũ linh căn ≈ 264 ngày (muộn hơn ~1 phút). Khác biệt lớn nằm ở hậu kỳ, không ở 30 phút đầu (`BALANCE.md` §2).

| Thời gian thực | Tuổi (năm·ngày) | Diễn biến                                                                                                                                                                                                                                                                                 | Hệ thống được giới thiệu                            |
| -------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 0:00           | 14·0            | Mở đầu: làng Thạch Khê, mẹ dệt vải, cha gãy chân khi đốn củi năm ngoái (lý do mắc nợ của xuất thân tiều phu). Hồ chưởng quỹ nhắc khoản nợ **800 văn**, hạn cuối năm. Chỉ có 3 hành động: Làm thuê, Đốn củi, Nghỉ ngơi.                                                                    | Hành động, Tinh lực, tiền, sinh hoạt phí            |
| 0:20           | 14·40           | Bà Từ ở miếu Thổ Địa kể lại chuyện năm 6 tuổi nhân vật rơi xuống giếng sau miếu, được tìm thấy đang nắm một mảnh đá vỡ, sốt ba ngày. (Hạt giống cho luân hồi; người chơi chưa biết ý nghĩa.)                                                                                              | Sự kiện nhỏ, Nhật ký                                |
| 0:45           | 14·90           | Đốn củi: Thể Phách lên cấp 3. Tô tiên sinh mở lớp học chữ (10 văn/ngày) hoặc đổi công bổ củi. Mộc bá nhận học việc.                                                                                                                                                                       | Kỹ năng, mở hành động theo điều kiện                |
| 1:30 – 2:30    | 14·180–300      | Người chơi đốn củi là chính để trả nợ, xen 1–2 tuần học việc. Trả đủ 800 văn trước hạn (net ≈ 6,3 văn/ngày khi đốn củi).                                                                                                                                                                  | Lựa chọn tiền ↔ kỹ năng                             |
| 3:00           | 15·0            | **Sự kiện lớn "Hạn nợ"**: trả đủ → Hồ chưởng quỹ thôi gây khó dễ. Không đủ → bị tịch thu rìu của cha (mất Đốn củi tới khi mua rìu 300 văn).                                                                                                                                               | Hậu quả, không softlock (Làm thuê luôn mở)          |
| 4:00 – 6:00    | 15·120–16·0     | Một đêm có **ánh kiếm bay qua trời**; cả làng xôn xao. Tri thức mới: _"Tiên nhân có thật"_. Mộc bá say rượu kể ông từng làm tạp dịch ở Thanh Vân Môn, và môn phái **tuyển đệ tử ở trấn Lạc Thủy 3 năm một lần, lần tới khi nhân vật 18 tuổi**.                                            | Tri thức, tin đồn có nguồn                          |
| 6:00 – 9:00    | 16·0–17·0       | Người chơi học chữ (Văn Tự ~6) và học việc (Thảo Dược ~5), mở **Hái thuốc** ở rừng Thanh Mộc. Gặp sói xám, chiến đấu tự động, bỏ chạy, bị thương nhẹ.                                                                                                                                     | Thám hiểm, chiến đấu tối giản, bị thương            |
| ~10:00         | 17·120          | **Mốc 10 phút.** Đang hái thuốc sâu trong rừng: vết máu, dấu chân. Lần theo (Thảo Dược ≥ 3 để nhận ra máu người lẫn mùi thuốc) → hang đá, gặp **Lục Thanh Phong**, tán tu bị thương nặng, cầm kiếm cảnh giác.                                                                             | Sự kiện lớn có điều kiện kỹ năng                    |
| 10:00 – 13:00  | 17·120–18·120   | Chuỗi "Kẻ lạ trong hang": chọn mang thuốc (cần Thảo Dược ≥ 5 để tự đắp thuốc, hoặc mua thuốc của Mộc bá – Mộc bá sinh nghi). Người của Hắc Phong trại dò hỏi trong làng, treo thưởng 500 văn. Người chơi chọn giữ bí mật.                                                                 | Lựa chọn có hậu quả, NPC có động cơ                 |
| ~12:00         | 18·0            | Hội tuyển đệ tử ở Lạc Thủy diễn ra (người chơi có thể đi hoặc không). Ở nhánh này người chơi ở lại chăm Lục.                                                                                                                                                                              | Sự kiện có lịch cố định                             |
| 15:00          | 19·0            | Lục bình phục, dùng **Trắc Linh Thạch** đo cho nhân vật: **Tứ linh căn (Kim, Mộc, Thủy, Thổ – thiếu Hỏa)**, "tạp nhưng không phải phế". Tri thức mới: Linh căn, Linh khí, Luyện Khí. Ông trả ơn bằng bản chép **Dẫn Khí Quyết** và dặn: "Ở làng này linh khí mỏng như sương." Rồi rời đi. | Linh căn được tiết lộ, công pháp, giới hạn tri thức |
| 15:00 – 19:00  | 19·0–20·120     | Văn Tự 6 chưa đủ đọc trọn (cần 8): công pháp bị giới hạn ở Sơ học. Người chơi học chữ thêm; thử tu luyện ở làng: cảm ứng linh khí rất chậm (mật độ 0,2).                                                                                                                                  | Gating bằng kỹ năng, mật độ linh khí                |
| 19:00 – 21:00  | 20·120–21·0     | Đưa Mộc bá xem công pháp (thiện cảm ≥ 40): ông nhận ra chữ của Thanh Vân Môn và kể về **Hắc Thạch Cốc**, khe núi có mạch linh khí yếu nơi ông từng hái linh thảo. Tri thức + địa điểm mới.                                                                                                | Cơ duyên có nguyên nhân                             |
| 21:00 – 23:00  | 21·0–21·240     | **Sự kiện "Lời mẹ"**: mẹ phản đối chuyện tiên nhân (em trai bà bỏ đi tìm tiên và không về). Chọn: nói thật / nói dối là đi làm thuê xa / để lại tiền rồi đi. Mua lương khô 90 ngày (540 văn).                                                                                             | Quan hệ gia đình, chuẩn bị                          |
| 23:00 – 24:00  | 21·240–22·0     | Đi 4 ngày tới Hắc Thạch Cốc. Gặp **Thiết Bối Lang**: dùng cỏ Xú Long (Thảo Dược ≥ 8) để xua, hoặc chiến đấu, hoặc lùi lại.                                                                                                                                                                | Kỹ năng thay thế chiến đấu                          |
| 24:00 – 29:00  | 22·0–23·240     | Tu luyện trong cốc (mật độ 1,0): cảm ứng linh khí sau 10 ngày; tu vi 0 → 60 trong ≈ 165 ngày tu luyện (0,4 tu vi/ngày × 91% thời gian không nghỉ); hai lần về làng mua lương khô, gửi tiền cho mẹ. Thổ Nạp lên 8.                                                                         | Tu vi, lương thực, đi lại                           |
| ~29:30         | 23·300          | **Đột phá "Dẫn khí nhập thể"** (90%). Thành công: **Luyện Khí tầng 1**, thọ nguyên +3 năm, mở bảng Tu luyện đầy đủ.                                                                                                                                                                       | Đột phá, mốc 30 phút                                |

Các nhánh khác trong 30 phút đầu (đều tới Luyện Khí 1 trong khoảng 28–45 phút):

- **Nhánh môn phái**: đi hội tuyển ở tuổi 18 → bị chê tạp linh căn → nhận làm tạp dịch 3 năm → học Dẫn Khí Quyết bản chuẩn trong môn → Luyện Khí 1 khoảng phút 32–35, nhưng thời gian rảnh ít hơn.
- **Nhánh báo quan**: báo cho Hồ chưởng quỹ → +500 văn, Lục bị phục kích và trốn thoát, ghi hận → con đường duy nhất còn lại là hội tuyển kế tiếp (tuổi 21) hoặc Mộc bá (thiện cảm ≥ 60, ông trao lệnh bài tạp dịch cũ và bản Dẫn Khí Quyết ông thuộc lòng). Luyện Khí 1 khoảng phút 40–45.
