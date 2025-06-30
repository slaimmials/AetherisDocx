// ===== LIBRARY FOR AUTODOC =====
class ApiDocu {
  static colorizeType(type) {
    const map = {
      float:   '#ba68c8',
      int:     '#ba68c8',
      string:  '#81c784',
      bool:    '#ffd54f',
      'uint8_t':'#ba68c8',
      Vector2: '#f2b134',
      Vector3: '#f2b134',
      Color:   '#f2b134',
      Player:  '#f2b134',
      Ents:    '#f2b134',
      GameWorld:'#f2b134'
    };
    return `<span style="color:${map[type]||'#fff'}">${type}</span>`;
  }

  static renderFieldRow(field, hasDesc) {
    const trStyle = field.private ? ' style="opacity:.55;"' : '';
    return `<tr${trStyle}>
      <td data-td="field"><span style="color:#64b5f6;">${field.name}</span>${field.private ? ' <span style="background:#c62828; color:#fff; border-radius:3px;padding:0 7px;font-size:0.97em;margin-left:7px;">private</span>' : ''}</td>
      <td data-td="type">${this.colorizeType(field.type)}</td>
      ${hasDesc ? `<td data-td="desc">${field.desc ? `<span style="color:#81c784;">${field.desc}</span>` : ''}</td>` : '<td></td>'}
    </tr>`;
  }

  static renderMethodRow(method, hasDesc) {
    const argNames = (method.args || []).map(a => a.name).join(', ');
    let argsBlock = '';
    if (method.args && method.args.length) {
      argsBlock = `<div style="margin-left:1.7em;font-size:0.97em;margin-top:2px;">
        ${method.args.map(
          arg => `<div><b>${arg.name}</b>: <span style="color:#ba68c8;">${arg.type}</span>${arg.desc ? ` — <span style="color:#aaa;">${arg.desc}</span>` : ''}</div>`
        ).join('')}
      </div>`;
    }
    return `<tr${method.private ? ' style="opacity:.55;"' : ''}>
      <td data-td="method">
        <span style="color:#f2b134;">${method.name}(${argNames})</span>
        ${method.private ? ' <span style="background:#c62828;color:#fff;border-radius:3px;padding:0 7px;font-size:0.97em;margin-left:7px;">private</span>' : ''}
        ${argsBlock}
      </td>
      <td data-td="returns" style="vertical-align:top;">${ApiDocu.colorizeType(method.returns)}</td>
      ${hasDesc ? `<td data-td="desc" style="vertical-align:top;">${method.desc||''}</td>` : ''}
    </tr>`;
  }

  static renderStruct(s) {
    const hasDesc = s.fields.some(f => f.desc);
    return `<div class="card">
      <h2 style="color:#f2b134;">${s.name}</h2>
      <table>
        <tr>
          <th data-th="field" style="color:#64b5f6;">${ApiDocu._th('field')}</th>
          <th data-th="type" style="color:#ba68c8;">${ApiDocu._th('type')}</th>
          <th data-th="desc" style="color:#81c784;">${ApiDocu._th('desc')}</th>
        </tr>
        ${s.fields.map(f => ApiDocu.renderFieldRow(f, hasDesc)).join('')}
      </table>
      ${!s.noConstructor ? `
      <b style="color:#ffd54f;">${ApiDocu._th('constructor')}</b>
      <pre class="language-lua"><code class="language-lua">${s.name}(${s.fields.map(f=>`${f.name}: ${f.type}`).join(', ')})</code></pre>
      ` : ''}
      ${s.privateNote ? `<div style="font-size:0.98em;color:#ff8a65;margin:-0.5em 0 1.1em 0;">${s.privateNote}</div>` : ''}
      ${s.methods && s.methods.length ? `
      <b style="color:#ffd54f;">${ApiDocu._th('methods')}</b>
      <table>
        <tr>
          <th data-th="method" style="color:#ffd54f;">${ApiDocu._th('method')}</th>
          <th data-th="returns" style="color:#ba68c8;">${ApiDocu._th('returns')}</th>
          <th data-th="desc" style="color:#81c784;">${s.methods.some(m=>m.desc) ? ApiDocu._th('desc') : ""}</th>
        </tr>
        ${s.methods.map(m=>ApiDocu.renderMethodRow(m, s.methods.some(m=>m.desc))).join('')}
      </table>
      ` : ''}
    </div>`;
  }

