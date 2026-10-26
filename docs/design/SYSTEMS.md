# Systems Specification

> **Trạng thái: Draft v0.2 – 2026-10-23** (sửa theo review Codex, chờ duyệt). Bản v0.1 đã Approved 2026-10-23; phần không gắn `[CẦN DUYỆT D17–D26]` giữ nguyên. Đối chiếu: `docs/reports/GDD_REVIEW_RESOLUTION.md`.
>
> **Bổ sung 2026-10-24:** D27–D30 (S1, S13, S14: thời gian khi tab ẩn hoặc máy ngủ, autosave khi chạy bù, nhiều tab) do người dùng quyết định trong lượt xử lý review P0. Nguồn: `docs/reports/phase/2026-10-24-p0-audit-n01-n09.md`, `docs/reports/phase/2026-10-24-code-review-round3.md`.
>
> **Bổ sung 2026-10-25:** D23 đã duyệt (S2); D31, D32 (S1: chết trước P4, tên/giới tính), D34 (S13: chết khi vắng mặt). Xem GDD §12.
>
> Mỗi hệ thống theo mẫu: **Mục đích gameplay · Input/Output · Điều kiện · Tương tác · Tiêu chí kiểm thử**. Công thức chi tiết ở `PROGRESSION.md` và `BALANCE.md`; ở đây chỉ nêu hợp đồng của hệ thống.

## 0. Đánh giá sự cần thiết của các hệ RPG

| Hệ                | Cần không?         | Lý do                                                                                   | Phạm vi                                                                       |
| ----------------- | ------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Actions & Jobs    | **Bắt buộc**       | Là core loop: cách người chơi tiêu thời gian                                            | MVP đầy đủ                                                                    |
| Exploration       | **Cần**            | Đưa cơ duyên vào không gian; gắn tri thức với nơi chốn                                  | MVP: bản đồ 7 địa điểm (5 + 3 điểm con nếu D24 được duyệt), tiến độ thám hiểm |
| Combat            | Cần, tối giản      | Rủi ro của thám hiểm, giải quyết xung đột cốt truyện; không phải trọng tâm              | MVP: tự động, có chiến thuật; Post-MVP: pháp thuật sâu hơn                    |
| Equipment         | Tối giản           | Công cụ nghề có ý nghĩa; pháp khí là mốc cảm xúc; loot ngẫu nhiên sẽ kéo game sang ARPG | MVP: 2 ô, 7 vật phẩm cố định; Post-MVP: pháp bảo, luyện hóa                   |
| Alchemy           | Chưa               | Hệ crafting riêng đủ lớn để thành một game con; MVP chỉ cần đan dược để mua/nhận        | Post-MVP (Thảo Dược đã chuẩn bị chỗ móc vào)                                  |
| Events            | **Bắt buộc**       | Nơi lựa chọn có ý nghĩa và câu chuyện xảy ra                                            | MVP: 60–80 sự kiện; đề xuất 30–40 `[CẦN DUYỆT D24]`                           |
| NPC Relationships | **Cần**            | Động cơ NPC tạo nhân quả; hậu quả xuyên kiếp                                            | MVP: 8 NPC + 8 dòng kế thừa                                                   |
| Quests            | Không làm hệ riêng | Trùng chức năng với chuỗi sự kiện; Nhật ký hiển thị "manh mối đang theo" là đủ          | MVP: Nhật ký; Post-MVP nếu cần                                                |
| Sect Management   | Không              | Đổi thể loại sang quản lý; lệch tầm nhìn MVP                                            | Post-MVP xa; MVP chỉ có làm thành viên môn phái                               |
| Reincarnation     | **Bắt buộc**       | Thọ nguyên là đồng hồ chính; luân hồi là trụ cột (PROGRESSION §8)                       | MVP: vòng đầy đủ, nội dung kiếp 2 tối giản                                    |

---

## S1. Thời gian, Tuổi, Thọ nguyên

