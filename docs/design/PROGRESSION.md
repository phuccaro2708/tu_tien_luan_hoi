# Progression – Tu luyện, Kỹ năng, Thọ nguyên, Luân hồi

> **Trạng thái: Draft v0.2 – 2026-10-23** (sửa theo review Codex, chờ duyệt). Bản v0.1 đã Approved 2026-10-23; phần không gắn `[CẦN DUYỆT D17–D26]` giữ nguyên giá trị đã duyệt. Mọi con số là giả thuyết để kiểm chứng bằng mô phỏng và playtest. Đối chiếu: `docs/reports/GDD_REVIEW_RESOLUTION.md`.
>
> **Bổ sung 2026-10-25:** D33 (bảng XP §5), D35 (Tinh lực tối đa và lão hóa §6), D36 (Chất phác bậc II §3), D37 (hệ linh căn kiếp 1 §3) – xem GDD §12.

## 1. Thang cảnh giới

| Cảnh giới           | Giai đoạn | Thọ nguyên cộng thêm                   | MVP                                      |
| ------------------- | --------- | -------------------------------------- | ---------------------------------------- |
| Phàm nhân           | –         | Gốc 60 năm (xem §6)                    | Có                                       |
| Luyện Khí 1–3       | Tiền kỳ   | +3 năm mỗi tầng                        | Có                                       |
| Luyện Khí 4–6       | Trung kỳ  | +3 năm mỗi tầng                        | Có                                       |
| Luyện Khí 7–9       | Hậu kỳ    | +3 năm mỗi tầng                        | Có                                       |
| Trúc Cơ             | –         | Tổng thọ nguyên ≈ 150 năm `[GIẢ ĐỊNH]` | Chỉ lần thử đột phá là mục tiêu cuối MVP |
| Kết Đan, Nguyên Anh | –         | –                                      | Post-MVP                                 |

Cảnh giới được thể hiện bằng **tu vi** (một con số tích lũy trong tầng hiện tại). Đầy ngưỡng → đủ điều kiện **đột phá** (không tự động).

### Ngưỡng tu vi

Công thức: `Ngưỡng(n → n+1) = 100 × 1.85^(n−1)`; nhập đạo (Phàm → LK1) cần 60; Trúc Cơ cần tích **3 000 tu vi ở tầng 9** ("tầng 9 viên mãn") `[CẦN DUYỆT D17]`.

| Chuyển    | Phàm→1 | 1→2 | 2→3 | 3→4 | 4→5 | 5→6   | 6→7   | 7→8   | 8→9   | 9→Trúc Cơ |
| --------- | ------ | --- | --- | --- | --- | ----- | ----- | ----- | ----- | --------- |
| Tu vi cần | 60     | 100 | 185 | 342 | 633 | 1 171 | 2 167 | 4 009 | 7 417 | 3 000     |
| v0.1 cũ   | 60     | 100 | 175 | 306 | 536 | 938   | 1 641 | 2 872 | 5 027 | 8 000     |

Tầng đầu 100, tầng giữa 633, tầng 8→9 là 7 417, tăng ×74 trên 8 tầng. Tốc độ tu vi có tăng nhờ linh địa, công pháp và kỹ năng nhưng không theo kịp, nên tầng cao chậm dần. Đây là chủ đích: thọ nguyên trở thành áp lực ở hậu kỳ.

**Vì sao 9→Trúc Cơ nhỏ hơn 8→9:** Trúc Cơ bị chặn bởi xác suất (pGốc 0,10) và chuẩn bị (đan, tâm cảnh, linh địa), không bởi khối lượng tu vi. Ngưỡng 8 000 của v0.1 khiến Tam linh căn kiếp 2 lên LK9 khi chỉ còn vài năm thọ, tức không bao giờ thử được (finding F01). Với 3 000, mô phỏng v0.2 cho thấy Tam linh căn kiếp 2 thử được trung bình 1,0–1,3 lần (BALANCE §10).

### Tốc độ tu vi

```
tuVi/ngày = 0.5 × D × R × C × P × (1 + 0.005 × ThổNạp) × E × Q × B × M
```

Đây là **toàn bộ** các hệ số. Hệ số nào không có trong bảng dưới thì không được nhân vào tu vi (sửa F09).

