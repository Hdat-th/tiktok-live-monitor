# JSON Contract — TikTok LIVE Monitor → Game Team

Tài liệu mô tả định dạng dữ liệu (payload) mà Backend gửi cho team Game
qua **Socket.io**, để team Game bắt sự kiện và trigger hiệu ứng lên
nhân vật trong game.

## Kết nối

- Giao thức: Socket.io (WebSocket)
- Server: `http://<backend-host>:5000`
- Team Game lắng nghe (subscribe) các event theo tên bên dưới trên
  cùng một socket connection.

## Quy ước chung

- Mọi payload đều là JSON object.
- Trường `room`: username TikTok (uniqueId) của phiên live đang theo dõi —
  dùng để phân biệt khi có nhiều phòng live được theo dõi song song.
- Trường `createTime`: timestamp (epoch millis).
- Các trường có thể `null` nếu TikTok không trả về dữ liệu tương ứng.

---

## 1. Event `CHAT` — Bình luận

Phát khi có người xem gửi bình luận trong phòng live.

```json
{
  "event": "CHAT",
  "room": "tiktok_username",
  "userId": "1234567890123456789",
  "username": "viewer_unique_id",
  "nickname": "Viewer Nickname",
  "comment": "nội dung bình luận",
  "createTime": 1735689600000
}
```

| Field | Type | Mô tả |
|---|---|---|
| userId | string | ID nội bộ TikTok của người bình luận |
| username | string | uniqueId (@handle) của người bình luận |
| nickname | string | Tên hiển thị |
| comment | string | Nội dung bình luận |

**Gợi ý cho Game:** dùng `comment` để match từ khóa (ví dụ lệnh điều
khiển nhân vật), dùng `nickname` để hiển thị tên người gửi lên màn hình.

---

## 2. Event `GIFT` — Quà tặng

Phát khi có người xem tặng quà (bao gồm combo quà đang được gộp).

```json
{
  "event": "GIFT",
  "room": "tiktok_username",
  "userId": "1234567890123456789",
  "username": "viewer_unique_id",
  "nickname": "Viewer Nickname",
  "giftId": 5655,
  "giftName": "Rose",
  "repeatCount": 3,
  "repeatEnd": false,
  "diamondCount": 1,
  "createTime": 1735689600000
}
```

| Field | Type | Mô tả |
|---|---|---|
| giftId | number | ID quà tặng theo TikTok |
| giftName | string | Tên quà (vd: "Rose") |
| repeatCount | number | Số lượng đã tặng trong combo hiện tại (tăng dần khi user giữ combo) |
| repeatEnd | boolean | `true` khi combo đã kết thúc — **Game chỉ nên trigger hiệu ứng khi `repeatEnd === true`** để tránh trigger lặp lại nhiều lần trong 1 combo |
| diamondCount | number | Giá trị quy đổi kim cương của **1 đơn vị** quà (tổng giá trị = `diamondCount * repeatCount`) |

**Gợi ý cho Game:** map `giftId`/`giftName` sang loại hiệu ứng
(buff/debuff) theo bảng cấu hình riêng của team Game; dùng
`diamondCount * repeatCount` để tính độ mạnh của hiệu ứng.

---

## 3. Event `MEMBER_JOIN` — Người vào phòng / Cập nhật viewer

Phát khi có cập nhật số lượng người xem (bao gồm khi có người mới vào phòng).

```json
{
  "event": "MEMBER_JOIN",
  "room": "tiktok_username",
  "viewerCount": 1024,
  "createTime": 1735689600000
}
```

| Field | Type | Mô tả |
|---|---|---|
| viewerCount | number | Tổng số người đang xem tại thời điểm phát event |

> Lưu ý: TikTok không luôn trả về thông tin chi tiết từng người vào
> phòng (username/nickname) qua event này ở chế độ kết nối ẩn danh —
> hiện tại chỉ đảm bảo có `viewerCount`. Nếu Game cần biết **ai** vừa
> vào phòng, cần thảo luận thêm vì đây là giới hạn của
> `tiktok-live-connector` khi không đăng nhập.

---

## 4. Endpoint test (Mock) — dùng để Game team dev không cần chờ live thật

| Method | Endpoint | Broadcast event |
|---|---|---|
| POST | `/api/test-events/chat` | `CHAT` |
| POST | `/api/test-events/gift` | `GIFT` |
| POST | `/api/test-events/member-join` | `MEMBER_JOIN` |

Body của mỗi request test nên theo đúng format field ở trên (trừ
`createTime`, do backend tự gán). Ví dụ gọi test gift:

```
POST /api/test-events/gift
Content-Type: application/json

{
  "room": "demo_room",
  "username": "test_user",
  "nickname": "Test User",
  "giftId": 5655,
  "giftName": "Rose",
  "repeatCount": 1,
  "repeatEnd": true,
  "diamondCount": 1
}
```

## 5. Việc còn mở (cần chốt thêm với team Game)

- [ ] Bảng mapping `giftId` → loại hiệu ứng game cụ thể (buff nào, debuff nào, độ mạnh)
- [ ] Ngưỡng `viewerCount` nào thì trigger hiệu ứng đặc biệt (nếu có)
- [ ] Có cần lọc/chặn từ ngữ không phù hợp trong `comment` trước khi gửi cho Game không