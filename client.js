// ========== SVG ICONS ==========
const icons = {
  function: `<img src="icons/Method.svg" class="vs-icon" alt="Function">`,
  class: `<img src="icons/Class.svg" class="vs-icon" alt="Class">`,
  example: `<img src="icons/PrettyCode.svg" class="vs-icon" alt="Example">`,
  field: `<img src="icons/Field.svg" class="vs-icon" alt="Field">`,
  fieldPrivate: `<img src="icons/FieldPrivate.svg" class="vs-icon" alt="Private Field">`,
  method: `<img src="icons/Method.svg" class="vs-icon" alt="Method">`,
  database: `<img src="icons/Database.svg" class="vs-icon" alt="Method">`,
  reference: `<img src="icons/BookStack.svg" class="vs-icon" alt="Reference">`
};

// ===== HELPERS =====
function tr(val) {
  if (typeof val === 'object' && val !== null) return val[currentLang] || val['ru'] || '';
  return val || '';
}

// ===== LIBRARY FOR AUTODOC =====
class ApiDocu {
  static colorizeType(type) {
    const map = {
      float:   '#ba68c8',
      int:     '#ba68c8',
      string:  '#81c784',
      bool:    '#ffd54f',
      function:'#f2b134',
      uint8_t: '#ba68c8',
      Vector2: '#4bc9a2',
      Vector3: '#4bc9a2',
      Color:   '#4bc9a2',
      Player:  '#4bc9a2',
      Ents:    '#4bc9a2',
      world:'#f2b134'
    };
    return `<span style="color:${map[type]||'#fff'}">${type}</span>`;
  }
static renderBadges(obj) {
  let html = '';
  if (obj.private)
    html += `<span style="background:#c62828;color:#fff;border-radius:3px;padding:0 7px;font-size:0.97em;margin-left:7px;">private</span>`;
  if (obj.wip)
    html += `<span style="background:#ffa000;color:#fff;border-radius:3px;padding:0 7px;font-size:0.97em;margin-left:7px;">wip</span>`;
  return html;
}
  static renderFieldRow(field, hasDesc) {
  const icon = field.private ? icons.fieldPrivate : icons.field;
  return `<tr>
    <td data-td="field">
      ${icon}
      ${
        field.private || field.wip
          ? `<span class="private-fade" style="margin-left:5px;">
              <span style="color:#64b5f6;">${field.name}</span>
              ${this.renderBadges(field)}
            </span>`
          : `<span style="color:#64b5f6;margin-left:5px;">${field.name}</span>`
      }
    </td>
    <td data-td="type">${
      field.private
        ? `<span class="private-fade">${this.colorizeType(field.type)}</span>`
        : this.colorizeType(field.type)
    }</td>
    ${
      hasDesc
        ? `<td data-td="desc">${
            field.private
              ? `<span class="private-fade" style="color:#81c784;">${tr(field.desc)}</span>`
              : (tr(field.desc) ? `<span style="color:#81c784;">${tr(field.desc)}</span>` : '')
          }</td>`
        : '<td></td>'
    }
  </tr>`;
}

static renderMethodRow(method, hasDesc) {
  const argNames = (method.args || []).map(a => a.name).join(', ');
  const signature = argNames ? `${method.name}(${argNames})` : method.name;
  let argsBlock = '';
  if (method.args && method.args.length) {
    argsBlock = `<div style="margin-left:1.7em;font-size:0.97em;margin-top:2px;">
      ${method.args.map(
        arg => `<div><b>${arg.name}</b>: <span style="color:#ba68c8;">${arg.type}</span>${tr(arg.desc) ? ` — <span style="color:#aaa;">${tr(arg.desc)}</span>` : ''}</div>`
      ).join('')}
    </div>`;
  }
  return `<tr>
    <td data-td="method">
      ${icons.method}
      ${
        method.private || method.wip
          ? `<span class="private-fade" style="margin-left:5px;">
              <span style="color:#f2b134;">${signature}</span>
              ${this.renderBadges(method)}
              ${argsBlock}
            </span>`
          : `<span style="color:#f2b134;margin-left:5px;">${signature}</span>${argsBlock}`
      }
    </td>
    <td data-td="returns" style="vertical-align:top;">
      ${method.private
        ? `<span class="private-fade">${ApiDocu.colorizeType(method.returns)}</span>`
        : ApiDocu.colorizeType(method.returns)
      }
    </td>
    ${hasDesc ? `<td data-td="desc" style="vertical-align:top;">
      ${method.private
        ? `<span class="private-fade">${tr(method.desc)||''}</span>`
        : (tr(method.desc)||'')
      }
    </td>` : ''}
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
      <p style="color:#90caf9;">${tr(f.desc)||''}</p>
      <table>
        <tr>
          <th data-th="param" style="color:#64b5f6;">${ApiDocu._th('param')}</th>
          <th data-th="type" style="color:#ba68c8;">${ApiDocu._th('type')}</th>
          <th data-th="desc" style="color:#81c784;">${ApiDocu._th('desc')}</th>
        </tr>
        ${(f.args||[]).map(a=> {
          let argsSignature = '';
          let argsBlock = '';
          if (a.type === 'function') {
            if (Array.isArray(a.args) && a.args.length) {
              argsSignature = `(${a.args.map(arg => arg.name).join(', ')})`;
              argsBlock = `<div style="margin-left:1.7em;font-size:0.97em;margin-top:2px;">
                ${a.args.map(
                  arg => `<div><b style="color:#ffd54f">${arg.name}:</b> <span style="color:#ba68c8;">${arg.type}</span>${tr(arg.desc) ? ` — <span style="color:#aaa;">${tr(arg.desc)}</span>` : ''}</div>`
                ).join('')}
              </div>`;
            } else {
              argsSignature = '';
            }
          }
          return `<tr>
            <td data-td="field">
              ${a.private ? icons.fieldPrivate : (a.type === 'function' ? icons.method : icons.field)}
              <span style="color:${a.type === 'function' ? '#f2b134' : '#64b5f6'};margin-left:5px;">
                ${a.name || ''}${a.type === 'function' ? argsSignature : ''}
              </span>
              ${argsBlock}
            </td>
            <td data-td="type" style="vertical-align:top;">${this.colorizeType(a.type)}</td>
            <td data-td="desc" style="vertical-align:top;">${tr(a.desc) ? `<span style="color:#81c784;">${tr(a.desc)}</span>` : ''}</td>
          </tr>`;
        }).join('')}
      </table>
      <b style="color:#ffd54f;">${ApiDocu._th('returns')}</b> <code class="inline">${f.returns||'nil'}</code>
      ${f.example ? `<h4 style="color:#90caf9;">${ApiDocu._th('example')}</h4>
      <pre class="language-lua"><code class="language-lua">${f.example}</code></pre>` : ''}
    </div>`;
  }
  static renderExample(ex) {
    return `<div class="card">
      <h2 style="color:#f2b134;">${tr(ex.title)}</h2>
      <pre class="language-lua"><code class="language-lua">${ex.code}</code></pre>
    </div>`;
  }
  static renderReference(refGroup) {
  return `
    <div class="card">
      <h2 style="color:#f2b134;">${tr(refGroup.title)}</h2>
      <table>
        <tr>
          <th style="color:#64b5f6;">${ApiDocu._th('name')}</th>
          <th style="color:#81c784;">${ApiDocu._th('desc')}</th>
        </tr>
        ${refGroup.items.map(item => `
          <tr>
            <td>
              <code style="color:#f2b134;">${item.name}</code>
              ${this.renderBadges(item)}
            </td>
            <td>${tr(item.desc)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}
  static _th(term) {
    if (window.ApiDocuLangs && window.ApiDocuLangs[window.currentLang||'ru'] && window.ApiDocuLangs[window.currentLang||'ru'][term]) {
      return window.ApiDocuLangs[window.currentLang||'ru'][term];
    }
    const d = {
      name: 'Name', field:'Field', type:'Type', desc:'Description', constructor:'Constructor:', methods:'Methods:', method:'Method', returns:'Returns', param:'Parameter', example:'Example'
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
  "ru": {
    "field": "Поле",
    "type": "Тип",
    "desc": "Описание",
    "constructor": "Конструктор:",
    "methods": "Методы:",
    "method": "Метод",
    "returns": "Возвращает:",
    "param": "Параметр",
    "example": "Пример"
  },
  "en": {
    "field": "Field",
    "type": "Type",
    "desc": "Description",
    "constructor": "Constructor:",
    "methods": "Methods:",
    "method": "Method",
    "returns": "Returns:",
    "param": "Parameter",
    "example": "Example"
  }
};

const docFunctions = [
  {
    "name": "draw.rect",
    "desc": {
      "ru": "Рисует прямоугольник по координатам.",
      "en": "Draws a rectangle at the specified coordinates."
    },
    "args": [
      {
        "name": "from",
        "type": "Vector2",
        "desc": {
          "ru": "Начальные координаты",
          "en": "Start coordinate"
        }
      },
      {
        "name": "to",
        "type": "Vector2",
        "desc": {
          "ru": "Конечные координаты",
          "en": "End coordinate"
        }
      }
    ],
    "returns": "class Rect",
    "example": "draw.rect( Vector2(0,0) , Vector2(200,200) )"
  },
  {
    "name": "draw.text",
    "desc": {
      "ru": "Рисует текст по координатам.",
      "en": "Draws text at the specified coordinates."
    },
    "args": [
      {
        "name": "position",
        "type": "Vector2",
        "desc": {
          "ru": "Позиция текста",
          "en": "Text position"
        }
      },
      {
        "name": "text",
        "type": "string",
        "desc": {
          "ru": "Текст",
          "en": "Text"
        }
      },
      {
        "name": "size",
        "type": "float",
        "desc": {
          "ru": "Размер текста",
          "en": "Text size"
        }
      }
    ],
    "returns": "class Text",
    "example": "draw.text( Vector2(), \"test\", 16)"
  },
  {
    "name": "view.WorldToScreen",
    "desc": {
      "ru": "Получает координаты объекта на экране.",
      "en": "Gets the coordinates of an object on the screen."
    },
    "args": [
      {
        "name": "point",
        "type": "Vector3",
        "desc": {
          "ru": "Позиция в игре",
          "en": "World point"
        }
      }
    ],
    "returns": "Vector2"
  },
  {
    "name": "view.CalculateAngles",
    "desc": {
      "ru": "Рассчитывет угол между двумя точками.",
      "en": "Calculates the angle between two points."
    },
    "args": [
      {
        "name": "point",
        "type": "Vector3",
        "desc": {
          "ru": "Точка от",
          "en": "Point from"
        }
      },
      {
        "name": "point",
        "type": "Vector3",
        "desc": {
          "ru": "Точка к",
          "en": "Point to"
        }
      }
    ],
    "returns": "Vector3"
  },
  {
    "name": "view.Normalize",
    "desc": {
      "ru": "Нормализует вектор(направление).",
      "en": "Normalizes a vector."
    },
    "args": [
      {
        "name": "point",
        "type": "Vector3",
        "desc": {
          "ru": "Направление",
          "en": "Vector"
        }
      }
    ],
    "returns": "Vector3"
  },
  {
    "name": "view.SetViewAngles",
    "desc": {
      "ru": "Меняет ваше направление взгляда",
      "en": "Edits your view angles"
    },
    "args": [
      {
        "name": "vector",
        "type": "Vector3",
        "desc": {
          "ru": "Направление",
          "en": "Angle"
        }
      }
    ],
    "returns": "Vector3"
  },
  {
    "name": "hook.Add",
    "desc": {
      "ru": "Регистрация обработчика на событие игры",
      "en": "Registering a handler for an specific event"
    },
    "args": [
      {
        "name": "hookName",
        "type": "string",
        "desc": {
          "ru": "Идентификатор события",
          "en": "Event ID"
        }
      },
      {
        "name": "id",
        "type": "string",
        "desc": {
          "ru": "Произвольный идентификатор",
          "en": "Custom ID"
        }
      },
      {
        "name": "func",
        "type": "function",
        "desc": {
          "ru": "Функция-триггер, вызывается при регистрации события",
          "en": "Trigger function, called when registering an event"
        },
      }
    ],
    "returns": "nil",
    "example": "hook.Add(\"Think\", \"test\", function()\n    print(\"function calling every tick\")\nend)"
  },
  {
    "name": "hook.Remove",
    "desc": {
      "ru": "Удаление обработчика на событие игры",
      "en": "Deleting a handler for a game event"
    },
    "args": [
      {
        "name": "hookName",
        "type": "string",
        "desc": {
          "ru": "Идентификатор события",
          "en": "Event ID"
        }
      },
      {
        "name": "id",
        "type": "string",
        "desc": {
          "ru": "Произвольный идентификатор",
          "en": "Custom ID"
        }
      }
    ],
    "returns": "nil",
    "example": "hook.Remove(\"Think\", \"test\")"
  },
  {
    "name": "util.TraceLine",
    "desc": {
      "ru": "Симуляция луча из одной точки в другую",
      "en": "Simulation of a beam from one point to another"
    },
    "args": [
      {
        "name": "ray",
        "type": "Ray",
        "desc": {
          "ru": "Идентификатор события",
          "en": "Event ID"
        }
      },
      {
        "name": "MASK_SHOT",
        "type": "int",
        "desc": {
          "ru": "Произвольный идентификатор",
          "en": "Custom ID"
        }
      },
      {
        "name": "ignore",
        "type": "table<Player>",
        "desc": {
          "ru": "Произвольный идентификатор",
          "en": "Custom ID"
        }
      },
      
    ],
    "returns": "nil",
    "example": "hook.Remove(\"Think\", \"test\")"
  }
];

const docStructs = [
  {
    "name": "Vector2",
    "fields": [
      {
        "name": "x",
        "type": "float",
        "desc": {
          "ru": "X-координата",
          "en": "X coordinate"
        }
      },
      {
        "name": "y",
        "type": "float",
        "desc": {
          "ru": "Y-координата",
          "en": "Y coordinate"
        }
      }
    ]
  },
  {
    "name": "Vector3",
    "fields": [
      {
        "name": "x",
        "type": "float",
        "desc": {
          "ru": "X-координата",
          "en": "X coordinate"
        }
      },
      {
        "name": "y",
        "type": "float",
        "desc": {
          "ru": "Y-координата",
          "en": "Y coordinate"
        }
      },
      {
        "name": "z",
        "type": "float",
        "desc": {
          "ru": "Z-координата",
          "en": "Z coordinate"
        }
      }
    ]
  },
  {
    "name": "Color",
    "fields": [
      {
        "name": "r",
        "type": "float",
        "desc": {
          "ru": "Красный",
          "en": "Red"
        }
      },
      {
        "name": "g",
        "type": "float",
        "desc": {
          "ru": "Зелёный",
          "en": "Green"
        }
      },
      {
        "name": "b",
        "type": "float",
        "desc": {
          "ru": "Синий",
          "en": "Blue"
        }
      },
      {
        "name": "a",
        "type": "float",
        "desc": {
          "ru": "Прозрачность",
          "en": "Alpha"
        }
      }
    ]
  },
  {
    "name": "Player",
    "noConstructor": true,
    "fields": [
      {
        "name": "alive",
        "type": "bool",
        "desc": {
          "ru": "Жив ли игрок",
          "en": "Is player alive"
        }
      },
      {
        "name": "scoped",
        "type": "bool",
        "desc": {
          "ru": "В прицеле ли",
          "en": "Is scoped"
        }
      },
      {
        "name": "health",
        "type": "float",
        "desc": {
          "ru": "Текущее здоровье",
          "en": "Current health"
        }
      },
      {
        "name": "team",
        "type": "float",
        "desc": {
          "ru": "Номер команды",
          "en": "Team number"
        }
      },
      {
        "name": "pos",
        "type": "Vector3",
        "desc": {
          "ru": "Позиция",
          "en": "Position"
        }
      },
      {
        "name": "velocity",
        "type": "Vector3",
        "desc": {
          "ru": "Скорость",
          "en": "Velocity"
        }
      },
      {
        "name": "name",
        "type": "string",
        "desc": {
          "ru": "Имя игрока",
          "en": "Player name"
        }
      },
      {
        "name": "pawnAddr",
        "type": "uintptr_t",
        "private": true
      },
      {
        "name": "controllerAddr",
        "type": "uintptr_t",
        "private": true
      }
    ],
    "methods": [
      {
        "name": "isValid",
        "args": [],
        "returns": "bool",
        "desc": {
          "ru": "Проверяет валидность игрока",
          "en": "Checks if player valid"
        }
      }
    ]
  },
  {
    "name": "Rect",
    "noConstructor": true,
    "fields": [
      {
        "name": "p1",
        "type": "Vector2",
        "desc": "Top-left corner"
      },
      {
        "name": "p2",
        "type": "Vector2",
        "desc": "Bottom-right corner"
      },
      {
        "name": "color",
        "type": "Color",
        "desc": "Rectangle color"
      },
      {
        "name": "rounding",
        "type": "float",
        "desc": "Corner radius"
      },
      {
        "name": "visible",
        "type": "bool",
        "desc": "Is rectangle visible",
        "default": "true"
      },
      {
        "name": "destroyed",
        "type": "bool",
        "desc": "Was rectangle destroyed",
        "default": "false"
      }
    ],
    "methods": [
      {
        "name": "destroy",
        "returns": "nil",
        "desc":{
          "ru": "Удаляет нарисованный квадрат",
          "en": "Deletes drawed rectangle"
        },
        "example": "rectangle = draw.rect( Vector2() , Vector2() )\nrectangle:destroy()"
      }
    ]
  },
  {
    "name": "Text",
    "noConstructor": true,
    "fields": [
      {
        "name": "pos",
        "type": "Vector2",
        "desc": "Text position"
      },
      {
        "name": "text",
        "type": "string",
        "desc": "Text string"
      },
      {
        "name": "color",
        "type": "Color",
        "desc": "Text color"
      },
      {
        "name": "size",
        "type": "float",
        "desc": "Font size"
      },
      {
        "name": "visible",
        "type": "bool",
        "desc": "Is text visible",
        "default": "true"
      },
      {
        "name": "destroyed",
        "type": "bool",
        "desc": "Was text destroyed",
        "default": "false"
      }
    ],
    "methods": [
      {
        "name": "destroy",
        "returns": "nil",
        "desc":{
          "ru": "Удаляет нарисованный квадрат",
          "en": "Deletes drawed rectangle"
        },
        "example": "text = draw.rect( Vector2() , \"Example text\" )\ntext:destroy()"
      }
    ]
  },
  {
    "name": "Ents",
    "noConstructor": true,
    "fields": [
      {
        "name": "clientBase",
        "type": "uintptr_t",
        "private": true
      }
    ],
    "methods": [
      {
        "name": "LocalPlayer",
        "args": [],
        "returns": "Player",
        "desc": {
          "ru": "Локальный игрок",
          "en": "Local player"
        }
      },
      {
        "name": "GetPlayers",
        "args": [],
        "returns": "table<Player>",
        "desc": {
          "ru": "Список игроков",
          "en": "List of players"
        }
      }
    ]
  },
  {
    "name": "world",
    "noConstructor": true,
    "fields": [
      {
        "name": "ents",
        "type": "Ents"
      }
    ],
    "methods": [
      {
        "name": "isLoaded",
        "private": true,
        "args": [],
        "returns": "bool",
        "desc": {
          "ru": "Загружен ли мир",
          "en": "Is world loaded"
        }
      }
    ]
  }
];

const docReferences = [
  {
    key: "hooks",
    title: {
      ru: "Доступные хуки",
      en: "Available Hooks"
    },
    items: [
      {
        name: "Think",
        desc: {
          ru: "Вызывается при каждом обновлении потока DLL",
          en: "Called every time the DLL thread is updated"
        }
      },
      {
        name: "DrawGui",
        desc: {
          ru: "Вызывается при отрисовке интерфейса",
          en: "Called when UI is rendered"
        }
      },
      {
        name: "PlayerDeath",
        wip: true,
        desc: {
          ru: "Вызывается при смерти игрока",
          en: "Called when player dies"
        }
      },
      {
        name: "PlayerSpawn",
        wip: true,
        desc: {
          ru: "Вызывается при спавне игрока",
          en: "Called when player spawning"
        }
      }
      
    ]
  },
  {
    key: "events",
    title: {
      ru: "События игры",
      en: "Game Events"
    },
    items: [
      // ... список событий
    ]
  }
];

const docExamples = [
  {
    "title": {
      "ru": "Получить позицию игроков",
      "en": "Get position of all players"
    },
    "code": "for _, player in ipairs(world.ents:GetPlayers()) do\n    if player:isValid() and player:alive() then\n        print(player:pos().x, player:pos().y, player:pos().z)\n    end\nend"
  },
  {
    "title": {
      "ru": "Получить здоровье локального игрока",
      "en": "Check hp of local player"
    },
    "code": "localplayer = world.ents:LocalPlayer()\nif localplayer:isValid() then\n    print(\"HP:\", localplayer:health())\nend"
  }
];

const LANGS = {
  "ru": {
    "title-main": "CSLua API — Документация",
    "nav-functions": "Функции",
    "nav-classes": "Классы",
    "nav-examples": "Примеры",
    "nav-references": "Справочники",
  },
  "en": {
    "title-main": "CSLua API — Documentation",
    "nav-functions": "Functions",
    "nav-classes": "Classes",
    "nav-examples": "Examples",
    "nav-references": "References",
  }
};

// ====================================

let currentLang = localStorage.getItem('api_lang') || 'ru';

// ========== SIDEBAR RENDER ==========

const SIDEBAR_SECTIONS = [
  {
    key: "functions",
    titleKey: "nav-functions",
    items: docFunctions,
    icon: icons.function,
    sectionType: "function",
    defaultOpen: true
  },
  {
    key: "classes",
    titleKey: "nav-classes",
    items: docStructs,
    icon: icons.class,
    sectionType: "class",
    defaultOpen: true
  },
  {
    key: "references",
    titleKey: "nav-references",
    items: docReferences,
    icon: icons.database,
    sectionType: "reference",
    itemRenderer: (item) => tr(item.title),
    defaultOpen: true
  },
  {
    key: "examples",
    titleKey: "nav-examples",
    items: docExamples,
    icon: icons.example,
    sectionType: "example",
    itemRenderer: (item) => tr(item.title),
    defaultOpen: false
  }
];

let sectionStates = JSON.parse(localStorage.getItem('api_section_states')) || {};

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  let html = '';

  SIDEBAR_SECTIONS.forEach(section => {
    const title = LANGS[currentLang][section.titleKey] || section.titleKey;
    const isOpen = sectionStates[section.key] ?? section.defaultOpen;
    
    html += `
      <div class="vs-nav-group" data-section-key="${section.key}">
        <div class="vs-nav-title toggle-section">
          <span class="toggle-icon">${isOpen ? '▼' : '▶'}</span>
          ${title}
        </div>
        <div class="vs-nav-items-container" style="${isOpen ? '' : 'display: none;'}">
    `;

    section.items.forEach((item, index) => {
      const label = section.itemRenderer 
        ? section.itemRenderer(item) 
        : item.name;
      
      html += `
        <div class="vs-nav-item" 
             data-section="${section.sectionType}" 
             data-index="${index}">
          ${section.icon}
          <span>${label}</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  sidebar.innerHTML = html;

  // Обработчики для сворачивания/разворачивания секций
  sidebar.querySelectorAll('.vs-nav-title.toggle-section').forEach(title => {
    title.addEventListener('click', function(e) {
      const group = this.closest('.vs-nav-group');
      const sectionKey = group.dataset.sectionKey;
      const container = this.nextElementSibling;
      
      const isOpen = container.style.display !== 'none';
      container.style.display = isOpen ? 'none' : '';
      
      const icon = this.querySelector('.toggle-icon');
      icon.textContent = isOpen ? '▶' : '▼';
      
      sectionStates[sectionKey] = !isOpen;
      localStorage.setItem('api_section_states', JSON.stringify(sectionStates));
      
      e.stopPropagation();
    });
  });

  // Обработчики для элементов навигации
  sidebar.querySelectorAll('.vs-nav-item').forEach(item => {
    item.addEventListener('click', function() {
      sidebar.querySelectorAll('.vs-nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      const section = this.dataset.section;
      const index = +this.dataset.index;
      renderMain(section, index);
      history.replaceState(null, "", "");
    });
  });
}

// ========== MAIN CONTENT RENDER ==========
function renderMain(section, idx) {
  const main = document.getElementById('mainContent');
  if (section==='function') main.innerHTML = ApiDocu.renderFunction(docFunctions[idx]);
  if (section==='class') main.innerHTML = ApiDocu.renderStruct(docStructs[idx]);
  if (section==='example') main.innerHTML = ApiDocu.renderExample(docExamples[idx]);
  if (section === 'reference') main.innerHTML = ApiDocu.renderReference(docReferences[idx]);
  if(window.Prism) Prism.highlightAll();
}

// ========== ЯЗЫК ==========
function switchLang(lang) {
  if (!LANGS[lang]) return;
  currentLang = lang;
  localStorage.setItem('api_lang', lang);
  window.currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  renderSidebar();
  document.getElementById('mainContent').innerHTML = `<div class="welcome">
    <h1>${lang==='ru'?'Добро пожаловать в CSLua API!':'Welcome to CSLua API!'}</h1>
    <p style="opacity:.8">${lang==='ru'?'Слева выберите раздел, чтобы посмотреть документацию к вашему API.':'Select a section on the left to view API documentation.'}</p>
  </div>`;
}

// ========== ПОИСК ==========
function highlightMatches(text, query) {
  if (!query) return text;
  const re = new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+')', 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

// Обновленный поисковый индекс с поддержкой References
const SEARCH_INDEX = [
  ...docFunctions.map((f, i) => ({
    type: 'function',
    name: f.name,
    section: 'function',
    index: i,
    label: { ru: 'Функция', en: 'Function' }
  })),
  ...docStructs.map((s, i) => ({
    type: 'class',
    name: s.name,
    section: 'class',
    index: i,
    label: { ru: 'Класс', en: 'Class' }
  })),
  ...docExamples.map((ex, i) => ({
    type: 'example',
    name: tr(ex.title),
    section: 'example',
    index: i,
    label: { ru: 'Пример', en: 'Example' }
  })),
  ...docReferences.flatMap((refGroup, groupIndex) => 
    refGroup.items.map(item => ({
      type: 'reference',
      name: item.name,
      section: 'reference',
      groupIndex: groupIndex,
      itemIndex: refGroup.items.indexOf(item),
      label: refGroup.title
    }))
  )
];

const searchInput = document.getElementById('searchInput');
const searchSuggest = document.getElementById('searchSuggest');

// Обновленный обработчик ввода для поиска
searchInput.addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  if (!q) {
    searchSuggest.style.display = 'none';
    searchSuggest.innerHTML = '';
    return;
  }

  const items = SEARCH_INDEX.filter(item => 
    (item.name || '').toLowerCase().includes(q)
  ).slice(0, 10);

  if (items.length) {
    let html = '<ul>';
    items.forEach(item => {
      const label = typeof item.label === 'object' ? 
                   item.label[currentLang] || item.label['ru'] : 
                   tr(item.label);
      
      html += `
        <li data-section="${item.section}" 
            data-index="${item.index || ''}"
            data-group-index="${item.groupIndex || ''}"
            data-item-index="${item.itemIndex || ''}">
          ${highlightMatches(item.name, q)}
          <span class="search-item-type">
            ${label}${item.groupIndex !== undefined ? ` (${tr(docReferences[item.groupIndex].title)})` : ''}
          </span>
        </li>
      `;
    });
    html += '</ul>';
    searchSuggest.innerHTML = html;
    searchSuggest.style.display = 'block';
  } else {
    searchSuggest.innerHTML = '<div class="no-results">' + 
      (currentLang === 'ru' ? 'Ничего не найдено' : 'No results found') + 
      '</div>';
    searchSuggest.style.display = 'block';
  }
});

// Обновленный обработчик клика по результатам поиска
searchSuggest.addEventListener('mousedown', function(e) {
  let li = e.target;
  while (li && li.tagName !== "LI") li = li.parentElement;
  if (!li) return;

  const section = li.getAttribute('data-section');
  const index = li.getAttribute('data-index');
  const groupIndex = li.getAttribute('data-group-index');
  const itemIndex = li.getAttribute('data-item-index');

  if (section === 'reference') {
    // Для справочников используем groupIndex и itemIndex
    const refGroup = docReferences[groupIndex];
    const refItem = refGroup.items[itemIndex];
    
    // Создаем временный объект для рендеринга
    const tempRef = {
      title: refGroup.title,
      items: [refItem] // Показываем только выбранный элемент
    };
    
    renderMain(section, groupIndex);
    document.getElementById('mainContent').innerHTML = ApiDocu.renderReference(tempRef);
  } else {
    // Для других разделов стандартный рендеринг
    renderMain(section, index);
  }

  // Подсветка выбранного элемента в сайдбаре
  document.querySelectorAll('.vs-nav-item').forEach(item => {
    if (section === 'reference') {
      // Особый случай для справочников
      const refItem = document.querySelector(`.vs-nav-item[data-section="reference"][data-index="${groupIndex}"]`);
      if (refItem) refItem.classList.add('active');
    } else if (item.dataset.section === section && +item.dataset.index === +index) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  searchSuggest.style.display = 'none';
  searchInput.blur();
  setTimeout(() => searchInput.value = '', 10);
});

// Закрытие поиска при клике вне его
document.addEventListener('click', function(e) {
  if (!searchSuggest.contains(e.target)) {
    searchSuggest.style.display = 'none';
  }
});

// ========== ЯЗЫКОВЫЕ КНОПКИ ==========
document.querySelectorAll('.lang-btn').forEach(btn=>{
  btn.onclick = ()=>switchLang(btn.dataset.lang);
});

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', ()=>{
  window.currentLang = localStorage.getItem('api_lang') || 'ru';
  renderSidebar();
  // Открыть первую функцию по умолчанию
  const sidebar = document.getElementById('sidebar');
  const firstItem = sidebar.querySelector('.vs-nav-item');
  if(firstItem) { firstItem.classList.add('active'); firstItem.click(); }
  window.Prism = window.Prism || undefined;
});
