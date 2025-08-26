
import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

type Q = { question: string, options: string[], answer: number }

function rulesMCQ(topic: string): Q {
  const correct = `${topic} – core concept definition`
  const options = [correct, `${topic} – unrelated anecdote`, `A vague statement about ${topic}`, `${topic} – incorrect property`]
  // shuffle
  for (let i=options.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [options[i],options[j]]=[options[j],options[i]] }
  return { question: `Which option best describes ${topic}?`, options, answer: options.indexOf(correct) }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const topics: string[] = body?.topics || ["Data Structures","Databases","Operating Systems","Networking","OOP"]
  const total: number = Math.max(5, body?.total_questions || 10)
  const shuffled = topics.slice().sort(()=> Math.random()-0.5)
  const qs: Q[] = shuffled.slice(0, total).map(t=> rulesMCQ(t))
  return NextResponse.json({ count: qs.length, questions: qs })
}
