# Tu Tiên Luân Hồi – Game Design Document

> **Trạng thái: Draft v0.2 – 2026-10-23** (sửa theo review Codex, chờ duyệt D17–D26). Bản v0.1 đã Approved 2026-10-23; D01–D16 giữ nguyên hiệu lực trừ chỗ ghi rõ. Đối chiếu từng finding: `reports/GDD_REVIEW_RESOLUTION.md`.
>
> **Bổ sung 2026-10-25:** D23 đã duyệt; D31–D36 (chết trước P4, chi tiết tên/giới tính, bảng XP, chết khi offline, Tinh lực tối đa, Chất phác bậc II) do người dùng quyết định trong lượt xử lý vấn đề còn lại của P1a. Xem §12.
>
> Ký hiệu: `[GIẢ ĐỊNH]` = điều tôi tự giả định, có thể sai, sẽ kiểm bằng playtest. `[ĐÃ DUYỆT Dxx]` = quyết định thiết kế đã được người dùng phê duyệt. `[CẦN DUYỆT Dxx]` = thay đổi v0.2 đang chờ duyệt. Mã `Dxx` tra ở bảng cuối file.
>
> Duyệt GDD nghĩa là duyệt hướng thiết kế và giá trị khởi điểm. Số liệu cân bằng là v0.2 (mô phỏng Monte Carlo, BALANCE §10) và được chỉnh qua harness (dựng từ P0) và playtest mà không cần duyệt lại toàn bộ.

## 1. High concept

Một Web 2D Incremental RPG huyền huyễn tu tiên. Người chơi là một **phàm nhân bình thường** ở một làng nghèo, không biết gì về tu tiên. Thời gian trôi liên tục, tuổi tác tăng, **thọ nguyên là đồng hồ thật sự của trò chơi**. Người chơi phân bổ từng ngày cho lao động, học tập, thám hiểm và (về sau) tu luyện; tìm ra cơ duyên có nguyên nhân rõ ràng; bước vào Luyện Khí; rồi đối mặt cái chết vì thọ nguyên. Khi chết, linh hồn đi qua Vong Xuyên – hầu hết ký ức bị xóa, nhưng người chơi được chọn **giữ lại một phần ký ức** có giới hạn, rồi tái sinh vào cùng thế giới ba mươi năm sau, nơi những lựa chọn kiếp trước vẫn để lại dấu vết.

**Một câu:** _"Mỗi kiếp người là một lần thử – thứ mang theo được không phải sức mạnh, mà là những gì đã hiểu."_

## 2. Trụ cột thiết kế

1. **Thời gian là tài nguyên quý nhất.** Mọi hành động tiêu tốn ngày; mọi ngày tiêu tốn thọ nguyên. Lựa chọn có ý nghĩa vì không thể làm hết mọi thứ trong một đời.
2. **Không biết điều chưa học.** Giao diện, văn bản và hành động chỉ hiện ra khi nhân vật đã có tri thức tương ứng (hệ Tri thức – xem `SYSTEMS.md` §S4). Không có thanh "linh khí" trước khi nhân vật biết linh khí tồn tại.
3. **Cơ duyên có nhân quả.** Mỗi cơ hội lớn đến từ một nguồn có động cơ (một người, một nơi, một sự kiện trước đó) và có ít nhất hai con đường dẫn tới mục tiêu then chốt để không softlock.
4. **Luân hồi là hiểu biết, không phải reset số.** Thứ được mang theo là ký ức có chọn lọc, hậu quả trong thế giới và căn cơ linh hồn – không có "+10% mọi chỉ số".
5. **Chiều sâu hơn số lượng.** Ít hệ thống, nhưng các hệ thống đan vào nhau (nghề → kỹ năng → tri thức → cơ duyên → tu luyện → thọ nguyên → luân hồi).

## 3. Đối tượng & nền tảng

- Trình duyệt desktop trước, mobile responsive sau `[GIẢ ĐỊNH]`. Static build trên Cloudflare Pages, không backend, không dịch vụ trả phí.
- Người chơi thích Your Chronicle, Idle Loops, Kittens Game, tiểu thuyết tu tiên; chấp nhận giao diện thiên về chữ và bảng.
- Ngôn ngữ MVP: tiếng Việt `[GIẢ ĐỊNH]`.
- Phiên chơi: 10–30 phút chủ động, xen kẽ idle; tổng nội dung MVP ≈ 10–12 giờ.

