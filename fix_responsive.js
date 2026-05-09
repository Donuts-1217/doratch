const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const cssToInsert = `
        /* 響應式縮放與排版 */
        html, body { max-width: 100vw; overflow-x: hidden; }
        .app-container { width: 100%; max-width: 100vw; overflow: hidden; }
        .main-content { overflow-x: auto; box-sizing: border-box; }
        
        @media (max-width: 1024px) {
            .app-container { flex-direction: column; }
            
            /* 導覽列改為橫向可滑動 */
            .sidebar-main { width: 100vw; height: auto; position: static; flex-direction: row; overflow-x: auto; white-space: nowrap; flex-wrap: nowrap; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .sidebar-logo { display: none; }
            .sidebar-main > div[style*="uppercase"] { display: none; }
            .nav-item { padding: 12px 20px; font-size: 14px; flex-shrink: 0; border-left: none !important; border-bottom: 2px solid transparent; }
            .nav-item.active { border-bottom: 2px solid var(--primary); }
            .sidebar-footer { width: auto; border: none; padding: 5px 15px; display: flex; align-items: center; margin-top: 0; flex-shrink: 0; }
            
            .main-content { margin-left: 0; padding: 15px; width: 100vw; }
            
            /* 卡片與通用排版 */
            #user-stats-card { flex-wrap: wrap; justify-content: center; text-align: center; }
            #user-stats-card > div { width: 100%; }
            .header, .header-title { flex-direction: column; gap: 15px; text-align: center; }
            .project-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
            .game-grid { grid-template-columns: 1fr; }
            
            /* 遊戲區域適應 */
            .boss-raid-container, .game-frame { width: 100%; box-sizing: border-box; padding: 20px 10px; min-height: auto; }
            .duel-arena { grid-template-columns: 1fr; }
            .boss-image-container { width: 200px; height: 200px; margin: 0 auto 15px; }
        }
        
        @media (max-width: 740px) {
            /* 精準縮放 700px 的遊戲畫布 (塔防與PvP) */
            [style*="width:700px"] { 
                transform-origin: top left;
                transform: scale(calc((100vw - 30px) / 700));
                margin-bottom: calc(-300px * (1 - ((100vw - 30px) / 700))); 
            }
        }
        
        @media (max-width: 480px) {
            .nav-item { font-size: 13px; padding: 10px 15px; }
            .hero h1 { font-size: 2.5rem; }
        }
`;

for(let f of files) {
   let content = fs.readFileSync(f, 'utf8');
   
   // remove old injected block
   const startIndex = content.indexOf('/* 響應式縮放與排版 */');
   if (startIndex !== -1) {
       const endIndex = content.indexOf('</style>', startIndex);
       if (endIndex !== -1) {
           content = content.substring(0, startIndex) + content.substring(endIndex);
       }
   }
   
   if(content.includes('</style>')) {
       content = content.replace('</style>', cssToInsert + '\n    </style>');
   }
   
   fs.writeFileSync(f, content);
}

console.log("Updated Responsive CSS applied to all HTML files.");
