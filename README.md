# Daily Logger 📅

自动记录每日活动，生成健康与生活日志报告

## 安装

```bash
npm install @zsc-glitch/daily-logger
```

或通过 ClawHub：

```bash
npx clawhub@latest install daily-logger
```

## 使用

### 记录活动

对我说：
- "记录睡了8小时"
- "今天吃了午饭"
- "跑了5公里"
- "心情不错"

### 查看报告

- "生成今天的日志报告"
- "看看这周的运动情况"
- "搜索之前关于跑步的记录"

## 活动类型

| 类型 | 说明 |
|------|------|
| sleep | 睡眠 |
| meal | 餐饮 |
| exercise | 运动 |
| mood | 心情 |
| work | 工作 |
| hobby | 休闲 |
| health | 健康 |
| custom | 自定义 |

## 工具

- `log_activity` - 记录活动
- `generate_report` - 生成报告
- `search_logs` - 搜索日志
- `export_logs` - 导出日志

## 数据存储

日志以 Markdown 格式存储在 `~/.daily-logs/` 目录：

```
~/.daily-logs/
├── 2026-03-30.md
├── 2026-03-29.md
└── ...
```

## License

MIT

---

Made with 📅 by 小影