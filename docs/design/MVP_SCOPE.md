# MVP Scope

> **Trạng thái: Approved – 2026-10-23** · v0.1 – trước playtest.

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

- [ ] Chơi được từ tuổi 14 tới Luyện Khí 1 trong 30–45 phút theo ít nhất 3 con đường (Lục, hội tuyển, Mộc bá).
- [ ] Chết vì thọ nguyên → Vong Xuyên → kiếp mới với ký ức đã chọn; thế giới phản ánh ít nhất 6 cờ của kiếp trước.
- [ ] Có thể thử Trúc Cơ trong ≤ 12 giờ chơi với lối chơi hợp lý (harness pacing, BALANCE §10).
- [ ] Offline 8 giờ hoạt động đúng điểm dừng và Tích Thời.
- [ ] Tốc độ 1×/2×/3×/5× cho cùng kết quả với cùng seed; điểm dừng vẫn tạm dừng ở 5×.
- [ ] Kiếp 1 ngẫu nhiên theo seed; Tự vẫn và nâng bậc thiên phú hoạt động theo SYSTEMS S12.
- [ ] Save/load/migrate/export/import hoạt động; save hỏng không làm mất save tốt.

### Kỹ thuật (theo AGENTS.md)

- [ ] Engine thuần TypeScript, không import React/DOM/Zustand; mọi hệ có unit test theo tiêu chí trong SYSTEMS.md.
- [ ] Mô phỏng tất định: cùng seed + cùng input → cùng state (kiểm thử replay).
- [ ] Kiểm thử tĩnh dữ liệu: không cờ mồ côi; tri thức then chốt có ≥ 2 nguồn; mọi sự kiện lớn có lựa chọn không yêu cầu.
- [ ] `npm run lint`, `test`, `build`, `format:check` đều qua; build tĩnh chạy được trên Cloudflare Pages (preview, không deploy production).

### Trải nghiệm (Antigravity QA)

- [ ] Không có từ khóa tu tiên lộ ra trước khi nhân vật biết (kiểm tra giao diện).
- [ ] Người chơi mới hiểu mình cần làm gì trong 2 phút đầu mà không cần hướng dẫn ngoài game.
- [ ] Không có softlock trong danh sách BALANCE §9 khi playtest thủ công.

## 5. Rủi ro phạm vi

| Rủi ro                                | Giảm thiểu                                                             |
| ------------------------------------- | ---------------------------------------------------------------------- |
| Viết 60–80 sự kiện tốn thời gian nhất | Ưu tiên 12 chuỗi chính; sự kiện nhỏ thêm dần; dữ liệu có validator     |
| Cân bằng 10 giờ khó kiểm bằng tay     | Harness headless chạy engine thật (IMPLEMENTATION_PLAN Phase 7)        |
| Hệ Tri thức làm giao diện phức tạp    | Một hàm `daBiet(id)` + biến thể văn bản; không tách hệ hiển thị riêng  |
| Nội dung kiếp 2 mỏng                  | Kiếp 2 tái sử dụng địa điểm; chỉ thêm khác biệt do cờ và người kế thừa |
