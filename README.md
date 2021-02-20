# PIXI Suite
pixi-suite是一个基于pixi.js的H5开发框架，添加JSX语法支持，entity-component的架构，封装了常用组件，
如ScrollView，Modal，VideoCtrl，Widget，toast等，方便复用和拓展组件，便于迅速开发H5。

### 文件结构说明
- managers
  全局单例，各种管理功能
- containers
  控件的组合，只负责把某控件需要的view和component组合起来
- components
  单个功能的逻辑

### Node生命周期
- initChildren(children)
  类实例化后, 返回需要创建的子元素
- onCreate()
  元素创建成功后的回调
- onAdd()
  在被添加到stage后, components都已执行了onEnble
- onRemove()
  移除出stage

### Component生命周期
- onEnble()
  对应的node被添加到stage
- onDisable()
  对应node被移除出stage

### 用法案例

main.js
```javascript
import { Sprite, Text, Point, Texture } from 'pixi.js'
import loader from '@teambun/loader'
import { Scene, Node } from 'pixi-suite/src/containers'
import { ViewAdapter, Widget, Button } from 'pixi-suite/src/components'
import { director, modalManager, toaster } from 'pixi-suite/src/managers'

import SelectModal from 'containers/SelectModal'

export default class Main extends Scene {
  view = ViewAdapter.Portrait

  initChildren() {
    return (
      <>
        <Sprite texture={WHITE} width={750} height={1500} />
        {/*components添加Button使得具有按钮功能， 添加Widget使得控件可以自动根据屏幕定位*/}
        <Node
          x={375}
          widget={{ flag: Widget.BOTTOM, bottom: 120 }}
          onClick={this.handleMove}
          components={[Button, Widget]}
        >
          <Text text="点击显示弹窗" anchor={center} />
        </Node>
      </>
    )
  }

  handleClick = () => {
    const modal = <SelectModal items={['1', '2']}/>
    modalManager.show(modal)
  }
}

```

SelectModal.js
```javascript
import { Sprite, Text, Point, Texture } from 'pixi.js'
import loader from '@teambun/loader'
import { Scene, Node } from 'pixi-suite/src/containers'
import { ViewAdapter, Widget, Button } from 'pixi-suite/src/components'
import { director, modalManager, toaster } from 'pixi-suite/src/managers'

import SelectModal from 'containers/SelectModal'

export default class SelectModal extends Node {
  initChildren() {
    const { items } = this
    return (
      <>
        <Sprite texture={WHITE} width={300} height={400} />
        {/*ScrollView是可滑动的固定可视范围组件， 添加ItemTap后有了委托监听子元素点击事件的功能*/}
        <ScrollView
          ref={(r) => (this.$$sv = r)}
          viewSize={{ w: 200, h: 300 }}
          layout={{ width: 200, height: 300, spaceY: 30 }}
          components={[ItemTap]}
          onItemTap={this.handleItemTap}
        >
          {items.map((v) =>(<SelectItem data={v} />)
          )}
        </ScrollView>
      </>
    )
  }

  handleItemTap = (evt, item) => {
    toaster.show({ type: 'text', title: '选择了item：' + item.data, duration: 3000 })
    modalManager.hide(this)
  }
}

```

app.js
```javascript
director.init(document.querySelector('.main'), { transparent: true })

// 注册H5的各个场景
director.addScene('Loading', require('./scenes/Loading').default)
director.addScene('Main', require('./scenes/Main').default)

// 先进入加载场景
director.loadScene('Loading')
```

