# ai/
> L2 | 父级: src/lib/CLAUDE.md

## 成员清单

crypto.js: API Key 加密/解密，使用 Web Crypto API 的 AES-GCM 算法，保护用户隐私
prompts.js: Prompt 工程，构建 AI 上下文（任务、历史、时间含深夜/清晨标记）+ System/User Prompt 模板（开放式问题引导 + 维度池灵感来源 + 反套路设计 + 问题来源多元化原则 + 稀疏上下文生活维度提示 + 标题生成多元化）+ 响应解析（按行分割，统一 'prompt' 类型）+ 6 组降级问题随机选择
openai.js: OpenAI API 集成，调用 chat/completions 接口 + 流式输出支持（问题生成，SSE 逐行解析）+ 标题生成（非流式）+ 错误处理 + 降级策略

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
