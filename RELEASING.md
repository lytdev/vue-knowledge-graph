# 发布到 npm

## 发布前准备

1. 在 npm 创建账号并开启发布操作的双因素认证。
2. 执行 `npm login --registry=https://registry.npmjs.org/`，再用 `npm whoami` 确认登录状态。
3. 确保工作区已提交，并确认 `package.json` 中的版本尚未发布。

包名 `agile-knowledge-graph` 用于公共发布，`publishConfig` 会将目标固定为官方 npm registry。不要把 npm Token 写入 `.npmrc` 或提交到仓库。

## 本地发布

首次发布当前版本：

```bash
pnpm install --frozen-lockfile
pnpm release:check
npm publish
```

后续版本先按语义化版本更新版本号，例如：

```bash
npm version patch
pnpm release:check
npm publish
```

`npm publish` 会通过 `prepack` 再次运行 Lint、类型检查、测试和构建。每个 `name@version` 只能发布一次；成功上传后必须使用新版本号发布下一版。

## CNB 标签自动发布

`.cnb.yml` 会在推送 `v*` 标签时发布，并以标签作为包版本。请在 CNB 的密钥仓库或个人环境变量中配置 `NPM_TOKEN`，使用只授权此包的 granular access token，并按 npm 账户策略允许发布操作。

```bash
npm version patch
git push --follow-tags
```

流水线会在版本已存在时安全跳过。不要在仓库、流水线文件或构建日志中打印 Token。本地发布与标签自动发布可任选一种；已由本地发布的版本在标签流水线中会被跳过。