- **Mục đích:** biến thời gian thành tài nguyên khan hiếm; tạo áp lực dài hạn.
- **Input:** clock tập trung (ms thực), hệ số tốc độ 1× / 2× / 3× / 5× `[ĐÃ DUYỆT D14]`, trạng thái tạm dừng; khi bắt đầu game mới: seed, tên, giới tính.
- **Output:** số tick (1 tick = 1 ngày) được đưa vào engine; tuổi; thọ nguyên còn lại; sự kiện mốc tuổi; tín hiệu cảnh báo/chết.
- **Điều kiện:**
  - 2 tick/giây ở 1× (4 / 6 / 10 ở 2× / 3× / 5×). Engine chạy bước cố định; dư thời gian được giữ trong bộ tích lũy. Mỗi khung hình xử lý tối đa một số tick cố định, phần dư dồn sang khung sau. Tạm dừng khi có điểm dừng (CORE_LOOP §3); tốc độ giữ nguyên sau điểm dừng.
  - **Tab ẩn** `[ĐÃ DUYỆT D27 – 2026-10-24]`:
    - Vẫn là online: chạy ở tốc độ đã chọn, không có trần.
    - Trình duyệt ngừng khung hình khi tab ẩn. Khi hiện lại, engine chạy bù theo trần mỗi khung hình (P0: 20 tick).
    - Ẩn hoặc đóng tab thì hạch toán hết thời gian tới lúc đó rồi lưu (S14).
    - Gặp điểm dừng trong lúc ẩn: thời gian còn lại bị bỏ như khi chơi online, **không** cộng vào Tích Thời. Tab ẩn không phải vắng mặt; S13 chỉ áp dụng khi game không chạy.
    - Clock bắt đầu chạy từ lúc game nạp save, không đợi khung hình đầu. Nhờ vậy tab mở sẵn ở nền cũng được tính thời gian.
  - **Máy ngủ** `[ĐÃ DUYỆT D28 – 2026-10-24]`:
    - Trên một số hệ điều hành, clock khung hình đứng yên khi máy ngủ còn đồng hồ hệ thống vẫn chạy. Phần đồng hồ hệ thống chạy hơn clock **trên 5 giây** được xử lý như vắng mặt theo S13: trần 8 giờ, phần dư thành Tích Thời.
    - Chênh dưới 5 giây coi là sai số đo.
    - Nếu clock khung hình vẫn chạy khi máy ngủ, thời gian đó là online như tab ẩn.
    - Hệ quả đã chấp nhận: chỉnh đồng hồ hệ thống tiến lên khi đang chơi cũng chỉ được tối đa 8 giờ, như khi đóng tab.
  - Tốc độ là tùy chọn giao diện: lưu cùng save nhưng nằm ngoài `GameState`, không ảnh hưởng replay. **Engine không bao giờ đọc tốc độ.**
  - **Chính sách sự kiện nhỏ** `[CẦN DUYỆT D21]` (sửa F04): `GameState.chinhSachSuKienNho ∈ { hoi, tuDong }`, giá trị ban đầu `hoi`, chỉ đổi bằng lệnh `datChinhSachSuKienNho` (ghi vào nhật ký lệnh, nhận cả khi `stop` đang mở, hiệu lực từ tick kế tiếp). `hoi`: sự kiện nhỏ tạm dừng và hỏi. `tuDong`: lấy `macDinhAnToan` và ghi vào Nhật ký. Sự kiện nhỏ đang chờ mà đổi sang `tuDong` thì được giải ngay bằng `macDinhAnToan`. Offline và Tích Thời dùng đúng giá trị đang lưu (offline ≡ online, D34). UI có tùy chọn "tự xử lý sự kiện nhỏ khi tua ≥ 3×"; khi người chơi đổi tốc độ, UI gửi lệnh tương ứng **tại tick hiện tại**, nên replay chỉ cần nhật ký lệnh. Thêm trường vào `GameState` nên tăng version save (v2 → v3). Chi tiết: `docs/technical/EVENT_SCHEMA.md` §4.
  - **Game mới:** sinh seed, rồi tung kiếp 1 theo `PROGRESSION.md` §3 (linh căn, ngộ tính, xuất thân, thiên phú bẩm sinh) `[ĐÃ DUYỆT D04]`.
  - **Tên và giới tính** `[ĐÃ DUYỆT D32 – 2026-10-25]` (chi tiết D05):
    - Game mới (và save cũ chưa có danh tính) dừng ở điểm dừng `chooseIdentity`; thời gian không chạy cho tới khi người chơi chọn.
    - Tên: cắt khoảng trắng hai đầu, còn 1–16 ký tự, không có ký tự điều khiển hay ký tự định dạng vô hình (VD U+200B). Giới tính: Nam hoặc Nữ (dữ liệu).
    - Đã chọn thì không đổi trong kiếp. Lệnh nào khác lệnh chọn danh tính đều bị từ chối khi chưa chọn.
  - **Sau khi chết, trước P4** `[ĐÃ DUYỆT D31 – 2026-10-25]`: màn "Kiếp này đã hết" (tuổi, thọ nguyên) và nút **Bắt đầu kiếp mới**. Xác nhận xong thì tạo game mới với seed mới; kiếp cũ và Tích Thời mất hẳn. Đây là lối thoát tạm; P4 thay bằng Vong Xuyên (S12).
- **Tương tác:** mọi hệ đều chạy theo tick; S9 cộng thọ nguyên; S12 kích hoạt khi chết; S13 dùng cùng bước tick.
- **Tiêu chí kiểm thử:**
  - 360 tick = +1 tuổi; 2 tick/giây chính xác với fake clock.
  - Cùng tổng thời gian thực, chia frame khác nhau (16 ms vs 100 ms vs 1 s) → cùng state.
  - Cùng seed + cùng nhật ký lệnh (kể cả lệnh đổi chính sách sự kiện nhỏ) → cùng hash state ở 1× / 2× / 3× / 5×; ở 5× với fake clock, 1 giây = 10 tick.
  - Đổi tốc độ mà không gửi lệnh chính sách → kết quả mô phỏng không đổi.
  - Tab ẩn N giây rồi hiện lại (sau khi chạy bù) → cùng số tick như tab hiện suốt N giây, ở mọi tốc độ (D27).
  - Tab mở khi đang ẩn, 3 giờ sau mới có khung hình đầu → 3 giờ được tính là online (D27).
  - Clock khung hình đứng yên trong khi đồng hồ hệ thống chạy 1 giờ → 1 giờ xử lý như vắng mặt; 9 giờ → chỉ 8 giờ; chênh 2 giây → không có gì (D28).
  - Cùng seed → cùng kiếp 1 (linh căn, ngộ tính, xuất thân, thiên phú); kiếp 1 không bao giờ ra Song/Thiên linh căn (kiểm thử trên nhiều seed).
  - Tuổi ≥ thọ nguyên → chết đúng tick đó; cảnh báo tạm dừng ở 10/5/1 năm còn lại.