## 4. Core loop (tóm tắt)

Chọn phương án **"Đời người theo hành động"** kết hợp **sự kiện nhân quả** (phân tích 3 phương án và phản biện trong `design/CORE_LOOP.md`).

```
Ngắn hạn (phút):   chọn hành động → nhận tiền/kỹ năng/tri thức → mở hành động, địa điểm, sự kiện mới
Trung hạn (giờ):   tìm cơ duyên → nhập đạo → tích tu vi → chuẩn bị & đột phá → đổi nơi tu luyện / công pháp
Dài hạn (nhiều phiên): chạy đua với thọ nguyên → chết → chọn ký ức giữ lại → tái sinh → đi xa hơn kiếp trước
```

## 5. Tóm tắt hệ thống

| Hệ thống                                        | MVP                                           | Tài liệu                              |
| ----------------------------------------------- | --------------------------------------------- | ------------------------------------- |
| Thời gian, tuổi, thọ nguyên                     | Có                                            | `SYSTEMS.md` §S1, `PROGRESSION.md` §6 |
| Hành động & Nghề                                | Có                                            | §S2                                   |
| Kỹ năng (6 kỹ năng)                             | Có                                            | §S3                                   |
| Tri thức (knowledge gating)                     | Có                                            | §S4                                   |
| Địa điểm & Thám hiểm                            | Có                                            | §S5                                   |
| Sự kiện nhân quả                                | Có                                            | §S6                                   |
| NPC & Quan hệ                                   | Có (8 NPC + người kế thừa)                    | §S7                                   |
| Chiến đấu tự động tối giản                      | Có                                            | §S8                                   |
| Tu luyện: linh căn, công pháp, tu vi, đột phá   | Có                                            | §S9, `PROGRESSION.md`                 |
| Vật phẩm, đan dược, công cụ & pháp khí cấp thấp | Có (tối giản)                                 | §S10                                  |
| Môn phái (gia nhập làm tạp dịch)                | Có (thành viên, không quản lý)                | §S11                                  |
| Luân hồi                                        | Có (bản tối giản đầy đủ vòng)                 | §S12, `PROGRESSION.md` §8             |
| Offline progression (tối đa 8 giờ) + Tích Thời  | Có                                            | §S13, `BALANCE.md` §7                 |
| Tăng tốc 1× / 2× / 3× / 5×                      | Có                                            | §S1, `BALANCE.md` §1                  |
| Thiên phú nâng cấp qua luân hồi                 | Có                                            | §S12, `PROGRESSION.md` §3, §8         |
| Tự vẫn (kết thúc kiếp sớm)                      | Có                                            | §S12, `BALANCE.md` §9                 |
| Luyện đan, luyện khí (crafting)                 | Post-MVP                                      | `MVP_SCOPE.md`                        |
| Quest log riêng                                 | Không làm – dùng chuỗi sự kiện + Nhật ký      | `SYSTEMS.md` §S6                      |
| Quản lý môn phái                                | Post-MVP xa                                   | `MVP_SCOPE.md`                        |
| Trúc Cơ trở lên                                 | Post-MVP (MVP kết thúc ở lần đột phá Trúc Cơ) | `PROGRESSION.md`                      |

## 6. Phạm vi MVP – cut line

MVP hoàn chỉnh khi người chơi có thể: sống một đời phàm nhân → nhập Luyện Khí qua ít nhất 3 con đường → tu luyện tới Luyện Khí 9 → chết vì thọ nguyên → luân hồi với ký ức đã chọn → ở kiếp sau thử đột phá Trúc Cơ. Chi tiết: `design/MVP_SCOPE.md`.

## 7. Hướng mỹ thuật & âm thanh `[GIẢ ĐỊNH]`

- Giao diện chủ đạo là bảng/chữ phong cách thủy mặc (giấy cũ, mực, ấn triện đỏ); ảnh nền 2D cho mỗi địa điểm (7 ảnh; 5 nếu D24 được duyệt), chân dung NPC (8 + 8 người kế thừa), icon tài nguyên.
- Không bắt buộc âm thanh cho MVP; nếu có, nhạc nền theo địa điểm và hiệu ứng khi đột phá.

## 8. Mục lục tài liệu

