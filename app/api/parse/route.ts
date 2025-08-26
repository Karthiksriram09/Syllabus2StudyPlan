import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { DOMAIN_KEYWORDS, TOPIC_LIBRARY } from '@/lib/topicLibrary'

function clean(text: string) {
  return text.replace(/\r/g, ' ').replace(/\n+/g, '\n').replace(/\s+/g, ' ').trim()
}

function baseExtractTopics(text: string): string[] {
  if (!text) return []
  let t = text
  const patterns = [/\n\s*\d+\.?\s+/gi, /\n\s*[•\-*]\s+/g, /\n\s*[A-Z]\)\s+/g]
  for (const p of patterns) t = t.replace(p, '\n')
  const lines = t.split('\n')
    .map(ln => ln.replace(/[^\w\s\-\(\)\,\:\/\+\&]/g, '').trim())
  const topics: string[] = []
  for (const ln of lines) {
    if (ln.length >= 8 && /[a-zA-Z]/.test(ln) && !/^(COURSE|UNIT|WEEK|OBJECTIVE|OUTCOME|REFERENCE|TEXTBOOKS?)\b/i.test(ln)) {
      topics.push(ln.slice(0, 160))
    }
  }
  const seen = new Set<string>()
  const dedup: string[] = []
  for (const t of topics) {
    const key = t.toLowerCase()
    if (!seen.has(key)) { seen.add(key); dedup.push(t) }
  }
  return dedup
}

function detectDomains(text: string): string[] {
  const low = text.toLowerCase()
  const domains: string[] = []
  for (const [dom, keys] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keys.some(k => low.includes(k))) domains.push(dom)
  }
  if (domains.length === 0 && /syllabus|computer|engineering|cs|programming|java|python/i.test(text)) {
    domains.push('data structures','algorithms','web')
  }
  return domains
}

function augment(topics: string[], text: string): string[] {
  const domains = detectDomains(text + ' ' + (topics.slice(0,10).join(' ')))
  let enriched = topics.slice()
  if (enriched.length < 10) {
    for (const d of domains) {
      const cat = (TOPIC_LIBRARY as any)[d] || []
      for (const item of cat) {
        if (!enriched.some(t => t.toLowerCase() === item.toLowerCase())) enriched.push(item)
      }
    }
  }
  const seen = new Set<string>()
  const final: string[] = []
  for (const t of enriched) {
    const key = t.toLowerCase()
    if (!seen.has(key)) { seen.add(key); final.push(t) }
    if (final.length >= 80) break
  }
  return final
}

function withTimeout<T>(p: Promise<T>, ms: number, onTimeout: ()=>T): Promise<T> {
  return new Promise((resolve) => {
    let done = false
    const t = setTimeout(()=>{ if (!done) { done = true; resolve(onTimeout()) } }, ms)
    p.then(v=>{ if (!done) { done = true; clearTimeout(t); resolve(v) } }).catch(()=>{
      if (!done) { done = true; clearTimeout(t); resolve(onTimeout()) }
    })
  })
}

export async function POST(req: NextRequest) {
  let text = ''

  // 1) If JSON with rawText provided, prefer that (from client-side DOCX/TXT parsing)
  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json().catch(()=>null)
      if (body?.rawText && typeof body.rawText === 'string') {
        text = body.rawText as string
      }
    }
  } catch {}

  // 2) Otherwise, fall back to file parsing via FormData
  if (!text) {
    try {
      const form = await req.formData()
      const file = form.get('file') as File | null
      if (file) {
        const name = (file.name||'').toLowerCase()
        const buf = Buffer.from(await file.arrayBuffer())
        const small = buf.slice(0, Math.min(buf.length, 300*1024))
        if (name.endsWith('.pdf')) {
          const fast = withTimeout(pdfParse(small, { max: 6 }) as any, 1200, ()=>({ text: '' } as any))
          const fastRes: any = await fast
          text = fastRes.text || ''
          if (!text) {
            const full = withTimeout(pdfParse(buf, { max: 10 }) as any, 2500, ()=>({ text: '' } as any))
            const fullRes: any = await full
            text = fullRes.text || ''
          }
        } else if (name.endsWith('.docx')) {
          const fast = withTimeout(mammoth.extractRawText({ buffer: small }) as any, 1200, ()=>({ value: '' } as any))
          const fastRes: any = await fast
          text = fastRes.value || ''
          if (!text) {
            const full = withTimeout(mammoth.extractRawText({ buffer: buf }) as any, 2500, ()=>({ value: '' } as any))
            const fullRes: any = await full
            text = fullRes.value || ''
          }
        } else {
          text = small.toString('utf-8')
        }
      }
    } catch {}
  }

  text = clean(text || '')
  let topics = baseExtractTopics(text)
  topics = augment(topics, text)
  if (topics.length === 0) {
    topics = augment(['Introduction','Course Overview','First Steps'], 'computer science syllabus')
  }
  return NextResponse.json({ topics, topic_count: topics.length })
}