## S2. Hành động & Nghề

- **Mục đích:** lựa chọn cơ bản nhất – dùng ngày hôm nay vào việc gì.
- **Input:** hành động đang chọn, địa điểm, Tinh lực, kỹ năng, vật phẩm, tri thức; quy tắc lịch trình (ngưỡng nghỉ, tự làm thuê khi hết tiền).
- **Output mỗi tick:** thay đổi văn/vật phẩm, XP kỹ năng, Tinh lực, tiến độ thám hiểm/tu vi, cơ hội sự kiện; sinh hoạt phí bị trừ **sau** khi cộng thu nhập. Không đủ trả → không trừ, không nợ, Đói ngày đó (BALANCE §3) `[ĐÃ DUYỆT D23 – 2026-10-25]`.
- **Điều kiện:** mỗi hành động định nghĩa trong dữ liệu: địa điểm hợp lệ, yêu cầu (kỹ năng, vật phẩm, tri thức, cờ), chi phí Tinh lực, sản lượng, XP. Khi Tinh lực < ngưỡng nghỉ → tự Nghỉ ngơi đến ngưỡng làm lại. **"Làm thuê" luôn có ở mọi khu dân cư, không yêu cầu gì, và có ròng dương ở mọi nơi (validator dữ liệu). "Hái quả rừng" luôn có ở mọi nơi hoang.**
- **Tương tác:** S3 (XP), S4 (mở hành động), S5 (địa điểm), S6 (cơ hội sự kiện), S9 (Tu luyện/Đột phá là hành động), S11 (tạp dịch chiếm thời gian).
- **Danh sách MVP:** Làm thuê, Hái quả rừng, Đốn củi, Học việc hiệu thuốc, Hái thuốc, Học chữ, Bổ củi đổi chữ, Tiểu nhị, Khuân vác, Luyện quyền (võ quán), Tự luyện quyền, Nghỉ ngơi, Thám hiểm, Tu luyện, Đột phá, Bế quan, Đào linh thạch vụn, Hái linh thảo, Hấp thu linh thạch, Đi đường. Số liệu: `BALANCE.md` §3.
- **Tiêu chí kiểm thử:**
  - Hành động thiếu yêu cầu không thể chọn và có lý do hiển thị (khi lý do đó là tri thức nhân vật đã biết).
  - Hết tiền + bật tự làm thuê → chuyển sang Làm thuê; không bật → tạm dừng.
  - Không tồn tại state nào mà danh sách hành động khả dụng rỗng (kiểm thử thuộc tính trên state ngẫu nhiên).
  - **Hồi phục từ tay trắng:** từ tiền 0, Tinh lực 0, Đói, ở bất kỳ khu dân cư nào, chỉ Làm thuê với quy tắc nghỉ mặc định (ở nơi hoang: Hái quả rừng, hoặc đi về khu dân cư gần nhất rồi Làm thuê) → sau 60 ngày tiền > 0 và không còn Đói ở ngày làm việc. Ở nơi hoang, chỉ Hái quả rừng → sau 10 ngày không còn Đói (kiểm thử thuộc tính trên mọi địa điểm trong dữ liệu).
  - Validator: với mọi khu dân cư, `thu Làm thuê × tỉ lệ làm − phí > 0`.

## S3. Kỹ năng

- **Mục đích:** tiến triển dọc của phàm nhân; mở khóa nội dung; mang ý nghĩa xuyên kiếp.
- **Input:** XP từ hành động/sự kiện; Ngộ tính; thiên phú; ký ức kiếp trước.
- **Output:** cấp kỹ năng; hiệu ứng thụ động; cờ mốc (VD `van_tu_8`).
- **Điều kiện:** 6 kỹ năng (PROGRESSION §5); Thổ Nạp ẩn tới khi cảm ứng linh khí. Cấp tối đa 50.
- **Tương tác:** S2 (sản lượng), S6 (điều kiện lựa chọn), S8 (chỉ số chiến đấu), S9 (Văn Tự, Thổ Nạp), S12 (cấp cao nhất → Tàn Niệm, ký ức).
- **Tiêu chí kiểm thử:**
  - Bảng XP khớp công thức `10 × L^1.6` tại cấp 1/5/10/20/30.
  - Hệ số ký ức ×3 chỉ áp dụng dưới cấp cao nhất kiếp trước và tắt đúng khi đạt lại.
  - Mỗi mốc mở khóa phát đúng một lần.

## S4. Tri thức (Knowledge)