  static renderFunction(f) {
    return `<div class="card">
      <h2 style="color:#f2b134;">${f.name}</h2>
      <p style="color:#90caf9;">${f.desc||''}</p>
      <table>
        <tr>
          <th data-th="param" style="color:#64b5f6;">${ApiDocu._th('param')}</th>
          <th data-th="type" style="color:#ba68c8;">${ApiDocu._th('type')}</th>
          <th data-th="desc" style="color:#81c784;">${ApiDocu._th('desc')}</th>
        </tr>
        ${(f.args||[]).map(a=>`<tr>
          <td data-td="field"><span style="color:#64b5f6;">${a.name}</span></td>
          <td data-td="type">${this.colorizeType(a.type)}</td>
          <td data-td="desc">${a.desc ? `<span style="color:#81c784;">${a.desc}</span>` : ''}</td>
        </tr>`).join('')}
      </table>
      <b style="color:#ffd54f;">${ApiDocu._th('returns')}</b> <code class="inline">${f.returns||'nil'}</code>
      ${f.example ? `<h4 style="color:#90caf9;">${ApiDocu._th('example')}</h4>
      <pre class="language-lua"><code class="language-lua">${f.example}</code></pre>` : ''}
    </div>`;
  }

  static renderExample(ex) {
    return `<div class="card">
      <h2 style="color:#f2b134;">${ex.title}</h2>
      <pre class="language-lua"><code class="language-lua">${ex.code}</code></pre>
    </div>`;
  }

  static _th(term) {
    if (window.ApiDocuLangs && window.ApiDocuLangs[window.currentLang||'ru'] && window.ApiDocuLangs[window.currentLang||'ru'][term]) {
      return window.ApiDocuLangs[window.currentLang||'ru'][term];
    }
    const d = {
      field:'Field', type:'Type', desc:'Description', constructor:'Constructor:', methods:'Methods:', method:'Method', returns:'Returns', param:'Parameter', example:'Example'
    };
    return d[term]||term;
  }

  static renderAll(data, container, mode) {
    if (mode === "struct") container.innerHTML = data.map(s=>this.renderStruct(s)).join('');
    if (mode === "function") container.innerHTML = data.map(f=>this.renderFunction(f)).join('');
    if (mode === "example") container.innerHTML = data.map(ex=>this.renderExample(ex)).join('');
    if(window.Prism) Prism.highlightAll();
  }
}
window.ApiDocu = ApiDocu;
// ===== END LIBRARY =====

// ==== YOUR DATA (multi-lang ready, ru/en) ====
window.ApiDocuLangs = {
  ru: {
    field: "Поле",
    type: "Тип",
    desc: "Описание",
    constructor: "Конструктор:",
    methods: "Методы:",
    method: "Метод",
    returns: "Возвращает:",
    param: "Параметр",
    example: "Пример"
  },
  en: {
    field: "Field",
    type: "Type",
    desc: "Description",
    constructor: "Constructor:",
    methods: "Methods:",
    method: "Method",
    returns: "Returns:",
    param: "Parameter",
    example: "Example"
  }
};

