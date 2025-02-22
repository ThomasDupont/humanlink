import { Price } from '@prisma/client'

const prices: (Omit<Price, 'id' | 'serviceId'> & { index: number })[] = [
  { index: 0, type: 'fix', number: 50000, currency: 'EUR' }, // UI/UX Design (500€)
  { index: 1, type: 'fix', number: 120000, currency: 'EUR' }, // Dev web (1200€)
  { index: 2, type: 'fix', number: 30000, currency: 'EUR' }, // Animations CSS/JS (300€)
  { index: 3, type: 'fix', number: 90000, currency: 'EUR' }, // API REST & GraphQL (900€)
  { index: 4, type: 'fix', number: 80000, currency: 'EUR' }, // DevOps CI/CD (800€)
  { index: 5, type: 'fix', number: 150000, currency: 'EUR' }, // Audit Cybersécurité (1500€)
  { index: 6, type: 'fix', number: 70000, currency: 'EUR' }, // Montage vidéo (700€)
  { index: 7, type: 'fix', number: 10000, currency: 'EUR' }, // Cours de cuisine (100€)
  { index: 8, type: 'fix', number: 60000, currency: 'EUR' }, // Consulting RH (600€)
  { index: 9, type: 'fix', number: 8000, currency: 'EUR' }, // Composition florale (80€)
  { index: 10, type: 'fix', number: 120000, currency: 'EUR' }, // Paysagiste (1200€)
  { index: 11, type: 'fix', number: 6000, currency: 'EUR' }, // Coaching sportif (60€)
  { index: 12, type: 'fix', number: 40000, currency: 'EUR' }, // Shooting photo (400€)
  { index: 13, type: 'fix', number: 5000, currency: 'EUR' }, // Cours de yoga (50€)
  { index: 14, type: 'fix', number: 4500, currency: 'EUR' }, // Soutien éducatif (45€)
  { index: 15, type: 'fix', number: 30000, currency: 'EUR' }, // Composition musicale (300€)
  { index: 16, type: 'fix', number: 9000, currency: 'EUR' }, // Atelier boulangerie (90€)
  { index: 17, type: 'fix', number: 2500, currency: 'EUR' }, // Visite guidée (25€)
  { index: 18, type: 'fix', number: 4000, currency: 'EUR' }, // Cours particuliers (40€)
  { index: 19, type: 'fix', number: 20000, currency: 'EUR' }, // Réparation voitures anciennes (200€)
  { index: 20, type: 'fix', number: 100000, currency: 'EUR' }, // Consulting entreprise (1000€)
  { index: 21, type: 'fixedPerItem', number: 5000, currency: 'EUR' }, // Rédaction SEO (50€/article)
  { index: 22, type: 'percent', number: 1000, currency: 'EUR' }, // Recrutement (10%)
  { index: 23, type: 'fix', number: 50000, currency: 'EUR' }, // Community management (500€)
  { index: 24, type: 'fix', number: 75000, currency: 'EUR' } // Analyse de données (750€)
]

export default prices