| Ký hiệu | Ý nghĩa                      | Giá trị                                                                                                 |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| D       | Mật độ linh khí nơi tu luyện | Làng/Trấn 0.2 · Rừng 0.4 · Hắc Thạch Cốc 1.0 · Thanh Vân ngoại môn 1.5 · động phủ Lục 0.8               |
| R       | Hệ số linh căn               | §3                                                                                                      |
| C       | Hệ số gốc công pháp          | Cột "C" ở §4: Dẫn Khí Quyết 1.0 · Thanh Vân Dưỡng Khí Quyết 1.1 · Hàn Thủy Quyết 1.0                    |
| P       | Độ thuần thục công pháp      | Sơ học 1.0 · Thuần thục 1.15 · Tinh thông 1.3 · Viên mãn 1.5                                            |
| ThổNạp  | Cấp kỹ năng Thổ Nạp          | 0–50; **+0,5%/cấp** (v0.1: +1%/cấp) `[CẦN DUYỆT D17]`                                                   |
| E       | Hợp hệ công pháp             | Công pháp có hệ trùng linh căn ×1.25; có hệ nhưng không trùng ×0.8; vô hệ ×1.0                          |
| Q       | Trạng thái                   | Khỏe 1.0 · Đói 0.5 · Nội thương 0.5 · Hàn độc 0.6. Nhiều trạng thái cùng lúc → lấy **giá trị nhỏ nhất** |
| B       | Đan dược                     | Tụ Khí Đan ×(1 + 1.0 × (1 − ĐanĐộc/100)) trong 60 ngày                                                  |
| M       | Phụ trợ                      | Bế quan ×1.10 · Bồ đoàn tĩnh tâm ×1.05; nhân với nhau (tối đa ×1.155)                                   |

Ví dụ (kiếp 1 seed chuẩn, Tứ linh căn R = 0.8; C, E, Q, B, M = 1 trừ khi ghi):

| Tình huống                                                          | tuVi/ngày                                     |
| ------------------------------------------------------------------- | --------------------------------------------- |
| Ở làng, Dẫn Khí Quyết Sơ học, Thổ Nạp 0                             | 0.5 × 0.2 × 0.8 = **0.08**                    |
| Hắc Thạch Cốc, Sơ học, Thổ Nạp 0                                    | **0.40**                                      |
| Hắc Thạch Cốc, Tinh thông, Thổ Nạp 20                               | 0.5 × 1.0 × 0.8 × 1.3 × 1.10 = **0.57**       |
| Ngoại môn, Thanh Vân Dưỡng Khí Quyết (C 1.1) Tinh thông, Thổ Nạp 30 | 0.5 × 1.5 × 0.8 × 1.1 × 1.3 × 1.15 = **0.99** |

## 2. Đột phá

### Điều kiện

1. Tu vi đầy ngưỡng tầng hiện tại.
2. Công pháp đang dùng cho phép lên tầng kế tiếp (trần công pháp, §4).
3. Không đang Nội thương.
4. Người chơi chủ động chọn hành động **Đột phá** (bế quan 30 ngày; Trúc Cơ: 90 ngày).

### Xác suất thành công

```
p = min(0.95, pGốc(n) + min(0.25, Σ chuẩn bị))        (Trúc Cơ: trần chuẩn bị 0.50, trần p 0.80)
```

| Chuyển | Phàm→1 | 1→2  | 2→3  | **3→4**  | 4→5  | 5→6  | **6→7**  | 7→8  | 8→9  | **9→TC** |
| ------ | ------ | ---- | ---- | -------- | ---- | ---- | -------- | ---- | ---- | -------- |
| pGốc   | 0.90   | 0.85 | 0.80 | **0.55** | 0.80 | 0.75 | **0.45** | 0.70 | 0.65 | **0.10** |

Đậm = nút thắt (tiền→trung kỳ, trung→hậu kỳ, Trúc Cơ).

| Nguồn chuẩn bị                       | Thưởng                                  | Chi phí / điều kiện                                                           |
| ------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------- |
| Tâm cảnh "Bình tĩnh"                 | +0.05                                   | 10 ngày liên tục không chiến đấu, không sự kiện xung đột (nghỉ hoặc tu luyện) |
| Công pháp Tinh thông / Viên mãn      | +0.05 / +0.10                           | Thời gian tu luyện                                                            |
| Linh địa D ≥ 1.5                     | +0.05                                   | Phải ở ngoại môn Thanh Vân (hoặc linh địa Post-MVP)                           |
| Phá Cảnh Đan                         | +0.15 × (1 − ĐanĐộc/100)                | 6 linh thạch hoặc 300 cống hiến                                               |
| Cảnh giới cảm ngộ (ký ức kiếp trước) | +0.10 cho đúng chuyển tầng đã từng vượt | Tàn Niệm (§8)                                                                 |
| Trúc Cơ Đan (chỉ cho 9→TC)           | +0.25 × (1 − ĐanĐộc/100)                | 600 cống hiến hoặc chuỗi sự kiện đặc biệt                                     |

Ví dụ nút thắt 6→7 kiếp 1: 0.45 + Bình tĩnh 0.05 + Tinh thông 0.05 + Phá Cảnh Đan (độc 20) 0.12 = **0.67**.

### Rủi ro khi thất bại

