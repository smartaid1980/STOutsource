# core-js-builder

[TOC]

## 介紹

為了使平台支援跨版本、跨瀏覽器等不同環境，除了 babel 編譯語法，還需要載入 polyfill 以順利使用新的類別方法，而 `core-js-builder` 就是可以根據目標環境建立需要的 polyfill 的工具

## 目前支援環境 2020-07-02

- 目標環境：chrome 63 (2017-12)
- 模組：ES (不包含 ESNext)

## 使用方法

:::info
如果需要更改支援環境才需要重新 build
:::

### 修改 `builder.option`

找到檔案 `util\core-js-builder\builder-option.json`，根據需求更改裡面的 `option`

- targets: 目標環境，參考 [browserlist](https://github.com/browserslist/browserslist)
- module: 希望包含的模組，參考 core-js 的文件
- blacklist: 希望排除的模組，參考 core-js 的文件
- filename: bundle.js 的目的地，預設為 `src/main/webapp/js/my-core-js-bundle.js`

### 確認兼容的特性

:::info
此步驟不是必須
:::

cmd 執行 `node --experimental-modules util/core-js-builder/compat-data.js`

console 會印出要支援的特性

### 執行

cmd 執行 `npm run build-core-js-bundle`

### deploy

`gradle moveFrontend`
`gradle unzipwar`

## 其他

### core-js

[Github 連結](https://github.com/zloirock/core-js)

將 Javascript 的各個特性包裝成模組，與 babel 整合，可當作 polyfill 以支援跨瀏覽、跨版本

> Modular standard library for JavaScript. Includes polyfills for ECMAScript up to 2020: promises, symbols, collections,  iterators, typed arrays, many other features, ECMAScript proposals, some cross-platform WHATWG / W3C features and proposals like URL. You can load only required features or use it without global namespace pollution.

### core-js-compat

[Github 連結](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat)

以 `browserlist` 取得目標環境欠缺的 JS 特性

### core-js-builder

[Github 連結](https://github.com/zloirock/core-js/tree/master/packages/core-js-builder)

根據 core-js-compat 取得的特性列表，包裝成單一檔案
