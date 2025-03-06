"use client";
import React from 'react';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react'; // Install using `npm install lucide-react`

const WorkoutCardsWithNavbar = () => {
  const workouts = [
    {
      title: 'Squats',
      description:
        'Squats are a fundamental exercise that strengthens the legs and glutes, while improving mobility and balance. They promote overall fitness and athletic performance.',
      image: '/squat.jpg',
      link: '/squats', // Path to the Squats page
    },
    {
      title: 'Bicep Curls',
      description:
        'A bicep curl is an exercise that builds muscle in the biceps by bending the elbow while holding a weight.',
      image: '/bicepcurls.jpg',
      link: '/bc', // Path to the Bicep Curls page
    },
    {
      title: 'Situps',
      description:
        'A sit-up is an exercise that strengthens your core by lifting your torso while lying on your back.',
      image: '/situps.jpg',
      link: '/situps', // Path to the Situps page
    },
    {
      title: 'Push Ups',
      description:
        'Push-ups are a bodyweight exercise that targets the chest, arms, and shoulders. They build upper body strength and increase muscular endurance.',
      image: '/pushup.jpg',
      link: '/pushups', // Path to the Push Ups page
    },
    {
      title: 'Pull Ups',
      description:
        'Pull-ups are a challenging upper body exercise that targets back, arms, and shoulders. They build strength, grip, and upper body stability for overall development.',
      image: '/pullups.jpg',
      link: '/pullup', // Path to the Pull Ups page
    },
    {
      title: 'Jumping Jacks',
      description:
        'A jumping jack is a physical exercise that involves jumping to separate your legs and raise your arms, then returning to your starting position.',
      image: '/jumpingjacks.jpg',
      link: '/jj', // Path to the Jumping Jacks page
    },
    {
      title: 'YOGA',
      description:
        'Yoga Tree Pose.',
      image: '/jumpingjacks.jpg',
      link: '/yoga', // Path to the Jumping Jacks page
    },
    {
      title: 'warrior pose',
      description:
        'Yoga Warrior pose.',
      image: '/jumpingjacks.jpg',
      link: '/warrior', // Path to the Jumping Jacks page
    },
    {
      title: 'Downward dog pose',
      description:
        'Yoga downward.',
      image: '/jumpingjacks.jpg',
      link: '/down', // Path to the Jumping Jacks page
    },
  ];

  return (
    <>
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-black">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-red-600" />
            <span className="text-3xl font-bold text-white">ARiseFit</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="hover:text-red-500 transition-colors text-xl font-medium text-white">
              Features
            </Link>
            <Link href="#ai" className="hover:text-red-500 transition-colors text-xl font-medium text-white">
              AI Coach
            </Link>
          </div>
        </div>
      </nav>

      {/* Workout Cards */}
      <div className="bg-black py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-red-500 mb-8">Workouts</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {workouts.map((workout, index) => (
              <div
                key={index}
                className="bg-zinc-900 text-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105"
              >
                <img src={workout.image} alt={workout.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{workout.title}</h2>
                  <p className="text-sm text-gray-400 mb-4">{workout.description}</p>
                  <Link href={workout.link}>
                    <button className="w-full py-2 bg-red-600 text-white font-medium rounded hover:bg-red-500 transition-colors">
                      Let&apos;s Do It
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-black {
          background-color: #000000; /* True black background */
        }
      `}</style>
    </>
  );
};

export default WorkoutCardsWithNavbar;