| Loại                | Hậu quả                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thất bại thường     | Mất 30% ngưỡng tu vi của tầng; Nội thương 60 ngày (tu vi ×0.5, chiến lực ×0.7)                                                                                                     |
| Thất bại ở nút thắt | Như trên + mất 1 năm thọ nguyên                                                                                                                                                    |
| Thất bại Phàm→1     | Không mất gì ngoài 10 ngày; thử lại được ngay                                                                                                                                      |
| Thất bại Trúc Cơ    | Mất 50% tu vi tầng 9; Nội thương 180 ngày; mất 5 năm thọ nguyên                                                                                                                    |
| Tẩu hỏa nhập ma     | Chỉ khi đột phá trong Tâm cảnh "Hỗn loạn" (do một số sự kiện gây ra, hiển thị rõ). 20% lần thất bại trong trạng thái này → chết. Giao diện cảnh báo hai lần trước khi cho bắt đầu. |

Không softlock: thất bại luôn cho phép thử lại; chi phí thật là **thời gian = thọ nguyên**.

## 3. Linh căn, Thiên phú, Ngộ tính

### Linh căn

| Loại           | Số hệ | R   | Ghi chú lore                                         |
| -------------- | ----- | --- | ---------------------------------------------------- |
| Thiên linh căn | 1     | 3.0 | Cực hiếm; ngoài phạm vi phân phối MVP cho người chơi |
| Song linh căn  | 2     | 2.0 | Đệ tử nội môn                                        |
| Tam linh căn   | 3     | 1.3 | Đệ tử ngoại môn chính thức                           |
| Tứ linh căn    | 4     | 0.8 | "Tạp linh căn", thường chỉ được làm tạp dịch         |
| Ngũ linh căn   | 5     | 0.5 | "Ngụy linh căn", bị coi là phế                       |

- Linh căn là thuộc tính ẩn. Nhân vật chỉ biết khi được đo bằng Trắc Linh Thạch (Lục, hội tuyển Thanh Vân Môn, hoặc mua lượt đo ở chợ đêm). Trước đó giao diện ghi "Chưa rõ".
- Hệ của linh căn (Kim/Mộc/Thủy/Hỏa/Thổ) quyết định công pháp có hệ (E) và pháp thuật dùng được.
- Kiếp 1 **ngẫu nhiên theo seed** `[ĐÃ DUYỆT D04]`: Ngũ 35% · Tứ 50% · Tam 15%; **không bao giờ Song/Thiên** ở kiếp 1 (giữ trụ cột "phàm nhân, không thiên tài"). Các hệ cụ thể cũng ngẫu nhiên: mọi tổ hợp hệ có xác suất như nhau `[ĐÃ DUYỆT D37 – 2026-10-25]`.
- Các kiếp sau: theo quy luật "Hồn dưỡng căn" (§8.4).

### Kiếp 1 – khởi tạo ngẫu nhiên `[ĐÃ DUYỆT D04]`

Seed sinh khi bắt đầu game mới và lưu trong save; cùng seed → cùng kiếp 1. Người chơi chỉ chọn tên và giới tính (D05).

| Thành phần | Cách random                                               |
| ---------- | --------------------------------------------------------- |
| Linh căn   | Ngũ 35% · Tứ 50% · Tam 15%; ẩn tới khi đo (tuổi ~18–19)   |
| Ngộ tính   | 0,85–1,15, phân bố đều                                    |
| Xuất thân  | 1 trong 3 xuất thân ở làng Thạch Khê (bảng dưới), đều 1/3 |
| Thiên phú  | 1 thiên phú bẩm sinh, đều 1/6, không phụ thuộc xuất thân  |

Chơi lại game mới để random lại được phép; vì linh căn chỉ lộ sau ~15 phút chơi nên reroll tốn công, không cần cơ chế chặn.

### Xuất thân

Xuất thân quyết định vật phẩm, kỹ năng khởi đầu và lý do mắc nợ – không phải thiên phú. Kiếp 1 luôn ở Thạch Khê, mẹ là Lý Tam Nương, cùng tai nạn giếng cạn (WORLD_LORE §4); chỉ khác gia cảnh.

| Xuất thân         | Nơi                | Khởi đầu                          | Nợ Hồ chưởng quỹ                                                     | Có ở    |
| ----------------- | ------------------ | --------------------------------- | -------------------------------------------------------------------- | ------- |
| Nhà tiều phu      | Thạch Khê          | Rìu của cha; Thể Phách 2          | 800 văn – cha gãy chân khi đốn củi                                   | Kiếp 1+ |
| Nhà hái thuốc     | Thạch Khê          | Giỏ thuốc; Thảo Dược 3            | 800 văn – cha ngã núi khi hái thuốc, nằm liệt                        | Kiếp 1+ |
| Nhà bán hàng rong | Thạch Khê          | 100 văn; Giao Tế 3                | 600 văn – hàng bị cướp trên đường lên trấn (manh mối Hắc Phong trại) | Kiếp 1+ |
| Nhà buôn          | Trấn Lạc Thủy      | 300 văn; Giao Tế 3                | Không                                                                | Kiếp 2+ |
| Nhà thợ săn       | Bìa rừng Thanh Mộc | Biết đường rừng sâu; Quyền Cước 3 | Không                                                                | Kiếp 2+ |