| File                                                                 | Nội dung                                                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [design/CORE_LOOP.md](design/CORE_LOOP.md)                           | 3 phương án core loop, phản biện, vòng lặp 3 tầng, active/idle, lựa chọn có ý nghĩa, walkthrough 30 phút đầu |
| [design/PROGRESSION.md](design/PROGRESSION.md)                       | Cảnh giới, đột phá, linh căn, thiên phú, ngộ tính, công pháp, kỹ năng, pháp khí, thọ nguyên, luân hồi        |
| [design/WORLD_LORE.md](design/WORLD_LORE.md)                         | Quy luật thế giới, địa lý, NPC & động cơ, hành trình phàm nhân → Luyện Khí                                   |
| [design/SYSTEMS.md](design/SYSTEMS.md)                               | Đặc tả từng hệ thống: mục đích, input/output, điều kiện, tương tác, tiêu chí kiểm thử                        |
| [design/MVP_SCOPE.md](design/MVP_SCOPE.md)                           | Phạm vi MVP / Post-MVP, danh sách nội dung, tiêu chí hoàn thành                                              |
| [design/BALANCE.md](design/BALANCE.md)                               | Pacing 10'/30'/2h/10h, nguồn & tiêu thụ, công thức, chống grind/softlock/chiến lược thống trị, offline       |
| [technical/IMPLEMENTATION_PLAN.md](technical/IMPLEMENTATION_PLAN.md) | Kiến trúc, mô hình dữ liệu, thứ tự phase, mốc kiểm thử                                                       |

## 9. Rủi ro chính

| Rủi ro                                                            | Mức        | Giảm thiểu                                                                                                  |
| ----------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| Khối lượng nội dung (≈70 sự kiện, 14 NPC entry) lớn cho một người | Cao        | Đề xuất thu gọn còn 30–40 sự kiện, 5 địa điểm (D24); dữ liệu hóa; lát cắt dọc hai kiếp ở P4                 |
| Pacing sai khi chơi thật                                          | Trung bình | v0.2 mô phỏng Monte Carlo có Thổ Nạp, đan, phí (BALANCE §10); harness headless từ P0 kiểm ngưỡng mỗi phase  |
| Luân hồi "thế giới tiếp diễn" phức tạp                            | Trung bình | Chỉ lưu cờ thế giới + bảng NPC kế thừa; không mô phỏng thế giới trong 30 năm vắng mặt                       |
| Người chơi thấy chậm ở phần phàm nhân                             | Trung bình | Phàm nhân chỉ ~21–24 phút đầu (CORE_LOOP §6), có mục tiêu ngắn (trả nợ) và tin đồn tiên nhân sớm (phút 4–6) |
| Save-scum phá hậu quả                                             | Thấp       | RNG có seed lưu trong state: tải lại cho cùng kết quả                                                       |

## 10. Quyết định đã duyệt (2026-10-23)

