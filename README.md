# dsh-text-stats

Plugin độc lập cho DeepSeek Harness, cung cấp công cụ `text_stats` để đếm ký tự, từ và dòng trong chuỗi văn bản. Package dùng JavaScript ESM và không cần build.

## Cài vào Web để thử

Cần Node.js `^22.19.0 || >=24.0.0`, pnpm và DeepSeek Harness có `@deepseek-ai/dsh-tools` phiên bản `0.2.0-rc.2`, Cordis `4.0.4`. Để gửi yêu cầu cho AI, profile Web cần được cấu hình model và thông tin xác thực.

Clone repo, rồi cài thư mục local vào profile Web:

```powershell
git clone https://github.com/thanhphu25/dsh-text-stats.git
dsh plugin --profile web add ./dsh-text-stats
dsh web
```

Nếu chạy Harness từ source, clone plugin vào thư mục gốc checkout Harness và thay hai lệnh `dsh` bằng:

```powershell
pnpm dsh plugin --profile web add ./dsh-text-stats
pnpm dsh web
```

Trong Web, gửi: `Hãy dùng công cụ text_stats để đếm văn bản "Hello world".` Kết quả công cụ:

```text
characters=11, words=2, lines=1
```

Bundle được lưu trong profile; các lần khởi động sau không cần truyền `--patch`. Để gỡ:

```powershell
dsh plugin --profile web remove dsh-text-stats
```

Khởi động lại profile sau khi cài hoặc gỡ nếu thay đổi chưa áp dụng vào phiên đang chạy.

## Cách đếm

Tham số `text` bắt buộc là chuỗi; kết quả là chuỗi có định dạng `characters=N, words=N, lines=N`, được gửi về AI dưới dạng nội dung văn bản.

| Trường | Ý nghĩa |
|---|---|
| `characters` | Số Unicode code point, bao gồm khoảng trắng và ký tự xuống dòng. Emoji ghép và chữ có dấu kết hợp có thể gồm nhiều code point. |
| `words` | Số nhóm ký tự phân cách bằng khoảng trắng, tab hoặc xuống dòng. Với tiếng Việt, cách này thường đếm tiếng, không phân tích từ theo nghĩa ngôn ngữ. |
| `lines` | Số phần khi tách bằng LF (`\n`) hoặc CRLF (`\r\n`). Dấu xuống dòng ở cuối tạo thêm một dòng rỗng; CR đơn không tách dòng. |

Chuỗi rỗng trả về cả ba giá trị bằng `0`. Công cụ không đọc file, không ghi file và không gọi mạng. Tham số thiếu hoặc sai kiểu bị bộ kiểm tra của `defineTool` từ chối. Công cụ tự gỡ đăng ký khi plugin unload.

## Cấu trúc

```text
dsh-text-stats/
├── package.json
├── cordis.patch.yml
├── index.js
├── README.md
├── .gitignore
└── test/
    └── text-stats.test.js
```

`package.json` khai báo bundle qua `dsh.bundle.patch`; `cordis.patch.yml` nạp package `dsh-text-stats`; `index.js` đăng ký công cụ. Các dependency dùng chung với Harness nằm trong `peerDependencies`; `devDependencies` phục vụ kiểm tra độc lập.

## Kiểm tra khi phát triển

Khi các phiên bản dependency trên có sẵn trong registry đang dùng, chạy trong thư mục plugin:

```powershell
pnpm install
pnpm test
```

Nếu đặt repo bên trong checkout Harness có pnpm workspace, dùng `pnpm --ignore-workspace install` và `pnpm --ignore-workspace test`. Nếu phiên bản Harness này chưa được phát hành lên registry, dùng các package đã build từ checkout tương ứng để kiểm tra.

Các test nạp plugin vào Cordis với registry công cụ thật, kiểm tra Unicode, khoảng trắng, LF/CRLF, tham số sai, nội dung trả cho AI và việc gỡ đăng ký. Chúng không gọi model hay cần API key.