- **Mục đích:** hiện thực trụ cột "không biết điều chưa học"; biến khám phá thế giới thành tiến triển.
- **Input:** sự kiện, đọc sách/công pháp, đối thoại NPC, ký ức kiếp trước.
- **Output:** tập ID tri thức (VD `biet_tien_nhan`, `biet_linh_can`, `duong_hac_thach_coc`); mỗi tri thức có phạm vi `kiep` (mất khi chết) hoặc `linh_hon` (giữ khi chết – chỉ qua S12).
- **Điều kiện:** mọi hành động, địa điểm, văn bản, trường giao diện có thể khai báo `yeuCauTriThuc`. Văn bản có thể có biến thể "góc nhìn phàm nhân".
- **Tương tác:** gần như mọi hệ đọc S4; S6 và S12 ghi vào S4. **Nhật ký** là giao diện của S4 (manh mối đang theo, điều đã biết).
- **Tiêu chí kiểm thử:**
  - Snapshot giao diện ở state ban đầu không chứa từ khóa bị khóa (linh khí, linh căn, tu vi, Luyện Khí, linh thạch, cảnh giới, Trúc Cơ; danh sách đầy đủ ở `EVENT_SCHEMA.md` §9).
  - **Kiểm thử khả đạt** `[CẦN DUYỆT D19]` (sửa F03): mỗi mốc then chốt dưới đây có ≥ 2 nguồn trong dữ liệu, trong đó **≥ 1 nguồn không phụ thuộc cờ thế giới hay NPC còn sống**. Chạy cho ba cấu hình: kiếp 1; kiếp 2 xấu nhất (mọi cờ tùy chọn tắt, mọi NPC có thể chết đều đã chết, không giữ ký ức); kiếp 3 xấu nhất (năm thế giới ~200: mọi NPC gốc kể cả Đỗ đã mất, kiếp 2 chết sớm bằng Tự vẫn). Từ kiếp 3 trở đi không còn NPC gốc nào nên cấu hình kiếp 3 đại diện cho mọi kiếp sau.

    | Mốc                    | Nguồn không phụ thuộc cờ                           | Nguồn khác                                                            |
    | ---------------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
    | Văn Tự 8               | Lớp ở Thư xá trấn Lạc Thủy (học phí 12 văn/ngày)   | Tô tiên sinh / lớp của người kế thừa Tô                               |
    | Văn Tự 12 / 15 / 20    | Lớp Thư xá (không giới hạn cấp; chỉ tốn thêm ngày) | Tô / người kế thừa; đọc sách ở Tàng Kinh Các (tạp dịch); ký ức Văn Tự |
    | `biet_linh_can`        | Hội tuyển Thanh Vân (mỗi 3 năm)                    | Lục, Mộc bá, ký ức                                                    |
    | `cong_phap_dan_khi`    | Thanh Vân tạp dịch (Tàng Kinh Các tầng 1)          | Lục, chợ đêm, ký ức văn bản                                           |
    | Nơi có D ≥ 1.0         | Thanh Vân Môn (sau hội tuyển)                      | Hắc Thạch Cốc (bút ký, thám hiểm), động phủ Lục                       |
    | Công pháp sau trần LK6 | Thanh Vân Dưỡng Khí Quyết (cống hiến)              | Chợ đêm, Hàn Thủy Quyết (Lục), ký ức                                  |
    | Thử Trúc Cơ            | Luôn thử được khi đủ tu vi tầng 9 (không cần đan)  | Trúc Cơ Đan: cống hiến, sự kiện                                       |

  - Chết → tri thức `kiep` bị xóa, tri thức `linh_hon` còn lại.

## S5. Địa điểm & Thám hiểm

- **Mục đích:** gắn cơ duyên với không gian; tạo lựa chọn "ở đâu" (mật độ linh khí, chi phí, rủi ro, sự kiện).
- **Input:** địa điểm hiện tại, tri thức đường đi, hành động Đi đường / Thám hiểm.
- **Output:** đổi địa điểm sau số ngày đi đường; tiến độ thám hiểm 0–100% mỗi nơi; mở điểm con `[CẦN DUYỆT D24]` (đúng 3: hang Lục, mỏ linh thạch, chỗ Diên Thọ Quả; Hắc Phong trại và Động phủ Lục chỉ là cảnh trong chuỗi, không phải địa điểm); bảng sự kiện theo nơi.
- **Điều kiện:** đi đường tốn ngày và sinh hoạt phí, có thể gặp sự kiện đường. Mỗi điểm con mở ở một mốc thám hiểm và/hoặc tri thức. Sinh hoạt phí theo nơi (BALANCE §3). Thám hiểm: **+1% tiến độ mỗi ngày làm việc** (ngày nghỉ không tính) `[CẦN DUYỆT D25]`.
- **Tương tác:** S1, S2, S6, S8 (chạm trán), S9 (D), S4.
- **Tiêu chí kiểm thử:**
  - Đường đi 2 ngày tốn đúng 2 tick và 2 ngày sinh hoạt phí.
  - Không thể tới địa điểm chưa có tri thức đường đi.
  - Thám hiểm 100% → tạm dừng và hiển thị mọi điểm con đã mở.

## S6. Sự kiện nhân quả