| Mã  | Quyết định                                                      | Kết quả duyệt                                                                                                                                              | Vì sao                                                                                                                                   |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| D01 | Core loop                                                       | Phương án A "Đời người theo hành động" + sự kiện nhân quả từ C                                                                                             | Chiều sâu cao nhất với chi phí triển khai trung bình; khớp trụ cột thời gian/thọ nguyên                                                  |
| D02 | Thang thời gian                                                 | 1 tick = 1 ngày; 2 tick/giây ở 1×; 1 năm = 360 ngày = 3 phút thực                                                                                          | Một đời ≈ 3–4 giờ, đủ để thọ nguyên có trọng lượng mà vẫn thấy được tiến triển hằng phút                                                 |
| D03 | Luân hồi trong MVP                                              | Có, thế giới tiếp diễn, tái sinh sau 30 năm                                                                                                                | Không có luân hồi thì chết = hết game; tiếp diễn tạo hậu quả xuyên kiếp                                                                  |
| D04 | Kiếp đầu **ngẫu nhiên theo seed** (đổi theo yêu cầu người dùng) | Linh căn Ngũ 35% / Tứ 50% / Tam 15% (không Song/Thiên); Ngộ 0,85–1,15; 1 trong 3 xuất thân ở Thạch Khê; 1 thiên phú bẩm sinh. Chi tiết `PROGRESSION.md` §3 | Tăng tính chơi lại mà vẫn giữ "không thiên tài"; linh căn ẩn đến khi đo nên không lộ "may/rủi" từ đầu                                    |
| D05 | Giới tính & tên nhân vật                                        | Người chơi tự chọn tên và giới tính; văn bản viết trung tính. _Chi tiết: D32 (§12)_                                                                        | Tiếng Việt xưng hô phụ thuộc giới; chọn từ đầu tránh sai ngữ cảnh                                                                        |
| D06 | Offline (sửa kèm D14)                                           | Mô phỏng bằng chính engine, tối đa 8 giờ, tự dừng ở "điểm dừng"; thời gian còn lại thành **Tích Thời** = tua nhanh tức thì, trần 8 giờ                     | Không chết khi offline (giới hạn: xem D34, §12), không bỏ phí 8 giờ, không trùng với nút tốc độ                                          |
| D07 | Mục tiêu cuối MVP                                               | Lần thử đột phá Trúc Cơ                                                                                                                                    | Mốc kết thúc rõ ràng, tự nhiên rơi vào kiếp 2–3 (≈8–12 giờ)                                                                              |
| D08 | Chiến đấu                                                       | Tự động, tối giản, chết chỉ khi người chơi chọn "liều mạng" sau cảnh báo                                                                                   | Combat không phải trọng tâm; tránh mất cả đời vì một trận ngẫu nhiên. _v0.2: giới hạn thêm bởi D22 (chờ duyệt)_                          |
| D09 | Cắt khỏi MVP                                                    | Luyện đan, luyện khí, quản lý môn phái, quest log, pháp bảo đầy đủ                                                                                         | Ưu tiên chiều sâu vòng lõi                                                                                                               |
| D10 | Tên riêng & bối cảnh                                            | Vạn Hà Giới, Tề Quốc, quận Lạc Thủy, Thanh Vân Môn… (xem WORLD_LORE)                                                                                       | Đặt tạm, dễ đổi vì dữ liệu hóa                                                                                                           |
| D11 | Quy luật "Hồn dưỡng căn"                                        | Linh căn kiếp sau phụ thuộc cảnh giới cao nhất kiếp trước                                                                                                  | Giải thích trong lore vì sao người chơi tái sinh vẫn có linh căn; thưởng có giới hạn                                                     |
| D12 | Công pháp cơ bản có trần                                        | Dẫn Khí Quyết chỉ tới Luyện Khí 6; cần công pháp mới để lên hậu kỳ                                                                                         | Tạo mục tiêu trung hạn và lựa chọn môn phái/tán tu                                                                                       |
| D13 | Một save tự động, không chọn slot                               | Có export/import chuỗi save                                                                                                                                | Bảo vệ hậu quả; vẫn cho người chơi sao lưu                                                                                               |
| D14 | Tăng tốc trò chơi (mới)                                         | 1× / 2× / 3× / 5× (2/4/6/10 tick/giây), miễn phí, có từ đầu; điểm dừng vẫn tạm dừng; 3×/5× sự kiện nhỏ chỉ ghi nhật ký                                     | Tôn trọng thời gian người chơi; không đổi logic nên không ảnh hưởng cân bằng. _v0.2: cách xử lý sự kiện nhỏ chuyển sang D21 (chờ duyệt)_ |
| D15 | Thiên phú nâng cấp qua luân hồi (mới)                           | 2 ô thiên phú (bẩm sinh + hồn ấn); khắc vào hồn khi sống ≥ 40 tuổi hoặc đạt LK1; nâng bậc I→II→III bằng 6/12 Tàn Niệm; bậc III cần từng đạt LK4            | Tiến triển dài hạn qua linh hồn, cạnh tranh Tàn Niệm với ký ức nên không thành power creep                                               |
| D16 | Tự vẫn (mới)                                                    | Ô "Tự vẫn" kết thúc kiếp sớm, xác nhận 2 bước, không dùng khi đang sự kiện/chiến đấu; Tàn Niệm ×0,5, không khắc thiên phú, cờ `tu_van`                     | Thoát kiếp "hỏng" mà không phải chờ; hình phạt + Hồn dưỡng căn chặn chiến lược reroll                                                    |

## 11. Quyết định chờ duyệt – v0.2 (2026-10-23)

Phát sinh từ review Codex (báo cáo được dán trong phiên, không có trong repo). Lý do và bằng chứng: `reports/GDD_REVIEW_RESOLUTION.md`.