### Thiên phú (trait) `[ĐÃ DUYỆT D15]`

Thiên phú là dấu vết trên hồn phách (WORLD_LORE R6), đổi một điểm mạnh lấy một điểm yếu hoặc một hướng chơi. Mỗi kiếp có **2 ô**:

- **Bẩm sinh:** 1 thiên phú random theo seed khi sinh ra (kiếp 1: §Kiếp 1; kiếp sau: đi kèm từng xuất thân được đề nghị).
- **Hồn ấn:** người chơi chọn ở Vong Xuyên từ các thiên phú **đã khắc vào hồn**, ở bậc đã nâng. Không chọn trùng thiên phú bẩm sinh; nếu trùng thì ô hồn ấn thay thế (lấy bậc cao hơn).

**Khắc vào hồn:** thiên phú có trong một kiếp (bẩm sinh hoặc hồn ấn) được khắc khi kiếp đó **sống tới ≥ 40 tuổi hoặc đạt LK1**. Kiếp kết thúc bằng Tự vẫn không khắc thiên phú mới. **Nâng bậc** ở Vong Xuyên bằng Tàn Niệm (§8.3); bậc III cần từng đạt LK4 ở bất kỳ kiếp nào.

| Thiên phú   | Bậc I                                            | Bậc II                                                    | Bậc III                        |
| ----------- | ------------------------------------------------ | --------------------------------------------------------- | ------------------------------ |
| Thiết cốt   | Thể Phách XP ×1,2                                | ×1,3                                                      | ×1,4                           |
| Khéo miệng  | Giao Tế XP ×1,2; Thể Phách XP ×0,9               | Giao Tế ×1,3; Thể Phách ×0,9                              | Giao Tế ×1,4; Thể Phách ×1,0   |
| Nhanh nhẹn  | Quyền Cước XP ×1,2                               | ×1,3; bỏ chạy +0,05                                       | ×1,4; bỏ chạy +0,10            |
| Chất phác   | Giao Tế XP ×0,9; thiện cảm dân làng khởi đầu +10 | Giao Tế ×0,9; thiện cảm +15 `[ĐÃ DUYỆT D36 – 2026-10-25]` | Thiện cảm +20; Giao Tế XP ×1,0 |
| Thể nhược   | Thọ nguyên −4; Văn Tự XP ×1,2                    | Thọ −3; Văn Tự ×1,3                                       | Thọ −2; Văn Tự ×1,4            |
| Cường tráng | Thọ nguyên +3; Tinh lực tối đa +10               | Thọ +4; Tinh lực +20                                      | Thọ +5; Tinh lực +30           |

**Trần sức mạnh** (kiểm thử tĩnh trên dữ liệu): hệ số XP tối đa ×1,4 (vì XP tăng theo L^1,6 nên tương đương ≈ +14% cấp kỹ năng trong cùng thời gian); thọ nguyên tối đa +5; không cộng dồn hai bản của cùng thiên phú.

### Ngộ tính

- Hệ số 0.85–1.15 (random theo seed mỗi kiếp), nhân vào XP của kỹ năng "trí" (Văn Tự, Thảo Dược, Thổ Nạp) và XP thuần thục công pháp.
- Thể hiện qua mô tả, không hiện số: "chậm hiểu" (< 0.95), "bình thường", "sáng dạ" (> 1.05). Người lớn trong làng nhận xét được trí khôn của một đứa trẻ, nên thông tin này hợp lý.

## 4. Công pháp, Pháp thuật, Pháp khí

### Công pháp tu luyện (MVP: 3)

| Công pháp                 | Hệ   | C    | Trần        | Văn Tự cần               | Nguồn (≥ 2 con đường cho mỗi mốc then chốt)                                                                                      |
| ------------------------- | ---- | ---- | ----------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Dẫn Khí Quyết             | Vô   | ×1.0 | Luyện Khí 6 | 8 (dưới 8: kẹt ở Sơ học) | Lục Thanh Phong · Thanh Vân Môn (tạp dịch) · Mộc bá (thiện cảm ≥ 60)                                                             |
| Thanh Vân Dưỡng Khí Quyết | Vô   | ×1.1 | Luyện Khí 9 | 15                       | Thanh Vân Môn: lên ngoại môn (LK4 + 200 cống hiến) · chợ đêm bản chép tay (12 linh thạch, 30% bản lỗi nếu Thảo Dược/Văn Tự < 15) |
| Hàn Thủy Quyết            | Thủy | ×1.0 | Luyện Khí 9 | 20 (cổ văn)              | Lục (thiện cảm ≥ 70, sau chuỗi Hắc Phong) · động phủ của Lục (kiếp sau, nếu nhớ địa điểm)                                        |

