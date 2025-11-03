import { PrismaClient } from '@prisma/client'
import { scoreFromSignals, suggestAngle } from '../lib/scoring'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.outreach.deleteMany()
  await prisma.signal.deleteMany()
  await prisma.lP.deleteMany()

  // Create LPs
  const lp1 = await prisma.lP.create({
    data: {
      name: 'Sequoia Capital',
      contactName: 'Sarah Chen',
      email: 'sarah@sequoia.com',
      geo: 'USA',
      strategy: ['Growth', 'Enterprise SaaS', 'B2B'],
    },
  })

  const lp2 = await prisma.lP.create({
    data: {
      name: 'Andreessen Horowitz',
      contactName: 'Michael Rodriguez',
      email: 'michael@a16z.com',
      geo: 'USA',
      strategy: ['Early Stage', 'Crypto', 'Consumer'],
    },
  })

  const lp3 = await prisma.lP.create({
    data: {
      name: 'Index Ventures',
      contactName: 'Emma Thompson',
      email: 'emma@indexventures.com',
      geo: 'Europe',
      strategy: ['Series A', 'Fintech', 'Marketplaces'],
    },
  })

  // Create signals for Sequoia
  const seq1 = await prisma.signal.create({
    data: {
      lpId: lp1.id,
      summary: 'Sequoia announces $2.8B new fund focused on AI infrastructure',
      tags: ['funding', 'AI', 'infrastructure'],
      url: 'https://example.com/sequoia-fund',
      weight: 2.0,
    },
  })

  const seq2 = await prisma.signal.create({
    data: {
      lpId: lp1.id,
      summary: 'Sarah Chen speaking at TechCrunch Disrupt about future of enterprise software',
      tags: ['speaking', 'enterprise', 'thought-leadership'],
      weight: 1.5,
    },
  })

  const seq3 = await prisma.signal.create({
    data: {
      lpId: lp1.id,
      summary: 'Sequoia portfolio company exits for $4.2B',
      tags: ['acquisition', 'exit', 'success'],
      weight: 1.0,
    },
  })

  // Create signals for a16z
  const a16z1 = await prisma.signal.create({
    data: {
      lpId: lp2.id,
      summary: 'a16z launches crypto research initiative with MIT',
      tags: ['partnership', 'crypto', 'research'],
      url: 'https://example.com/a16z-mit',
      weight: 1.5,
    },
  })

  const a16z2 = await prisma.signal.create({
    data: {
      lpId: lp2.id,
      summary: 'Hiring 5 new partners for consumer investments',
      tags: ['hiring', 'expansion', 'consumer'],
      weight: 1.2,
    },
  })

  // Create signals for Index
  const idx1 = await prisma.signal.create({
    data: {
      lpId: lp3.id,
      summary: 'Index Ventures opens new office in Berlin',
      tags: ['expansion', 'Europe', 'office'],
      weight: 1.0,
    },
  })

  const idx2 = await prisma.signal.create({
    data: {
      lpId: lp3.id,
      summary: 'Emma Thompson wins "Best VC" award at European Tech Summit',
      tags: ['award', 'recognition', 'Europe'],
      weight: 0.8,
    },
  })

  // Compute scores and angles
  const sequoiaSignals = [seq1, seq2, seq3]
  await prisma.lP.update({
    where: { id: lp1.id },
    data: {
      score: scoreFromSignals(sequoiaSignals),
      messageAngle: suggestAngle(sequoiaSignals),
    },
  })

  const a16zSignals = [a16z1, a16z2]
  await prisma.lP.update({
    where: { id: lp2.id },
    data: {
      score: scoreFromSignals(a16zSignals),
      messageAngle: suggestAngle(a16zSignals),
    },
  })

  const indexSignals = [idx1, idx2]
  await prisma.lP.update({
    where: { id: lp3.id },
    data: {
      score: scoreFromSignals(indexSignals),
      messageAngle: suggestAngle(indexSignals),
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
