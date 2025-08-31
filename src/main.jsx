
// Vanilla JS Book Finder (works with Vite)
// Uses Open Library API with graceful fallbacks & mock data
const SUGGESTIONS = ["Clean Code", "Data Structures", "Machine Learning", "Algorithms", "Operating Systems", "Psychology", "Discrete Mathematics", "Artificial Intelligence"];

const MOCK_DATA = [
  { key: "/works/OL123W", title: "Clean Code", author_name: ["Robert C. Martin"], first_publish_year: 2008, cover_i: null, subject: ["Programming","Software Engineering"]},
  { key: "/works/OL456W", title: "Introduction to Algorithms", author_name: ["Cormen, Leiserson, Rivest"], first_publish_year: 1990, cover_i: null, subject: ["Algorithms","Computer Science"]},
  { key: "/works/OL789W", title: "Machine Learning", author_name: ["Tom M. Mitchell"], first_publish_year: 1997, cover_i: null, subject: ["AI","Data Science"]},
];

function $(sel) { return document.querySelector(sel) }
function create(tag, attrs = {}, children = []){
  const el = document.createElement(tag)
  for (const k in attrs) {
    if (k === 'class') el.className = attrs[k]
    else if (k.startsWith('on') && typeof attrs[k] === 'function') el.addEventListener(k.slice(2).toLowerCase(), attrs[k])
    else el.setAttribute(k, attrs[k])
  }
  for (const c of children) el.append(typeof c === 'string' ? document.createTextNode(c) : c)
  return el
}

