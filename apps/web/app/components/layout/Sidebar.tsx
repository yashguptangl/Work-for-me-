"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'

interface Item { href: string; label: string; icon?: React.ReactNode }
export function Sidebar({ items, title, color }: { items: Item[]; title: string; color: 'admin'|'owner'|'user' }) {
  const pathname = usePathname()
  const colorMap = {
    admin: 'bg-[#1e40af]',
    owner: 'bg-[#0d9488]',
    user: 'bg-[#f3f4f6] text-black'
  }
  return (
    <aside className="w-64 shrink-0 hidden md:flex md:flex-col h-screen sticky top-0 border-r">
      <div className={cn('p-6 text-white', colorMap[color])}>
        <div className="text-lg font-semibold">{title}</div>
      </div>
      <nav className="p-4 space-y-1">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={cn('flex items-center gap-2 rounded px-3 py-2 hover:bg-muted', pathname === it.href && 'bg-muted font-medium')}>
            {it.icon}
            <span>{it.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}