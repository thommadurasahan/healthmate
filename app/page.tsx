'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Heart, ShoppingBag, TestTube, Stethoscope, MapPin, Shield } from 'lucide-react'

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
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary fill-current" />
            <h1 className="text-2xl font-bold text-primary">HealthMate</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Your Digital <span className="text-primary">Healthcare</span> Partner
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Order medicines online, book lab tests, and consult with doctors - all in one secure platform. 
            Healthcare made simple, accessible, and affordable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?role=PATIENT">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started as Patient
              </Button>
            </Link>
            <Link href="/auth/signup?role=PHARMACY">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Join as Pharmacy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose HealthMate?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Medicine Ordering</CardTitle>
                <CardDescription>
                  Upload prescriptions and get medicines delivered from nearby pharmacies
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TestTube className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Lab Tests</CardTitle>
                <CardDescription>
                  Book lab tests online and get reports delivered digitally
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Doctor Consultations</CardTitle>
                <CardDescription>
                  Video consultations with qualified doctors at your convenience
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Location-Based</CardTitle>
                <CardDescription>
                  Find nearest pharmacies and healthcare providers automatically
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Safe and secure payment processing with transparent pricing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Care Coordination</CardTitle>
                <CardDescription>
                  Seamless coordination between patients, pharmacies, and healthcare providers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary fill-current" />
              <span className="text-lg font-semibold">HealthMate</span>
            </div>
            <p className="text-gray-600 text-center">
              Making healthcare accessible, affordable, and efficient for everyone.
            </p>
            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
              <a href="#" className="hover:text-primary">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}