- **Mục đích:** nơi lựa chọn và câu chuyện xảy ra; nối hành động với hậu quả.
- **Input:** state hiện tại; RNG có seed; bảng sự kiện dữ liệu.
- **Output:** sự kiện được kích hoạt (tạm dừng nếu là sự kiện lớn); lựa chọn; hệ quả (tài nguyên, cờ, tri thức, thiện cảm, chiến đấu, đổi địa điểm, thọ nguyên).
- **Điều kiện:** sự kiện nhỏ xử lý theo `chinhSachSuKienNho` (S1); lựa chọn tự động được ghi vào Nhật ký kèm tên lựa chọn. Mỗi sự kiện khai báo: `trigger` (địa điểm, hành động, khoảng tuổi, `lich {tuoi, ngayTrongNam}` cho sự kiện cố định, cờ, kỹ năng, thiện cảm, tri thức; định nghĩa kiểu: `docs/technical/EVENT_SCHEMA.md`), `trongSo`, `hoiChieu`, `motLan`, `quanTrong` (lớn/nhỏ), `luaChon[]` (yêu cầu, hệ quả, `macDinhAnToan`). Mỗi tick: lọc sự kiện hợp lệ → xác suất kích hoạt theo hành động (VD Thám hiểm 4%/ngày, Đốn củi 1%/ngày) → chọn theo trọng số. Sự kiện cố định theo lịch (hội tuyển) bỏ qua xác suất.
- **Tương tác:** đọc mọi hệ; ghi vào S2–S12.
- **Tiêu chí kiểm thử:**
  - Cùng seed + cùng chuỗi lựa chọn → cùng chuỗi sự kiện.
  - Sự kiện `motLan` không lặp; `hoiChieu` được tôn trọng.
  - Kiểm thử tĩnh: mọi cờ được đọc trong điều kiện đều được ghi ở ít nhất một hệ quả (không có cờ "mồ côi"); mọi sự kiện lớn đều có ít nhất một lựa chọn không có yêu cầu.
  - Khi `chinhSachSuKienNho = tuDong`, sự kiện nhỏ dùng `macDinhAnToan`, không tạm dừng, và có dòng Nhật ký; sự kiện lớn vẫn tạm dừng.
  - Validator: mọi sự kiện nhỏ có đúng một `macDinhAnToan` không có yêu cầu.

## S7. NPC & Quan hệ

- **Mục đích:** NPC có động cơ, tạo nguyên nhân cho cơ duyên và hậu quả xuyên kiếp.
- **Input:** hệ quả sự kiện, quà, hành động liên quan (học việc với Mộc bá…).
- **Output:** thiện cảm −100…100; cờ ký ức của NPC (`luc_thu_han`…); trạng thái sống/chết; người kế thừa.
- **Điều kiện:** mỗi NPC khai báo trong dữ liệu `namSinh` và `thoNguyen` theo **năm thế giới** (năm 0 = năm kiếp 1 tròn 14 tuổi; WORLD_LORE §3.1) `[CẦN DUYỆT D18]`; chết khi `namTheGioi − namSinh ≥ thoNguyen`. Công thức thọ nguyên PROGRESSION §6 chỉ dành cho người chơi. Thiện cảm chỉ thay đổi qua hệ quả khai báo trong dữ liệu (sự kiện, quà, hành động), không có tăng/giảm ẩn. Mức thiện cảm mở lựa chọn ở 20/40/60/80. Giao Tế tăng thiện cảm nhận được +2%/cấp.
- **Tương tác:** S6 (điều kiện/hệ quả), S12 (đếm NPC thân, bảng kế thừa), S11 (Chấp sự Đỗ).
- **Tiêu chí kiểm thử:**
  - Thiện cảm bị kẹp trong [−100, 100].
  - NPC chết đúng năm thế giới theo dữ liệu; sự kiện yêu cầu NPC sống không kích hoạt sau đó.
  - Validator: mọi NPC mà walkthrough hay chuỗi sự kiện cần ở năm thế giới Y đều còn sống ở năm Y (so `namSinh + thoNguyen` với khoảng năm của chuỗi).
  - Sang kiếp mới: mỗi NPC gốc được thay bằng đúng người kế thừa theo cờ.

## S8. Chiến đấu (tự động, tối giản)

- **Mục đích:** rủi ro của thám hiểm và đỉnh điểm của vài chuỗi; không phải trọng tâm.
- **Input:** chỉ số người chơi (từ kỹ năng, cảnh giới, trang bị), địch (dữ liệu), chiến thuật (Thận trọng / Cân bằng / Liều mạng), pháp thuật đã học, RNG.
- **Output:** thắng / bỏ chạy / thua; Khí huyết còn lại; bị thương; chiến lợi phẩm; (chỉ Liều mạng) chết.
- **Điều kiện:** theo lượt, tối đa 20 lượt. Bỏ chạy khi Khí huyết < 50% (Thận trọng) / 30% (Cân bằng) / không bao giờ (Liều mạng). Thua khi không Liều mạng → Nội thương nặng 120 ngày, mất 30% văn mang theo, **không chết**. Thua khi Liều mạng → chết (Hộ thân phù cứu một lần). Công thức: `BALANCE.md` §6.
- **Liều mạng chỉ có trong trận của sự kiện lớn gắn cả `quanTrong` và `motLan`** `[CẦN DUYỆT D22]` (sửa F06). `motLan` = xảy ra tối đa **một lần mỗi save** (thế giới tiếp diễn, không lặp ở kiếp sau). Chạm trán ngẫu nhiên chỉ cho Thận trọng / Cân bằng. Vì vậy số lần có thể chết bằng Liều mạng bị chặn bởi số trận như vậy trong toàn thế giới (vài trận cho cả save), không lặp được theo ý muốn ở mỗi kiếp như Tự vẫn. Validator: không trận `quanTrong` nào mở được trước LK3.
- **Quy tắc phân xử** `[CẦN DUYỆT D25]` (sửa F10):
  - Thứ tự một lượt: kiểm tra bỏ chạy → người chơi hành động (pháp thuật mạnh nhất nếu đủ Linh lực, nếu không thì đánh thường) → địch hành động.
  - Hết lượt 20 mà chưa phân thắng bại → **rút lui**: không tính thua, không chiến lợi phẩm, không bị thương.
  - Ngoài chiến đấu, Khí huyết hồi 10% tối đa mỗi ngày; vào trận với Khí huyết hiện tại.
  - Linh lực luôn đầy khi bắt đầu trận (tu sĩ điều tức giữa các trận); trong trận không hồi.
