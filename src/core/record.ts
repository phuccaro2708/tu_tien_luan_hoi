/**
 * Đọc khóa riêng của một record. Khóa như "toString", "constructor", "__proto__"
 * không được rơi vào Object.prototype (save/content là dữ liệu chưa tin cậy).
 * Ghi vào record thì dùng spread với computed key (`{ ...r, [k]: v }`) để luôn tạo own property.
 */
export function own<T>(
  record: Readonly<Record<string, T>>,
  key: string,
): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined
}
