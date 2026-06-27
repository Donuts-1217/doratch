# Doratch 共用資料

網站與 React Native App 共用的靜態設定（商城、遊戲列表等）。

- `shop-catalog.json` — 商城道具（與 `shop.html` 的 `itemsBank` 同步）
- `games-catalog.json` — 遊戲中心入口

網站日後可改為 `import items from '../shared/shop-catalog.json'` 以單一來源維護。