- **Tương tác:** S5, S6, S9 (tầng, pháp thuật, Linh lực), S10 (vũ khí, Hộ thân phù), S1 (thời gian hồi phục).
- **Tiêu chí kiểm thử:**
  - Cùng seed → cùng kết quả từng lượt.
  - Không có đường nào dẫn tới chết khi chiến thuật ≠ Liều mạng; chạm trán ngẫu nhiên không cho chọn Liều mạng.
  - Trận tới lượt 20 → rút lui, state chiến lợi phẩm không đổi.
  - Bảng TTK trong BALANCE §6 tái hiện trong ±1 lượt.

## S9. Tu luyện

- **Mục đích:** trục tiến triển chính sau khi nhập đạo; nơi các lựa chọn trung hạn hội tụ.
- **Input:** linh căn, công pháp và thuần thục, Thổ Nạp, địa điểm (D), trạng thái, đan dược, Tâm cảnh, hành động Tu luyện/Đột phá/Bế quan.
- **Output:** tu vi, tầng, thọ nguyên cộng thêm, thuần thục công pháp, Linh lực, Đan Độc, kết quả đột phá.
- **Điều kiện:** chỉ khả dụng khi có tri thức + công pháp. Công thức tu vi và xác suất: PROGRESSION §1–2; **chỉ** các hệ số liệt kê ở PROGRESSION §1 được nhân vào tu vi. Bế quan: hệ số M ×1,10, chỉ sự kiện lớn được kích hoạt, phải có đủ lương khô cho thời gian đặt trước.
- **Quy tắc phân xử** `[CẦN DUYỆT D25]`: nhiều trạng thái cùng lúc → Q lấy giá trị **nhỏ nhất**, không nhân. Đột phá hoàn tất trong một tick → cộng thọ nguyên tầng mới **trước** bước kiểm tra chết của tick đó.
- **Tương tác:** S1, S3, S4, S5, S8, S10 (đan), S11, S12 (cảnh giới cao nhất, cảm ngộ).
- **Tiêu chí kiểm thử:**
  - Bảng ví dụ tu vi/ngày trong PROGRESSION §1 tái hiện chính xác.
  - Đói + Nội thương cùng lúc → Q = 0,5 (không phải 0,25).
  - Đột phá xong đúng tick tuổi = thọ nguyên cũ → không chết.
  - p đột phá không vượt 0.95 (0.80 cho Trúc Cơ); thưởng chuẩn bị không vượt trần.
  - Thất bại trừ đúng tu vi/thọ nguyên; không bao giờ làm tu vi âm hoặc rớt tầng.
  - Không thể đột phá vượt trần công pháp.
  - Tẩu hỏa chỉ xảy ra khi Tâm cảnh Hỗn loạn.

## S10. Vật phẩm, Đan dược, Trang bị

- **Mục đích:** chuyển tiền thành tiến triển; tạo quyết định "dùng hay để dành".
- **Input:** mua/bán, sự kiện, chiến lợi phẩm, chôn/đào di vật.
- **Output:** kho đồ (giới hạn 20 ô `[GIẢ ĐỊNH]`), 2 ô trang bị, buff đan dược, Đan Độc.
- **Điều kiện:** danh sách cố định (PROGRESSION §4, BALANCE §4). Lương khô là vật phẩm tiêu hao theo ngày khi ở nơi không có chợ. Đan Độc ≥ 80 → không thể dùng đan.
- **Quy tắc phân xử** `[CẦN DUYỆT D25]`: dùng đan theo thứ tự (1) kiểm tra Đan Độc < 80 → (2) tính hiệu lực với Đan Độc **trước** khi uống → (3) cộng Đan Độc. Thời hạn buff tính theo **ngày lịch** (mọi tick, kể cả nghỉ và đi đường). Dùng lại cùng loại đan khi buff còn hiệu lực → làm mới thời hạn, không cộng dồn hiệu lực.
- **Tương tác:** S2, S8, S9, S11 (cửa hàng cống hiến), S12 (chôn di vật).
- **Tiêu chí kiểm thử:** hiệu lực đan giảm tuyến tính theo Đan Độc trước khi uống; Đan Độc giảm 0,5/ngày; uống hai viên Tụ Khí Đan liên tiếp → một buff, thời hạn làm mới; mua khi thiếu tiền bị từ chối, không âm tiền.