- **Trần LK6 của Dẫn Khí Quyết** buộc người chơi chọn con đường trung hạn `[ĐÃ DUYỆT D12]`.
- Hàn Thủy Quyết với linh căn có Thủy: E ×1.25 → mạnh nhất (C × E = 1.25 so với 1.1 của Thanh Vân), không có Thủy: ×0.8. Đánh đổi: thất bại đột phá gây **Hàn độc** (Q 0.6, kéo dài 120 ngày thay vì 60). Ngũ linh căn luôn có Thủy nên luôn được ×1.25; đây là bù đắp có chủ đích cho R 0.5.
- Thuần thục: Sơ học → Thuần thục 100 điểm → Tinh thông 600 → Viên mãn 2 000 (cộng dồn). Mỗi ngày tu luyện: `1 × Ngộ × (1 + 0.01 × VănTự)` điểm. Văn Tự 15, Ngộ 1.0 → Tinh thông sau ≈ 1,4 năm tu luyện, Viên mãn sau ≈ 4,8 năm.
- Đổi công pháp: 30 ngày "chuyển công", mất 10% tu vi tầng hiện tại; thuần thục công pháp mới bắt đầu từ Sơ học.

### Pháp thuật (MVP: 3, dùng trong chiến đấu)

| Pháp thuật     | Hệ  | Yêu cầu                         | Hiệu ứng                                                                                                          |
| -------------- | --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Linh Đạn Thuật | Vô  | LK2, Văn Tự 10                  | Sát thương = 10 + 4 × tầng, bỏ qua 50% phòng thủ                                                                  |
| Mộc Lao Thuật  | Mộc | LK3, Văn Tự 12                  | Khóa đối thủ 2 lượt; bỏ chạy chắc chắn thành công                                                                 |
| Hỏa Cầu Thuật  | Hỏa | LK3, Văn Tự 12, linh căn có Hỏa | Sát thương 20 + 6 × tầng. Chỉ dùng được khi linh căn có Hỏa (≈ 84% nhân vật kiếp 1: Ngũ luôn có, Tứ 4/5, Tam 3/5) |

### Công cụ & Pháp khí (MVP tối giản)

Hai ô trang bị: **Vũ khí/Công cụ** và **Phụ trợ**. Không có độ hiếm ngẫu nhiên, không cường hóa.

| Vật phẩm                            | Ô              | Hiệu ứng                                              | Nguồn                                   |
| ----------------------------------- | -------------- | ----------------------------------------------------- | --------------------------------------- |
| Rìu của cha                         | Vũ khí/Công cụ | Cho phép Đốn củi; Công +2                             | Khởi đầu kiếp 1                         |
| Giỏ thuốc                           | Phụ trợ        | Hái thuốc +15%                                        | Mộc bá, 150 văn                         |
| Đoản đao                            | Vũ khí         | Công +5                                               | Trấn, 400 văn                           |
| Thiết kiếm                          | Vũ khí         | Công +9                                               | Trấn, 1 200 văn                         |
| Thanh Phong Kiếm (pháp khí hạ phẩm) | Vũ khí         | Công +16; cần LK2                                     | 4 linh thạch / chiến lợi phẩm Hắc Phong |
| Hộ thân phù                         | Phụ trợ        | Biến một kết cục chết thành Nội thương, rồi vỡ        | 2 linh thạch / Lục                      |
| Bồ đoàn tĩnh tâm                    | Phụ trợ        | Tu vi +5%; Tâm cảnh Bình tĩnh trong 7 ngày thay vì 10 | 30 cống hiến                            |

Pháp bảo luyện hóa, độ hiếm, luyện khí: Post-MVP.

## 5. Kỹ năng

Sáu kỹ năng, cấp 0–50. XP để lên cấp tiếp theo: `XP(L → L+1) = round(10 × max(1, L)^1.6)` (làm tròn từng bước). XP lưu dạng cộng dồn; "XP cộng dồn" của cấp N là tổng các bước từ cấp 0 tới N, kể cả bước 0 → 1 `[ĐÃ DUYỆT D33 – 2026-10-25]`.

| Cấp                     | 1      | 5       | 10                 | 20                | 30               |
| ----------------------- | ------ | ------- | ------------------ | ----------------- | ---------------- |
| XP lên cấp kế           | 10     | 131     | 398                | 1 207             | 2 309            |
| XP cộng dồn từ 0        | 10     | 200     | 1 347              | 8 699             | 25 509           |
| Thời gian ở 2,5 XP/ngày | 4 ngày | 0,2 năm | 1,5 năm (4,5 phút) | 9,7 năm (29 phút) | 28 năm (85 phút) |

