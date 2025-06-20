# SSL 证书目录

在生产环境中，请将以下文件放置在此目录：

- `fullchain.pem` - SSL 证书链
- `privkey.pem` - SSL 私钥

## 如何获取 SSL 证书

### 方法 1: Let's Encrypt (推荐)

使用 [certbot](https://certbot.eff.org/) 工具获取免费的 Let's Encrypt 证书：

```bash
# 安装 certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 证书文件将保存在 /etc/letsencrypt/live/yourdomain.com/ 目录下
# 将它们复制到此目录
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./fullchain.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./privkey.pem
```

### 方法 2: 自签名证书 (仅用于测试)

```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout privkey.pem -out fullchain.pem
```

注意：自签名证书会导致浏览器显示安全警告，不应在生产环境中使用。 