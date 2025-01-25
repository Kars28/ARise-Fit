import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Camera, Dumbbell, Brain, Apple } from 'lucide-react'
import HealthPlan from '../components/ui/report'

export default function Home() {
  return (
      <><div className="min-h-screen bg-black text-white scroll-smooth">
      {/* Navigation */}
      <nav className="border-b border-zinc-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-red-600" />
            <span className="text-3xl font-bold">ARiseFit</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="hover:text-red-500 transition-colors text-xl font-medium">Features</Link>
            <Link href="#ai" className="hover:text-red-500 transition-colors text-xl font-medium">AI Coach</Link>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen">
        <Image
          src="/gym2.jpg"
          alt="Gym Interior"
          fill
          className="object-cover brightness-50"
          priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <h1 className="text-6xl md:text-8xl font-bold text-red-600 mb-4">
              AI POWERED
              <br />
              FITNESS
            </h1>
            <p className="text-2xl md:text-4xl font-semibold mb-8 text-zinc-300">
              TRANSFORM YOUR WORKOUT WITH AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <Link href="/diet">
                <Button size="lg" className="text-lg font-bold bg-red-600 hover:bg-red-700 text-white">
                  Analyze
                </Button>
              </Link>
              <Link href="/nobo">
              <Button size="lg" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-lg font-bold">
                Try Out Exercise
              </Button>
              </Link>
              <Link href="/workcanva">
              <Button size="lg" variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-lg font-bold">
                Analyze Reports
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="min-h-screen bg-black flex items-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">AI-Powered Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black p-6 rounded-lg border border-zinc-800">
              <Brain className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Workout Plans</h3>
              <p className="text-zinc-400">
                Personalized workout routines adapted to your goals and progress using advanced AI algorithms.
              </p>
            </div>
            <div className="bg-black p-6 rounded-lg border border-zinc-800">
              <Camera className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Form Analysis</h3>
              <p className="text-zinc-400">
                Real-time exercise form feedback using computer vision to prevent injuries and maximize results.
              </p>
            </div>
            <div className="bg-black p-6 rounded-lg border border-zinc-800">
              <Apple className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Diet Planning</h3>
              <p className="text-zinc-400">
                AI-generated meal plans and nutrition advice tailored to your fitness goals and dietary preferences.
              </p>
            </div>
          </div>
        </div>
      </section>




      {/* AI Coach Section */}
      <section id="ai" className="min-h-screen bg-black flex items-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-8">AI <span className='text-red-600'>Coach</span></h2>
          <p className="text-zinc-400 text-center max-w-2xl text-2xl mx-auto">
            Our revolutionary AI Coach leverages cutting-edge artificial intelligence to provide you with personalized, real-time guidance. Whether you're a beginner or a seasoned athlete, the AI Coach adapts to your unique fitness level, tracks your progress, and offers actionable feedback to help you achieve your goals faster. With features like form correction, adaptive workout adjustments, and motivational insights, it's like having a personal trainer available 24/7—tailored to you, anytime, anywhere.
          </p>
          {/* Placeholder for AI coach content */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Dumbbell className="h-6 w-6 text-red-600" />
              <span className="font-bold text-3xl">ARiseFit</span>
            </div>
            
          </div>
          <div className="mt-8 text-center text-zinc-500 text-sm">
            © {new Date().getFullYear()} ARiseFit
          </div>
        </div>
      </footer>
    </div></>
  )
}
