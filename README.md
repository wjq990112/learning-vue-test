> 本文首发于公众号 **「Hello FE」**，关注获取更多内容

## 前言

距离上一次更新自动化测试相关的内容已经过去大半年了，之前写了基础篇和 `React` 实战，说好了要更新 `Vue` 实战的。

毕业设计、论文、答辩都结束了，难得有一段属于自己的时间，就决定更新一下。

**这次通过实现一个 `Button` 组件并完善其测试用例带大家学习 `Vue` 中的自动化测试。**

前面两篇还没学习过的同学，建议先学习前面的内容再来看这一篇文章：

- [试试前端自动化测试！（基础篇）](https://juejin.cn/post/6844904194600599560)
- [试试前端自动化测试！（React 实战）](https://juejin.cn/post/6894234532224958478)

> 本文中所有代码都存放在此仓库：[Learning-Vue-Test](https://github.com/wjq990112/Learning-Vue-Test)
>
> 本文中实现的 `Button` 组件在此处可以预览：[Learning-Vue-Test](https://learning-vue-test.vercel.app/)

## 创建项目

首先需要创建一个项目来开始我们的自动化测试实战，这里选用了 [`Vite`](https://cn.vitejs.dev/) 作为构建工具来创建项目，用 `@vitejs/app` 创建一个 `vue-ts` 项目。

为什么选 `Vite` 呢？ ~~因为我参与了 `Vite` 的官方中文文档的翻译。~~ 因为 `Vite` 又快又好用。

当然，也可以选择使用 `Vue CLI` 创建项目，创建项目的时候勾选 `TypeScript` 和 `Unit Test`，并且选择 `Jest` 作为单元测试工具就行。

## 环境配置

如果选用的是 `Vue CLI` 创建项目的话，就可以跳过这一步了，`@vue/cli-plugin-unit-jest` 已经将基本的测试环境配置都预设好了，只需要对 `JSX` 做一下支持就可以了。

如果是 `Vite` 的话，就需要做比较多的配置了，首先是安装一些依赖：

```bash
npm install jest@next @types/jest @vue/test-utils@next jest-transform-stub vue-jest@next babel-jest@next @babel/preset-env @babel/preset-typescript @vue/babel-plugin-jsx @vitejs/plugin-vue-jsx windicss vite-plugin-windicss @testing-library/jest-dom -D
```

依赖很多，看晕了是吧？没关系，一个一个来介绍：

- `jest`：提供单元测试能力。
- `@vue/test-utils`：对 `Vue` 组件进行测试（`Vue` 官方提供）。
- `jest-transform-stub`：将非 `JavaScript` 文件转换为 `Jest` 可执行的 `JavaScript` 代码。
- `vue-jest`：将 `Vue SFC`（单文件组件）转换为 `Jest` 可执行的 `JavaScript` 代码。
- `babel-jest`：将非标准 `JavaScript` 代码（`JSX/TSX`）转换为 `Jest` 可执行的 `JavaScript` 代码。
- `@babel/preset-env`：提供**测试时**最新的 `JavaScript` 语法的 `Babel Preset`。
- `@babel/preset-typescript`：提供**测试时** `TypeScript` 语法的 `Babel Preset`。
- `@vue/babel-plugin-jsx`：提供**测试时**在 `Vue` 中使用 `JSX/TSX` 语法的 `Babel Plugin`。
- `@vitejs/plugin-vue-jsx`：提供**开发时**在 `Vue` 中使用 `JSX/TSX` 语法的 `Vite Plugin`。
- `windicss`：`Windi CSS` 核心依赖。
- `vite-plugin-windicss`：提供**开发时**在 `Vue` 中使用 `Windi CSS` 能力的 `Vite Plugin`。
- `@testing-library/jest-dom`：提供**测试时**部分与 `DOM` 相关的断言。

需要安装的依赖就这些，依赖安装好之后，就需要编写相应的配置文件了。

### `vite.config.ts`

`Vite` 的配置就不详细介绍了，直接复制粘贴就行，主要是一个路径别名的配置和插件配置：

```ts title="vite.config.ts"
import { defineConfig } from 'vite';
import path from 'path';

import Vue from '@vitejs/plugin-vue';
import VueJSX from '@vitejs/plugin-vue-jsx';
import WindiCSS from 'vite-plugin-windicss';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    Vue(),
    VueJSX({
      optimize: true,
    }),
    WindiCSS(),
  ],
});
```

### `windi.config.ts`

比较懒，不想自己写样式，决定使用 `Windi CSS` 做样式开发。

实测很爽，只用调整 `class` 就能实现样式，开发调试体验都很棒。

具体的配置直接复制粘贴就行，主要对颜色做了一点拓展，增加了 `light` 和 `dark` 两种颜色：

```ts title="windi.config.ts"
import { defineConfig } from 'vite-plugin-windicss';

export default defineConfig({
  extract: {
    include: ['index.html', 'src/**/*.{vue,jsx,tsx,html}'],
  },
  theme: {
    extend: {
      colors: {
        dark: '#303030',
        light: '#ebebeb',
      },
    },
  },
});
```

`extract.include` 数组中的文件就是 `Windi CSS` 生效的文件，对 `index.html` 和所有 `src` 目录下的 `Vue/JSX/TSX/HTML` 文件生效。

详细的用法可以到 [`Windi CSS` 官方文档](https://cn.windicss.org/guide/)中学习。

### `package.json`

要跑测试用例，就需要给 `package.json` 中加入一条新的 `npm script`：

```json {7} title="package.json"
{
  ...
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "serve": "vite preview",
    "test:watch": "jest --watch --coverage"
  },
  ...
}
```

在 `jest` 后加上 `--watch` 和 `--coverage` 两个参数是为了开启监听和测试覆盖率报告，这样在每次写完测试脚本后保存，`Jest` 就会自动跑一轮测试脚本并给出测试覆盖率报告。

加入了这一条 `test:watch` 后，就可以在终端里使用 `npm run test:watch` 启动测试脚本了。

### `jest.config.js`

等一下！输入 `npm run test:watch` 之后报错了对不对？因为还没有对 `Jest` 做配置。

在项目的根目录下创建一个 `jest.config.js` 的文件，然后复制粘贴这段配置：

```js title="jest.config.js"
module.exports = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx,ts,tsx}',
    '!src/components/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    // tell Jest to handle *.vue files
    'vue',
  ],
  transform: {
    // process *.vue files with vue-jest
    '.+\\.(css|styl|less|sass|scss|jpg|jpeg|png|svg|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      'jest-transform-stub',
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.(j|t)sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

配置很多比较复杂，在上一期的详细的内容里有一部分的讲解，这里主要对一些核心的配置讲解一下，详细的内容可以到 [`Jest`](https://jestjs.io/) 官方文档里学习。

- `testEnvironment`：用于指定测试运行的环境，默认是 `node`，因为测试的是运行在浏览器中的代码，所以要改成 `jsdom`。上一篇 `React` 实战里用的是 `jest-environment-jsdom-fourteen`，现在由于 `Jest` 已经内置了 `JSDOM`，所以已经不需要使用上一篇里用到的库了。
- `collectCoverageFrom`：用于指定测试覆盖率收集的文件，只有在这个列表里的文件的测试覆盖率才会被统计。
- `setupFilesAfterEnv`：用于为测试环境做预设，例如引入一些与 `DOM` 相关的断言。
- `testMatch`：用于指定测试文件，只有在这个列表里的文件才会被当成测试脚本。
- `moduleFileExtensions`：用于指定模块文件类型，只有在列表里的文件类型才能被识别。
- `transform`：用于指定对应类型的文件转换器，这里非 `JavaScript/TypeScript/Vue` 文件使用了 `jest-transform-stub` 进行转换，而 `Vue` 则使用 `vue-jest`，`JS/JSX/TS/TSX` 使用 `babel-jest` 转换。
- `transformIgnorePatterns`：用于指定文件转换器需要忽略的文件。
- `moduleNameMapper`：用于设置引入时路径的别名，这里设置引入路径是 `@` 开头的模块都到 `src` 目录下查找。

此处的配置参考的是 `@vue/plugin-unit-jest` 中 `typescript-and-babel` 的 `preset`，稍微做了一些改动，将 `TS` 文件的处理由 `ts-jest` 改成了 `babel-jest`，将其交给 `Babel` 来处理。（实测交给 `Babel` 来处理比原来快约 60%，猜测原因在于 `Babel` 对 `TS` 做编译时会去掉类型信息跳过类型校验）

### `babel.config.js`

对 `Jest` 配置之后，还需要对 `Babel` 做配置，不然当 `Jest` 将对应的文件交给 `Babel` 处理的时候会报错。

因此需要在根目录下创建 `babel.config.js`，往里面写入 `Babel` 配置：

```js title="babel.config.js"
module.exports = {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
  plugins: [
    [
      '@vue/babel-plugin-jsx',
      {
        optimize: true,
      },
    ],
  ],
};
```

细心的读者应该发现了，明明在 `Vite` 里已经配置了 `JSX/TSX` 支持，为什么在 `Babel` 里面还要使用插件？

因为 `Vite` 中的插件只在 `development` 和 `production` 环境下生效，在 `test` 环境下完全由 `Jest` 来跑测试用例，而遇到 `JSX/TSX` 会交给 `babel-jest` 来做转换，如果没有使用插件 `Jest` 就无法识别 `JSX/TSX` 语法。

至于配置的这两个 `preset` 在前面已经介绍过了，就不重复介绍了。

## `index.html`

因为组件里用到了一些 `icon`，所以需要引入 `iconfont` 的字体资源，直接复制粘贴到 `index.html` 的 `head` 标签里面就可以了：

```html
<link
  rel="stylesheet"
  href="https://at.alicdn.com/t/font_2595498_06e66vrjx514.css?spm=a313x.7781069.1998910419.63&file=font_2595498_06e66vrjx514.css"
/>
```

对应 `icon` 的 `class` 可以到 `iconfont` 官网中的官方图标库里找到[Ant Design 官方图标库](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.1998910419.d9df05512&cid=9402)，查看对应图标的 `class`。

## 编写组件

配置文件真多，真麻烦，好在都可以复制粘贴。

现在就开始创建一个组件，真正开始写代码！

首先先删除项目中 `src/components` 目录下的 `HelloWorld.vue`，再打开 `App.vue`，将与 `HelloWorld.vue` 的内容都删除。

完成第一步之后就可以开始创建 `Button` 组件的代码了，在 `src/components` 目录下创建一个 `Button.tsx`，开始写组件。

写组件的内容不是本篇文章的重点，就简单贴个代码，放个效果：

```tsx title="Button.tsx"
import { defineComponent } from 'vue';

// Types
import type { PropType, ButtonHTMLAttributes } from 'vue';

export type ButtonType =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export type ButtonSize = 'lg' | 'md' | 'sm';

export default defineComponent({
  name: 'Button',

  props: {
    icon: String,
    round: Boolean,
    block: Boolean,
    loading: Boolean,
    loadingText: String,
    nativeType: String as PropType<ButtonHTMLAttributes['type']>,
    type: {
      type: String as PropType<ButtonType>,
      default: 'default',
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md',
    },
    loadingIcon: {
      type: String,
      default: 'icon-sync',
    },
  },

  emits: ['click'],

  setup(props, { emit, slots }) {
    const onClick = (event: MouseEvent) => {
      if (!props.loading) {
        emit('click', event);
      }
    };

    const getStyle = () => {
      const style = [
        'inline-flex',
        'justify-center',
        'items-center',
        'border',
        'rounded-md',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
      ];

      // ButtonSize
      if (props.size === 'lg') {
        style.push(
          'min-w-20',
          'min-h-13',
          'px-4',
          'text-lg',
          'tracking-widest'
        );
      }
      if (props.size === 'md') {
        style.push(
          'min-w-16',
          'min-h-10',
          'px-2',
          'text-base',
          'tracking-wider'
        );
      }
      if (props.size === 'sm') {
        style.push('min-w-12', 'min-h-7', 'px-1', 'text-sm', 'tracking-wide');
      }

      // ButtonType
      if (props.block) {
        style.push('block', 'w-full');
      }
      if (props.round) {
        style.push('rounded-full');
      }
      if (props.type === 'default') {
        style.push(
          'text-dark',
          'bg-white',
          'border-gray-300',
          'active:bg-gray-200'
        );
      }
      if (props.type === 'primary') {
        style.push(
          'text-light',
          'bg-blue-500',
          'border-transparent',
          'active:bg-blue-600'
        );
      }
      if (props.type === 'success') {
        style.push(
          'text-light',
          'bg-green-500',
          'border-transparent',
          'active:bg-green-600'
        );
      }
      if (props.type === 'warning') {
        style.push(
          'text-light',
          'bg-yellow-500',
          'border-transparent',
          'active:bg-yellow-600'
        );
      }
      if (props.type === 'danger') {
        style.push(
          'text-light',
          'bg-red-500',
          'border-transparent',
          'active:bg-red-600'
        );
      }

      return style;
    };

    const renderIcon = () => {
      if (props.loading) {
        return slots.loadingIcon ? (
          slots.loadingIcon()
        ) : (
          <i
            class={[
              'iconfont',
              'inline-block',
              'animate-spin',
              props.loadingIcon,
            ]}
          />
        );
      }

      if (props.icon) {
        return <i class={['iconfont', 'inline-block', props.icon]} />;
      }

      if (slots.icon) {
        return slots.icon();
      }
    };

    const renderText = () => {
      if (props.loading) {
        if (slots.loadingText) {
          return slots.loadingText();
        }

        if (props.loadingText) {
          return <span class="mx-0.5">{props.loadingText}</span>;
        }
      }

      if (slots.default) {
        return slots.default();
      }
    };

    return () => (
      <button class={getStyle()} onClick={onClick}>
        {renderIcon()}
        {renderText()}
      </button>
    );
  },
});
```

预览之前，要改一改 `App.vue`，直接复制粘贴一下就行：

```vue title="App.vue"
<template>
  <div class="w-screen h-screen flex flex-col justify-evenly">
    <div class="flex justify-evenly items-center">
      <Button>默认按钮</Button>
      <Button type="primary">普通按钮</Button>
      <Button type="success">成功按钮</Button>
      <Button type="warning">警告按钮</Button>
      <Button type="danger">危险按钮</Button>
    </div>
    <div class="flex justify-evenly items-center">
      <Button size="lg">大按钮</Button>
      <Button>中按钮</Button>
      <Button size="sm">小按钮</Button>
    </div>
    <div class="flex justify-evenly items-center">
      <Button icon="icon-rocket">自定义图标</Button>
      <Button type="primary" icon="icon-rocket">自定义图标</Button>
      <Button type="success" icon="icon-rocket">自定义图标</Button>
      <Button type="warning" icon="icon-rocket">自定义图标</Button>
      <Button type="danger" icon="icon-rocket">自定义图标</Button>
    </div>
    <div class="flex justify-evenly items-center">
      <Button :loading="true" />
      <Button :loading="true" loadingText="正在加载中" />
      <Button
        :loading="true"
        loadingText="自定义加载图标"
        loadingIcon="icon-reload"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/components/Button';

export default defineComponent({
  name: 'App',

  components: {
    Button,
  },
});
</script>
```

最终实现的效果是这样的：

![Button](http://cdn.jack-wjq.cn/PicGo/image-20210613161032685.png)

看完代码之后，是不是觉得用 `Windi CSS` 写组件库也挺爽的？

## 编写测试用例

组件写好了，人工测试好像也没啥问题啊，为啥还要写测试用例呢？

而且这里还没采用 `TDD` 的思想，先写测试用例再写代码，为什么呢？

人工测试当然没问题，组件能正常运行，也没发现什么问题，但是万一以后要重构呢？或者人工测试不够完美，没覆盖到所有分支呢？这就需要用自动化测试的脚本和测试覆盖率报告来约束了。

至于为什么没用 `TDD`，先写测试用例再写代码，是因为我本人抽象能力还不够，还没有炼成在编码之前就抽象出组件的输入输出的能力，就只能边写边看，再测试了。（太菜了）

现在就来一起写测试用例！

### 引入工具

要做组件的测试就一定要有对应的工具对组件进行渲染，并能够调用一些 `API` 来触发一些事件。

这里就采用 `Vue` 官方提供的 `Vue Test Utils（VTU）` 来测试。

与 `Button` 同级的目录下创建一个 `Button.test.tsx`，引入 `VTU` 和 `Button` 组件：

```tsx
import { shallowMount } from '@vue/test-utils';

import Button from './Button';
```

事实上 `VTU` 为我们提供了两种渲染组件的方法（`shallowMount/mount`），这里引入的时候选择的是 `shallowMount` 而不是 `mount`，因为在 `Button` 中，除了 `HTML` 标签外不存在其他组件，即 `Button` 组件内没有包含子组件，所以直接使用 `shallowMount`。

`shallowMount` 和 `mount` 两者的渲染行为是有差异的，前者只会渲染当前组件，子组件的内容不会被渲染，而后者会将整个组件树都渲染出来。

关于两者渲染行为的差异，可以查看这篇文章：[Difference between mount and shallowMount in Vue Test Utils](https://reactgo.com/vue-testing-mount-vs-shallowmount/)

建议在能使用 `shallowMount` 的情况下优先使用 `shallowMount`，能有效提高跑测试用例的速度。

### 事件分发

`Button` 组件最重要功能当然是 `click`，所以一定要对 `click` 事件做测试，组件内部一定要能够向外分发 `click` 事件，对应的测试用例：

```tsx
it('should emit click event.', async () => {
  const wrapper = shallowMount(Button);

  await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeDefined();
});
```

`VTU` 渲染组件后会返回一个组件的 `wrapper` 实例，通过调用 `wrapper` 上的方法和属性能够实现一些能力，上面调用 `wrapper.trigger('click')` 就是触发组件的 `click` 事件。

然后在断言里，需要判断组件是否有向外分发 `click` 事件。通过 `wrapper.emitted('click')` 能够获取到组件是否向外分发了 `click` 事件，如果有则 `wrapper.emitted('click')` 的值不为 `undefined`，就可以断言其是 `toBeDefined` 的。

当然，这段测试用例也有坑，那就是只知道组件向外分发了 `click` 事件，但是不知道分发了几次，所以也有需要改的地方。`wrapper.emitted` 的返回值是 `Event[] | undefined`，因此可以改成：

```tsx {6}
it('should emit click event.', async () => {
  const wrapper = shallowMount(Button);

  await wrapper.trigger('click');
  // expect(wrapper.emitted('click')).toBeDefined();
  expect(wrapper.emitted('click')).toHaveLength(1);
});
```

`Button` 组件肯定有被 `disabled` 的时候，这个时候组件是不可用的，也就是说不能向外分发 `click` 事件，对应的测试用例：

```tsx
it('should not emit click event when disabled.', async () => {
  const wrapper = shallowMount(Button, {
    props: {
      disabled: true,
    },
  });

  await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeUndefined();
});
```

同样的，当 `Button` 组件处于 `loading` 状态的时候，也不能向外分发 `click` 事件，对应的测试用例：

```tsx
it('should not emit click event when loading.', async () => {
  const wrapper = shallowMount(Button, {
    props: {
      loading: true,
    },
  });

  await wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeUndefined();
});
```

## 组件渲染

事件分发测试完了之后，就需要测试组件渲染的部分了。

测试渲染通常会用到快照测试，将组件以快照的形式保存下来，一方面能够直观地看到渲染结果，另一方面当渲染结果发生变化是能够得到提醒，查看渲染结果的变动内容。

测试组件渲染的时候也需要转变一下思路，因为组件是使用 `Windi CSS` 来实现样式的，所以测试渲染是否正常只需要找到对应的元素，判断 `class` 上是否有需要的样式即可。

因为使用了 `iconfont` 的 `Font class`，所以测试起来也很方便。

后面的测试用例，都在测试组件渲染并生成快照，直接贴代码：

```tsx
it('should render icon correctly.', async () => {
  const wrapper = shallowMount(Button, {
    props: {
      icon: 'icon-rocket',
    },
  });

  expect(wrapper.find('.icon-sync').exists()).toBeFalsy();
  expect(wrapper.find('.icon-rocket').exists()).toBeTruthy();
  expect(wrapper.html()).toMatchSnapshot();

  await wrapper.setProps({ loading: true });

  expect(wrapper.find('.icon-sync').exists()).toBeTruthy();
  expect(wrapper.find('.icon-rocket').exists()).toBeFalsy();
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render text correctly.', async () => {
  const wrapper = shallowMount(Button, {
    props: {
      loadingText: 'Custom Loading',
    },
    slots: {
      default: () => <span>Custom Text</span>,
    },
  });

  expect(wrapper.find('span').exists()).toBeTruthy();
  expect(wrapper.find('span').element).toHaveTextContent(/custom text/gi);
  expect(wrapper.find('.icon-sync').exists()).toBeFalsy();
  expect(wrapper.html()).toMatchSnapshot();

  await wrapper.setProps({ loading: true });

  expect(wrapper.find('span').exists()).toBeTruthy();
  expect(wrapper.find('span').element).toHaveTextContent(/custom loading/gi);
  expect(wrapper.find('.icon-sync').exists()).toBeTruthy();
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render icon slot correctly.', async () => {
  const wrapper = shallowMount(Button, {
    slots: {
      icon: () => <i class="iconfont icon-rocket" />,
    },
  });

  expect(wrapper.find('.icon-sync').exists()).toBeFalsy();
  expect(wrapper.find('.icon-rocket').exists()).toBeTruthy();
  expect(wrapper.html()).toMatchSnapshot();

  await wrapper.setProps({ loading: true });

  expect(wrapper.find('.icon-sync').exists()).toBeTruthy();
  expect(wrapper.find('.icon-rocket').exists()).toBeFalsy();
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render loading slot correctly.', async () => {
  const wrapper = shallowMount(Button, {
    slots: {
      loadingIcon: () => <i class="iconfont icon-reload" />,
      loadingText: () => <span>Custom Loading</span>,
    },
  });

  expect(wrapper.find('.icon-reload').exists()).toBeFalsy();
  expect(wrapper.find('span').exists()).toBeFalsy();
  expect(wrapper.html()).toMatchSnapshot();

  await wrapper.setProps({ loading: true });

  expect(wrapper.find('.icon-reload').exists()).toBeTruthy();
  expect(wrapper.find('span').element).toHaveTextContent(/custom loading/gi);
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render small button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      size: 'sm',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('should render large button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      size: 'lg',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

it('should render primary button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      type: 'primary',
    },
  });

  expect(wrapper.element).toHaveClass('bg-blue-500');
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render success button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      type: 'success',
    },
  });

  expect(wrapper.element).toHaveClass('bg-green-500');
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render warning button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      type: 'warning',
    },
  });

  expect(wrapper.element).toHaveClass('bg-yellow-500');
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render danger button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      type: 'danger',
    },
  });

  expect(wrapper.element).toHaveClass('bg-red-500');
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render block button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      block: true,
    },
  });

  expect(wrapper.element).toHaveClass('block');
  expect(wrapper.html()).toMatchSnapshot();
});

