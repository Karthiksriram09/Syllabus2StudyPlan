'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, ListChecks, Trash2, GripVertical } from 'lucide-react'

type Plan = {
  weeks: { week: number, topics: string[], tasks: string[], estimated_hours: number }[]
  total_weeks: number
  hours_per_week: number
  total_topics: number
  milestones: {week:number, goal:string}[]
}

function Item({ id, text, onDelete }:{id:string, text:string, onDelete:()=>void}){
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id})
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-white">
      <div className="text-gray-400" {...attributes} {...listeners}><GripVertical size={16}/></div>
      <div className="flex-1 text-sm text-gray-800">{text}</div>
      <button onClick={onDelete} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
    </div>
  )
}

/** DOCX local parser: Mammoth first, then JSZip fallback (reads word/document.xml) */
async function parseDocxLocally(file: File): Promise<string> {
  // Fast path: mammoth browser build
  try {
    const mammoth = await import('mammoth/mammoth.browser')
    const ab = await file.arrayBuffer()
    const { value } = await (mammoth as any).extractRawText({ arrayBuffer: ab } as any)
    if (value && value.trim().length > 0) return value
  } catch {}

  // Fallback: unzip and strip XML tags to plain text
  try {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(await file.arrayBuffer())
    const entry = zip.file('word/document.xml')
    if (!entry) return ''
    const xml = await entry.async('string')
    const text = xml
      .replace(/<\/w:p>/g, '\n')   // paragraph ends → newline
      .replace(/<[^>]+>/g, ' ')    // strip other tags
      .replace(/\s+/g, ' ')        // collapse spaces
      .replace(/\n\s+/g, '\n')     // tidy newlines
      .trim()
    return text
  } catch {
    return ''
  }
}