const docFunctions = [
  {
    name: "draw.rect",
    desc: {
      ru: "Рисует прямоугольник по координатам.",
      en: "Draws a rectangle at the specified coordinates."
    },
    args: [
      {name: "from", type:"Vector2", desc: {ru:"Начальные координаты" ,en: "Start coordinate"}},
      {name: "to", type:"Vector2", desc: {ru:"Конечные координаты",en:"End coordinate"}},
    ],
    returns: "class Rect",
    example: "draw.rect( Vector2(0,0) , Vector2(200,200) )"
  },
  {
    name: "draw.text",
    desc: {
      ru: "Рисует текст по координатам.",
      en: "Draws text at the specified coordinates."
    },
    args: [
      {name: "position", Vector2", desc: {ru:"Позиция текста" ,en:"Text position"}},
      {name: "text", type:"string", desc: {ru:"Текст",en:"Text"}},
      {name: "size", type:"float", desc: {ru:"Размер текста",en:"Text size"}}
    ],
    returns: "class Text",
    example: 'draw.text( Vector2(), "test", 16)'
  },
  {
    name: "view.WorldToScreen",
    desc: {
      ru: "Получает координаты объекта на экране.",
      en: "Gets the coordinates of an object on the screen."
    },
    args: [
      {name: "point", type:"Vector3", desc: {ru:"Координаты в игре",en:"Ingame coordinates"}},
    ],
    returns: "Vector2"
  },
  {
    name: "view.CalculateAngles",
    desc: {
      ru: "Рассчитывет угол между двумя точками.",
      en: "Calculates the angle between two points."
    },
    args: [
      {name: "point", type:"Vector3", desc: {ru:"Координаты в игре",en:"Ingame coordinates"}},
      {name: "point", type:"Vector3", desc: {ru:"Координаты в игре",en:"Ingame coordinates"}},
    ],
    returns: "Vector3"
  },
  {
    name: "view.Normalize",
    desc: {
      ru: "Нормализует вектор(направление).",
      en: "Normalizes a vector."
    },
    args: [
      {name: "point", type:"Vector3", desc: {ru:"Направление",en:"Vector"}},
    ],
    returns: "Vector3"
  },
];

const docStructs = [
  {
    name: "Vector2",
    fields: [
      { name: "x", type: "float", desc: {ru:"X-координата",en:"X coordinate"} },
      { name: "y", type: "float", desc: {ru:"Y-координата",en:"Y coordinate"} }
    ]
  },
  {
    name: "Vector3",
    fields: [
      { name: "x", type: "float", desc: {ru:"X-координата",en:"X coordinate"} },
      { name: "y", type: "float", desc: {ru:"Y-координата",en:"Y coordinate"} },
      { name: "z", type: "float", desc: {ru:"Z-координата",en:"Z coordinate"} }
    ]
  },
  {
    name: "Color",
    fields: [
      { name: "r", type: "uint8_t" },
      { name: "g", type: "uint8_t" },
      { name: "b", type: "uint8_t" },
      { name: "a", type: "uint8_t" }
    ]
  },
  {
    name: "Player",
    noConstructor: true,
    fields: [
      { name: "alive", type: "bool",  desc: {ru:"Жив ли игрок", en:"Is player alive"} },
      { name: "scoped", type: "bool", desc: {ru:"В прицеле ли", en:"Is scoped"} },
      { name: "health", type: "float",  desc: {ru:"Текущее здоровье", en:"Current health"} },
      { name: "team", type: "float",  desc: {ru:"Номер команды", en:"Team number"} },
      { name: "pos", type: "Vector3",  desc: {ru:"Позиция", en:"Position"} },
      { name: "velocity", type: "Vector3",  desc: {ru:"Скорость", en:"Velocity"} },
      { name: "pawnAddr", type: "uintptr_t", private: true },
      { name: "controllerAddr", type: "uintptr_t", private: true }
    ],
    methods: [
      { name: "isValid", args: [], returns: "bool", desc: {ru:"Проверяет валидность игрока", en:"Checks if player valid"} },
    ]
  },
  {
    name: "Rect",
    noConstructor: true,
    fields: [
      { name: "p1", type: "Vector2", desc: "Top-left corner" },
      { name: "p2", type: "Vector2", desc: "Bottom-right corner" },
      { name: "color", type: "Color", desc: "Rectangle color" },
      { name: "rounding", type: "float", desc: "Corner radius" },
      { name: "visible", type: "bool", desc: "Is rectangle visible", default: "true" },
      { name: "destroyed", type: "bool", desc: "Was rectangle destroyed", default: "false" }
    ]
  },
  {
    name: "Text",
    noConstructor: true,
    fields: [
      { name: "pos", type: "Vector2", desc: "Text position" },
      { name: "text", type: "string", desc: "Text string" },
      { name: "color", type: "Color", desc: "Text color" },
      { name: "size", type: "float", desc: "Font size" },
      { name: "visible", type: "bool", desc: "Is text visible", default: "true" },
      { name: "destroyed", type: "bool", desc: "Was text destroyed", default: "false" }
    ]
  },
  {
    name: "Ents",
    noConstructor: true,
    fields: [
      { name: "clientBase", type: "uintptr_t", private: true }
    ],
    methods: [
      { name: "LocalPlayer", args: [], returns: "Player", desc: {ru:"Локальный игрок", en:"Local player"} },
      { name: "GetPlayers", 
        args: [
          {name:"skipLocal",type:"bool"},
          {name:"test",type:"float"},
        ], 
        returns: "table<Player>", 
        desc: {ru:"Список игроков", en:"List of players"} 
      }
    ]
  },
  {
    name: "GameWorld",
    noConstructor: true,
    fields: [
      { name: "ents", type: "Ents" }
    ],
    methods: [
      { name: "isLoaded", private: true, args: [], returns: "bool", desc: {ru:"Загружен ли мир", en:"Is world loaded"} }
    ]
  }
];

const docExamples = [
  {
    title: {ru:"Получить позицию игроков",en:"Get position of all players"},
    code:
`for _, player in ipairs(world.ents:GetPlayers()) do
    if player:isValid() and player:alive() then
        print(player:pos().x, player:pos().y, player:pos().z)
    end
end`
  },
  {
    title: {ru:"Получить здоровье локального игрока",en:"Check hp of local player"},
    code:
`localplayer = world.ents:LocalPlayer()
if localplayer:isValid() then
    print("HP:", localplayer:health())
end`
  }
];

// ====== LANG SWITCHER, SEARCH, TABS, ETC (как раньше) =====

const LANGS = {
  ru: {
    "title-main": "CSLua API — Документация",
    "nav-functions": "Функции",
    "nav-classes": "Классы",
    "nav-examples": "Примеры",
    "functions-title": "Функции",
    "classes-title": "Классы и структуры",
    "examples-title": "Примеры Lua-кода",
    "draw_rect-desc": "Рисует прямоугольник по координатам.",
    "draw_text-desc": "Рисует текст по координатам.",
    "returns": "Возвращает:",
    "example": "Пример",
    "example-lua": "Пример Lua",
    "param": "Параметр",
    "type": "Тип",
    "desc": "Описание",
    "field": "Поле",
    "constructor": "Конструктор:",
    "methods": "Методы:",
    "method": "Метод",
    "x-desc": "X-координата",
    "y-desc": "Y-координата",
    "w-desc": "Ширина",
    "h-desc": "Высота",
    "color-desc": "Цвет",
    "text-desc": "Текст",
    "example-getplayers": "Получить всех игроков",
    "example-localplayer": "Проверить локального игрока"
  },
  en: {
    "title-main": "CSLua API — Documentation",
    "nav-functions": "Functions",
    "nav-classes": "Classes",
    "nav-examples": "Examples",
    "functions-title": "Functions",
    "classes-title": "Classes and Structures",
    "examples-title": "Lua Code Examples",
    "draw_rect-desc": "Draws a rectangle at the specified coordinates.",
    "draw_text-desc": "Draws text at the specified coordinates.",
    "returns": "Returns:",
    "example": "Example",
    "example-lua": "Lua Example",
    "param": "Parameter",
    "type": "Type",
    "desc": "Description",
    "field": "Field",
    "constructor": "Constructor:",
    "methods": "Methods:",
    "method": "Method",
    "x-desc": "X coordinate",
    "y-desc": "Y coordinate",
    "w-desc": "Width",
    "h-desc": "Height",
    "color-desc": "Color",
    "text-desc": "Text",
    "example-getplayers": "Get all players",
    "example-localplayer": "Check local player"
  }
};
let currentLang = localStorage.getItem('api_lang') || 'ru';

function switchLang(lang) {
  if (!LANGS[lang]) return;
  currentLang = lang;
  localStorage.setItem('api_lang', lang);
  window.currentLang = lang;
  document.documentElement.lang = lang;
  
  document.getElementById("title-main").textContent = LANGS[lang]["title-main"];
  document.querySelectorAll('.tr').forEach(el => {
    const tr = el.getAttribute('data-tr');
    if (tr && LANGS[lang][tr]) el.textContent = LANGS[lang][tr];
  });
  document.getElementById('searchInput').placeholder = lang === 'ru' ? 'Поиск по API...' : 'Search API...';
  document.querySelectorAll('.lang-dropdown-list button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.getElementById('langDropdownBtn').textContent = lang === 'ru' ? 'Русский' : 'English';
  updateSuggestList();
  renderAutodocu();
}

// Dropdown logic
const langDropdown = document.getElementById('langDropdown');
const langDropdownBtn = document.getElementById('langDropdownBtn');
const langDropdownList = document.getElementById('langDropdownList');
langDropdownBtn.addEventListener('click', function(e) {
  langDropdown.classList.toggle('open');
});
langDropdownList.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function(e) {
    switchLang(this.dataset.lang);
    langDropdown.classList.remove('open');
  });
});
document.addEventListener('mousedown', function(e) {
  if (!langDropdown.contains(e.target)) langDropdown.classList.remove('open');
});

