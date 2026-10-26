# P1b – Thiết kế kỹ thuật kinh tế phàm nhân

**Trạng thái: `Draft`** · Soạn 2026-10-25 · Chờ người dùng duyệt các mục `[CẦN DUYỆT]` trước khi code.

Nguồn: SYSTEMS S2, BALANCE §3–§4, IMPLEMENTATION_PLAN P1b, D23 (đã duyệt). Tài liệu này chỉ chốt **cơ chế**; mọi con số lấy nguyên từ BALANCE §3, không thêm số mới.

## 1. Phạm vi

Làm: hành động nhóm phàm ở làng, sinh hoạt phí, Đói, nợ, tự Nghỉ ngơi theo ngưỡng, nguồn XP kỹ năng, validator dữ liệu, kiểm thử hồi phục.
Không làm (để P2 trở đi): địa điểm khác ngoài làng và Đi đường (S5), hành động trấn/rừng/Hắc Thạch Cốc, sự kiện hậu quả nợ (`hoi0_no`), vật phẩm thật (S10), Tu luyện/Đột phá (S9), Tạp dịch (S11).

Hành động P1b (BALANCE §3, nơi = làng): Làm thuê, Đốn củi, Học việc hiệu thuốc, Nghỉ ngơi. "Học chữ" và "Bổ củi đổi chữ" cần thiện cảm/NPC Tô (S7) nên chờ P3 hoặc dùng cờ stub như P2.

## 2. Quyết định cần duyệt

| #   | Vấn đề                                   | Đề xuất mặc định                                                                                                                                                                                                                   | Lý do                                                                                                                  |
| --- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A   | R03: tick bị chặn có làm ngày trôi không | **Không trôi** (giữ như hiện tại). Hai ca hay bị chặn (hết tiền, hết Tinh lực) được engine tự xử lý bằng Nghỉ ngơi/Làm thuê (mục 3) nên không còn kẹt ở sinh nhật.                                                                 | Giữ tất định, tránh "chạy ngày trống" mà không có hành động.                                                           |
| B   | Nơi chốn trước khi có S5                 | P1b **không thêm state địa điểm**: mọi hành động P1b mặc định ở làng. Validator "mọi khu dân cư" chạy trên các khu dân cư có trong dữ liệu (hiện chỉ làng). Trấn thêm ở P2 cùng validator.                                         | Tránh sinh trường tạm rồi phải migrate lại.                                                                            |
| C   | Công thức "tỉ lệ làm" 75%                | Không cài như hằng số. Tỉ lệ đó **nảy sinh** từ chu kỳ Tinh lực (nghỉ khi < 20, làm lại khi ≥ 90, Nghỉ ngơi +30/ngày). Harness đo lại và so với BALANCE §3 ±10%.                                                                   | BALANCE ghi "≈", đúng với mô phỏng; không mâu thuẫn dữ liệu.                                                           |
| D   | Trạng thái ngưỡng nghỉ                   | Thêm `resting: boolean` vào state (cần vì có trễ 20→90). **Save lên v3.** P2 cũng cần v3 (Nhật ký) nên P1b và P2 dùng chung v3 nếu merge liền; nếu P1b ra trước thì P2 là v4.                                                      | Không suy ra được từ Tinh lực hiện tại.                                                                                |
| E   | Đói: lưu hay suy ra                      | Lưu `hungry: boolean` (đặt khi trả phí) để UI/Nhật ký đọc; các hệ số ×0.5 dùng trạng thái của **ngày đó**.                                                                                                                         | Single source of truth, kiểm thử được.                                                                                 |
| F   | Vòng phụ thuộc Đói ↔ thu nhập cùng tick  | Thứ tự: (1) tính thu nhập hành động; (2) kiểm tra đủ trả phí **với thu nhập đó**; (3) nếu không đủ → Đói, **XP và hồi Tinh lực của chính ngày đó nhân 0.5** và thu nhập vẫn được cộng; (4) đủ → trừ phí. Hoàn toàn tất định.       | D23 chỉ nói "Đói đúng ngày đó"; đây là cách đọc ít bất ngờ nhất. **Cần bạn xác nhận** vì ảnh hưởng ngày đầu tay trắng. |
| G   | Nợ                                       | Tài nguyên `no` (800/600 theo xuất thân, PROGRESSION §ngày 138–140). Trả nợ bằng **lệnh `repayDebt` của người chơi** (chuyển văn → giảm nợ), không tự trừ. Hạn 360 ngày chỉ lưu `hanNo`; **hậu quả quá hạn thuộc P2** (`hoi0_no`). | GDD chưa nói cơ chế trả hay hậu quả; tự trừ sẽ tranh tiền với sinh hoạt phí.                                           |
| H   | Số lẻ (1,3 phần; XP 1,5; ×0.5)           | Cho phép số thực, **không làm tròn** khi lưu; làm tròn chỉ ở hiển thị. Cấp kỹ năng vẫn suy từ `xpTable`.                                                                                                                           | JSON round-trip số thực đúng; tránh sai lệch tích lũy do làm tròn sớm.                                                 |
| I   | Rìu, lương khô                           | Cờ stub `coRiu` từ xuất thân tiều phu (đồng bộ với `EVENT_SCHEMA` §6 cờ stub S10). Lương khô chưa cần ở làng (phí làng trả bằng văn).                                                                                              | Vật phẩm thật là S10 (P5).                                                                                             |

## 3. Cơ chế engine

Pipeline mỗi tick (mở rộng IMPLEMENTATION_PLAN §1, thứ tự ghi vào test):

1. Ngày +1; kẹp Tinh lực (đã có).
2. Chọn hành động hiệu lực: nếu `resting` → Nghỉ ngơi; nếu tiền không đủ và bật tự làm thuê → Làm thuê (S2); ngược lại hành động người chơi.
3. Áp hành động: thu nhập, chi phí Tinh lực, XP (theo F, H).
4. Trừ sinh hoạt phí hoặc đặt `hungry` (F).
5. Cập nhật `resting` (vào khi Tinh lực < 20, ra khi ≥ 90).
6. Cảnh báo thọ nguyên / chết (đã có).

Dữ liệu: `ActionDef` thêm `place`, `income`, `staminaCost`, `xp` có cấu trúc thay vì mảng `effects` thô; `RawContent` thêm `livingCost` theo nơi. Engine giữ nguyên ranh giới không import React/DOM/Zustand.

## 4. Kiểm thử (khớp tiêu chí thoát P1b)

1. S2: hành động thiếu yêu cầu không chọn được; hết tiền + tự làm thuê chuyển sang Làm thuê, không bật thì tạm dừng; không state nào rỗng hành động khả dụng (thuộc tính, seed ngẫu nhiên).
2. Harness: 360 ngày Đốn củi trả nợ 800 văn trong ±10% BALANCE §3 (≈127 ngày thuần đốn củi).
3. Hồi phục: từ 0 văn, 0 Tinh lực, Đói ở làng, chỉ Làm thuê → sau 60 ngày tiền > 0 và hết Đói ở ngày làm việc.
4. Validator: mọi khu dân cư trong dữ liệu có `thu Làm thuê × tỉ lệ làm − phí > 0`.
5. Save v3: migrate v2→v3 (`resting=false`, `hungry=false`, `no` theo xuất thân), save hỏng bị từ chối.
6. Cùng seed + cùng lệnh → cùng hash (đã có harness).

## 5. Câu hỏi cần người dùng trả lời

Tối thiểu để bắt đầu code: **A, F, G** (ảnh hưởng luật chơi). B, C, D, E, H, I là cơ chế, tôi sẽ làm theo đề xuất nếu bạn không phản đối.