document.addEventListener('DOMContentLoaded', () => {
  const q = $('#q'), author = $('#author'), subject = $('#subject'), yearFrom = $('#yearFrom'), yearTo = $('#yearTo')
  const searchBtn = $('#searchBtn'), suggestions = $('#suggestions'), results = $('#results'), loading = $('#loading'), empty = $('#empty')
  const gridBtn = $('#gridBtn'), listBtn = $('#listBtn')

  // render suggestions
  SUGGESTIONS.forEach(s => {
    const tag = create('button', { class: 'suggestion', type:'button', onclick: () => { q.value = s; doSearch() } }, [s])
    suggestions.appendChild(tag)
  })

  // view toggle
  gridBtn.addEventListener('click', () => { setView('grid') })
  listBtn.addEventListener('click', () => { setView('list') })

  function setView(v){
    if (v === 'list') {
      results.classList.remove('view-grid'); results.classList.add('view-list')
      gridBtn.classList.remove('active'); listBtn.classList.add('active')
    } else {
      results.classList.remove('view-list'); results.classList.add('view-grid')
      listBtn.classList.remove('active'); gridBtn.classList.add('active')
    }
  }

  function showLoading(on=true){
    loading.classList.toggle('hidden', !on)
  }

  function showEmpty(on=true){
    empty.classList.toggle('hidden', !on)
  }

  function showResultsContainer(has=true){
    results.classList.toggle('hidden', !has)
  }

  async function fetchOpenLibrary(params){
    const url = new URL('https://openlibrary.org/search.json')
    Object.keys(params).forEach(k => { if (params[k]) url.searchParams.set(k, params[k]) })
    // request a richer set
    url.searchParams.set('limit', '120')
    url.searchParams.set('fields', 'key,title,author_name,first_publish_year,edition_count,cover_i,subject')
    const res = await fetch(url.href)
    if (!res.ok) throw new Error('Network response was not ok')
    return await res.json()
  }

  async function doSearch(){
    const qv = q.value.trim(), av = author.value.trim(), sv = subject.value.trim()
    const yf = yearFrom.value.trim(), yt = yearTo.value.trim()

    // show loading
    showEmpty(false); showResultsContainer(true); showLoading(true)
    results.innerHTML = ''

    // if no query provided, show mock data
    if (!qv && !av && !sv) {
      await new Promise(r => setTimeout(r, 600))
      renderDocs(MOCK_DATA)
      showLoading(false)
      return
    }

    try {
      const params = {}
      if (qv) params.title = qv
      if (av) params.author = av
      if (sv) params.subject = sv
      const data = await fetchOpenLibrary(params)
      let docs = Array.isArray(data.docs) ? data.docs : []
      // year filtering
      docs = docs.filter(d => {
        const y = d.first_publish_year ?? 0
        if (yf && y < Number(yf)) return false
        if (yt && y > Number(yt)) return false
        return true
      })
      if (docs.length === 0) {
        renderDocs([])
      } else {
        renderDocs(docs)
      }
    } catch (err) {
      console.error(err)
      // on network failure, show mock data as fallback with a toast/alert
      alert('Network error — showing mock data.')
      renderDocs(MOCK_DATA)
    } finally {
      showLoading(false)
    }
  }

  searchBtn.addEventListener('click', doSearch)
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch() })

  // render documents
  function renderDocs(docs){
    results.innerHTML = ''
    if (!docs || docs.length === 0){
      showEmpty(true); showResultsContainer(false); return
    }
    showEmpty(false); showResultsContainer(true)
    docs.forEach((doc, idx) => {
      const card = create('article', { class: 'book-card enter' })
      const inner = create('div', { class: 'inner' })
      const coverWrap = create('div', { class: 'cover-wrap' })
      const img = create('img', { class: 'cover', src: coverUrl(doc), alt: `Cover of ${doc.title}` })
      coverWrap.appendChild(img)

      const meta = create('div', { class: 'meta' })
      meta.appendChild(create('div', { class: 'title' }, [doc.title || 'Untitled']))
      meta.appendChild(create('div', { class: 'author' }, [ (doc.author_name && doc.author_name[0]) || 'Unknown' ]))
      meta.appendChild(create('div', { class: 'author' }, [ 'Year: ' + (doc.first_publish_year || '—') ]))
      const badges = create('div', { class: 'badges' })
      ;(doc.subject || []).slice(0,3).forEach(s => badges.appendChild(create('div', { class: 'badge' }, [s])))
      meta.appendChild(badges)

      inner.appendChild(coverWrap)
      inner.appendChild(meta)
      card.appendChild(inner)

      // click -> alert feedback (as requested)
      card.addEventListener('click', () => {
        const title = doc.title || 'Untitled'
        const authorName = (doc.author_name && doc.author_name[0]) || 'Unknown'
        alert(`Selected: ${title}
Author: ${authorName}`)
      })

      // tilt effect
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        const rotateY = (px - 0.5) * 14
        const rotateX = (0.5 - py) * 10
        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
      })
      card.addEventListener('mouseleave', () => {
        card.style.transform = ''
      })

      results.appendChild(card)
      // entry animation stagger
      setTimeout(() => card.classList.add('show'), 30 + idx * 20)
    })
  }

  function coverUrl(doc){
    if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    return `https://placehold.co/400x600?text=No+Cover`
  }

  // initial view
  setView('grid')
  // initial empty prompt
  showEmpty(true)

  // ---------- background particle canvas ----------
  const canvas = document.getElementById('bg-canvas')
  const ctx = canvas.getContext('2d')
  let w = canvas.width = innerWidth, h = canvas.height = innerHeight
  window.addEventListener('resize', () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight })

  const stars = Array.from({length:140}, () => createStar())
  function createStar(){
    return { x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.6+0.2, vx:(Math.random()-0.5)*0.1, vy: (Math.random()*0.3+0.05), alpha: Math.random()*0.8+0.2 }
  }
  function loop(){
    ctx.clearRect(0,0,w,h)
    // soft gradient overlay
    const g = ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'rgba(80,130,170,0.03)'); g.addColorStop(1,'rgba(10,20,40,0.06)')
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h)
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy
      if (s.y > h+20){ s.y = -10; s.x = Math.random()*w }
      ctx.beginPath(); ctx.globalAlpha = s.alpha * (0.7 + 0.3*Math.sin(Date.now()/500 + s.x)); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill()
    })
    ctx.globalAlpha = 1
    requestAnimationFrame(loop)
  }
  loop()
})
