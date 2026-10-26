# Bàn giao phiên – 2026-10-25

Đọc file này đầu tiên khi bắt đầu phiên mới (sau `/clear`). Sau đó đọc `IMPLEMENTATION_STATUS.md` và `EVENT_SCHEMA.md`.

## Trạng thái git

- `main` (0bbb425): đã có P1a cùng các sửa `/code-review`. Đã push.
- Nhánh `worktree-p2-design` (đã push, **chưa merge**): bản nháp tài liệu P2 và code P1b (xem `docs/reports/phase/2026-10-25-p1b-economy.md`). Worktree: `.claude/worktrees/p2-design`.
- Nhánh/worktree `feat/p1-character` còn trên máy, đã merge; chờ người dùng quyết giữ hay xóa.

## Đã làm

- P0 `VERIFIED`; P1a và P1b `IMPLEMENTED` (chờ Codex review). A, F, G đã duyệt (GDD D38–D40). Mở: nợ 800 trả sau ~103 ngày, lệch mốc 127 của BALANCE §3.
- Tài liệu P2 hoàn thiện ở mức Draft: `docs/technical/EVENT_SCHEMA.md` (mới), sửa GDD, SYSTEMS, MVP_SCOPE, CORE_LOOP, WORLD_LORE, IMPLEMENTATION_PLAN/STATUS. Báo cáo: `docs/reports/phase/2026-10-25-p2-design-completion.md`.

## Quyết định của người dùng đã ghi vào tài liệu

- D21: mặc định `hoi`; offline và Tích Thời theo giá trị đang lưu; đổi sang `tuDong` thì giải ngay sự kiện nhỏ đang chờ.
- D24: 5 địa điểm + 3 điểm con (hang Lục, mỏ linh thạch, chỗ Diên Thọ Quả); 12 chuỗi = 6 Hồi + 6 trung hạn.
- P2 dùng cờ stub cho thiện cảm; sự kiện Sói dời sang P3.
- Tiêu chí thoát P2 số 3: so `hoi` với `tuDong`. `trigger` = tuổi + ngày trong năm. Nhật ký trong state, 200 dòng, save v3.

## Đang chờ người dùng

1. Hắc Phong trại và Động phủ Lục: cảnh trong chuỗi (đang ghi tạm, `[CHỜ XÁC NHẬN]`) hay địa điểm riêng.
2. Duyệt D21, D24, D26 (các thẻ vẫn là `[CẦN DUYỆT]`; chỉ người dùng được đổi sang đã duyệt, rồi ghi GDD §12).
3. Xử lý lệch tiêu chí thoát P1b (2): sửa mốc BALANCE §3 (~103 ngày) hay sửa tiêu chí.
4. Quyết định merge `worktree-p2-design` vào `main`.
5. Có thêm `.claude/` vào `.gitignore` và ignore của eslint/vitest/prettier không.

## Việc tiếp theo (theo thứ tự đề xuất)

1. Smoke test trình duyệt khối Sinh kế (P1b); sau đó P2 khi D21, D24, D26 được duyệt.
2. Hoàn thiện tài liệu P3 (D18, D22, D25). Vấn đề đã biết: quy tắc "pháp thuật mạnh nhất" của D25 làm hỏng bảng TTK (pháp thuật yếu hơn đánh thường ở LK3); cơ chế bỏ chạy mơ hồ; trận Thiết Bối Lang xảy ra khi còn phàm; thiếu thứ tự RNG, làm tròn, chỉ số địch dùng pháp thuật; "Nội thương nặng 120 ngày" lệch 60 ngày của đột phá; validator `quanTrong` trước LK3 quá rộng; NPC chết ngày 0 của năm `namSinh+thoNguyen` (D18).
3. Hoàn thiện tài liệu P5–P6 (D17, D19, D20): rà chưa đầy đủ. Số học D17 khớp; bước tầng 9 → Trúc Cơ chỉ 3 000 (thấp hơn 7 417 của bước 8→9) cần giải thích; bảng Monte Carlo BALANCE §10.3 chưa tái lập được.

## Quy tắc nhắc lại

- Trả lời tiếng Việt có dấu. Thiết kế trước, code sau; không tự quyết lore/công thức khi chưa duyệt.
- Trước khi báo xong: `npm run lint`, `test`, `build`, `format:check`; báo cáo 5 mục.
- Không push `main`, không force-push, không deploy, không thêm dependency khi chưa hỏi.
