'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dumbbell, Leaf, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

type Exercise = {
  id: string;
  name: string;
  type: 'strength' | 'yoga';
  description: string;
  image: string;
  reps?: number;
  duration?: string;
};

const exercises: Exercise[] = [
  {
    id: 'squats',
    name: 'Squats',
    type: 'strength',
    description: 'Lower body exercise targeting quadriceps, hamstrings, and glutes',
    image: '/squat.jpg',
    reps: 12
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    type: 'strength',
    description: 'Upper body exercise targeting chest, shoulders, and triceps',
    image: '/pushup.jpg',
    reps: 10
  },
  {
    id: 'bicepcurls',
    name: 'Bicep Curls',
    type: 'strength',
    description: 'Arm exercise targeting biceps',
    image: '/bicepcurls.jpg',
    reps: 15
  },
  {
    id: 'situps',
    name: 'Sit-ups',
    type: 'strength',
    description: 'Core exercise targeting abdominal muscles',
    image: '/situps.jpg',
    reps: 20
  },
  {
    id: 'pullups',
    name: 'Pull-ups',
    type: 'strength',
    description: 'Upper body exercise targeting back and biceps',
    image: '/pullups.jpg',
    reps: 8
  },
  {
    id: 'jumpingjacks',
    name: 'Jumping Jacks',
    type: 'strength',
    description: 'Full body cardio exercise',
    image: '/jumpingjacks.jpg',
    reps: 30
  },
  {
    id: 'downwarddog',
    name: 'Downward Dog',
    type: 'yoga',
    description: 'Yoga pose that stretches the entire body',
    image: '/yoga1.jpg',
    duration: '30 seconds'
  },
  {
    id: 'warrior2',
    name: 'Warrior II',
    type: 'yoga',
    description: 'Yoga pose that strengthens legs and improves balance',
    image: '/yoga2.jpg',
    duration: '20 seconds'
  }
];

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
  return (
    <Link href={`/workout/ar?exercise=${exercise.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{exercise.name}</h3>
          {exercise.type === 'strength' ? (
            <Dumbbell className="h-6 w-6 text-blue-600" />
          ) : (
            <Leaf className="h-6 w-6 text-green-600" />
          )}
        </div>
        <p className="text-gray-600 mb-4">{exercise.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {exercise.duration} minutes
        </div>
      </div>
    </Link>
  );
};

export default function WorkoutExercises({ type }: { type: 'strength' | 'yoga' }) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = exercises.filter(exercise => exercise.type === type);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900">
          {type === 'strength' ? 'Strength Training' : 'Yoga'} Exercises
        </h2>
        <Link href="/workout">
          <Button variant="outline" className="text-blue-600">
            Back to Workout <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedExercise(exercise)}
          >
            <div className="relative h-48">
              <img
                src={exercise.image}
                alt={exercise.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                {exercise.name}
              </h3>
              <p className="text-gray-600 mb-4">{exercise.description}</p>
              <div className="flex items-center text-sm text-blue-600">
                {type === 'strength' ? (
                  <>
                    <Dumbbell className="h-4 w-4 mr-2" />
                    <span>{exercise.reps} reps</span>
                  </>
                ) : (
                  <>
                    <Leaf className="h-4 w-4 mr-2" />
                    <span>{exercise.duration}</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-900">
                {selectedExercise.name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedExercise(null)}
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-64">
                <img
                  src={selectedExercise.image}
                  alt={selectedExercise.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">{selectedExercise.description}</p>
                <div className="flex items-center text-blue-600">
                  {type === 'strength' ? (
                    <>
                      <Dumbbell className="h-5 w-5 mr-2" />
                      <span>{selectedExercise.reps} reps</span>
                    </>
                  ) : (
                    <>
                      <Leaf className="h-5 w-5 mr-2" />
                      <span>{selectedExercise.duration}</span>
                    </>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    // Start AR workout for this exercise
                    window.location.href = `/workout/ar?exercise=${selectedExercise.id}`;
                  }}
                >
                  Start AR Workout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 