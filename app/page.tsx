'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Heart, ShoppingBag, TestTube, Stethoscope, MapPin, Shield, Truck, UserCog, Pill } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      // Redirect based on user role
      switch (session.user.role) {
        case 'PATIENT':
          router.push('/dashboard/patient')
          break
        case 'PHARMACY':
          router.push('/dashboard/pharmacy')
          break
        case 'DELIVERY_PARTNER':
          router.push('/dashboard/delivery')
          break
        case 'LABORATORY':
          router.push('/dashboard/laboratory')
          break
        case 'DOCTOR':
          router.push('/dashboard/doctor')
          break
        case 'ADMIN':
          router.push('/dashboard/admin')
          break
        default:
          break
      }
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary fill-current" />
            <h1 className="text-2xl font-bold text-primary">HealthMate</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/signin" className="cursor-pointer inline-block">
              <Button variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-primary">
            Your Digital Healthcare Partner
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Order medicines online, book lab tests, and book doctors - All in one secure platform. 
            Healthcare made simple, accessible, and affordable.
          </p>
        </div>
      </section>

      {/* Onboard Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get Started with Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/auth/signup?role=PATIENT">
              <Card className="text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <Heart className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">I am a Patient</CardTitle>
                  <CardDescription className="group-hover:text-primary/80 transition-colors duration-300">
                    Get healthcare services at your convenience
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Link href="/auth/signup?role=PHARMACY">
              <Card className="text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <Pill className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Manage Pharmacy</CardTitle>
                  <CardDescription className="group-hover:text-primary/80 transition-colors duration-300">
                    Accept medicine orders and manage inventory seamlessly
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/auth/signup?role=LABORATORY">
              <Card className="text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <TestTube className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Manage Lab</CardTitle>
                  <CardDescription className="group-hover:text-primary/80 transition-colors duration-300">
                    Provide laboratory services for patients
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/auth/signup?role=DOCTOR">
              <Card className="text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">I am a Doctor</CardTitle>
                  <CardDescription className="group-hover:text-primary/80 transition-colors duration-300">
                    Provide expert medical advice to your patients
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/auth/signup?role=DELIVERY_PARTNER">
              <Card className="text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <Truck className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">I am a Delivery Partner</CardTitle>
                  <CardDescription className="group-hover:text-primary/80 transition-colors duration-300">
                    Deliver medicine orders to doorsteps
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/auth/signup?role=ADMIN">
              <Card className="text-center hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <UserCog className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">Manage Platform</CardTitle>
                  <CardDescription className="group-hover:text-primary/80 transition-colors duration-300">
                    Maintain HealthMate platform effortlessly
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary fill-current" />
              <h1 className="text-lg font-bold text-primary">HealthMate</h1>
            </div>
            <p className="text-muted-foreground text-center">
              Making healthcare accessible, affordable, and efficient for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}