## S11. Môn phái (thành viên)

- **Mục đích:** con đường an toàn, có cấu trúc, đánh đổi tự do lấy tài nguyên; nguồn Trúc Cơ Đan.
- **Input:** kết quả hội tuyển, hợp đồng tạp dịch, cấp bậc, cống hiến.
- **Output:** địa điểm ngoại môn (D 1.5), thời gian bị chiếm (tạp dịch 60%, ngoại môn 55% `[CẦN DUYỆT D20]`), cống hiến (tạp dịch 1/ngày làm, ngoại môn 0,5/ngày nhiệm vụ; không có linh thạch), cửa hàng, Tàng Kinh Các.
- **Điều kiện:** tạp dịch: hợp đồng 3 năm, bỏ trước hạn → bị xóa tên, mất cống hiến, cấm quay lại 3 năm. Lên ngoại môn: LK4 + 200 cống hiến. Trúc Cơ Đan: LK9 + 600 cống hiến.
- **Tương tác:** S2, S5, S6 (chuỗi Đỗ, vụ cháy), S9, S10.
- **Tiêu chí kiểm thử:** thời gian bị chiếm đúng tỉ lệ trên 360 ngày; điều kiện thăng cấp; cấm quay lại được tôn trọng; tạp dịch nhận sinh hoạt phí 0.

## S12. Luân hồi

- **Mục đích:** biến cái chết thành bước tiến; tiến triển dài hạn bằng hiểu biết.
- **Input:** state lúc chết (cảnh giới cao nhất, cấp kỹ năng cao nhất, NPC thân, chuỗi hoàn thành, tri thức, di vật đã chôn, nguyên nhân chết), lựa chọn ký ức, lựa chọn nâng bậc thiên phú, lựa chọn xuất thân và thiên phú hồn ấn, seed. Lệnh **Tự vẫn** từ menu nhân vật `[ĐÃ DUYỆT D16]`.
- **Output:** state kiếp mới: tuổi 14, xuất thân, linh căn (Hồn dưỡng căn), ký ức đã giữ (tri thức `linh_hon`, hệ số XP, cảm ngộ), 2 ô thiên phú (bẩm sinh + hồn ấn), cờ thế giới, NPC kế thừa, năm thế giới +30 sau khi chết. Dữ liệu xuyên kiếp: danh sách thiên phú đã khắc kèm bậc, cảnh giới cao nhất từng đạt.
- **Điều kiện:**
  - Chỉ khi chết (thọ nguyên, thua "Liều mạng" trong trận của sự kiện lớn, tẩu hỏa nhập ma, hoặc Tự vẫn). Năm thế giới của kiếp mới = năm chết + 30; NPC sống/chết theo S7. Màn hình Vong Xuyên không có thời gian chạy. Tàn Niệm không dùng hết thì mất.
  - Tự vẫn: xác nhận hai bước; bị từ chối khi đang có sự kiện hoặc chiến đấu; Tàn Niệm ×0,5 (làm tròn xuống); đặt cờ `tu_van`.
  - Khắc thiên phú `[ĐÃ DUYỆT D15]`: thiên phú của kiếp vừa kết thúc được khắc nếu kiếp đó sống ≥ 40 tuổi hoặc đạt LK1 **và** không kết thúc bằng Tự vẫn. Nâng bậc: I→II 6, II→III 12 Tàn Niệm; bậc III cần từng đạt LK4. Bậc tối đa III.
- **Tương tác:** đọc mọi hệ; khởi tạo lại S1–S11.
- **Tiêu chí kiểm thử:**
  - Tàn Niệm khớp công thức với state mẫu (ví dụ PROGRESSION §8.2 = 32); cùng state nhưng Tự vẫn → 16.
  - Không thể chọn ký ức hoặc nâng bậc vượt Tàn Niệm.
  - Không còn chỉ số phẳng nào được mang sang ngoài danh sách ký ức và thiên phú đã khắc (kiểm thử: kiếp mới không giữ ký ức → state kỹ năng/tu vi/tiền = mặc định xuất thân).
  - Cùng seed → cùng 3 xuất thân và cùng linh căn.
  - Không khắc thiên phú khi Tự vẫn, khi chết trước 40 tuổi mà chưa đạt LK1; khắc khi đạt một trong hai điều kiện.
  - Không nâng được lên bậc III nếu chưa từng đạt LK4; không vượt bậc III; không chọn hồn ấn trùng thiên phú bẩm sinh ở bậc thấp hơn.
  - Lệnh Tự vẫn bị từ chối khi đang có sự kiện hoặc chiến đấu.
  - Kiểm thử tĩnh dữ liệu thiên phú: hệ số XP ≤ 1,4; thọ nguyên ≤ +5 (BALANCE §9).
  - Kiểm thử khả đạt S4 chạy lại với state đầu kiếp 2 và kiếp 3 xấu nhất.

## S13. Offline & Tích Thời

