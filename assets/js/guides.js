
/*! Guides Data Store (localStorage) */
(function(){
  const LS_KEY = 'guides';
  const today = () => new Date().toISOString().slice(0,10);
  const read = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch(e){ return []; }
  };
  const write = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr||[]));
  const slug = (s='') => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const newId = (title) => slug(title)+'-'+Date.now().toString(36);

  // seed only once if store is empty
  const seedIfEmpty = () => {
    const cur = read();
    if(cur && cur.length) return;
    const seed = (window.GUIDES_STATIC || [{
      id: newId('Cách chưng yến đúng chuẩn'),
      title: 'Cách chưng yến đúng chuẩn – Giữ trọn dưỡng chất',
      image: './assets/img/tintuc/tintuc11.png',
      content: '<p>Ngâm 20–30 phút rồi chưng cách thủy 20–25 phút lửa nhỏ. Không chưng quá lâu.</p>',
      excerpt: 'Hướng dẫn chưng yến cách thủy: tỉ lệ nước, thời gian, mẹo bảo quản.',
      date: today()
    }]);
    write(seed);
  };
  seedIfEmpty();

  const list = () => {
    const stored = read();
    const staticArr = Array.isArray(window.GUIDES_STATIC) ? window.GUIDES_STATIC : [];
    // merge static + stored (stored wins)
    const map = new Map();
    staticArr.forEach(x=> map.set(x.id, x));
    stored.forEach(x=> map.set(x.id, x));
    return Array.from(map.values()).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  };

  const get = (id) => list().find(x=>x.id===id);
  const create = ({title,image,content}) => {
    const id = newId(title);
    const item = {
      id, title, image, content,
      date: today(),
      excerpt: (content||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().slice(0,140)+'...'
    };
    const arr = read(); arr.unshift(item); write(arr);
    // store last created for admin convenience
    localStorage.setItem('guides_last_created', id);
    return item;
  };
  const remove = (id) => {
    const arr = read().filter(x=>x.id !== id);
    write(arr);
  };

  window.GUIDES_API = { list, get, create, remove };
})();

// --- Compatibility layer ---
// Some pages may still read from window.GUIDES (static array). Provide a dynamic view.
try {
  Object.defineProperty(window, 'GUIDES', {
    get() { return (window.GUIDES_API && GUIDES_API.list()) || []; },
    configurable: true
  });
} catch(e) {
  // fallback
  window.GUIDES = (window.GUIDES_API && GUIDES_API.list()) || [];
}
