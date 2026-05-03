# TEST CASE — Hệ thống Tuyển sinh Đại học
> Phiên bản theo Module & Workflow hoàn chỉnh

---

## MODULE 1 — Public Portal (Không cần đăng nhập)

### WF-01: Duyệt thông tin tuyển sinh

**Mục tiêu:** Thí sinh xem thông tin ngành, phương thức, điểm chuẩn trước khi đăng ký.

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-01 | Trang chủ hiển thị đúng | Truy cập `/` | Hero, thống kê, quy trình, timeline, sidebar hiển thị đầy đủ | P1 | Positive |
| TC-02 | Thống kê trang chủ có dữ liệu | Xem phần Stats trên trang chủ | Số liệu (tổng ngành, chỉ tiêu) không phải 0 hoặc mock | P1 | Positive |
| TC-03 | Xem danh sách ngành | Truy cập `/majors` → chờ load | Danh sách ngành từ DB, hiển thị mã, tên, chỉ tiêu, tổ hợp | P1 | Positive |
| TC-04 | Tìm kiếm ngành theo tên | Nhập "Công nghệ" vào ô tìm | Chỉ hiện ngành chứa "Công nghệ" | P1 | Positive |
| TC-05 | Tìm kiếm ngành theo mã | Nhập "CNTT" | Chỉ hiện ngành có mã "CNTT" | P2 | Positive |
| TC-06 | Tìm kiếm không có kết quả | Nhập "XXXXXXX" | Empty state: "Không tìm thấy ngành phù hợp" | P2 | Negative |
| TC-07 | Xem phương thức xét tuyển | Truy cập `/methods` → chờ load | Danh sách phương thức từ DB, mỗi card có tên, mô tả | P1 | Positive |
| TC-08 | Xem điểm chuẩn — tab năm | Truy cập `/benchmarks` | Tab năm hiển thị đúng năm có trong DB, mặc định năm mới nhất | P1 | Positive |
| TC-09 | Lọc điểm chuẩn theo năm | Click tab "Năm 2025" | Bảng chỉ hiện data năm 2025, summary bar cập nhật | P1 | Positive |
| TC-10 | Lọc điểm chuẩn theo PT | Click pill "Xét học bạ THPT" | Bảng lọc đúng phương thức, số ngành cập nhật | P1 | Positive |
| TC-11 | Đổi năm → reset phương thức | Chọn PT → click tab năm khác | Pill phương thức tự reset về "Tất cả" | P2 | Positive |
| TC-12 | Tìm ngành trong bảng điểm chuẩn | Nhập tên ngành vào ô tìm | Bảng lọc theo tên/mã ngành | P2 | Positive |
| TC-13 | Điểm chuẩn — cột xu hướng | Xem cột "Xu hướng" | Hiện TrendingUp (đỏ) nếu tăng, TrendingDown (xanh) nếu giảm, ±0 nếu bằng | P2 | Positive |
| TC-14 | API Public không cần auth | Gọi `GET /api/admissions/public/majors/` không có token | HTTP 200, data trả về | P1 | Positive |

---

## MODULE 2 — Authentication (Xác thực)

### WF-02: Đăng ký & Đăng nhập

**Mục tiêu:** Người dùng tạo tài khoản và đăng nhập thành công theo đúng vai trò.

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-15 | Đăng ký tài khoản thí sinh | Truy cập `/register` → điền form hợp lệ → Submit | Tài khoản tạo thành công, redirect `/login` | P1 | Positive |
| TC-16 | CCCD sai định dạng (10 số) | Nhập CCCD 10 chữ số → Submit | Lỗi: "CCCD phải đúng 11 số" | P1 | Negative |
| TC-17 | CCCD có ký tự chữ | Nhập "ABC12345678" → Submit | Lỗi: CCCD chỉ chứa chữ số | P1 | Negative |
| TC-18 | Email đã tồn tại | Nhập email đã đăng ký → Submit | Lỗi: "Email đã được sử dụng" | P1 | Negative |
| TC-19 | Mật khẩu < 8 ký tự | Nhập pass "1234" → Submit | Lỗi validation mật khẩu | P1 | Negative |
| TC-20 | Để trống trường bắt buộc | Bỏ trống tên → Submit | Lỗi: "Trường này là bắt buộc" | P1 | Negative |
| TC-21 | Đăng nhập thành công — Thí sinh | Nhập email/pass thí sinh → Submit | Redirect `/candidate/profile`, token lưu vào localStorage | P1 | Positive |
| TC-22 | Đăng nhập thành công — Admin | Nhập email/pass admin → Submit | Redirect `/admin/dashboard` | P1 | Positive |
| TC-23 | Sai mật khẩu | Đúng email, sai mật khẩu → Submit | Lỗi: "Email hoặc mật khẩu không chính xác" | P1 | Negative |
| TC-24 | Email không tồn tại | Nhập email chưa đăng ký → Submit | Lỗi xác thực | P1 | Negative |
| TC-25 | Đăng xuất | Click Đăng xuất | Token bị xóa, redirect `/login` | P1 | Positive |
| TC-26 | Truy cập trang cần auth khi chưa login | Truy cập `/candidate/profile` khi chưa login | Redirect về `/login` | P1 | Negative |