```
XP/ngày = XPGốc(hành động) × Ngộ (kỹ năng trí) × Thiên phú × Ký ức × Trạng thái
Ký ức = 3 nếu cấp hiện tại < cấp cao nhất kiếp trước và đã giữ ký ức kỹ năng này; ngược lại 1
```

| Kỹ năng    | Loại | Hiệu ứng mỗi cấp                                                                                       | Mốc mở khóa                                                                                     |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Thể Phách  | Thân | Thu nhập việc nặng +2%; Khí huyết +5; Tinh lực tối đa +1 (trần +30); thọ nguyên +1 mỗi 5 cấp (trần +6) | 5: Khuân vác · 10: Thám hiểm sâu                                                                |
| Văn Tự     | Trí  | XP thuần thục công pháp +1%                                                                            | 3: đọc sổ sách · 8: Dẫn Khí Quyết · 12: pháp thuật · 15: Thanh Vân Dưỡng Khí Quyết · 20: cổ văn |
| Thảo Dược  | Trí  | Giá trị thảo dược +1,5 văn/ngày; hồi phục bị thương +2%                                                | 3: Hái thuốc · 5: tự đắp thuốc · 8: cỏ Xú Long · 10: linh thảo · 15: nhận ra đan giả            |
| Quyền Cước | Thân | Công +1; tỉ lệ bỏ chạy +1%                                                                             | 5: Tự luyện quyền · 10: lựa chọn "khống chế" thay vì giết                                       |
| Giao Tế    | Trí* | Giá mua −0,5% (trần −15%); thiện cảm nhận được +2%                                                     | 5: hỏi tin đồn · 10: thuyết phục · 15: mặc cả chợ đêm                                           |
| Thổ Nạp    | Trí  | Tu vi +0,5%                                                                                            | Mở khi cảm ứng linh khí · 20: Tâm cảnh Bình tĩnh nhanh hơn 30%                                  |

\* Giao Tế không nhân Ngộ tính.

## 6. Thọ nguyên, tuổi tác, sinh tử

```
ThọNguyên = 60 + min(6, floor(ThểPhách / 5)) + ThiênPhú + 3 × tầngLuyệnKhí − ThọNguyênĐãMất
```

| Nhân vật                               | Thọ nguyên                                                            |
| -------------------------------------- | --------------------------------------------------------------------- |
| Phàm nhân, Thể Phách 10                | 62                                                                    |
| Kiếp 1 Tứ linh căn: LK8, Thể Phách 25  | 60 + 5 + 24 = 89 (trừ đi các lần thất bại nút thắt, thường còn 87–88) |
| Kiếp 2: LK9, Thể Phách 30, Cường tráng | 60 + 6 + 3 + 27 = 96                                                  |

- **Lão hóa:** khi tuổi > 80% thọ nguyên, Tinh lực tối đa −2 mỗi năm; chiến lực −1% mỗi năm.
- **Tinh lực tối đa** `[ĐÃ DUYỆT D35 – 2026-10-25]`:
  ```
  TinhLựcTốiĐa = max(0, 100 + min(30, cấp ThểPhách) + ThiênPhú − 2 × max(0, tuổi − floor(0,8 × ThọNguyên)))
  ```
  - Tuổi là số năm tròn. Thọ nguyên 60 → mốc 48: tuổi 48 chưa giảm, 49 giảm 2, 55 giảm 14.
  - Khi mức tối đa giảm (lão hóa, thọ nguyên đổi), Tinh lực hiện có bị kẹp xuống mức mới. Kiếp mới bắt đầu với Tinh lực đầy.
- **Cảnh báo:** tự động dừng khi còn 10, 5, 1 năm.
- **Cái chết:** khi tuổi ≥ thọ nguyên (tất định, không ngẫu nhiên); hoặc thua khi chọn "Liều mạng" — chiến thuật này **chỉ có trong trận chiến của sự kiện lớn gắn cả `quanTrong` và `motLan`** (một lần mỗi save), không có ở chạm trán ngẫu nhiên `[CẦN DUYỆT D22]`; hoặc tẩu hỏa nhập ma. Không có cái chết ngẫu nhiên không báo trước, và không có cách chết lặp lại được theo ý muốn ở mỗi kiếp ngoài Tự vẫn (§8.7).
- **Công thức trên chỉ dành cho người chơi.** NPC có tuổi và thọ nguyên khai báo trong dữ liệu theo dòng thời gian thế giới (`WORLD_LORE.md` §3.1) `[CẦN DUYỆT D18]`.
- **Kéo dài thọ nguyên:** Diên Thọ Quả (+2 năm, tối đa một lần mỗi kiếp, chuỗi sự kiện Hắc Thạch Cốc). Không có cách mua thọ nguyên trong MVP.
- **Chôn giấu di vật:** khi còn ≤ 5 năm, người chơi có thể chôn tối đa 3 vật phẩm và 5 linh thạch ở một địa điểm đã biết.

