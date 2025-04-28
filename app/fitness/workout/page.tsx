'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkoutPage() {
  const exercises = [
    {
      id: 'squats',
      title: 'Squats',
      description: 'Lower body exercise for legs and glutes',
      image: '/fitness/exercises/squats.jpg',
      difficulty: 'Beginner',
      duration: '5-10 minutes'
    },
    {
      id: 'pushups',
      title: 'Push-ups',
      description: 'Upper body exercise for chest and arms',
      image: '/fitness/exercises/pushups.jpg',
      difficulty: 'Intermediate',
      duration: '5-10 minutes'
    },
    {
      id: 'bicepcurls',
      title: 'Bicep Curls',
      description: 'Arm exercise for biceps',
      image: '/fitness/exercises/bicepcurls.jpg',
      difficulty: 'Beginner',
      duration: '5 minutes'
    },
    {
      id: 'lunges',
      title: 'Lunges',
      description: 'Lower body exercise for legs and balance',
      image: '/fitness/exercises/lunges.jpg',
      difficulty: 'Intermediate',
      duration: '5-10 minutes'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Workout Exercises</h1>
        <Link 
          href="/fitness"
          className="text-blue-600 hover:underline"
        >
          ← Back to Fitness
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <Link 
            key={exercise.id}
            href={{
              pathname: `/fitness/workout/${exercise.id}`,
              query: { exercise: exercise.id }
            }}
            className="block"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                  <img
                    src={exercise.image}
                    alt={exercise.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Difficulty: {exercise.difficulty}</span>
                  <span>Duration: {exercise.duration}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 