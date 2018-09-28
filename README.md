# PIXI Suite

### 说明
- managers
  全局单例，各种管理功能
- containers
  控件的组合，只负责把某控件需要的view和component组合起来
- components
  单个功能的逻辑


### Node生命周期
- initChildren(children)
  类实例化后
- onCreate()
  children也实例化后
- onAdd()
  在被添加到stage后, components都已执行onEnble
- onRemove()
  移除出stage

### Component生命周期
- onEnble()
  对应的node被添加到stage
- onDisable()
  对应node被移除出stage