// Вкладки и боковое меню
function setActiveTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(sec => {
    sec.style.display = sec.id === 'tab-' + tab ? 'block' : 'none';
  });
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
});

const searchInput = document.getElementById('searchInput');
const searchSuggest = document.getElementById('searchSuggest');
const SEARCH_INDEX = [
  {type: 'function', name: {'ru':'draw.rect','en':'draw.rect'}, section: 'functions', anchor: 'draw_rect', label: {'ru': 'Функция', 'en': 'Function'}},
  {type: 'function', name: {'ru':'draw.text','en':'draw.text'}, section: 'functions', anchor: 'draw_text', label: {'ru': 'Функция', 'en': 'Function'}},
  {type: 'class', name: {'ru':'Vector2','en':'Vector2'}, section: 'classes', anchor: 'Vector2', label: {'ru':'Класс','en':'Class'}},
  {type: 'class', name: {'ru':'Vector3','en':'Vector3'}, section: 'classes', anchor: 'Vector3', label: {'ru':'Класс','en':'Class'}},
  {type: 'class', name: {'ru':'Color','en':'Color'}, section: 'classes', anchor: 'Color', label: {'ru':'Класс','en':'Class'}},
  {type: 'class', name: {'ru':'Player','en':'Player'}, section: 'classes', anchor: 'Player', label: {'ru':'Класс','en':'Class'}},
  {type: 'class', name: {'ru':'Ents','en':'Ents'}, section: 'classes', anchor: 'Ents', label: {'ru':'Класс','en':'Class'}},
  {type: 'class', name: {'ru':'GameWorld','en':'GameWorld'}, section: 'classes', anchor: 'GameWorld', label: {'ru':'Класс','en':'Class'}},
  {type: 'example', name: {'ru':'Получить всех игроков','en':'Get all players'}, section: 'examples', anchor: '', label: {'ru':'Пример','en':'Example'}},
  {type: 'example', name: {'ru':'Проверить локального игрока','en':'Check local player'}, section: 'examples', anchor: '', label: {'ru':'Пример','en':'Example'}}
];