---

## MODULE 3 — Candidate: Hoàn thiện Hồ sơ

### WF-03: Thí sinh hoàn thiện và nộp hồ sơ

**Mục tiêu:** Thí sinh điền đầy đủ thông tin, upload tài liệu, nhập điểm và nộp hồ sơ thành công.

**Điều kiện tiên quyết:** Đã đăng nhập với tài khoản thí sinh.

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-27 | Xem hồ sơ cá nhân | Truy cập `/candidate/profile` | Thông tin cá nhân + trạng thái hồ sơ hiện tại | P1 | Positive |
| TC-28 | Cập nhật thông tin cá nhân | Điền ngày sinh, giới tính, địa chỉ → Lưu | Thông tin cập nhật thành công | P1 | Positive |
| TC-29 | Không sửa được HS đã duyệt | Hồ sơ VERIFIED → thử chỉnh sửa | Thông báo lỗi: không thể chỉnh sửa sau khi duyệt | P1 | Negative |
| TC-30 | Nhập điểm học bạ hợp lệ | Nhập điểm từng môn (0-10) → Lưu | Điểm lưu thành công | P1 | Positive |
| TC-31 | Nhập điểm vượt giới hạn | Nhập điểm = 11 → Lưu | Lỗi: "Điểm không hợp lệ (0-10)" | P1 | Negative |
| TC-32 | Nhập điểm âm | Nhập điểm = -1 → Lưu | Lỗi validation | P1 | Negative |
| TC-33 | Upload học bạ thành công | Chọn file JPG/PDF < 5MB → chọn loại "Học bạ" → Upload | File upload thành công, hiển thị trong danh sách | P1 | Positive |
| TC-34 | Upload file quá 5MB | Chọn file > 5MB → Upload | Lỗi: "Dung lượng file tối đa 5MB" | P1 | Negative |
| TC-35 | Upload sai định dạng | Chọn file .exe → Upload | Lỗi: "Định dạng file không được chấp nhận" | P1 | Negative |
| TC-36 | Xóa tài liệu (chưa thanh toán) | Click xóa tài liệu vừa upload | Tài liệu bị xóa khỏi danh sách | P2 | Positive |
| TC-37 | Nộp hồ sơ thiếu học bạ | Không upload ACADEMIC_RECORD → click Nộp | Lỗi: "Vui lòng tải ảnh học bạ" | P1 | Negative |
| TC-38 | Nộp hồ sơ thiếu thông tin | Chưa điền đầy đủ thông tin → Nộp | Lỗi danh sách trường còn thiếu | P1 | Negative |
| TC-39 | Nộp hồ sơ thành công | Điền đủ thông tin + upload đủ TL → Nộp | Trạng thái chuyển PENDING_VERIFY | P1 | Positive |

---

## MODULE 4 — Candidate: Nguyện vọng & Thanh toán

### WF-04: Đăng ký nguyện vọng và thanh toán

