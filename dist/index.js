/**
 * Daily Logger Plugin
 * 自动记录每日活动，生成日志报告
 */
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
// 获取日志目录
function getLogDir(config) {
    const dir = config?.logDir || process.env.DAILY_LOG_DIR || "~/.daily-logs";
    return dir.replace("~", os.homedir());
}
// 获取索引文件路径
function getManifestPath(logDir) {
    return path.join(logDir, ".manifest.json");
}
// 获取今天的日期字符串
function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}
// 获取时间字符串
function getTimeString(date) {
    return date.toTimeString().slice(0, 5);
}
// 生成活动 ID（时间戳 + 8位随机）
function generateId() {
    const timestamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 10);
    return `act-${timestamp}-${rand}`;
}
// 确保目录存在
async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    }
    catch {
        // 目录已存在
    }
}
// 获取日期对应的日志文件路径
function getLogFilePath(logDir, date) {
    return path.join(logDir, `${date}.md`);
}
// 加载索引
async function loadManifest(logDir) {
    try {
        const content = await fs.readFile(getManifestPath(logDir), "utf-8");
        return JSON.parse(content);
    }
    catch {
        return [];
    }
}
// 保存索引（原子写入）
async function saveManifest(logDir, manifest) {
    await ensureDir(logDir);
    const manifestPath = getManifestPath(logDir);
    const tmpPath = path.join(logDir, ".manifest.json.tmp");
    await fs.writeFile(tmpPath, JSON.stringify(manifest, null, 2), "utf-8");
    await fs.rename(tmpPath, manifestPath);
}
// 重建索引（扫描所有日志文件）
async function rebuildManifest(logDir) {
    const manifest = [];
    const files = await fs.readdir(logDir);
    const logFiles = files.filter(f => f.endsWith(".md")).sort();
    for (const file of logFiles) {
        const logPath = path.join(logDir, file);
        const activities = await parseLogActivities(logPath);
        for (const act of activities) {
            manifest.push({ ...act, file });
        }
    }
    await saveManifest(logDir, manifest);
    return manifest;
}
// 格式化单条活动为 Markdown
function formatActivityMarkdown(log) {
    const time = getTimeString(new Date(log.timestamp));
    const typeEmoji = {
        sleep: "😴",
        meal: "🍽️",
        exercise: "🏃",
        mood: "😊",
        work: "💼",
        hobby: "🎮",
        health: "🏥",
        custom: "📝",
    };
    return `- ${time} ${typeEmoji[log.type]} ${log.content}`;
}
// 解析日志文件中的活动列表
async function parseLogActivities(logPath) {
    try {
        const content = await fs.readFile(logPath, "utf-8");
        const lines = content.split("\n");
        const activities = [];
        for (const line of lines) {
            const match = line.match(/^- (\d{2}:\d{2}) (😴|🍽️|🏃|😊|💼|🎮|🏥|📝) (.+)$/);
            if (match) {
                const [, time, emoji, content] = match;
                const typeMap = {
                    "😴": "sleep",
                    "🍽️": "meal",
                    "🏃": "exercise",
                    "😊": "mood",
                    "💼": "work",
                    "🎮": "hobby",
                    "🏥": "health",
                    "📝": "custom",
                };
                activities.push({
                    id: generateId(),
                    type: typeMap[emoji] || "custom",
                    content,
                    timestamp: time,
                    date: path.basename(logPath, ".md"),
                });
            }
        }
        return activities;
    }
    catch {
        return [];
    }
}
// 追加活动到日志文件
async function appendActivity(logDir, log) {
    await ensureDir(logDir);
    const logPath = getLogFilePath(logDir, log.date);
    let content = "";
    try {
        content = await fs.readFile(logPath, "utf-8");
    }
    catch {
        content = `# ${log.date}\n\n`;
    }
    const sections = {
        sleep: "## 睡眠\n",
        meal: "## 餐饮\n",
        exercise: "## 运动\n",
        mood: "## 心情\n",
        work: "## 工作\n",
        hobby: "## 休闲\n",
        health: "## 健康\n",
        custom: "## 其他\n",
    };
    const sectionHeader = sections[log.type];
    const activityLine = formatActivityMarkdown(log);
    if (content.includes(sectionHeader)) {
        const sectionIndex = content.indexOf(sectionHeader);
        const nextSectionIndex = content.indexOf("\n## ", sectionIndex + 1);
        if (nextSectionIndex === -1) {
            content = content.trimEnd() + "\n" + activityLine + "\n";
        }
        else {
            content = content.slice(0, nextSectionIndex) + activityLine + "\n" + content.slice(nextSectionIndex);
        }
    }
    else {
        content = content.trimEnd() + "\n\n" + sectionHeader + activityLine + "\n";
    }
    await fs.writeFile(logPath, content, "utf-8");
}
// 更新索引：添加单条记录
async function indexActivity(logDir, act, file) {
    const manifest = await loadManifest(logDir);
    manifest.push({ ...act, file });
    await saveManifest(logDir, manifest);
}
// 活动类型 Schema
const ActivityTypeSchema = Type.Union([
    Type.Literal("sleep"),
    Type.Literal("meal"),
    Type.Literal("exercise"),
    Type.Literal("mood"),
    Type.Literal("work"),
    Type.Literal("hobby"),
    Type.Literal("health"),
    Type.Literal("custom"),
]);
// 时间范围 Schema
const PeriodSchema = Type.Union([
    Type.Literal("today"),
    Type.Literal("yesterday"),
    Type.Literal("week"),
    Type.Literal("month"),
]);
// 导出格式 Schema
const ExportFormatSchema = Type.Union([
    Type.Literal("json"),
    Type.Literal("markdown"),
]);
// 插件入口
export default definePluginEntry({
    id: "daily-logger",
    name: "Daily Logger",
    description: "自动记录每日活动，生成健康与生活日志报告",
    register(api) {
        const config = api.pluginConfig;
        // 记录活动工具
        api.registerTool({
            name: "log_activity",
            label: "记录活动",
            description: "记录日常活动（睡眠、餐饮、运动、心情等）",
            parameters: Type.Object({
                type: ActivityTypeSchema,
                content: Type.String(),
                timestamp: Type.Optional(Type.String()),
            }),
            async execute(toolCallId, params) {
                try {
                    const logDir = getLogDir(config);
                    const now = new Date();
                    const log = {
                        id: generateId(),
                        type: params.type,
                        content: params.content,
                        timestamp: params.timestamp || now.toISOString(),
                        date: getTodayDate(),
                    };
                    await appendActivity(logDir, log);
                    await indexActivity(logDir, log, `${log.date}.md`);
                    const typeLabels = {
                        sleep: "睡眠",
                        meal: "餐饮",
                        exercise: "运动",
                        mood: "心情",
                        work: "工作",
                        hobby: "休闲",
                        health: "健康",
                        custom: "其他",
                    };
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ 已记录 ${typeLabels[log.type]}\n\n📝 ${log.content}\n时间: ${getTimeString(now)}\n日期: ${log.date}`,
                            },
                        ],
                        details: { id: log.id, type: log.type, date: log.date },
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ 记录失败: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        details: { error: true },
                    };
                }
            },
        }, { optional: true });
        // 生成报告工具
        api.registerTool({
            name: "generate_report",
            label: "生成报告",
            description: "生成日志报告（日报、周报、月报）",
            parameters: Type.Object({
                period: PeriodSchema,
                type: Type.Optional(ActivityTypeSchema),
            }),
            async execute(toolCallId, params) {
                try {
                    const logDir = getLogDir(config);
                    const now = new Date();
                    // 确定日期范围
                    const dates = [];
                    let startDate;
                    switch (params.period) {
                        case "today":
                            dates.push(getTodayDate());
                            break;
                        case "yesterday":
                            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                            dates.push(yesterday.toISOString().slice(0, 10));
                            break;
                        case "week":
                            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            for (let i = 0; i < 7; i++) {
                                const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                                dates.push(d.toISOString().slice(0, 10));
                            }
                            break;
                        case "month":
                            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            for (let i = 0; i < 30; i++) {
                                const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                                dates.push(d.toISOString().slice(0, 10));
                            }
                            break;
                    }
                    // 收集所有活动
                    const allActivities = [];
                    for (const date of dates) {
                        const logPath = getLogFilePath(logDir, date);
                        const activities = await parseLogActivities(logPath);
                        allActivities.push(...activities);
                    }
                    // 按类型筛选
                    let filtered = params.type
                        ? allActivities.filter(a => a.type === params.type)
                        : allActivities;
                    // 【修复】按日期+时间倒序排列，最新的在前
                    filtered.sort((a, b) => {
                        const dateCompare = b.date.localeCompare(a.date);
                        if (dateCompare !== 0)
                            return dateCompare;
                        return b.timestamp.localeCompare(a.timestamp);
                    });
                    // 统计
                    const stats = {
                        sleep: 0,
                        meal: 0,
                        exercise: 0,
                        mood: 0,
                        work: 0,
                        hobby: 0,
                        health: 0,
                        custom: 0,
                    };
                    for (const act of filtered) {
                        stats[act.type]++;
                    }
                    const periodLabels = {
                        today: "今天",
                        yesterday: "昨天",
                        week: "最近一周",
                        month: "最近一个月",
                    };
                    const typeLabels = {
                        sleep: "睡眠",
                        meal: "餐饮",
                        exercise: "运动",
                        mood: "心情",
                        work: "工作",
                        hobby: "休闲",
                        health: "健康",
                        custom: "其他",
                    };
                    if (filtered.length === 0) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `📊 ${periodLabels[params.period]} 报告\n\n暂无活动记录`,
                                },
                            ],
                            details: { stats, count: 0 },
                        };
                    }
                    // 构建报告内容
                    const statsText = Object.entries(stats)
                        .filter(([, count]) => count > 0)
                        .map(([type, count]) => `- ${typeLabels[type]}: ${count} 条`)
                        .join("\n");
                    // 最近的活动（已排序，直接取前15条）
                    const recentText = filtered
                        .slice(0, 15)
                        .map((act, i) => `${i + 1}. ${act.date} ${act.timestamp} ${act.content}`)
                        .join("\n");
                    return {
                        content: [
                            {
                                type: "text",
                                text: `📊 ${periodLabels[params.period]} 报告\n\n共 ${filtered.length} 条活动记录\n\n统计:\n${statsText}\n\n最近活动:\n${recentText}`,
                            },
                        ],
                        details: { stats, count: filtered.length },
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ 生成报告失败: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        details: { error: true },
                    };
                }
            },
        }, { optional: true });
        // 搜索日志工具
        api.registerTool({
            name: "search_logs",
            label: "搜索日志",
            description: "搜索历史活动日志",
            parameters: Type.Object({
                query: Type.String(),
                type: Type.Optional(ActivityTypeSchema),
                limit: Type.Optional(Type.Number()),
            }),
            async execute(toolCallId, params) {
                try {
                    const logDir = getLogDir(config);
                    const limit = Math.min(params.limit || 20, 100);
                    let manifest = await loadManifest(logDir);
                    // 如果索引为空，先重建
                    if (manifest.length === 0) {
                        manifest = await rebuildManifest(logDir);
                    }
                    const queryLower = params.query.toLowerCase();
                    const today = getTodayDate();
                    // 从索引筛选（内存操作，极快）
                    let results = manifest.filter(act => {
                        if (params.type && act.type !== params.type)
                            return false;
                        return act.content.toLowerCase().includes(queryLower);
                    });
                    // 按日期倒序
                    results.sort((a, b) => {
                        const dateCompare = b.date.localeCompare(a.date);
                        if (dateCompare !== 0)
                            return dateCompare;
                        return b.timestamp.localeCompare(a.timestamp);
                    });
                    results = results.slice(0, limit);
                    if (results.length === 0) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `🔍 未找到匹配的活动\n\n搜索: "${params.query}"`,
                                },
                            ],
                            details: { count: 0 },
                        };
                    }
                    const resultText = results
                        .map((act, i) => `${i + 1}. ${act.date} ${act.timestamp} ${act.content}`)
                        .join("\n");
                    return {
                        content: [
                            {
                                type: "text",
                                text: `🔍 找到 ${results.length} 条活动\n\n${resultText}`,
                            },
                        ],
                        details: { count: results.length, results },
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ 搜索失败: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        details: { error: true },
                    };
                }
            },
        }, { optional: true });
        // 重建索引工具
        api.registerTool({
            name: "rebuild_index",
            label: "重建索引",
            description: "强制重建搜索索引",
            parameters: Type.Object({}),
            async execute(toolCallId) {
                try {
                    const logDir = getLogDir(config);
                    const manifest = await rebuildManifest(logDir);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ 索引重建完成\n\n共索引 ${manifest.length} 条活动记录`,
                            },
                        ],
                        details: { count: manifest.length },
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ 索引重建失败: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        details: { error: true },
                    };
                }
            },
        }, { optional: true });
        // 导出日志工具
        api.registerTool({
            name: "export_logs",
            label: "导出日志",
            description: "导出日志数据",
            parameters: Type.Object({
                format: ExportFormatSchema,
                period: Type.Optional(PeriodSchema),
            }),
            async execute(toolCallId, params) {
                try {
                    const logDir = getLogDir(config);
                    const now = new Date();
                    // 确定日期范围
                    let dates = [];
                    const period = params.period || "month";
                    switch (period) {
                        case "today":
                            dates.push(getTodayDate());
                            break;
                        case "yesterday":
                            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                            dates.push(yesterday.toISOString().slice(0, 10));
                            break;
                        case "week":
                            const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            for (let i = 0; i < 7; i++) {
                                const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                                dates.push(d.toISOString().slice(0, 10));
                            }
                            break;
                        case "month":
                            const startMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            for (let i = 0; i < 30; i++) {
                                const d = new Date(startMonth.getTime() + i * 24 * 60 * 60 * 1000);
                                dates.push(d.toISOString().slice(0, 10));
                            }
                            break;
                    }
                    // 收集所有活动
                    const allActivities = [];
                    for (const date of dates) {
                        const logPath = getLogFilePath(logDir, date);
                        const activities = await parseLogActivities(logPath);
                        allActivities.push(...activities);
                    }
                    if (allActivities.length === 0) {
                        return {
                            content: [
                                { type: "text", text: "📭 无活动记录，无法导出" },
                            ],
                            details: { count: 0 },
                        };
                    }
                    // 导出文件
                    const ext = params.format === "json" ? "json" : "md";
                    const exportPath = path.join(logDir, `export-${now.toISOString().slice(0, 10)}.${ext}`);
                    if (params.format === "json") {
                        await fs.writeFile(exportPath, JSON.stringify(allActivities, null, 2), "utf-8");
                    }
                    else {
                        // Markdown 格式：逐文件读取，单个失败不影响其他
                        let mdContent = "# 日志导出\n\n";
                        for (const date of dates) {
                            const logPath = getLogFilePath(logDir, date);
                            try {
                                const content = await fs.readFile(logPath, "utf-8");
                                mdContent += content + "\n\n---\n\n";
                            }
                            catch {
                                // 文件不存在，直接跳过，不中断导出
                            }
                        }
                        await fs.writeFile(exportPath, mdContent, "utf-8");
                    }
                    return {
                        content: [
                            {
                                type: "text",
                                text: `✅ 导出完成\n\n共 ${allActivities.length} 条活动\n格式: ${params.format}\n路径: ${exportPath}`,
                            },
                        ],
                        details: { count: allActivities.length, exportPath },
                    };
                }
                catch (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `❌ 导出失败: ${error instanceof Error ? error.message : String(error)}`,
                            },
                        ],
                        details: { error: true },
                    };
                }
            },
        }, { optional: true });
    },
});
//# sourceMappingURL=index.js.map