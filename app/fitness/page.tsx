'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FitnessPage() {
  const [selectedCategory, setSelectedCategory] = useState<'workout' | 'yoga'>('workout');

  const categories = [
    {
      id: 'workout',
      title: 'Workout',
      description: 'Track your exercises with AR guidance',
      image: '/fitness/workout.jpg'
    },
    {
      id: 'yoga',
      title: 'Yoga',
      description: 'Practice yoga with virtual instructor',
      image: '/fitness/yoga.jpg'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fitness & Yoga</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id}
            href={`/fitness/${category.id}`}
            className="block"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 