## 7. Kinh tế tu luyện

| Tài nguyên      | Nguồn                                                                                              | Tiêu thụ                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Văn (tiền phàm) | Nghề, bán thảo dược, sự kiện                                                                       | Sinh hoạt phí, học phí, lương khô, công cụ, đổi linh thạch                       |
| Linh thạch      | Đào linh thạch vụn (0,04/ngày), linh thảo, cống hiến đổi, chiến lợi phẩm, chợ đêm (1 200 văn/viên) | Đan dược, pháp khí, công pháp chép tay, hấp thu (1 viên → 15 tu vi trong 5 ngày) |
| Cống hiến       | Tạp dịch (1/ngày), nhiệm vụ môn phái                                                               | Đan, công pháp, Trúc Cơ Đan                                                      |
| Đan Độc         | Mỗi viên đan (Tụ Khí +25, Phá Cảnh +30, Trúc Cơ +40)                                               | Giảm 0,5/ngày; ≥ 80 không thể dùng thêm đan                                      |

Chi tiết cân bằng: `BALANCE.md`.

## 8. Luân hồi

### 8.1 Đánh giá có phù hợp không

Có, và là trụ cột. Lý do: (1) thọ nguyên là đồng hồ chính, cái chết cần dẫn tới một thứ có ý nghĩa thay vì "Game Over"; (2) "Luân Hồi" có trong tên game; (3) tạo lớp tiến triển dài hạn tự nhiên cho incremental. Rủi ro: dễ thành prestige reset → khắc phục bằng các nguyên tắc dưới đây.

Nguyên tắc:

- Không bao giờ được cộng chỉ số phẳng (+% mọi thứ).
- Thứ mang theo là **ký ức (hiểu biết)**, **hậu quả thế giới** và **căn cơ linh hồn có giới hạn**.
- Chỉ cái chết dẫn tới luân hồi. Người chơi có thể chủ động kết thúc kiếp bằng **Tự vẫn** (§8.7), nhưng bị phạt để không thành chiến lược reset.
- Chết sớm cho ít Tàn Niệm hơn; Tự vẫn còn nhân thêm ×0,5.

### 8.2 Tàn Niệm – điểm giữ ký ức

```
TànNiệm = 3 + 2 × tầngLuyệnKhíCaoNhất + Σ floor(cấpCaoNhấtKỹNăng / 10) + số NPC thiện cảm ≥ 60 + số chuỗi sự kiện lớn đã hoàn thành
```

Ví dụ một kiếp 1 dừng ở LK7 ( kỹ năng cao nhất 24/16/21/12/9/33; 3 NPC thân; 3 chuỗi): 3 + 14 + 9 + 3 + 3 = **32**.

Kiếp kết thúc bằng Tự vẫn: `TànNiệm = floor(công thức trên × 0,5)` `[ĐÃ DUYỆT D16]`.

### 8.3 Ký ức có thể giữ

| Ký ức              | Chi phí              | Hiệu quả ở kiếp sau                                                                                                           |
| ------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Kỹ năng X          | ceil(cấpCaoNhất / 5) | XP ×3 cho tới khi đạt lại cấp cao nhất cũ (Thổ Nạp 33 → 7 điểm)                                                               |
| Văn bản công pháp  | 6 mỗi bộ             | Nhớ nội dung, tu luyện được mà không cần bản chép (vẫn cần Văn Tự tương ứng để đạt trên Sơ học); thuần thục bắt đầu từ Sơ học |
| Địa điểm ẩn        | 2 mỗi nơi            | Biết đường tới (VD: Hắc Thạch Cốc, động phủ Lục) từ đầu kiếp                                                                  |
| Cảnh giới cảm ngộ  | 2 mỗi chuyển tầng    | +0,10 xác suất cho đúng chuyển tầng đã từng vượt                                                                              |
| Bí mật nhân duyên  | 2 mỗi người          | Biết bí mật/động cơ của một NPC hoặc dòng họ (mở lựa chọn hội thoại)                                                          |
| Chỗ chôn di vật    | 2                    | Biết chỗ chôn, lấy lại vật phẩm đã chôn (nếu chưa bị người khác đào – có xác suất theo cờ thế giới)                           |
| Nâng bậc thiên phú | I→II: 6 · II→III: 12 | Thiên phú đã khắc lên bậc mới, vĩnh viễn cho mọi kiếp sau (§3); bậc III cần từng đạt LK4 `[ĐÃ DUYỆT D15]`                     |

