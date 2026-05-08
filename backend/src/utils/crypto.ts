import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export function generateToken(): string {
  return `zz_${randomBytes(32).toString('hex')}`
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 12)
}

export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenPrefix(token: string): string {
  return token.substring(0, 10)
}
