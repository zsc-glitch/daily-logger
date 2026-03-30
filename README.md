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

## 功能特性

- ✅ **活动记录** - 记录睡眠、饮食、运动、心情等，支持时长记录
- ✅ **快速记录** - 预设常用活动，一键记录
- ✅ **详细摘要** - 生成统计摘要，包含分类统计、运动详情、心情趋势
- ✅ **日报生成** - 每日总结，一目了然
- ✅ **周报/月报** - 趋势分析，发现模式
- ✅ **数据导出** - JSON/Markdown 导出，便于分析
- ✅ **隐私本地** - 数据存储在本地，完全掌控

## 使用

### 记录活动

对我说：
- "记录睡了8小时"
- "今天吃了午饭"
- "跑了5公里，30分钟"
- "心情不错"

### 快速记录

使用预设活动快速记录：
- "快速记录早起了"
- "记录运动了，45分钟"
- "心情好"

### 查看报告

- "生成今天的日志报告"
- "看看这周的运动情况"
- "给我一个详细摘要"
- "搜索之前关于跑步的记录"

## 活动类型

| 类型 | 说明 | 示例 |
|------|------|------|
| sleep | 睡眠 | "睡了7小时" |
| meal | 餐饮 | "吃了早餐" |
| exercise | 运动 | "跑了5公里" |
| mood | 心情 | "心情不错" |
| work | 工作 | "完成了项目报告" |
| hobby | 休闲 | "看了部电影" |
| health | 健康 | "体重70kg" |
| custom | 自定义 | 任意活动 |

## 工具列表

### log_activity
记录活动：`log_activity(type, content, duration?)`

```typescript
// 记录运动，带时长
log_activity({ type: "exercise", content: "跑步5公里", duration: 30 })

// 记录心情
log_activity({ type: "mood", content: "今天心情很好" })
```

### log_quick
快速记录预设活动：`log_quick(activity, duration?, note?)`

```typescript
// 快速记录运动
log_quick({ activity: "exercise", duration: 45 })

// 带备注
log_quick({ activity: "happy", note: "完成了一个重要项目" })
```

**可用预设：**

| ID | 类型 | 说明 | 默认时长 |
|------|------|------|------|
| wake_up | sleep | 早起了 | - |
| sleep | sleep | 入睡了 | 8小时 |
| breakfast | meal | 吃早餐 | - |
| lunch | meal | 吃午餐 | - |
| dinner | meal | 吃晚餐 | - |
| exercise | exercise | 运动了 | 30分钟 |
| run | exercise | 跑步了 | 30分钟 |
| gym | exercise | 健身了 | 60分钟 |
| happy | mood | 心情好 | - |
| tired | mood | 有点累 | - |
| stressed | mood | 压力大 | - |
| meditation | health | 冥想了 | 15分钟 |
| water | health | 喝水了 | - |
| vitamin | health | 吃维生素 | - |
| reading | hobby | 看书了 | 30分钟 |
| gaming | hobby | 玩游戏 | 60分钟 |
| meeting | work | 开会了 | 60分钟 |
| focus | work | 专注工作 | 90分钟 |

### log_summary
生成详细统计摘要：`log_summary(period?)`

```typescript
// 今天的详细摘要
log_summary({ period: "today" })

// 本周摘要
log_summary({ period: "week" })
```

### generate_report
生成报告：`generate_report(period, type?)`

```typescript
// 今天所有活动
generate_report({ period: "today" })

// 本周运动报告
generate_report({ period: "week", type: "exercise" })
```

### search_logs
搜索日志：`search_logs(query, type?, limit?)`

```typescript
// 搜索跑步相关
search_logs({ query: "跑步" })

// 搜索运动类型，限制5条
search_logs({ query: "", type: "exercise", limit: 5 })
```

### export_logs
导出日志：`export_logs(format, period?)`

```typescript
// 导出为 JSON
export_logs({ format: "json" })

// 导出本周为 Markdown
export_logs({ format: "markdown", period: "week" })
```

### log_quick_list
列出所有预设活动：`log_quick_list()`

## 数据存储

日志以 Markdown 格式存储在 `~/.daily-logs/` 目录：

```
~/.daily-logs/
├── 2026-03-30.md
├── 2026-03-29.md
└── ...
```

### 日志格式

```markdown
# 2026-03-30

## 睡眠
- 07:00 😴 起床
- 23:30 😴 入睡 （8小时）

## 餐饮
- 08:30 🍽️ 早餐
- 12:00 🍽️ 午餐
- 18:00 🍽️ 晚餐

## 运动
- 15:00 🏃 跑步5公里 （30分钟）

## 心情
- 20:00 😊 今天心情很好

## 统计
- 睡眠: 8h
- 运动: 5km, 30min
```

## 配置

在 OpenClaw 配置中启用：

```json
{
  "skills": {
    "entries": {
      "daily_logger": {
        "enabled": true,
        "config": {
          "logDir": "~/.daily-logs",
          "autoSummary": true
        }
      }
    }
  }
}
```

## 更新日志

### v1.1.0
- ✨ 新增 `log_quick` 快速记录预设活动
- ✨ 新增 `log_summary` 详细统计摘要
- ✨ 新增活动时长记录功能
- 🐛 修复时间戳解析问题
- 💄 改进 Markdown 格式化输出
- 📝 更新文档

### v1.0.0
- 🎉 初始版本
- 活动记录、报告生成、搜索、导出

## License

MIT

---

## ☕ 支持开发者

如果这些工具对你有帮助，欢迎请我喝杯咖啡 ☕

### 微信赞赏
![微信赞赏码](https://raw.githubusercontent.com/zsc-glitch/assets/main/wechat-pay.png)

### 支付宝
![支付宝收款码](https://raw.githubusercontent.com/zsc-glitch/assets/main/alipay.png)

### GitHub Sponsors
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-lightgrey?logo=github)](https://github.com/sponsors/zsc-glitch)

---

Made with 📅 by [小影](https://github.com/zsc-glitch)