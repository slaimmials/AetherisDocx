// ========== SVG ICONS ==========
const icons = {
  function: `<img src="icons/Method.svg" class="vs-icon" alt="Function">`,
  class: `<img src="icons/Class.svg" class="vs-icon" alt="Class">`,
  example: `<img src="icons/images/CodeDefinitionWindow.svg" class="vs-icon" alt="Example">`,
  field: `<img src="icons/images/Field.svg" class="vs-icon" alt="Field">`,
  fieldPrivate: `<img src="icons/images/FieldPrivate.svg" class="vs-icon" alt="Private Field">`,
  method: `<img src="icons/Method.svg" class="vs-icon" alt="Method">`
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
      'uint8_t':'#ba68c8',
      Vector2: '#f2b134',
      Vector3: '#f2b134',
      Color:   '#f2b134',
      Player:  '#f2b134',
      Ents:    '#f2b134',
      world:'#f2b134'
    };
    return `<span style="color:${map[type]||'#fff'}">${type}</span>`;
  }
  static renderFieldRow(field, hasDesc) {
    const icon = field.private ? icons.fieldPrivate : icons.field;
    return `<tr>
      <td data-td="field">
        ${icon}
        ${
          field.private
            ? `<span class="private-fade" style="margin-left:5px;">
                <span style="color:#64b5f6;">${field.name}</span>
                <span style="background:#c62828;color:#fff;border-radius:3px;padding:0 7px;font-size:0.97em;margin-left:7px;">private</span>
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
          method.private
            ? `<span class="private-fade" style="margin-left:5px;">
                <span style="color:#f2b134;">${method.name}(${argNames})</span>
                <span style="background:#c62828;color:#fff;border-radius:3px;padding:0 7px;font-size:0.97em;margin-left:7px;">private</span>
                ${argsBlock}
              </span>`
            : `<span style="color:#f2b134;margin-left:5px;">${method.name}(${argNames})</span>${argsBlock}`
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
        ${(f.args||[]).map(a=>`<tr>
          <td data-td="field">${a.private ? icons.fieldPrivate : icons.field}<span style="color:#64b5f6;margin-left:5px;">${a.name}</span></td>
          <td data-td="type">${this.colorizeType(a.type)}</td>
          <td data-td="desc">${tr(a.desc) ? `<span style="color:#81c784;">${tr(a.desc)}</span>` : ''}</td>
        </tr>`).join('')}
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
let ApiDocuLangs, docFunctions, docStructs, docExamples, LANGS;
// Подключаем JSON (лучше всего делать это асинхронно в самом начале)
fetch('apidocu-data.json')
  .then(res => res.json())
  .then(data => {
    ApiDocuLangs = data.ApiDocuLangs;
    docFunctions = data.docFunctions;
    docStructs = data.docStructs;
    docExamples = data.docExamples;
    LANGS = data.LANGS;
  });
let currentLang = localStorage.getItem('api_lang') || 'ru';

// ========== SIDEBAR RENDER ==========
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `
    <div class="vs-nav-group">
      <div class="vs-nav-title">${LANGS[currentLang]["nav-functions"]||"Функции"}</div>
      ${docFunctions.map((f,i)=>`
        <div class="vs-nav-item" data-section="function" data-index="${i}">${icons.function}<span>${f.name}</span></div>
      `).join('')}
    </div>
    <div class="vs-nav-group">
      <div class="vs-nav-title">${LANGS[currentLang]["nav-classes"]||"Классы"}</div>
      ${docStructs.map((s,i)=>`
        <div class="vs-nav-item" data-section="class" data-index="${i}">${icons.class}<span>${s.name}</span></div>
      `).join('')}
    </div>
    <div class="vs-nav-group">
      <div class="vs-nav-title">${LANGS[currentLang]["nav-examples"]||"Примеры"}</div>
      ${docExamples.map((ex,i)=>`
        <div class="vs-nav-item" data-section="example" data-index="${i}">${icons.example}<span>${tr(ex.title)}</span></div>
      `).join('')}
    </div>
  `;
  sidebar.querySelectorAll('.vs-nav-item').forEach(item=>{
    item.onclick = ()=>{
      sidebar.querySelectorAll('.vs-nav-item').forEach(i=>i.classList.remove('active'));
      item.classList.add('active');
      const section = item.dataset.section, idx = +item.dataset.index;
      renderMain(section, idx);
      history.replaceState(null, "", "");
    }
  });
}

// ========== MAIN CONTENT RENDER ==========
function renderMain(section, idx) {
  const main = document.getElementById('mainContent');
  if (section==='function') main.innerHTML = ApiDocu.renderFunction(docFunctions[idx]);
  if (section==='class') main.innerHTML = ApiDocu.renderStruct(docStructs[idx]);
  if (section==='example') main.innerHTML = ApiDocu.renderExample(docExamples[idx]);
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
const SEARCH_INDEX = [
  ...docFunctions.map((f,i)=>({type:'function', name:f.name, section:'function', index:i, label:{ru:'Функция',en:'Function'}})),
  ...docStructs.map((s,i)=>({type:'class', name:s.name, section:'class', index:i, label:{ru:'Класс',en:'Class'}})),
  ...docExamples.map((ex,i)=>({type:'example', name:tr(ex.title), section:'example', index:i, label:{ru:'Пример',en:'Example'}}))
];
const searchInput = document.getElementById('searchInput');
const searchSuggest = document.getElementById('searchSuggest');
searchInput.addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  if (!q) { searchSuggest.style.display='none'; searchSuggest.innerHTML=''; return; }
  const items = SEARCH_INDEX.filter(item => (item.name||'').toLowerCase().includes(q)).slice(0, 10);
  if(items.length) {
    let html = '<ul>';
    items.forEach(item => {
      html += `<li data-section="${item.section}" data-index="${item.index}">
        ${highlightMatches(item.name, q)}
        <span style="font-size:0.99em;color:#999;margin-left:7px;">${item.label[currentLang]||item.label['ru']}</span>
      </li>`;
    });
    html+='</ul>';
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
  const idx = +li.getAttribute('data-index');
  renderMain(section, idx);
  document.querySelectorAll('.vs-nav-item').forEach(item=>{
    if(item.dataset.section===section && +item.dataset.index===idx) item.classList.add('active');
    else item.classList.remove('active');
  });
  searchSuggest.style.display = 'none';
  searchInput.blur();
  setTimeout(() => searchInput.value='', 10);
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