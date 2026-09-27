'use client'

import { useState, useTransition } from 'react'
import { login } from '@/src/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Mail, Lock, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        const res = await login(formData)
        if (res?.error) {
          setError(res.error)
        }
      } catch (err: any) {
        if (!err?.message?.includes('NEXT_REDIRECT') && !err?.digest?.includes('NEXT_REDIRECT')) {
          setError(err?.message || "Terjadi kesalahan saat masuk.")
        }
      }
    })
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-zinc-100 to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 right-0 -z-10 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[80px] dark:bg-indigo-500/5" />
      <div className="absolute bottom-0 left-0 -z-10 h-[350px] w-[350px] rounded-full bg-sky-500/10 blur-[80px] dark:bg-sky-500/5" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_80%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.2),transparent_80%)]" />

      <Card className="w-full max-w-[390px] shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
        <CardHeader className="space-y-3 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20">
            <Home className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 dark:from-indigo-400 dark:via-purple-400 dark:to-sky-400 bg-clip-text text-transparent">
                KOST BUWATI
              </span>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Portal Masuk Pengelola & Penghuni Kost
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 rounded-lg animate-in fade-in-50 duration-200">
                <span className="font-semibold text-xs mt-0.5 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50">!</span>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/70" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@kos.com"
                  required
                  disabled={isPending}
                  className="pl-10 h-10.5 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/70" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isPending}
                  className="pl-10 h-10.5 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 dark:from-indigo-500 dark:to-sky-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
