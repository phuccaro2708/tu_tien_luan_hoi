# Quy tắc dự án – Tu Tiên Luân Hồi

Web 2D Incremental RPG chủ đề tu tiên. Stack: Vite, React, TypeScript strict, Zustand, Vitest, ESLint, Prettier, CSS thuần. File này là nguồn quy tắc duy nhất cho mọi AI tham gia dự án.

## 1. Vai trò

| AI          | Vai trò                        | Được làm                                                                                           | Không được làm                                                      |
| ----------- | ------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Claude Code | Lead Developer, Game Designer  | Viết GDD và tài liệu kỹ thuật, triển khai gameplay theo GDD đã duyệt, viết test, sửa lỗi           | Triển khai ngoài GDD đã duyệt, deploy production                    |
| Codex       | Independent Technical Reviewer | Review code và kiến trúc, chạy test/lint/build, viết báo cáo review, hỗ trợ kỹ thuật khi được giao | Sửa `src/`, `tests/`, `docs/design/` khi chưa được giao file cụ thể |
| Antigravity | Browser QA, UX Playtester      | Chạy bản dev/preview trên trình duyệt, playtest, ghi bug và nhận xét UX                            | Sửa code hoặc tài liệu thiết kế                                     |

Người dùng (chủ dự án) là người duy nhất phê duyệt GDD, cho phép thêm dependency và deploy production.

## 2. Quyền sở hữu file – không sửa chồng chéo

Mỗi đường dẫn chỉ có một AI được ghi tại một thời điểm.

| Đường dẫn                                                                           | Chủ sở hữu                     |
| ----------------------------------------------------------------------------------- | ------------------------------ |
| `src/`, `tests/`, `public/`, `scripts/`                                             | Claude Code                    |
| `docs/design/`, `docs/technical/`, `docs/reports/phase/`                            | Claude Code                    |
| Cấu hình gốc (`package.json`, `tsconfig*`, `vite.config.ts`, `eslint.config.js`, …) | Claude Code                    |
| `docs/reports/review/`                                                              | Codex                          |
| `docs/reports/qa/`                                                                  | Antigravity                    |
| `AGENTS.md`, `CLAUDE.md`                                                            | Chỉ sửa khi người dùng yêu cầu |

- Reviewer và QA không sửa trực tiếp file của Claude Code. Phát hiện lỗi thì ghi vào báo cáo; Claude Code sửa.
- Nếu người dùng giao cho Codex sửa một file cụ thể, quyền ghi file đó chuyển sang Codex cho đến khi Codex báo xong. Claude Code không sửa file đó trong thời gian này.
- Không để hai AI cùng ghi file trên một thư mục làm việc cùng lúc. Dùng branch/worktree riêng hoặc làm tuần tự.

## 3. Giới hạn chung

- **Không viết gameplay ngoài GDD đã duyệt.** GDD nằm trong `docs/design/`, mỗi tài liệu ghi rõ trạng thái `Draft` hoặc `Approved` kèm ngày duyệt. Lore, công thức, số liệu cân bằng và hệ thống gameplay chỉ được triển khai khi đã `Approved`. Muốn mở rộng phạm vi phải xin phép người dùng.
- **Không tự ý thêm dependency.** Ưu tiên API chuẩn và dependency sẵn có. Nếu thật sự cần, hỏi người dùng trước và ghi lý do vào báo cáo phase.
- **Không tự deploy production.** Chỉ build (`npm run build`) và preview cục bộ. Deploy Cloudflare Pages do người dùng thực hiện.
- **Không dùng API hay dịch vụ trả phí.** MVP không có backend, chỉ là static build.

## 4. Quy tắc kỹ thuật

- **TypeScript strict.** Không tắt `strict`; không dùng `any` nếu không có comment giải thích.
- **Tách engine khỏi UI.** `src/core`, `src/systems`, `src/data`, `src/types` không import React, DOM hay Zustand. UI (`src/components`, `src/pages`, `src/hooks`) chỉ đọc state và gửi action.
- **Single source of truth.** Toàn bộ game state nằm trong một store. UI không giữ bản sao state gameplay và không mutate state trực tiếp; mọi thay đổi đi qua action/hàm của engine.
- **Clock tập trung, mô phỏng tất định.** Thời gian đi vào engine qua một clock duy nhất được inject (thay được bằng fake clock trong test). Mô phỏng chạy theo bước thời gian cố định. Engine không gọi trực tiếp `Date.now()`, `performance.now()` hay `Math.random()`; ngẫu nhiên dùng RNG có seed lưu trong state.
- **Không phụ thuộc FPS.** `requestAnimationFrame` chỉ dùng để render. Cùng một khoảng thời gian trôi qua phải cho cùng kết quả, bất kể tốc độ khung hình hay tab bị ẩn.
- **Data-driven.** Nội dung game (cảnh giới, kỹ năng, vật phẩm, kẻ địch, …) định nghĩa dưới dạng dữ liệu trong `src/data`, không hard-code trong logic.
- **Save có version và validation.** Save mang trường `version`; khi load phải validate cấu trúc, migrate từ version cũ, và từ chối dữ liệu hỏng mà không ghi đè save hợp lệ đang có.
- **Offline progression có giới hạn.** Thời gian offline được tính qua cùng engine mô phỏng và bị chặn bởi một mức trần do GDD quy định.
- **Unit test cho logic quan trọng.** Engine, công thức, save/load, migration và offline progression phải có test trong `tests/unit` (test tích hợp trong `tests/integration`). Test dùng clock và seed cố định.

Các quy tắc trên chỉ quy định cơ chế. Mọi con số cụ thể (tick rate, trần offline, công thức) thuộc về GDD hoặc tài liệu trong `docs/technical/`.

## 5. Quy trình theo phase

1. Claude Code viết hoặc cập nhật GDD/tài liệu kỹ thuật → người dùng duyệt.
2. Claude Code triển khai phần đã duyệt kèm test.
3. Claude Code chạy kiểm tra và báo cáo phase.
4. Codex review, ghi báo cáo vào `docs/reports/review/`.
5. Antigravity playtest trên trình duyệt (`npm run dev` hoặc `npm run preview`), ghi báo cáo vào `docs/reports/qa/`.
6. Claude Code xử lý phản hồi; người dùng quyết định chuyển phase.

Lệnh kiểm tra bắt buộc trước khi báo cáo:

```bash
npm run lint
npm run test
npm run build
npm run format:check
```

## 6. Mẫu báo cáo

Sau mỗi phase (và mỗi lượt review/QA), báo cáo gồm 5 mục:

1. **File thay đổi** – danh sách đường dẫn.
2. **Tóm tắt công việc** – đã làm gì, theo mục nào của GDD.
3. **Kết quả test/lint/build** – kết quả thật của từng lệnh; lệnh nào bị bỏ qua phải nêu lý do.
4. **Vấn đề còn lại** – bug, nợ kỹ thuật, câu hỏi chưa giải quyết.
5. **Đề xuất bước tiếp theo.**

Báo cáo trực tiếp trong phiên làm việc. Khi cần lưu lại, ghi file Markdown vào thư mục báo cáo của mình, đặt tên `YYYY-MM-DD-<chủ-đề>.md`.