Mua tất cả ký ức của kiếp ví dụ trên tốn ≈ 64 điểm, gấp đôi 32 → người chơi phải chọn. Nâng bậc thiên phú cạnh tranh cùng quỹ điểm: "mạnh lâu dài" ↔ "biết nhiều cho kiếp sau".

### 8.4 Hồn dưỡng căn – linh căn kiếp sau

Quy luật thế giới: _"Vong Xuyên xóa ký ức, không xóa căn cơ hồn phách."_ Linh hồn từng luyện khí có xu hướng tái sinh vào thân xác có linh căn.

| Cảnh giới cao nhất kiếp trước | Ngũ  | Tứ  | Tam | Song |
| ----------------------------- | ---- | --- | --- | ---- |
| Phàm nhân                     | 100% | –   | –   | –    |
| Luyện Khí 1–3                 | 30%  | 60% | 10% | –    |
| Luyện Khí 4–6                 | –    | 50% | 45% | 5%   |
| Luyện Khí 7–9                 | –    | 20% | 60% | 20%  |

Linh căn được tung một lần mỗi kiếp bằng RNG có seed, ẩn cho tới khi được đo. Hệ cụ thể ngẫu nhiên theo seed. Bảng này chỉ áp dụng **từ kiếp 2**; kiếp 1 dùng phân phối ở §3.

### 8.5 Xuất thân

Ở Vong Xuyên, người chơi chọn một trong **3 xuất thân** sinh từ seed (gia cảnh, nơi sinh, thiên phú bẩm sinh, ngộ tính dạng mô tả), rồi chọn thiên phú cho ô hồn ấn (§3). Linh căn không phụ thuộc xuất thân và không hiển thị. Mọi kiếp bắt đầu ở tuổi 14 – theo lore, Tàn Niệm chỉ thức tỉnh khi hồn phách ổn định ở tuổi này.

### 8.6 Thế giới tiếp diễn

- Kiếp mới bắt đầu **30 năm sau** cái chết `[ĐÃ DUYỆT D03]`.
- Cờ thế giới giữ lại: VD Hắc Phong trại bị diệt hay lớn mạnh, Mộc bá có truyền nghề cho cháu không, động phủ Lục còn hay đã bị cướp.
- NPC phàm nhân đã chết được thay bằng **người kế thừa** (bảng trong `WORLD_LORE.md`), mang theo thái độ dòng họ dựa trên cờ.
- NPC sống/chết theo **năm thế giới** và thọ nguyên khai báo trong dữ liệu (`WORLD_LORE.md` §3.1). Kiếp sau bắt đầu ở `nămThếGiới = nămChếtKiếpTrước + 30`, nên NPC tu sĩ còn sống hay không tùy kiếp trước dài bao lâu; mọi chuỗi phụ thuộc một NPC phải có nhánh "đã mất" `[CẦN DUYỆT D18]`.
- **Nguồn bảo đảm xuyên kiếp:** mỗi mốc then chốt có ít nhất một nguồn không phụ thuộc cờ thế giới ở mọi kiếp (`SYSTEMS.md` S4, bảng khả đạt) `[CẦN DUYỆT D19]`.

### 8.7 Tự vẫn `[ĐÃ DUYỆT D16]`

Ô "Tự vẫn" trong menu nhân vật cho phép kết thúc kiếp sớm, để thoát một kiếp "hỏng" (VD kẹt Ngũ linh căn, thọ nguyên còn quá ít) mà không phải chờ hàng chục phút.

- **Xác nhận hai bước:** hộp thoại nêu rõ hậu quả, rồi xác nhận lần hai; không có phím tắt.
- **Không dùng được** khi đang ở màn sự kiện hoặc chiến đấu, để không thoát khỏi hậu quả của lựa chọn đang diễn ra.
- **Không có đường vòng lặp lại được:** Liều mạng chỉ có trong vài trận của sự kiện lớn, mỗi trận một lần mỗi save, và không trận nào mở trước LK3. Người chơi không thể tự tìm cái chết "sạch" bằng chiến đấu ở mỗi kiếp để né hình phạt Tự vẫn (finding F06) `[CẦN DUYỆT D22]`. Chết trong các trận cốt truyện đó vẫn được tính là cái chết thường.
- **Hậu quả:** Tàn Niệm ×0,5 (§8.2); không khắc thiên phú mới (§3); thế giới vẫn +30 năm; đặt cờ `tu_van` để người thân/người kế thừa phản ứng ở kiếp sau (WORLD_LORE §3).
- **Chống reroll:** kiếp chưa nhập đạo → Hồn dưỡng căn cho 100% Ngũ linh căn (§8.4). Tự vẫn sớm để đổi linh căn luôn cho kết quả không tốt hơn, cộng thêm mất một nửa Tàn Niệm.
