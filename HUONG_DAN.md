# Form M8 cho người tham gia tự làm: hướng dẫn cài đặt

Gồm 2 file: `Code.gs` (lưu kết quả vào Google Sheet) và `index.html` (trang người tham gia mở). Trang được host trên GitHub Pages; Apps Script chỉ làm nhiệm vụ nhận câu trả lời và ghi vào Sheet. Hình trong trang dựng lại đúng từ code M8-02 và M8-03 của `05_beyond_flat.ipynb` (plotly 7.1.0, plotly.js 4.1.1, dữ liệu `network_edges.csv` năm 2024), chỉ khác là tiêu đề hình chuyển ra ngoài khung vẽ để hình vừa màn hình laptop mà không phải cuộn.

## 1. Cài đặt (một người làm, khoảng 10 phút)

### 1a. Apps Script (nơi lưu câu trả lời)

1. Tạo một Google Sheet mới trong thư mục nhóm, đặt tên `M8_ket_qua_tu_lam`.
2. Trong Sheet: **Tiện ích mở rộng > Apps Script**.
3. Xóa toàn bộ nội dung `Code.gs` có sẵn, dán nội dung file `Code.gs`. Bấm Lưu.
4. **Triển khai > Tùy chọn triển khai mới**. Chọn loại **Ứng dụng web**:
   - Thực thi với tư cách: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai** (bắt buộc, nếu không trang trên GitHub không gửi được dữ liệu)
5. Bấm Triển khai, cấp quyền cho tài khoản của bạn. Nếu Google báo "ứng dụng chưa được xác minh", chọn Nâng cao > Đi tới dự án (an toàn vì đây là script của chính bạn).
6. Sao chép **URL ứng dụng web** (kết thúc bằng `/exec`).

### 1b. Gắn URL vào trang trên GitHub

1. Mở `index.html` trong repo GitHub, tìm dòng `const API_URL = "";`.
2. Dán URL `/exec` vào giữa hai dấu ngoặc kép, ví dụ `const API_URL = "https://script.google.com/macros/s/.../exec";`. Commit.
3. Sau khoảng 1 phút, link GitHub Pages (dạng `https://<tài-khoản>.github.io/<tên-repo>/`) là đường link gửi cho người tham gia.

Khi `API_URL` để trống, trang vẫn chạy được nhưng ở chế độ thử: mã có dạng `THU-xxxx` và không lưu gì.

(Cách cũ vẫn dùng được: thêm tệp HTML tên `Index` trong Apps Script, dán `index.html` vào, rồi dùng thẳng link `/exec`. Trang tự nhận ra đang chạy trong Apps Script.)

## 2. Chạy thử trước khi mời người thật

1. Mở link GitHub Pages trong cửa sổ ẩn danh trên laptop, làm hết một lượt.
2. Kiểm tra Sheet đã có 2 trang tính `sessions` (1 dòng) và `responses` (6 dòng).
3. **Xóa các dòng thử** ở cả 2 trang tính (giữ dòng tiêu đề), để mã người tham gia thật bắt đầu từ S001.
4. Ghi lại lượt thử vào mục 10 (chạy thử) của `m8_protocol.md`.

## 3. Mời người tham gia

- Chỉ mời người ngoài Nhóm 02. Gửi link riêng cho từng người, dặn: làm trên máy tính có chuột hoặc bàn di, một lần, một mình, không mở tab khác.
- Giữ một sổ mời riêng (ngày gửi, kênh gửi). Sổ này không đưa tên vào bài nộp; chỉ dùng để trả lời giảng viên nếu được hỏi.
- Nên dừng ở số người hoàn tất là số chẵn (6, 8 hoặc 10).
- Trang tự cấp mã S001, S002… và tự chọn thứ tự bản: thứ tự nào ít người hơn thì được chọn, bằng nhau thì bốc thăm. Phiên bỏ dở quá 40 phút không được tính khi cân bằng.

## 4. Lấy dữ liệu cho notebook

- Trang tính `responses`: **Tệp > Tải xuống > CSV**, lưu thành `evidence/tests/m8_results_raw.csv`.
- 20 cột đầu trùng `RESULT_COLS` của notebook. 6 cột sau là thông tin riêng của bản tự làm: `answer_source` (đọc trên hình, nhớ từ hình trước, đoán), `hover_count`, `view_changes` (số lần xoay, phóng to), `left_page` (số lần rời trang trong lúc trả lời), `mode`, `app_version`.
- Cột `pointed` để trống ở bản tự làm; dùng `answer_source` thay cho nó.
- Cột `note` tự ghi các trường hợp cần xem lại: rời trang, trả lời dưới 2 giây, trình duyệt đã có người làm.

## 5. Bảo vệ dữ liệu

- Trang tính `contacts` chỉ có ngày và liên hệ người tham gia tự nguyện để lại, không có mã, nên không nối được với câu trả lời. Không đưa trang này vào bài nộp; xóa sau khi môn học kết thúc.
- Không chia sẻ Sheet ra ngoài nhóm.

## 6. Nếu cần sửa trang

- Sửa `index.html` (giao diện, câu hỏi, hình): chỉ cần commit lên GitHub, link giữ nguyên.
- Sửa `Code.gs`: dán lại vào Apps Script, rồi **Triển khai > Quản lý các lần triển khai > Chỉnh sửa (biểu tượng bút) > Phiên bản: Phiên bản mới > Triển khai**. Làm như vậy thì URL `/exec` giữ nguyên, không phải sửa `API_URL`. Nếu tạo "Tùy chọn triển khai mới" thì URL đổi và phải cập nhật `API_URL`.
- Đổi câu hỏi hoặc hình sau khi đã có người làm thì phải bắt đầu lại từ đầu.
- Repo GitHub là công khai: ai cũng xem được code và URL `/exec`, nhưng **không** xem được Sheet. Không đưa dữ liệu kết quả lên repo.