**Điều kiện tiên quyết:** Hồ sơ đã được Admin duyệt (VERIFIED).

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-40 | Xem danh sách nguyện vọng | Truy cập trang nguyện vọng | Danh sách NV hiện tại (nếu có) | P1 | Positive |
| TC-41 | Thêm nguyện vọng hợp lệ | Chọn ngành + phương thức + tổ hợp → Thêm | NV được thêm, hiển thị trong DS, có thứ tự ưu tiên | P1 | Positive |
| TC-42 | Thêm NV thứ 4 (vượt giới hạn) | Đã có 3 NV → thêm tiếp | Lỗi: "Tối đa 3 nguyện vọng" | P1 | Negative |
| TC-43 | Xóa nguyện vọng | Click xóa NV → xác nhận | NV bị xóa, thứ tự các NV còn lại tự cập nhật | P2 | Positive |
| TC-44 | Thanh toán khi chưa duyệt | Hồ sơ PENDING_VERIFY → thử thanh toán | Lỗi: "Hồ sơ chưa được duyệt" | P1 | Negative |
| TC-45 | Khởi tạo thanh toán VNPay | Click Thanh toán → chọn VNPay | Redirect đến cổng thanh toán VNPay | P1 | Positive |
| TC-46 | Callback thành công | Hoàn tất trên cổng VNPay | Payment SUCCESS lưu DB, trạng thái hồ sơ cập nhật PAID | P1 | Positive |
| TC-47 | Không upload/xóa sau khi PAID | Sau khi thanh toán → thử xóa tài liệu | Lỗi: "Không thể thay đổi sau khi thanh toán" | P1 | Negative |
| TC-48 | Xem kết quả xét tuyển | Admin đã công bố → thí sinh vào trang kết quả | Hiển thị Trúng tuyển/Không trúng tuyển + ngành + điểm | P1 | Positive |
| TC-49 | Xem thư trúng tuyển | Click xem Thư trúng tuyển | Thư trúng tuyển hiển thị với thông tin ngành, năm, đợt | P2 | Positive |

---

## MODULE 5 — Admin: Thiết lập & Danh mục

### WF-05: Admin thiết lập hệ thống tuyển sinh

**Điều kiện tiên quyết:** Đăng nhập tài khoản admin.

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-50 | Dashboard hiển thị KPI | Truy cập `/admin/dashboard` | Hiển thị: tổng hồ sơ, đã duyệt, chờ duyệt, doanh thu, biểu đồ | P1 | Positive |
| TC-51 | Tạo mùa tuyển sinh | Seasons → Thêm → nhập năm/đợt/tên → Lưu | Mùa mới hiển thị trong danh sách | P1 | Positive |
| TC-52 | Kích hoạt mùa tuyển sinh | Click toggle is_active | Mùa active, các mùa cùng năm tự tắt | P1 | Positive |
| TC-53 | Tạo ngành đào tạo | Catalogs → Ngành → Thêm → lưu | Ngành mới hiển thị trong DS | P1 | Positive |
| TC-54 | Sửa ngành (chỉ tiêu) | Click Edit ngành → sửa chỉ tiêu → Lưu | Chỉ tiêu được cập nhật | P1 | Positive |
| TC-55 | Xóa ngành không có NV | Click Delete ngành chưa có NV | Ngành bị xóa khỏi DB | P2 | Positive |
| TC-56 | Xóa ngành có NV | Xóa ngành đang có NV đăng ký | Lỗi: "Không thể xóa ngành đang có nguyện vọng" | P1 | Negative |
| TC-57 | Tạo tổ hợp môn | Thêm tổ hợp với đúng 3 môn → Lưu | Tổ hợp được tạo | P2 | Positive |
| TC-58 | Tạo phương thức xét tuyển | Thêm PT mới → nhập tên, mô tả → Lưu | PT mới hiển thị trong DS | P2 | Positive |
| TC-59 | Tạo công thức điểm | Thêm ScoreFormula gán PT + tổ hợp → Lưu | Công thức được lưu, thí sinh dùng được | P2 | Positive |

---

## MODULE 6 — Admin: Xét duyệt Hồ sơ

### WF-06: Admin xét duyệt hồ sơ thí sinh

**Điều kiện tiên quyết:** Có hồ sơ ở trạng thái PENDING_VERIFY.

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-60 | Xem danh sách hồ sơ chờ duyệt | Verifications → lọc PENDING_VERIFY | Hiển thị đúng các hồ sơ chờ duyệt | P1 | Positive |
| TC-61 | Xem chi tiết hồ sơ | Click vào hồ sơ thí sinh | Thông tin cá nhân, điểm, tài liệu (ảnh), lịch sử thao tác | P1 | Positive |
| TC-62 | Duyệt hồ sơ | Click "Duyệt hồ sơ" | Trạng thái chuyển VERIFIED, ghi log | P1 | Positive |
| TC-63 | Từ chối hồ sơ có lý do | Click "Từ chối" → nhập lý do → Xác nhận | Trạng thái REJECTED, lý do lưu vào DB | P1 | Positive |
| TC-64 | Từ chối không có lý do | Click "Từ chối" → để trống lý do → Xác nhận | Lỗi: "Vui lòng nhập lý do từ chối" | P1 | Negative |
| TC-65 | Duyệt tài liệu | Click Duyệt tài liệu từng file | Trạng thái TL chuyển VERIFIED | P1 | Positive |
| TC-66 | Từ chối tài liệu | Click Từ chối TL → nhập lý do | Trạng thái TL chuyển REJECTED | P1 | Positive |
| TC-67 | Xác nhận thanh toán thủ công | Click Xác nhận thanh toán thủ công | Payment SUCCESS lưu DB | P1 | Positive |
| TC-68 | Không xác nhận 2 lần | Đã có payment SUCCESS → xác nhận lại | Lỗi: "Đã xác nhận thanh toán trước đó" | P1 | Negative |

