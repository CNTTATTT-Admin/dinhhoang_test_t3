/**
 * Mock 3 email: 2 hợp lệ, 1 phishing (mức dễ) — dùng trước khi nối API.
 * Cấu trúc khớp VirtualInboxEmailResponse (backend).
 */
export const SURVIVAL_INBOX_MOCK_EMAILS = [
  {
    id: 1,
    senderEmail: 'hr@cybershield-academy.internal',
    senderName: 'Phòng Nhân sự',
    subject: 'Thông báo: Lịch workshop an ninh thông tin tuần tới',
    body: `Chào bạn,

Phòng Nhân sự xin thông báo buổi workshop bắt buộc "Nhận biết email lừa đảo" sẽ diễn ra vào 10:00 thứ Ba tại phòng đào tạo A12.

Không cần phản hồi email này; đăng ký đã được đồng bộ từ hệ thống nội bộ.

Trân trọng,
Phòng Nhân sự`,
    linkUrl: 'https://intranet.cybershield-academy.internal/events/workshop-phishing',
    linkLabel: 'Xem lịch chi tiết (intranet)',
    isPhishing: false,
    redFlags: [],
  },
  {
    id: 2,
    senderEmail: 'security@secure-bank-verify.net',
    senderName: 'Đội ngũ Bảo mật Ngân hàng',
    subject: 'KHẨN CẤP: Tài khoản của bạn sẽ bị khóa trong 24 giờ',
    body: `Kính gửi khách hàng,

Chúng tôi phát hiện đăng nhập bất thường. Bạn phải xác minh danh tính ngay để tránh khóa thẻ và tài khoản.

Nhấn vào liên kết bên dưới và nhập đầy đủ mã OTP, số thẻ và mật khẩu Internet Banking.

Trân trọng,
Bộ phận Bảo mật`,
    linkUrl: 'http://secure-bank-verify.net/login?session=urgent',
    linkLabel: 'Xác minh ngay — không bỏ lỡ',
    isPhishing: true,
    redFlags: [
      'Miền gửi không phải domain chính thức của ngân hàng (đuôi .net lạ, tên gần giống thương hiệu).',
      'Tạo áp lực thời gian ("24 giờ", "KHẨN CẤP") — thủ pháp gây hoảng loạn phổ biến.',
      'Yêu cầu cung cấp mật khẩu và OTP qua một liên kết ngoài cổng đăng nhập chính thức.',
      'Nội dung chung chung, không có tên tài khoản hoặc mã khách hàng cụ thể.',
    ],
  },
  {
    id: 3,
    senderEmail: 'it-helpdesk@cybershield-academy.internal',
    senderName: 'IT Helpdesk',
    subject: 'Nhắc nhở: Đổi mật khẩu theo chính sách 90 ngày',
    body: `Xin chào,

Theo chính sách nội bộ, mật khẩu tài khoản domain của bạn sắp đến hạn đổi (90 ngày).

Vui lòng đăng nhập vào portal IT nội bộ và thực hiện đổi mật khẩu — không bao giờ gửi mật khẩu qua email.

Nếu cần hỗ trợ, mở ticket trên helpdesk.cybershield-academy.internal.

IT Helpdesk`,
    linkUrl: 'https://helpdesk.cybershield-academy.internal/password-policy',
    linkLabel: 'Đọc chính sách mật khẩu',
    isPhishing: false,
    redFlags: [],
  },
]
