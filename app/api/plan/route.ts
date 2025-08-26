
import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

type Plan = {
  weeks: { week: number, topics: string[], tasks: string[], estimated_hours: number }[]
  total_weeks: number
  hours_per_week: number
  total_topics: number
  milestones: {week:number, goal:string}[]
}

function chunkTopics(topics: string[], weeks: number) {
  if (weeks <= 0) weeks = 4
  const n = Math.max(1, Math.ceil(topics.length / Math.max(1, weeks)))
  const chunks: string[][] = []
  for (let i=0;i<topics.length;i+=n) chunks.push(topics.slice(i, i+n))
  while (chunks.length < weeks) chunks.push([])
  while (chunks.length > weeks) { chunks[chunks.length-2].push(...chunks[chunks.length-1]); chunks.pop() }
  return chunks
}

function buildPlan(topics: string[], weeks: number, hours: number): Plan {
  if (!topics || !topics.length) topics = Array.from({length:6}, (_,i)=>`Topic ${i+1}`)
  weeks = Math.max(1, weeks|0)
  hours = Math.max(2, hours|0)
  const weekly = chunkTopics(topics, weeks)

  const plan: Plan = {
    weeks: [], total_weeks: weeks, hours_per_week: hours, total_topics: topics.length, milestones: []
  }

  weekly.forEach((wk, idx)=>{
    const tasks: string[] = wk.length
      ? [
          `Read/Watch core material for: ${wk.slice(0,3).join(', ')}`,
          "Notes + flashcards (SRS)",
          "Hands-on practice / mini-project",
          "Weekly quiz + reflection"
        ]
      : ["Buffer/Revision week: consolidate previous topics, attempt mock test"]

    plan.weeks.push({ week: idx+1, topics: wk, tasks, estimated_hours: hours })
  })

  const q = [Math.ceil(weeks*0.25), Math.ceil(weeks*0.5), Math.ceil(weeks*0.75), weeks]
  plan.milestones = [
    { week: q[0], goal: "Finish fundamentals + 1 mini-project" },
    { week: q[1], goal: "Build mid-size project, attempt timed quiz" },
    { week: q[2], goal: "Mock interview / peer review" },
    { week: q[3], goal: "Capstone report + final quiz" },
  ]
  return plan
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const topics: string[] = body?.topics || []
  const weeks: number = body?.weeks || 6
  const hours: number = body?.hours_per_week || 6
  const plan = buildPlan(topics, weeks, hours)
  return NextResponse.json(plan)
}