function highlightMatches(text, query) {
  if (!query) return text;
  const re = new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}
function updateSuggestList() {
  if (searchInput.value.trim()) {
    const event = new Event('input');
    searchInput.dispatchEvent(event);
  }
}
searchInput.addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  document.querySelectorAll('.tab-content').forEach(sec => {
    sec.querySelectorAll('mark').forEach(m => {
      const txt = document.createTextNode(m.textContent);
      m.replaceWith(txt);
    });
    if (!q) return;
    sec.querySelectorAll('h2, h3, h4, p, td, th').forEach(node => {
      let html = node.innerHTML;
      if (!html.toLowerCase().includes(q)) return;
      html = html.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+')', 'gi'), '<mark>$1</mark>');
      node.innerHTML = html;
    });
  });
  if (q.length === 0) {
    searchSuggest.style.display = 'none';
    searchSuggest.innerHTML = '';
    return;
  }
  const items = SEARCH_INDEX
    .filter(item => (item.name[currentLang] || item.name['ru']).toLowerCase().includes(q))
    .slice(0, 8);

  if (items.length) {
    let html = '<ul>';
    items.forEach(item => {
      html += `<li data-section="${item.section}" data-anchor="${item.anchor}">${highlightMatches(item.name[currentLang] || item.name['ru'], q)} <span style="color:var(--text-muted);font-size:0.97em;">(${item.label[currentLang]})</span></li>`;
    });
    html += '</ul>';
    searchSuggest.innerHTML = html;
    searchSuggest.style.display = 'block';
  } else {
    searchSuggest.innerHTML = '';
    searchSuggest.style.display = 'none';
  }
});

