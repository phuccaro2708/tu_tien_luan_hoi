# MVP Scope

> **Trạng thái: Draft v0.2 – 2026-10-23** (sửa theo review Codex, chờ duyệt). Bản v0.1 đã Approved 2026-10-23; phần không gắn `[CẦN DUYỆT D17–D26]` giữ nguyên. Đối chiếu: `docs/reports/GDD_REVIEW_RESOLUTION.md`.

## 1. Mục tiêu MVP

Chứng minh một câu: **"Một đời người phàm có giới hạn, sống bằng lựa chọn và chết để quay lại khôn ngoan hơn, đủ hấp dẫn để chơi 10 giờ."**

MVP kết thúc khi người chơi **thử đột phá Trúc Cơ** (thành công hoặc thất bại) `[ĐÃ DUYỆT D07]`. Thành công hiện màn "Hết nội dung MVP" và cho phép tiếp tục sống tới hết thọ nguyên.

## 2. Trong phạm vi

| Hạng mục   | Số lượng                                                                                                                                                                                          | Nguồn                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Cảnh giới  | Phàm nhân, Luyện Khí 1–9, Trúc Cơ (chỉ là mục tiêu)                                                                                                                                               | PROGRESSION §1             |
| Địa điểm   | 7 (Thạch Khê, Rừng Thanh Mộc, Trấn Lạc Thủy, Hắc Thạch Cốc, Thanh Vân ngoại môn, Hắc Phong trại, Động phủ Lục)                                                                                    | WORLD_LORE §2              |
| NPC        | 8 gốc + 8 dòng kế thừa                                                                                                                                                                            | WORLD_LORE §3              |
| Hành động  | ~19                                                                                                                                                                                               | SYSTEMS S2, BALANCE §3     |
| Kỹ năng    | 6                                                                                                                                                                                                 | PROGRESSION §5             |
| Sự kiện    | 60–80, trong 12 chuỗi + sự kiện ngẫu nhiên nhỏ                                                                                                                                                    | SYSTEMS S6                 |
| Công pháp  | 3 (Dẫn Khí Quyết, Thanh Vân Dưỡng Khí Quyết, Hàn Thủy Quyết)                                                                                                                                      | PROGRESSION §4             |
| Pháp thuật | 3 (Linh Đạn, Mộc Lao, Hỏa Cầu)                                                                                                                                                                    | PROGRESSION §4             |
| Vật phẩm   | ~20 (công cụ, trang bị 2 ô, đan dược, lương khô, vật cốt truyện)                                                                                                                                  | PROGRESSION §4, BALANCE §4 |
| Địch       | 5–6                                                                                                                                                                                               | BALANCE §6                 |
| Thiên phú  | 6, mỗi cái 3 bậc; 2 ô (bẩm sinh + hồn ấn); nâng bậc ở Vong Xuyên                                                                                                                                  | PROGRESSION §3             |
| Kiếp 1     | Ngẫu nhiên theo seed: linh căn, ngộ tính, 1 trong 3 xuất thân ở Thạch Khê, thiên phú bẩm sinh                                                                                                     | PROGRESSION §3             |
| Luân hồi   | Vòng đầy đủ: Tàn Niệm, ký ức, Hồn dưỡng căn, 3 xuất thân, thế giới +30 năm, Tự vẫn                                                                                                                | PROGRESSION §8             |
| Offline    | Mô phỏng tối đa 8 giờ + Tích Thời (tua nhanh tức thì)                                                                                                                                             | BALANCE §7                 |
| Tốc độ     | 1× / 2× / 3× / 5×                                                                                                                                                                                 | BALANCE §1                 |
| Lưu game   | 1 save tự động, export/import                                                                                                                                                                     | SYSTEMS S14                |
| Giao diện  | Một trang: bảng hành động, trạng thái, nhật ký sự kiện, bản đồ dạng danh sách, Nhật ký tri thức, nút tốc độ, menu nhân vật (có ô Tự vẫn), màn Vong Xuyên (ký ức, nâng bậc thiên phú, chọn hồn ấn) | –                          |
| Ngôn ngữ   | Tiếng Việt                                                                                                                                                                                        | –                          |

### 2.1 Đề xuất khóa phạm vi `[CẦN DUYỆT D24]`

Sửa một phần F13. Bảng §2 là phạm vi đã duyệt ở v0.1; đề xuất dưới đây chỉ có hiệu lực khi được duyệt.

| Hạng mục  | v0.1      | Đề xuất v0.2                                                                                                                       | Lý do                                                                                      |
| --------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Sự kiện   | 60–80     | **30–40 cho MVP**: các sự kiện lớn của 12 chuỗi + ~10 sự kiện nhỏ lặp lại; phần còn lại thành Post-MVP                             | Nội dung là rủi ro lớn nhất (§5); 30–40 đủ cho hai kiếp vì kiếp 2 tái dùng địa điểm        |
| Địa điểm  | 7         | **5 địa điểm** + 2 điểm con: Hắc Phong trại thành điểm con của Rừng (sự kiện chuỗi), Động phủ Lục thành điểm con của Hắc Thạch Cốc | Hai nơi này chỉ phục vụ một chuỗi; điểm con (S5) đủ dùng                                   |
| Công pháp | 3         | **Giữ 3**                                                                                                                          | Không cắt: D12 (trần LK6) cần lối thoát, và Hàn Thủy Quyết là bản sắc của con đường tán tu |
| Thiên phú | 6 × 3 bậc | **Giữ**                                                                                                                            | D15 đã được duyệt; chi phí chủ yếu là dữ liệu                                              |

