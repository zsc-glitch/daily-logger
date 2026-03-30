# Daily Logger 📅

自动记录每日活动，生成健康与生活日志报告

## 功能

- ✅ **活动记录** - 记录睡眠、饮食、运动、心情等
- ✅ **时间追踪** - 自动时间戳，无需手动输入
- ✅ **日报生成** - 每日总结，一目了然
- ✅ **周报/月报** - 趋势分析，发现模式
- ✅ **数据导出** - JSON/Markdown 导出，便于分析
- ✅ **隐私本地** - 数据存储在本地，完全掌控

## 触发词

当用户说：
- "记录我睡了8小时"
- "今天心情不错"
- "吃了午饭"
- "跑了5公里"
- "生成今天的日志"
- "看看这周的运动情况"

自动调用对应工具。

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

## 数据结构

日志以 Markdown 格式存储：

```markdown
# 2026-03-30

## 睡眠
- 07:00 起床
- 23:30 入睡
- 总计: 7.5小时

## 餐饮
- 08:30 早餐: 鸡蛋、牛奶
- 12:00 午餐: 米饭、蔬菜
- 18:00 晚餐: 鱼、汤

## 运动
- 15:00 跑步 5公里

## 心情
- 全天: 良好 👊

## 工作
- 完成项目报告
- 代码评审

## 统计
- 睡眠: 7.5h
- 运动: 5km
- 心情评分: 7/10
```

## 工具

### log_activity
记录活动：`log_activity(type, content, timestamp?)`

### generate_report
生成报告：`generate_report(period, type?)`

### search_logs
搜索日志：`search_logs(query, dateRange?)`

### export_logs
导出日志：`export_logs(format, dateRange?)`

## 与 Knowledge Keeper 联动

重要活动可自动保存到 Knowledge Keeper：
- 达成目标 → decision
- 健康趋势 → concept  
- 待办事项 → todo

## 安装

```bash
npx clawhub@latest install daily-logger
```

或从本地：
```bash
openclaw skills install /path/to/daily-logger
```

## License

MIT

---

Made with 📅 by 小影