| Mã  | Quyết định đề xuất                                                                                                                                                             | Sửa finding | Tài liệu                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------------------------------- |
| D17 | Ngưỡng tu vi `100 × 1.85^(n−1)` (LK1→2 = 100 … LK8→9 = 7 417); tầng 9 → Trúc Cơ cần 3 000; Thổ Nạp +0,5%/cấp; công thức tu vi có đủ hệ số C (công pháp) và M (Bế quan/Bồ đoàn) | F01, F09    | PROGRESSION §2, BALANCE §5, §10                |
| D18 | Năm thế giới 0 = năm nhân vật kiếp 1 tròn 14 tuổi; tuổi và thọ nguyên NPC là dữ liệu (`namSinh`, `thoNguyen`); Mộc bá 52, Bà Từ 60                                             | F02         | WORLD_LORE §3.1, SYSTEMS S7                    |
| D19 | Mốc then chốt có ≥ 2 nguồn, ≥ 1 nguồn không phụ thuộc cờ; thêm Thư xá ở trấn (12 văn/ngày); di thư của Đỗ; kiểm thử khả đạt                                                    | F03         | SYSTEMS S4, WORLD_LORE §3.2                    |
| D20 | Tụ Khí Đan 120 cống hiến; ngoại môn chiếm 55% thời gian                                                                                                                        | F07         | BALANCE §4, SYSTEMS S11                        |
| D21 | `chinhSachSuKienNho` (`hoi`/`tuDong`) nằm trong GameState, chỉ đổi qua lệnh có ghi log; engine không đọc tốc độ                                                                | F04         | SYSTEMS S1, S6, CORE_LOOP §3                   |
| D22 | "Liều mạng" chỉ có trong trận của sự kiện lớn gắn cả `quanTrong` và `motLan` (một lần mỗi save, không trước LK3); trận thường luôn rút lui được                                | F06         | SYSTEMS S8, PROGRESSION §6                     |
| D23 | **Đã duyệt 2026-10-25.** Thu nhập cộng trước phí sinh hoạt; không đủ → Đói, không ghi nợ; Làm thuê ròng > 0 ở mọi khu dân cư                                                   | F05         | SYSTEMS S2, BALANCE §3, IMPLEMENTATION_PLAN §1 |
| D24 | Thu gọn MVP: 30–40 sự kiện, 5 địa điểm + 2 điểm con; giữ 3 công pháp và thiên phú 3 bậc                                                                                        | F13         | MVP_SCOPE §2.1                                 |
| D25 | Quy tắc phân xử: thứ tự lượt, hết 20 lượt = rút lui, hồi phục, thứ tự dùng đan, đột phá cộng thọ trước kiểm tra chết                                                           | F10         | SYSTEMS S8–S10                                 |
| D26 | Kế hoạch phase mới: harness từ P0, lát cắt dọc hai kiếp ở P4, tiêu chí thoát kiểm thử được                                                                                     | F13, F11    | IMPLEMENTATION_PLAN §2                         |

## 12. Quyết định bổ sung (2026-10-25)

Phát sinh khi triển khai P1a. Người dùng chốt trong phiên ngày 2026-10-25; nguồn: `docs/reports/phase/2026-10-25-p1a-followup.md`.

| Mã  | Quyết định                                                                                                                                                                                          | Tài liệu                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| D31 | Trước khi có Vong Xuyên (P4): chết → màn "Kiếp này đã hết" và nút **Bắt đầu kiếp mới** (seed mới, có xác nhận; kiếp cũ mất). P4 thay bằng luân hồi thật                                             | SYSTEMS S1                 |
| D32 | Chi tiết D05: tên 1–16 ký tự sau khi cắt khoảng trắng hai đầu, không có ký tự điều khiển; giới tính Nam/Nữ. Chọn trước khi thời gian bắt đầu chạy; khi chưa chọn, vắng mặt không sinh Tích Thời     | SYSTEMS S1, S13            |
| D33 | Bảng XP sửa theo công thức có làm tròn từng bước; "XP cộng dồn" tính cả bước từ cấp 0                                                                                                               | PROGRESSION §5             |
| D34 | Giữ offline ≡ online: chỉ có thể chết khi vắng mặt trong năm cuối, sau khi người chơi đã tự bấm qua cảnh báo 1 năm                                                                                  | SYSTEMS S13                |
| D35 | Tinh lực tối đa = `100 + min(30, cấp Thể Phách) + thiên phú − 2 × max(0, tuổi − floor(0,8 × thọ nguyên))`, không âm; Tinh lực hiện có bị kẹp khi mức tối đa giảm; kiếp mới bắt đầu với Tinh lực đầy | PROGRESSION §6, BALANCE §3 |
| D36 | Chất phác bậc II: Giao Tế XP ×0,9                                                                                                                                                                   | PROGRESSION §3             |
