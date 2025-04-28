import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Label } from "@/components/ui/label";

interface DietRecommendation {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

interface DietRecommendationsProps {
  recommendations: {
    breakfast: Array<{ item: string; calories: number }>;
    lunch: Array<{ item: string; calories: number }>;
    dinner: Array<{ item: string; calories: number }>;
    snacks: Array<{ item: string; calories: number }>;
    daily_calories: number;
  } | null;
}

const defaultRecommendations: DietRecommendation = {
  breakfast: ['Loading recommendations...'],
  lunch: ['Loading recommendations...'],
  dinner: ['Loading recommendations...'],
  snacks: ['Loading recommendations...']
};

const errorRecommendations: DietRecommendation = {
  breakfast: ['Unable to generate recommendations'],
  lunch: ['Unable to generate recommendations'],
  dinner: ['Unable to generate recommendations'],
  snacks: ['Unable to generate recommendations']
};

export function DietRecommendations({ recommendations }: DietRecommendationsProps) {
  if (!recommendations) return null;

  const renderMealSection = (title: string, items: Array<{ item: string; calories: number }>) => (
    <div className="space-y-2">
      <Label className="text-lg font-semibold">{title}</Label>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between">
            <span>{item.item}</span>
            <span className="text-muted-foreground">{item.calories} kcal</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diet Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderMealSection("Breakfast", recommendations.breakfast)}
        {renderMealSection("Lunch", recommendations.lunch)}
        {renderMealSection("Dinner", recommendations.dinner)}
        {renderMealSection("Snacks", recommendations.snacks)}
        <div className="pt-4 border-t">
          <Label className="text-lg font-semibold">Daily Calorie Target</Label>
          <p className="text-muted-foreground">{recommendations.daily_calories} kcal</p>
        </div>
      </CardContent>
    </Card>
  );
} 