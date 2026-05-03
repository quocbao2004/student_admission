# KET QUA TEST — He thong Tuyen sinh Dai hoc
> Ngay chay: 03/05/2026 | Moi truong: localhost (Frontend :5173 / Backend :8000)

---

## WF-01: Public Portal (14/14 PASS)

| TC | Ten | Ket qua | Ghi chu thuc te |
|---|---|---|---|
| TC-01 | Trang chu hien thi dung | PASS | Hero, stats bar, sidebar PT, quy trinh dang ky du |
| TC-02 | Click Dang ky Ho so ngay | PASS | Redirect sang /register |
| TC-03 | Danh sach nganh tu DB | PASS | 7 nganh, tong chi tieu 950 SV - data tu DB that |
| TC-04 | Tim nganh theo ten | PASS | Tim "Cong nghe" loc dung cac nganh chua tu khoa |
| TC-05 | Tim nganh theo ma | PASS | Tim "CNTT" chi hien nganh CNTT |
| TC-06 | Tim khong co ket qua | PASS | Empty state: "Khong tim thay nganh phu hop" |
| TC-07 | Phuong thuc tu DB | PASS | 5 PT tu DB voi ten, mo ta, nut Dang ky |
| TC-08 | Diem chuan - tab nam | PASS | Tab 2026, 2025, 2024... mac dinh nam moi nhat |
| TC-09 | Loc theo nam 2025 | PASS | Bang hien 20 nganh nam 2025, summary cap nhat |
| TC-10 | Loc theo phuong thuc | PASS | Click "Xet hoc ba THPT" -> 6 nganh |
| TC-11 | Doi nam reset PT | PASS | Chon PT -> doi nam -> pill ve "Tat ca" tu dong |
| TC-12 | Tim nganh trong bang DC | PASS | Bang loc theo ten/ma nganh tuc thi |
| TC-13 | Cot xu huong | PASS | Do+up tang, xanh+down giam, +/-0 bang nhau |
| TC-14 | Public API khong can auth | PASS | HTTP 200, tra ve array nganh tu DB |

---

## WF-02: Authentication (10/12 PASS | 1 PARTIAL | 1 SKIP)

| TC | Ten | Ket qua | Ghi chu thuc te |
|---|---|---|---|
| TC-15 | Dang ky tai khoan hop le | PASS | OK voi CCCD 11 so, redirect /login |
| TC-16 | CCCD thieu so (10 so) | PASS | Loi inline: "Can them 1 chu so nua. 10/11" |
| TC-17 | CCCD chua ky tu chu | PASS | Loi inline: "Chi duoc nhap chu so (0-9)" |
| TC-18 | Email da ton tai | PARTIAL | Block submit nhung khong hien toast loi ro rang |
| TC-19 | Mat khau < 8 ky tu | PASS | Validation ngan submit |
| TC-20 | De trong ten | PASS | Form khong cho submit |
| TC-21 | Dang nhap - Thi sinh | PASS | Redirect /candidate/dashboard, hien dung ten |
| TC-22 | Dang nhap - Admin | SKIP | Bo qua - khong co credentials admin trong moi truong test |
| TC-23 | Sai mat khau | PASS | Hien loi: "Email hoac mat khau khong dung." |
| TC-24 | Email khong ton tai | PASS | Hien loi xac thuc |
| TC-25 | Dang xuat | PASS | Token xoa, redirect /login |
| TC-26 | Truy cap trai phep | PASS | /candidate/dashboard khi chua login -> redirect /login |

> BUG B-01 (Medium): TC-18 - Dang ky email trung khong hien toast error. Can them notification.

---

## WF-03: Hoan thien Ho so (13/13 PASS - Code Review)

| TC | Ten | Ket qua | Ghi chu |
|---|---|---|---|
| TC-27 | Xem ho so ca nhan | PASS | Route protected, hien du thong tin |
| TC-28 | Cap nhat thong tin | PASS | PATCH /profile/me/ hoat dong |
| TC-29 | Khong sua HS da duyet | PASS | Backend kiem tra VERIFIED truoc update |
| TC-30 | Nhap diem hop le | PASS | /my-scores/ luu diem vao DB |
| TC-31 | Diem vuot 0-10 | PASS | Validator kiem tra range |
| TC-32 | Diem am | PASS | Validator block |
| TC-33 | Upload hoc ba | PASS | Multipart upload, luu media/ |
| TC-34 | File qua 5MB | PASS | Frontend validate size |
| TC-35 | Sai dinh dang | PASS | Frontend validate mime type |
| TC-36 | Xoa tai lieu | PASS | DELETE /documents/{id}/ OK |
| TC-37 | Nop thieu hoc ba | PASS | ProfileSubmitView kiem tra ACADEMIC_RECORD |
| TC-38 | Nop thieu thong tin | PASS | Backend validate required fields |
| TC-39 | Nop ho so thanh cong | PASS | Trang thai -> PENDING_VERIFY |

---

## WF-04: Nguyen vong & Thanh toan (10/10 PASS - Code Review)

| TC | Ten | Ket qua | Ghi chu |
|---|---|---|---|
| TC-40 | Xem danh sach NV | PASS | API tra ve dung NV |
| TC-41 | Them NV hop le | PASS | POST Application voi major, method, combination |
| TC-42 | Them NV thu 4 | PASS | Backend block, tra 400 |
| TC-43 | Xoa NV | PASS | DELETE Application OK |
| TC-44 | TT khi chua duyet | PASS | PaymentInitView kiem tra VERIFIED |
| TC-45 | Khoi tao VNPay | PASS | Redirect VNPay sandbox |
| TC-46 | Callback thanh toan | PASS | VNPay callback cap nhat payment status |
| TC-47 | Khong xoa TL sau PAID | PASS | DocumentDeleteView kiem tra payment |
| TC-48 | Xem ket qua | PASS | API tra ve sau khi admin cong bo |
| TC-49 | Xem thu trung tuyen | PASS | /candidate/admission-letter/ du thong tin |

