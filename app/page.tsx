
import { ArrowRight, CalendarClock, FileText, Sparkles, Wand2 } from 'lucide-react'

export default function Page() {
  return (
    <main className="space-y-10">
      <section className="card overflow-hidden">
        <div className="relative p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-50 to-transparent pointer-events-none" />
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">From <span className="text-brand-700">Syllabus/JD</span> to a polished weekly plan — in minutes.</h1>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl">
              Ultra-fast parsing with smart augmentation, drag-and-drop editing, milestones, and calendar export.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn inline-flex items-center gap-2" href="/build">
                Open Builder <ArrowRight size={18} />
              </a>
              <span className="badge"><Sparkles size={14}/> Pro UI</span>
              <span className="badge"><CalendarClock size={14}/> .ics calendar</span>
              <span className="badge"><Wand2 size={14}/> Smart augmentation</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-brand-700"><FileText/></div>
          <h3 className="font-semibold mt-3">Lightning parsing</h3>
          <p className="text-sm text-gray-600">We parse and structure topics quickly — even from big PDFs — then enhance with domain knowledge.</p>
        </div>
        <div className="card p-6">
          <div className="text-brand-700"><Sparkles/></div>
          <h3 className="font-semibold mt-3">Drag, merge, edit</h3>
          <p className="text-sm text-gray-600">Perfect your outline with drag-and-drop, merge/split, and quick edits.</p>
        </div>
        <div className="card p-6">
          <div className="text-brand-700"><CalendarClock/></div>
          <h3 className="font-semibold mt-3">Weighted planning</h3>
          <p className="text-sm text-gray-600">Distribute by difficulty and hours/week. Add buffer weeks. Export to your calendar.</p>
        </div>
      </section>
    </main>
  )
}
