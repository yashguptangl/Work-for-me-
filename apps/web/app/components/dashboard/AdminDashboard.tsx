"use client"
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Sidebar } from '../../components/layout/Sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { AlertTriangle, Pencil, Trash } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const properties: any[] = []
  const users: any[] = []

  return (
    <div className="flex">
      <Sidebar
        title="Admin"
        color="admin"
        items={[
          { href: '/admin/dashboard', label: 'Manage Listings' },
          { href: '/admin/dashboard?tab=users', label: 'Manage Users' },
          { href: '/admin/dashboard?tab=ads', label: 'Manage Ads/Banners' },
          { href: '/admin/dashboard?tab=moderation', label: 'Moderation Queue' },
          { href: '/admin/dashboard?tab=settings', label: 'Settings' },
        ]}
      />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Hi, Admin!</h1>
            <p className="text-sm text-muted-foreground">Welcome back</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">View Reports</Button>
            <Button>Add New Ad</Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10, rotateY: -6 }} whileInView={{ opacity: 1, y: 0, rotateY: 0 }} viewport={{ once: true }} className="[transform-style:preserve-3d]">
        <Card className="transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle>Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((p) => (
                  <TableRow key={p.id} className="transition-transform hover:-translate-y-0.5">
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.ownerId}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline"><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive"><Trash className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline"><AlertTriangle className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10, rotateY: -6 }} whileInView={{ opacity: 1, y: 0, rotateY: 0 }} viewport={{ once: true }} className="[transform-style:preserve-3d]">
        <Card className="transition-shadow hover:shadow-xl">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:[perspective:1200px]">
              {users.map((u) => (
                <motion.div key={u.id} initial={{ opacity: 0, y: 8, rotateY: -8 }} whileInView={{ opacity: 1, y: 0, rotateY: 0 }} viewport={{ once: true }} whileHover={{ y: -6, scale: 1.02 }} className="border rounded p-4 [transform-style:preserve-3d]">
                  <div className="font-medium">{u.name || u.email}</div>
                  <div className="text-sm text-muted-foreground">{u.role}{u.verified ? ' • Verified' : ''}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </main>
    </div>
  )
}