"use client"

import { Button } from "@/components/ui/button"
import { Dumbbell, Utensils, ArrowRight, Heart, Shield, Brain, Leaf } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="border-b border-blue-200 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">ARiseFit</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-blue-600 hover:text-blue-800 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-blue-600 hover:text-blue-800 transition-colors">How It Works</Link>
            <Link href="/diet" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-900">
              Your Personal AI-Powered Health & Fitness Guide
            </h1>
            <p className="text-xl text-blue-700">
              Get personalized diet recommendations and health analysis based on your medical reports and personal information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/diet">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/workout">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Try AR Workout <Dumbbell className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src="/fitness-illustration.svg"
                alt="Fitness Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-xl space-y-4">
              <Heart className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-900">Health Analysis</h3>
              <p className="text-blue-700">Comprehensive analysis of your medical reports to understand your health status.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl space-y-4">
              <Utensils className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-900">Personalized Diet</h3>
              <p className="text-blue-700">Customized Indian diet recommendations based on your health metrics and preferences.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl space-y-4">
              <Brain className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-900">AI-Powered</h3>
              <p className="text-blue-700">Advanced AI algorithms to provide accurate and personalized recommendations.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl space-y-4">
              <Leaf className="h-12 w-12 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-900">AR Workout Guide</h3>
              <p className="text-blue-700">Experience interactive AR-guided workouts for better form and results.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto">1</div>
              <h3 className="text-xl font-semibold text-blue-900">Upload Reports</h3>
              <p className="text-blue-700">Upload your medical reports (Blood, Cholesterol, Thyroxine)</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto">2</div>
              <h3 className="text-xl font-semibold text-blue-900">Enter Details</h3>
              <p className="text-blue-700">Provide your personal information and health preferences</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto">3</div>
              <h3 className="text-xl font-semibold text-blue-900">Get Analysis</h3>
              <p className="text-blue-700">Receive detailed health analysis and recommendations</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto">4</div>
              <h3 className="text-xl font-semibold text-blue-900">Download Report</h3>
              <p className="text-blue-700">Get your personalized diet plan in PDF format</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Health?</h2>
          <p className="text-blue-100 mb-8">Start your journey to better health with personalized recommendations today.</p>
          <Link href="/diet">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Dumbbell className="h-6 w-6" />
            <span className="text-xl font-bold">ARiseFit</span>
          </div>
          <p className="text-sm">© 2024 ARiseFit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
