import { PrismaClient } from '@prisma/client'
import { scoreFromSignals, suggestAngle } from '../lib/scoring'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.outreach.deleteMany()
  await prisma.signal.deleteMany()
  await prisma.lP.deleteMany()

  // Create LPs (Limited Partners - investors in VC funds)
  const lp1 = await prisma.lP.create({
    data: {
      name: 'CalPERS (California Public Employees Retirement System)',
      contactName: 'Jennifer Martinez',
      email: 'jmartinez@calpers.ca.gov',
      geo: 'USA (California)',
      strategy: ['Venture Capital', 'Growth Equity', 'Infrastructure'],
    },
  })

  const lp2 = await prisma.lP.create({
    data: {
      name: 'Yale Endowment',
      contactName: 'David Chen',
      email: 'david.chen@yale.edu',
      geo: 'USA (Connecticut)',
      strategy: ['Venture Capital', 'Private Equity', 'Absolute Return'],
    },
  })

  const lp3 = await prisma.lP.create({
    data: {
      name: 'Ontario Teachers Pension Plan',
      contactName: 'Sarah Thompson',
      email: 'sthompson@otpp.com',
      geo: 'Canada',
      strategy: ['Venture Capital', 'Growth Equity', 'Public Markets'],
    },
  })

  // Create signals for CalPERS
  const seq1 = await prisma.signal.create({
    data: {
      lpId: lp1.id,
      summary: 'CalPERS announces $2.5B increase in venture capital allocation',
      tags: ['funding', 'venture-capital', 'allocation'],
      url: 'https://example.com/calpers-vc',
      weight: 2.0,
    },
  })

  const seq2 = await prisma.signal.create({
    data: {
      lpId: lp1.id,
      summary: 'Jennifer Martinez speaking at Institutional Investor Summit about alternative investments',
      tags: ['speaking', 'alternatives', 'thought-leadership'],
      weight: 1.5,
    },
  })

  const seq3 = await prisma.signal.create({
    data: {
      lpId: lp1.id,
      summary: 'CalPERS reports 15% returns on venture portfolio',
      tags: ['performance', 'returns', 'success'],
      weight: 1.0,
    },
  })

  // Create signals for Yale Endowment
  const a16z1 = await prisma.signal.create({
    data: {
      lpId: lp2.id,
      summary: 'Yale partners with Stanford on emerging manager program',
      tags: ['partnership', 'emerging-managers', 'education'],
      url: 'https://example.com/yale-stanford',
      weight: 1.5,
    },
  })

  const a16z2 = await prisma.signal.create({
    data: {
      lpId: lp2.id,
      summary: 'Hiring new Senior Investment Associate for VC investments',
      tags: ['hiring', 'expansion', 'venture-capital'],
      weight: 1.2,
    },
  })

  // Create signals for Ontario Teachers
  const idx1 = await prisma.signal.create({
    data: {
      lpId: lp3.id,
      summary: 'Ontario Teachers expanding venture capital allocation in North America',
      tags: ['expansion', 'venture-capital', 'allocation'],
      weight: 1.0,
    },
  })

  const idx2 = await prisma.signal.create({
    data: {
      lpId: lp3.id,
      summary: 'Sarah Thompson recognized as top pension fund CIO by Institutional Investor',
      tags: ['award', 'recognition', 'leadership'],
      weight: 0.8,
    },
  })

  // Compute scores and angles
  const calpersSignals = [seq1, seq2, seq3]
  await prisma.lP.update({
    where: { id: lp1.id },
    data: {
      score: scoreFromSignals(calpersSignals),
      messageAngle: suggestAngle(calpersSignals),
    },
  })

  const yaleSignals = [a16z1, a16z2]
  await prisma.lP.update({
    where: { id: lp2.id },
    data: {
      score: scoreFromSignals(yaleSignals),
      messageAngle: suggestAngle(yaleSignals),
    },
  })

  const ontarioSignals = [idx1, idx2]
  await prisma.lP.update({
    where: { id: lp3.id },
    data: {
      score: scoreFromSignals(ontarioSignals),
      messageAngle: suggestAngle(ontarioSignals),
    },
  })

  console.log('✅ Seed completed!')
  console.log(`Created 3 LPs with signals:`)
  console.log(`- ${lp1.name}: 3 signals`)
  console.log(`- ${lp2.name}: 2 signals`)
  console.log(`- ${lp3.name}: 2 signals`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
