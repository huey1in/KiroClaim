<p align="center">
  <img src="static/apple-touch-icon.png" width="96" height="96" alt="KiroClaim 图标">
</p>

<h1 align="center">KiroClaim</h1>

<p align="center">一个轻量的 Kiro 账号发卡、兑换与管理系统。</p>

<p align="center">
  <img alt="GitHub Tag" src="https://img.shields.io/github/v/tag/huey1in/KiroClaim?label=tag&sort=semver">
  <img alt="Go" src="https://img.shields.io/badge/Go-1.24-00ADD8?logo=go&logoColor=white">
  <img alt="Gin" src="https://img.shields.io/badge/Gin-HTTP-00ADD8">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Dev-003B57?logo=sqlite&logoColor=white">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-Prod-4479A1?logo=mysql&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white">
</p>

## 项目简介

KiroClaim 面向 Kiro 账号发卡兑换场景，提供账号导入、上游健康检查、卡密生成、客户端兑换、管理员初始化、系统配置和日志记录等功能。

本地开发默认使用 SQLite，生产环境推荐使用 MySQL。管理员账号、JWT 密钥和账号凭证加密密钥都通过初始化流程生成。

## 功能特性

- 首次启动引导创建管理员账号
- 本地环境检测与初始化确认
- Kiro 账号导入、刷新 token、用量检查、模型列表检查
- 导入与发货时进行上游健康检查，403 判定为封禁
- 卡密生成与兑换，支持 SSE 流式发货
- 管理后台设置项写入 KV 表
- SQLite 开发环境，MySQL 生产环境
- 文件日志与日志切片配置
- Docker / Docker Compose 部署

## 本地运行

```bash
cp .env.example .env
go mod download
go run .
```

默认访问：

- 初始化页面：`http://127.0.0.1:9527/setup`
- 管理后台：`http://127.0.0.1:9527/`
- 兑换中心：`http://127.0.0.1:9527/redeem`

## Docker 部署

镜像地址：

```text
ghcr.io/huey1in/kiroclaim:latest
```

一行部署：

```bash
docker run -d --name kiroclaim --restart unless-stopped -p 9527:9527 -e GIN_MODE=release -e DB_TYPE=sqlite -e DB_PATH=/app/data/app.db -v kiroclaim-data:/app/data -v kiroclaim-logs:/app/logs ghcr.io/huey1in/kiroclaim:latest
```

启动后访问：

- 初始化页面：`http://服务器IP:9527/setup`
- 兑换中心：`http://服务器IP:9527/redeem`

如果使用 Docker Compose：

```bash
cp .env.example .env
docker compose pull
docker compose up -d
```

默认运行路径：

- SQLite 数据库：`./data/app.db`
- 日志目录：`./logs`
- 服务端口：`9527`

生产环境使用 MySQL 时，修改 `.env`：

```env
DB_TYPE=mysql
DB_DSN=kiroclaim:change_me@tcp(mysql-host:3306)/kiroclaim?charset=utf8mb4&parseTime=True&loc=Local
```

手动拉取最新镜像：

```bash
docker pull ghcr.io/huey1in/kiroclaim:latest
```

发布版本会同时生成对应 tag 镜像，例如：

```bash
docker pull ghcr.io/huey1in/kiroclaim:v0.1.0
```

## 二进制资源包

每个 `v*` 版本 tag 会自动发布 GitHub Release，并附带：

- `KiroClaim_<version>_linux_amd64.tar.gz`
- `KiroClaim_<version>_linux_arm64.tar.gz`
- `KiroClaim_<version>_windows_amd64.zip`
- `KiroClaim_<version>_docker.zip`

二进制包内包含运行所需的 `static` 静态资源和 `.env.example`。

## 配置说明

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `9527` | HTTP 监听端口 |
| `DB_TYPE` | `sqlite` | 数据库类型，支持 `sqlite` / `mysql` |
| `DB_PATH` | `app.db` | SQLite 数据库文件路径 |
| `DB_DSN` | 空 | MySQL DSN，`DB_TYPE=mysql` 时使用 |
| `METRICS_USER` | 空 | Prometheus 指标接口 Basic Auth 用户名 |
| `METRICS_PASS` | 空 | Prometheus 指标接口 Basic Auth 密码 |

运行期配置，例如请求限流、上游检查并发、日志切片、人机验证等，通过管理后台写入 KV 表。
