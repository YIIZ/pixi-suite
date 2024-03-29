# PIXI Suite
pixi-suite is an animation development framework based on [pixi.js](https://pixijs.com/), adding JSX syntax support, entity-component architecture, encapsulating commonly used components, such as ScrollView, Modal, VideoCtrl, Widget, Toast.

[中文](./README_zh-CN.md)

### File structure
- managers
  Global singletons managed various functions
- containers
  compositions of nodes and components,  only responsible for combining the Views and Components that a control needs
- components
  The logic of various components

### Node Lifecycle
- `initChildren(children)`
  return all children nodes
- `onCreate()`
  Callback after the node is created
- `onAdd()`
  Callback after the node is added to the stage, all components will execute `onEnble`
- `onRemove()`
  Callback after the node is removed from the stage

### Component Lifecycle
- onEnble()
  When the attached node is added to the stage
- onDisable()
  When the attached node is removed from the stage

### Use case

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
        {/*Component Button make the node clickable，it will call the onClick function*/}
        {/*Component Widget enable the node to automatically position themselves according to the screen*/}
        <Node
          x={375}
          widget={{ flag: Widget.BOTTOM, bottom: 120 }}
          onClick={this.handleClick}
          components={[Button, Widget]}
        >
          <Text text="Show the Modal" anchor={center} />
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
        {/*ScrollViewIt is a scrollable container. Adding the component ItemTap can enable the container to listen for child element click events*/}
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
    toaster.show({ type: 'text', title: 'select item：' + item.data, duration: 3000 })
    modalManager.hide(this)
  }
}

```

app.js
```javascript
director.init(document.querySelector('.main'), { transparent: true })

// Register scenes
director.addScene('Loading', require('./scenes/Loading').default)
director.addScene('Main', require('./scenes/Main').default)

// Load the fisrt Loading scene
director.loadScene('Loading')
```