---

## MODULE 7 — Admin: Xét tuyển & Công bố kết quả

### WF-07: Admin chạy xét tuyển → công bố → gửi email

**Điều kiện tiên quyết:** Có thí sinh đã PAID, đã đăng ký NV.

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-69 | Xem trạng thái workflow | Admissions → chọn ngành | Hiển thị 4 bước workflow và trạng thái từng bước | P1 | Positive |
| TC-70 | Chạy lọc/xếp hạng ảo | Click "Chạy xếp hạng" | DS thí sinh được xếp theo điểm, lưu admission_results | P1 | Positive |
| TC-71 | Xem bảng xếp hạng | Sau khi chạy → xem DS | DS có điểm, thứ hạng, trạng thái dự kiến | P1 | Positive |
| TC-72 | Chốt điểm chuẩn | Click "Chốt điểm chuẩn" | Điểm chuẩn tự tính và lưu vào major_benchmarks | P1 | Positive |
| TC-73 | Không chốt điểm khi chưa xếp hạng | Chưa chạy xếp hạng → click Chốt | Lỗi: "Chưa có dữ liệu xếp hạng" | P1 | Negative |
| TC-74 | Công bố kết quả | Click "Công bố kết quả" | Trạng thái thí sinh cập nhật RESULT_PUBLISHED | P1 | Positive |
| TC-75 | Export CSV DS trúng tuyển | Click Export CSV chọn ngành | File CSV tải về đúng DS thí sinh trúng tuyển | P2 | Positive |
| TC-76 | Gửi email thông báo kết quả | Click "Gửi email" sau công bố | Email gửi đến thí sinh, ghi log | P2 | Positive |
| TC-77 | Gửi email khi chưa công bố | Chưa công bố → click Gửi email | Lỗi: "Chưa có kết quả để gửi" | P1 | Negative |
| TC-78 | Điểm chuẩn hiển thị trang public | Sau chốt → vào `/benchmarks` | Điểm chuẩn năm mới xuất hiện trong bảng | P1 | Positive |

---

## MODULE 8 — Security & Phân quyền

### WF-08: Kiểm tra bảo mật và phân quyền

| TC | Tên | Bước thực hiện | Kết quả mong đợi | P | Loại |
|---|---|---|---|---|---|
| TC-79 | Thí sinh truy cập trang Admin | Login thí sinh → truy cập `/admin/dashboard` | Bị chặn, redirect về `/candidate/profile` | P1 | Negative |
| TC-80 | Admin truy cập trang Thí sinh | Login admin → truy cập `/candidate/profile` | Bị chặn, redirect về `/admin/dashboard` | P1 | Negative |
| TC-81 | Truy cập route cần auth khi logout | Logout → truy cập `/candidate/profile` | Redirect về `/login` | P1 | Negative |
| TC-82 | Token hết hạn | Dùng token cũ (>1 ngày) để gọi API | HTTP 401 Unauthorized | P1 | Negative |
| TC-83 | Thí sinh gọi Admin API | Token thí sinh gọi `GET /api/admissions/admin/profiles/` | HTTP 403 Forbidden | P1 | Negative |
| TC-84 | Public API không cần auth | Gọi `/api/admissions/public/majors/` không có token | HTTP 200, data trả về | P1 | Positive |

---

## Tóm tắt thống kê

| Module | Số TC | P1 | P2 | Positive | Negative |
|---|---|---|---|---|---|
| WF-01: Public Portal | 14 | 10 | 4 | 12 | 2 |
| WF-02: Authentication | 12 | 12 | 0 | 5 | 7 |
| WF-03: Hoàn thiện HS | 13 | 12 | 1 | 8 | 5 |
| WF-04: NV & Thanh toán | 10 | 8 | 2 | 7 | 3 |
| WF-05: Thiết lập Admin | 10 | 7 | 3 | 9 | 1 |
| WF-06: Xét duyệt HS | 9 | 9 | 0 | 7 | 2 |
| WF-07: Xét tuyển & KQ | 10 | 8 | 2 | 7 | 3 |
| WF-08: Security | 6 | 6 | 0 | 1 | 5 |
| **Tổng** | **84** | **72** | **12** | **56** | **28** |