searchSuggest.addEventListener('mousedown', function(e) {
  let li = e.target;
  while (li && li.tagName !== "LI") li = li.parentElement;
  if (!li) return;
  const section = li.getAttribute('data-section');
  const anchor = li.getAttribute('data-anchor');
  setActiveTab(section);
  if (anchor) {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      window.location.hash = "#" + anchor;
    }
  }
  searchSuggest.style.display = 'none';
  searchInput.blur();
  setTimeout(() => searchInput.focus(), 10);
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    searchSuggest.style.display = 'none';
    setTimeout(() => searchInput.focus(), 10);
  });
});
document.addEventListener('click', (e) => {
  if (!searchSuggest.contains(e.target) && e.target !== searchInput) {
    searchSuggest.style.display = 'none';
  }
});

document.querySelectorAll('h2[id]').forEach(h => {
  h.style.cursor = "pointer";
  h.title = "Скопировать ссылку на этот раздел";
  h.addEventListener('click', function() {
    window.location.hash = '#' + this.id;
  });
});

function onHashChange() {
  const hash = window.location.hash.slice(1);
  if(!hash) return;
  const sec = document.getElementById(hash);
  if(sec) {
    if(sec.closest('#tab-classes')) setActiveTab('classes');
    if(sec.closest('#tab-functions')) setActiveTab('functions');
  }
}
window.addEventListener('hashchange', onHashChange);
onHashChange();

function highlightAllLua() {
  Prism.highlightAll();
}

function renderAutodocu() {
  ApiDocu.renderAll(
    docFunctions.map(f=>({
      ...f,
      desc: typeof f.desc === 'object' ? f.desc[currentLang]||f.desc['ru'] : f.desc,
      args: f.args ? f.args.map(a=>({
        ...a,
        desc: a.desc ? (typeof a.desc === 'object' ? a.desc[currentLang]||a.desc['ru'] : a.desc) : undefined
      })) : []
    })),
    document.getElementById('auto-functions'),
    "function"
  );
  ApiDocu.renderAll(
    docStructs.map(s=>({
      ...s,
      fields: s.fields.map(f=>({
        ...f,
        desc: f.desc ? (typeof f.desc === 'object' ? f.desc[currentLang]||f.desc['ru'] : f.desc) : undefined
      })),
      methods: s.methods ? s.methods.map(m=>({
        ...m,
        desc: m.desc ? (typeof m.desc === 'object' ? m.desc[currentLang]||m.desc['ru'] : m.desc) : undefined
      })) : [],
      privateNote: s.privateNote
    })),
    document.getElementById('auto-classes'),
    "struct"
  );
  ApiDocu.renderAll(
    docExamples.map(ex=>({
      ...ex,
      title: typeof ex.title === 'object' ? ex.title[currentLang]||ex.title['ru'] : ex.title
    })),
    document.getElementById('auto-examples'),
    "example"
  );
}

document.addEventListener('DOMContentLoaded', function() {
  switchLang(currentLang);
  highlightAllLua();
});
searchInput.addEventListener('input', highlightAllLua);
