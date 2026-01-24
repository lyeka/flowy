# ai/
> L2 | 父级: src/lib/CLAUDE.md

## 成员清单

crypto.js: API Key 加密/解密，使用 Web Crypto API 的 AES-GCM 算法，保护用户隐私
prompts.js: Prompt 工程，构建 AI 上下文（任务、历史、时间）+ System/User Prompt 模板（问题生成 + 标题生成，纯文本格式）+ 响应解析（按行分割，支持流式）+ 降级问题
openai.js: OpenAI API 集成，调用 chat/completions 接口 + 流式输出支持（问题生成，SSE 逐行解析）+ 标题生成（非流式）+ 错误处理 + 降级策略

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
