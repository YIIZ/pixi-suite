# PIXI Suite

## 概念说明

### Managers

全局单例，负责管理资源与场景。

### Containers

Components 的容器。

### Components

负责表现或行为的一个逻辑单元。

### Node 生命周期

- `initChildren(children)`：Node 实例化时触发；
- `onCreate()`：所有 Children 创建完毕后触发；
- `onAdd()`：当 Node 被添加到 Stage，且 Node 中所包含 Components 的 `onEnable()` 都已执行完毕后触发；
- `onRemove()`：当前 Node 从 Stage 移除后触发；

### Component 生命周期

- `onEnable()`：Component 所属 Node 被添加到 Stage 后触发；
- `onDisable()`：Component 所属 Node 被从 Stage 移除后触发；

## JSX 支持

通过 `@babel/plugin-transform-react-jsx` 将 JSX 标签转译为 `Node.createChildren` 与 `Node.Fragment` 的调用。