export default function BuilderPage(){
  const sensors = useSensors(useSensor(PointerSensor))
  const [file, setFile] = useState<File | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [ids, setIds] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [planning, setPlanning] = useState(false)
  const [weeks, setWeeks] = useState(6)
  const [hours, setHours] = useState(6)
  const [sessions, setSessions] = useState(['Mon','Wed','Fri'])
  const [plan, setPlan] = useState<Plan | null>(null)

  useEffect(()=>{ setIds(topics.map((_,i)=>`t${i}`)) },[topics])

  const handleParse = async () => {
    setParsing(true)
    try {
      let usedLocal = false
      let rawText = ''

      if (file) {
        const name = (file.name||'').toLowerCase()
        if (name.endsWith('.txt')) {
          rawText = await file.text()
          usedLocal = true
        } else if (name.endsWith('.docx')) {
          rawText = await parseDocxLocally(file)
          usedLocal = rawText.trim().length > 0
        }
      }

      let data: any
      if (usedLocal) {
        const res = await fetch('/api/parse', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText })
        })
        data = await res.json()
      } else {
        const fd = new FormData()
        if (file) fd.append('file', file) // PDF or fallback
        const res = await fetch('/api/parse', { method: 'POST', body: fd })
        data = await res.json()
      }
      setTopics(data.topics || [])
    } catch (e) {
      console.error(e)
      alert('Failed to parse. If the DOCX is a scanned image, paste text or use TXT.')
    } finally {
      setParsing(false)
    }
  }

  const handleDragEnd = (event:any)=> {
    const {active, over} = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    setIds((v)=> arrayMove(v, oldIndex, newIndex))
    setTopics((v)=> arrayMove(v, oldIndex, newIndex))
  }

  const removeItem = (index:number)=>{
    setTopics(v=> v.filter((_,i)=> i!==index))
    setIds(v=> v.filter((_,i)=> i!==index))
  }

  const handlePlan = async ()=>{
    setPlanning(true)
    try {
      const res = await fetch('/api/plan', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ topics, weeks, hours_per_week: hours })
      })
      const data = await res.json()
      setPlan(data)
    } finally {
      setPlanning(false)
    }
  }

  const exportICS = async () => {
    if (!plan) return
    const mod: any = await import('ics')
    const { ICS } = mod
    const events:any[] = []
    const start = new Date()
    const day = start.getDay()
    const mapDay:Record<string,number> = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}
    const firstMondayOffset = (1 + 7 - day) % 7
    start.setDate(start.getDate() + firstMondayOffset)
    const dayOffsets = sessions.map(s=> mapDay[s] ?? 1)
    for (const w of plan.weeks) {
      for (const off of dayOffsets) {
        const d = new Date(start)
        d.setDate(start.getDate() + (w.week-1)*7 + off-1)
        events.push({
          title: `Study Week ${w.week}: ${w.topics.slice(0,2).join(', ') || 'Revision'}`.slice(0,120),
          description: (w.tasks || []).join('\n'),
          start: [d.getFullYear(), d.getMonth()+1, d.getDate(), 19, 0],
          duration: { hours: Math.min(2, plan.hours_per_week || 2) }
        })
      }
    }
    const { error, value } = ICS.createEvents(events)
    if (error) { alert('ICS error'); return }
    const blob = new Blob([value], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'study-plan.ics'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold">1) Upload or Paste</h2>
        <p className="textmuted">PDF, DOCX, or TXT. Parser is optimized for speed and enhanced with domain knowledge.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input type="file" className="input" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
          <Button onClick={handleParse} disabled={parsing}>
            {parsing ? 'Parsing…' : 'Parse Topics'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">2) Edit Topics</h2>
          <span className="textmuted">{topics.length} items</span>
        </div>
        <p className="textmuted">Drag to reorder. Delete unwanted lines. (We auto-enhanced the outline.)</p>
        <div className="mt-3">
          {topics.length===0 ? <div className="skeleton h-24" /> : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className="grid gap-2">
                  {ids.map((id,idx)=> <Item key={id} id={id} text={topics[idx]} onDelete={()=> removeItem(idx)} />)}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">3) Planning Options</h2>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <label className="text-sm">Weeks
            <input type="number" className="input mt-1" value={weeks} onChange={(e)=> setWeeks(parseInt(e.target.value||'6'))} />
          </label>
          <label className="text-sm">Hours / week
            <input type="number" className="input mt-1" value={hours} onChange={(e)=> setHours(parseInt(e.target.value||'6'))} />
          </label>
          <label className="text-sm">Sessions / week
            <div className="mt-1 flex flex-wrap gap-2">
              {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> (
                <button key={d} onClick={()=> setSessions(s=> s.includes(d)? s.filter(x=>x!==d): [...s,d])}
                        className={`px-3 py-1 rounded-full border ${sessions.includes(d)? 'bg-brand-600 text-white border-brand-600':'bg-white text-gray-700 border-gray-300'}`}>{d}</button>
              ))}
            </div>
          </label>
        </div>
        <div className="mt-3">
          <Button onClick={handlePlan} disabled={planning}>
            {planning ? 'Planning…' : 'Generate Plan'}
          </Button>
        </div>
      </Card>

      {plan && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Weekly Plan</h3>
              <div className="flex gap-3">
                <Button onClick={exportICS} className="inline-flex items-center gap-2"><Calendar size={16}/> Export .ics</Button>
                <Button
                  onClick={async()=>{
                    const res = await fetch('/api/quiz', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ topics, total_questions: 10 }) })
                    const d = await res.json(); alert('Quiz generated: '+d.count+' questions')
                  }}
                  className="inline-flex items-center gap-2"
                >
                  <ListChecks size={16}/> Generate Quiz
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {plan.weeks.map((w)=>(
                <div key={w.week} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="font-semibold">Week {w.week} · {w.estimated_hours}h</div>
                  <div className="text-sm text-gray-600 mt-1">Topics: {w.topics?.length? w.topics.join(', '): '—'}</div>
                  <ul className="list-disc ml-5 text-sm text-gray-700 mt-2">
                    {(w.tasks||[]).map((t,idx)=>(<li key={idx}>{t}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold">Milestones</h4>
            <ul className="list-disc ml-5 text-sm text-gray-700 mt-2">
              {(plan.milestones||[]).map((m,idx)=>(<li key={idx}>Week {m.week}: {m.goal}</li>))}
            </ul>
          </Card>
        </>
      )}
    </main>
  )
}