- **Mục đích:** tôn trọng thời gian người chơi vắng mặt mà không tước quyền quyết định.
- **Input:** thời điểm lưu cuối, thời điểm hiện tại (từ clock được inject), state; lệnh "Dùng Tích Thời".
- **Output:** state sau mô phỏng; báo cáo "trong lúc vắng mặt"; Tích Thời được cộng hoặc tiêu.
- **Điều kiện:** `vắngMặt = min(now − lastSave, 8 giờ)`. Mô phỏng bằng chính engine, từng tick, tới khi hết `vắngMặt` hoặc gặp điểm dừng. Phần còn lại cộng vào Tích Thời (trần 8 giờ). Đồng hồ hệ thống chạy lùi → vắng mặt = 0. "Dùng Tích Thời" `[ĐÃ DUYỆT D06]` chạy cùng đường mô phỏng ngay lập tức với lượng Tích Thời đang có, dừng ở điểm dừng đầu tiên, trừ phần đã chạy.
  - Cùng quy tắc áp cho khoảng máy ngủ mà clock khung hình đứng yên (S1, D28).
  - Tab ẩn **không** phải vắng mặt (S1, D27): không bị trần 8 giờ, và không sinh Tích Thời khi gặp điểm dừng.
  - Chưa chọn danh tính (S1, D32): vắng mặt không sinh Tích Thời.
  - **Chết khi vắng mặt** `[ĐÃ DUYỆT D34 – 2026-10-25]`: giữ offline ≡ online. Cảnh báo 10/5/1 năm là điểm dừng nên vắng mặt luôn dừng trước đó; chỉ chết khi vắng mặt nếu người chơi đã tự bấm qua cảnh báo 1 năm. Phần thời gian còn lại vẫn vào Tích Thời nhưng không dùng được sau khi chết.
- **Tương tác:** S1 (bước tick, tab ẩn, máy ngủ), S6 (điểm dừng), lưu game.
- **Tiêu chí kiểm thử:**
  - Offline N giờ ≡ online N giờ với cùng seed và không có tương tác.
  - Vắng 20 giờ → chỉ 8 giờ được xử lý.
  - Gặp sự kiện lớn ở giờ 1 → dừng, 7 giờ vào Tích Thời.
  - Dùng 7 giờ Tích Thời, gặp điểm dừng sau 2 giờ → còn 5 giờ; state giống hệt chạy 2 giờ online với cùng seed.
  - Thời gian âm → không làm gì.
  - Máy ngủ 9 giờ mà clock khung hình đứng yên → chỉ 8 giờ được xử lý (D28).
  - Tab ẩn gặp điểm dừng → Tích Thời không tăng (D27).
  - Vắng mặt khi chưa chọn danh tính → Tích Thời không tăng (D32).
  - 8 giờ (57 600 tick) mô phỏng dưới 1 giây trên máy tầm trung.

## S14. Lưu game

- **Mục đích:** bảo toàn tiến trình, chống mất dữ liệu.
- **Input/Output:** state ↔ chuỗi JSON trong localStorage; export/import chuỗi.
- **Điều kiện:** một save tự động `[ĐÃ DUYỆT D13]`; lưu mỗi 30 giây thực, khi có sự kiện lớn, khi đóng tab. Save có `version`; tải → kiểm tra cấu trúc → migrate tuần tự → kiểm tra lại. Save hỏng không ghi đè save hợp lệ (ghi vào khóa tạm rồi mới đổi). RNG state nằm trong save.
  - Khoảng 30 giây đo bằng clock khung hình, không bằng đồng hồ hệ thống: chỉnh đồng hồ lùi không làm ngừng autosave.
  - **Autosave khi chạy bù** `[ĐÃ DUYỆT D29 – 2026-10-24]`: khi engine còn tick nợ (S1, D27), autosave được hoãn tới khi bù xong. Lý do: lưu phải hạch toán hết nợ trong một lần, vượt trần mỗi khung hình. Việc hoãn có trần: tối đa 5 lần khoảng autosave (2,5 phút) kể từ lúc bắt đầu bù; quá trần thì vẫn lưu, chấp nhận UI khựng một lần.
  - **Nhiều tab** `[ĐÃ DUYỆT D30 – 2026-10-24]`:
    - Tại một thời điểm chỉ một tab được ghi save (khóa Web Locks).
    - Tab mở sau tạm dừng. Khi tab kia đóng, nó đọc save mới nhất rồi chạy tiếp.
    - Trình duyệt không có Web Locks, hoặc trang không chạy qua HTTPS/localhost: vẫn chơi được nhưng **không ghi gì** vào storage, kể cả bản cách ly save hỏng, và hiện cảnh báo nêu đúng nguyên nhân.
  - Lỗi ghi save (VD hết dung lượng) hiển thị riêng và chỉ mất khi lần ghi sau thành công.
- **Tiêu chí kiểm thử:** round-trip save/load bằng nhau; save version cũ migrate được; JSON hỏng/thiếu trường bị từ chối và save cũ còn nguyên; import chuỗi sai không làm hỏng game; chạy bù 1 giờ → không autosave trước 2,5 phút, tới 2,5 phút thì lưu đủ (D29); tab thứ hai không ghi khi tab đầu còn mở, rồi tiếp tục từ save mới nhất khi tab đầu đóng; không có Web Locks → storage không đổi (D30).