**Mốc sớm: lát cắt dọc hai kiếp.** Trước khi viết đủ nội dung, phải chơi được một vòng **kiếp 1 (rút gọn) → chết → Vong Xuyên → kiếp 2 thấy ít nhất 1 hậu quả** với ~10 sự kiện lõi (IMPLEMENTATION_PLAN P4). Đây là bằng chứng sớm nhất cho câu mục tiêu ở §1.

## 3. Ngoài phạm vi (Post-MVP)

| Hạng mục                                    | Lý do để sau                                                |
| ------------------------------------------- | ----------------------------------------------------------- |
| Luyện đan, luyện khí, chế tạo               | Một hệ thống con lớn; MVP chỉ mua/nhận đan `[ĐÃ DUYỆT D09]` |
| Pháp bảo đầy đủ, luyện hóa, phẩm cấp        | Lệch trọng tâm sang loot                                    |
| Quản lý tông môn                            | Đổi thể loại                                                |
| Hệ nhiệm vụ riêng                           | Chuỗi sự kiện + Nhật ký đã đủ                               |
| Cảnh giới từ Kết Đan trở lên, các giới khác | Nội dung                                                    |
| Song tu, đạo lữ, con cái                    | Cần hệ quan hệ sâu hơn                                      |
| Âm thanh, hoạt ảnh, minh họa nhân vật       | Chỉ dùng giao diện chữ + biểu tượng đơn giản                |
| Nhiều save slot, đồng bộ đám mây, tài khoản | Không backend trong MVP                                     |
| Đa ngôn ngữ                                 | Sau khi văn bản ổn định                                     |
| Thành tựu, bảng xếp hạng                    | Không cần để chứng minh vòng chơi                           |
| Mobile-first layout                         | Desktop-first, chỉ cần không vỡ trên mobile                 |

## 4. Tiêu chí hoàn thành MVP

### Chức năng

- [ ] Chơi được từ tuổi 14 tới Luyện Khí 1 trong 21–40 phút ở 1× theo ít nhất 3 con đường (Lục ~21–24, hội tuyển ~32, Mộc bá ~38–40), đo bằng harness với chính sách cố định.
- [ ] Chết vì thọ nguyên → Vong Xuyên → kiếp mới với ký ức đã chọn; thế giới phản ánh ít nhất 6 cờ của kiếp trước.
- [ ] Harness pacing (BALANCE §10): trung vị seed thử Trúc Cơ trong ≤ 10 giờ ở 1×; tuổi đạt mốc trong ±15% bảng 10.2; kiếp 1 Tam linh căn thành Trúc Cơ ≤ 15% số lượt; tỉ lệ tốc độ môn phái/tán tu trong 1,0–1,25×.
- [ ] Offline 8 giờ hoạt động đúng điểm dừng và Tích Thời.
- [ ] Tốc độ 1×/2×/3×/5× cho cùng hash state với cùng seed + nhật ký lệnh; điểm dừng vẫn tạm dừng ở 5×; engine không đọc tốc độ (SYSTEMS S1).
- [ ] Kiếp 1 ngẫu nhiên theo seed; Tự vẫn và nâng bậc thiên phú hoạt động theo SYSTEMS S12.
- [ ] Save/load/migrate/export/import hoạt động; save hỏng không làm mất save tốt.

### Kỹ thuật (theo AGENTS.md)

- [ ] Engine thuần TypeScript, không import React/DOM/Zustand; mọi hệ có unit test theo tiêu chí trong SYSTEMS.md.
- [ ] Mô phỏng tất định: cùng seed + cùng input → cùng state (kiểm thử replay).
- [ ] Kiểm thử tĩnh dữ liệu: không cờ mồ côi; mọi sự kiện lớn có lựa chọn không yêu cầu; Làm thuê ròng > 0 ở mọi khu dân cư; NPC còn sống trong khoảng năm của chuỗi dùng họ.
- [ ] Kiểm thử khả đạt (SYSTEMS S4): mỗi mốc then chốt có ≥ 2 nguồn, ≥ 1 nguồn không phụ thuộc cờ, cho kiếp 1, kiếp 2 và kiếp 3 xấu nhất.
- [ ] Kiểm thử hồi phục (SYSTEMS S2): từ tay trắng thoát Đói ở mọi địa điểm.
- [ ] `npm run lint`, `test`, `build`, `format:check` đều qua; build tĩnh chạy được trên Cloudflare Pages (preview, không deploy production).

### Trải nghiệm (Antigravity QA)

- [ ] Không có từ khóa tu tiên lộ ra trước khi nhân vật biết (kiểm tra giao diện).
- [ ] Người chơi mới hiểu mình cần làm gì trong 2 phút đầu mà không cần hướng dẫn ngoài game.
- [ ] Không có softlock trong danh sách BALANCE §9 khi playtest thủ công.

## 5. Rủi ro phạm vi

| Rủi ro                                | Giảm thiểu                                                              |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Viết 60–80 sự kiện tốn thời gian nhất | Đề xuất 30–40 (§2.1); ưu tiên 12 chuỗi chính; dữ liệu có validator      |
| Cân bằng 10 giờ khó kiểm bằng tay     | Harness headless dựng từ P0, mở rộng mỗi phase (IMPLEMENTATION_PLAN §2) |
| Hệ Tri thức làm giao diện phức tạp    | Một hàm `daBiet(id)` + biến thể văn bản; không tách hệ hiển thị riêng   |
| Nội dung kiếp 2 mỏng                  | Kiếp 2 tái sử dụng địa điểm; chỉ thêm khác biệt do cờ và người kế thừa  |