it('should render round button correctly.', () => {
  const wrapper = shallowMount(Button, {
    props: {
      round: true,
    },
  });

  expect(wrapper.element).toHaveClass('rounded-full');
  expect(wrapper.html()).toMatchSnapshot();
});
```

简单介绍一下几个方法：

- `wrapper.find('span').exists()` 返回一个 `boolean`，用于判断 `span` 标签是否存在，`find` 方法的参数是一个选择器，可以是 `id` 选择器，也可以是 `class` 选择器等等。
- `wrapper.find('span').element` 返回一个 `DOM`，用于获取 `span` 标签对应的 `DOM`，也可以获取其他任何满足选择器条件的 `DOM`。
- `wrapper.html()` 返回一个 `HTML` 字符串，用于生成组件快照。
- `toBeTruthy/toBeFalsy` 用于断言结果为真值/假值。
- `toHaveTextContent` 用于断言当前元素是否有匹配的 `textContent`，参数为 `string | RegExp`。
- `toMatchSnapshot` 用于断言当前组件快照是否与上一次的组件快照相同，如果没有组件快照则会创建。

## 查看测试覆盖率

按照上面的测试用例跑一轮，测试覆盖率肯定是 100% 的，这是在简单组件上测试才有这样的效果。

事实上在实际应用当中，测试覆盖率很难达到 100%，能够达到百分之八九十就已经是很高的覆盖率了。

在上面的 `test:watch script` 里加了 `--coverage`，`Jest` 就会在根目录下生成一个 `coverage` 文件夹，将里面的 `clover.xml` 使用浏览器打开就能够查看测试覆盖的详情了。

页面效果像这样：

![index.html](http://cdn.jack-wjq.cn/PicGo/image-20210613173615563.png)

点击 `Button.tsx` 还能看到组件代码被测试的详细情况，例如某个分支被测试的次数以及未被测试到的分支：

![Button.tsx](http://cdn.jack-wjq.cn/PicGo/image-20210613173844763.png)

![Button.tsx](http://cdn.jack-wjq.cn/PicGo/image-20210613173912993.png)

## 总结

在写这篇文章的同时我也在不断学习和思考，深感自身代码功底还不够。

尤其是在写组件的时候完全不能抽象出组件的输入输出，导致没有办法先写测试用例再写组件。

希望这篇文章能给和我一样在不断学习的同学一些帮助！

## 参考资料

- [Jest 是一个令人愉快的 JavaScript 测试框架，专注于简洁明快。 | Jest](https://jestjs.io/zh-Hans/)
- [下一代前端开发与构建工具 | Vite](https://cn.vitejs.dev/)
- [Next generation utility-first CSS framework. | Windi CSS](https://cn.windicss.org/guide/)
- [@vue/cli-plugin-unit-jest | Haoqun Jiang](https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-unit-jest#readme)
- [Difference between mount and shallowMount in Vue test utils | Sai gowtham](https://reactgo.com/vue-testing-mount-vs-shallowmount/)
- [轻量、可靠的移动端 Vue 组件库 | Vant](https://vant-contrib.gitee.io/vant/v3/#/zh-CN/home)