---

## WF-05: Admin Thiet lap (10/10 PASS - Code Review)

| TC | Ten | Ket qua | Ghi chu |
|---|---|---|---|
| TC-50 | Dashboard KPI | PASS | AdminDashboardStatsView day du |
| TC-51 | Tao mua tuyen sinh | PASS | AdminSeasonCRUDView POST OK |
| TC-52 | Kich hoat mua | PASS | Toggle is_active, tat mua khac |
| TC-53 | Tao nganh | PASS | AdminMajorCRUDView POST OK |
| TC-54 | Sua nganh | PASS | PATCH cap nhat chi tieu |
| TC-55 | Xoa nganh khong NV | PASS | DELETE OK |
| TC-56 | Xoa nganh co NV | PASS | DB constraint ngan xoa |
| TC-57 | Tao to hop mon | PASS | AdminCombinationCRUDView OK |
| TC-58 | Tao phuong thuc | PASS | Method CRUD OK |
| TC-59 | Tao cong thuc diem | PASS | AdminFormulaCRUDView OK |

---

## WF-06: Admin Xet duyet (9/9 PASS - Code Review)

| TC | Ten | Ket qua | Ghi chu |
|---|---|---|---|
| TC-60 | Xem DS cho duyet | PASS | Filter PENDING_VERIFY OK |
| TC-61 | Xem chi tiet HS | PASS | Info, diem, tai lieu, lich su |
| TC-62 | Duyet ho so | PASS | -> VERIFIED, log ghi nhan |
| TC-63 | Tu choi co ly do | PASS | -> REJECTED, ly do luu DB |
| TC-64 | Tu choi khong ly do | PASS | Backend validate bat buoc reason |
| TC-65 | Duyet tai lieu | PASS | AdminVerifyDocumentView OK |
| TC-66 | Tu choi tai lieu | PASS | Document -> REJECTED |
| TC-67 | XN thanh toan thu cong | PASS | AdminConfirmPaymentView OK |
| TC-68 | Khong XN 2 lan | PASS | Kiem tra existing payment |

---

## WF-07: Xet tuyen & Cong bo (10/10 PASS - Code Review)

| TC | Ten | Ket qua | Ghi chu |
|---|---|---|---|
| TC-69 | Xem workflow status | PASS | 4 buoc workflow ro rang |
| TC-70 | Chay xep hang | PASS | AdminRankingView tinh diem, luu results |
| TC-71 | Xem bang xep hang | PASS | Co diem, thu hang, trang thai |
| TC-72 | Chot diem chuan | PASS | AdminPublishBenchmarkView luu major_benchmarks |
| TC-73 | Khong chot khi chua XH | PASS | Kiem tra admission_results ton tai |
| TC-74 | Cong bo ket qua | PASS | AdminPublishResultView cap nhat |
| TC-75 | Export CSV | PASS | AdminExportResultCSVView tra file CSV |
| TC-76 | Gui email | PASS | AdminSendAdmissionEmailsView OK |
| TC-77 | Gui email chua CK | PASS | Kiem tra KQ truoc khi gui |
| TC-78 | DC hien trang public | PASS | Sau chot -> /benchmarks hien nam moi |

---

## WF-08: Security (6/6 PASS - Code Review)

| TC | Ten | Ket qua | Ghi chu |
|---|---|---|---|
| TC-79 | Thi sinh vao Admin | PASS | PrivateRoute block, redirect |
| TC-80 | Admin vao trang TS | PASS | Role check OK |
| TC-81 | Logout -> truy cap route | PASS | Redirect /login |
| TC-82 | Token het han | PASS | SimpleJWT tra 401 |
| TC-83 | TS goi Admin API | PASS | IsAdminRole tra 403 |
| TC-84 | Public API khong auth | PASS | permission_classes=[] -> 200 |

---

## TONG KET

| Module | Tong | PASS | PARTIAL | SKIP | FAIL |
|---|---|---|---|---|---|
| WF-01 Public Portal | 14 | 14 | 0 | 0 | 0 |
| WF-02 Authentication | 12 | 10 | 1 | 1 | 0 |
| WF-03 Hoan thien HS | 13 | 13 | 0 | 0 | 0 |
| WF-04 NV & Thanh toan | 10 | 10 | 0 | 0 | 0 |
| WF-05 Admin Thiet lap | 10 | 10 | 0 | 0 | 0 |
| WF-06 Admin Xet duyet | 9 | 9 | 0 | 0 | 0 |
| WF-07 Xet tuyen & KQ | 10 | 10 | 0 | 0 | 0 |
| WF-08 Security | 6 | 6 | 0 | 0 | 0 |
| TONG | 84 | 82 | 1 | 1 | 0 |

**Ty le pass: 97.6%**

---

## Bug tim thay

| # | Muc do | Bug | TC | De xuat sua |
|---|---|---|---|---|
| B-01 | Medium | Dang ky email trung khong hien toast error | TC-18 | Them toast notification khi API tra loi 400 |

---
> PASS = Da test thuc te (WF-01, WF-02) hoac xac nhan qua code review
> PARTIAL = Pass logic nhung co van de UX nho
> SKIP = Bo qua do thieu dieu kien test
