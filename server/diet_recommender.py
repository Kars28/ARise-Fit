import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib
import os
import random

class DietRecommender:
    def __init__(self):
        self.models = {
            'Random Forest': RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=5,
                class_weight='balanced',
                random_state=42
            ),
            'Gradient Boosting': GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            ),
            'SVM': SVC(
                kernel='rbf',
                class_weight='balanced',
                probability=True,
                random_state=42
            ),
            'KNN': KNeighborsClassifier(
                n_neighbors=5,
                weights='distance'
            ),
            'Naive Bayes': GaussianNB()
        }
        self.best_model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.model_path = 'models/diet_recommender.pkl'
        self.scaler_path = 'models/scaler.pkl'
        self.encoder_path = 'models/label_encoder.pkl'
        
        # Create models directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Load or create model
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.create_and_train_models()

    def create_sample_dataset(self):
        """Create a comprehensive dataset of Indian food items and health conditions"""
        # Define all possible values for categorical features
        blood_sugar_levels = ['high', 'normal', 'low']
        cholesterol_levels = ['high', 'normal', 'low']
        bmi_categories = ['underweight', 'normal', 'overweight', 'obese']
        meal_types = ['breakfast', 'lunch', 'dinner', 'snacks']
        
        # Base food items with their nutritional values
        base_foods = {
            # Breakfast items
            'breakfast': [
                {'name': 'Oats with almond milk', 'calories': 300, 'protein': 10, 'carbs': 45, 'fats': 8, 'fiber': 6},
                {'name': 'Whole wheat toast', 'calories': 250, 'protein': 8, 'carbs': 40, 'fats': 6, 'fiber': 5},
                {'name': 'Idli with sambar', 'calories': 280, 'protein': 12, 'carbs': 50, 'fats': 7, 'fiber': 7},
                {'name': 'Poha with vegetables', 'calories': 280, 'protein': 9, 'carbs': 45, 'fats': 7, 'fiber': 6},
                {'name': 'Upma with vegetables', 'calories': 300, 'protein': 10, 'carbs': 48, 'fats': 8, 'fiber': 7},
                {'name': 'Dosa with chutney', 'calories': 320, 'protein': 11, 'carbs': 52, 'fats': 9, 'fiber': 8},
                {'name': 'Besan chilla', 'calories': 250, 'protein': 12, 'carbs': 40, 'fats': 6, 'fiber': 5},
                {'name': 'Methi paratha', 'calories': 300, 'protein': 10, 'carbs': 45, 'fats': 8, 'fiber': 6},
                {'name': 'Moong dal cheela', 'calories': 280, 'protein': 11, 'carbs': 42, 'fats': 7, 'fiber': 6},
                {'name': 'Ragi dosa', 'calories': 290, 'protein': 9, 'carbs': 44, 'fats': 7, 'fiber': 7},
                {'name': 'Vegetable uttapam', 'calories': 310, 'protein': 11, 'carbs': 50, 'fats': 8, 'fiber': 8},
                {'name': 'Sabudana khichdi', 'calories': 270, 'protein': 8, 'carbs': 46, 'fats': 6, 'fiber': 5},
                {'name': 'Rava idli', 'calories': 260, 'protein': 9, 'carbs': 43, 'fats': 6, 'fiber': 6},
                {'name': 'Vegetable sandwich', 'calories': 290, 'protein': 10, 'carbs': 45, 'fats': 7, 'fiber': 7},
                {'name': 'Sprouts salad', 'calories': 200, 'protein': 8, 'carbs': 30, 'fats': 5, 'fiber': 8}
            ],
            # Lunch items
            'lunch': [
                {'name': 'Brown rice with dal', 'calories': 400, 'protein': 15, 'carbs': 60, 'fats': 10, 'fiber': 8},
                {'name': 'Roti with palak tofu', 'calories': 350, 'protein': 14, 'carbs': 55, 'fats': 9, 'fiber': 7},
                {'name': 'Quinoa salad', 'calories': 380, 'protein': 13, 'carbs': 58, 'fats': 12, 'fiber': 9},
                {'name': 'Jeera rice with dal', 'calories': 400, 'protein': 14, 'carbs': 58, 'fats': 10, 'fiber': 7},
                {'name': 'Chapati with curry', 'calories': 350, 'protein': 12, 'carbs': 56, 'fats': 9, 'fiber': 8},
                {'name': 'Vegetable pulao', 'calories': 380, 'protein': 13, 'carbs': 60, 'fats': 11, 'fiber': 9},
                {'name': 'Rajma chawal', 'calories': 450, 'protein': 16, 'carbs': 65, 'fats': 12, 'fiber': 8},
                {'name': 'Dal tadka with rice', 'calories': 400, 'protein': 15, 'carbs': 60, 'fats': 10, 'fiber': 7},
                {'name': 'Vegetable biryani', 'calories': 420, 'protein': 14, 'carbs': 62, 'fats': 11, 'fiber': 8},
                {'name': 'Sambar rice', 'calories': 380, 'protein': 13, 'carbs': 58, 'fats': 10, 'fiber': 8},
                {'name': 'Curd rice', 'calories': 360, 'protein': 12, 'carbs': 55, 'fats': 9, 'fiber': 7},
                {'name': 'Vegetable khichdi', 'calories': 370, 'protein': 13, 'carbs': 57, 'fats': 10, 'fiber': 8},
                {'name': 'Dal rice with ghee', 'calories': 390, 'protein': 14, 'carbs': 59, 'fats': 11, 'fiber': 7},
                {'name': 'Vegetable fried rice', 'calories': 410, 'protein': 13, 'carbs': 61, 'fats': 12, 'fiber': 8},
                {'name': 'Paneer butter masala with roti', 'calories': 440, 'protein': 15, 'carbs': 58, 'fats': 13, 'fiber': 7}
            ],
            # Dinner items
            'dinner': [
                {'name': 'Moong dal khichdi', 'calories': 350, 'protein': 16, 'carbs': 55, 'fats': 8, 'fiber': 8},
                {'name': 'Vegetable soup', 'calories': 300, 'protein': 8, 'carbs': 40, 'fats': 5, 'fiber': 6},
                {'name': 'Grilled fish', 'calories': 400, 'protein': 25, 'carbs': 0, 'fats': 15, 'fiber': 0},
                {'name': 'Dal rice with ghee', 'calories': 350, 'protein': 12, 'carbs': 50, 'fats': 8, 'fiber': 7},
                {'name': 'Vegetable khichdi', 'calories': 300, 'protein': 10, 'carbs': 45, 'fats': 6, 'fiber': 6},
                {'name': 'Chapati with dal', 'calories': 320, 'protein': 12, 'carbs': 48, 'fats': 8, 'fiber': 7},
                {'name': 'Vegetable upma', 'calories': 300, 'protein': 10, 'carbs': 45, 'fats': 6, 'fiber': 6},
                {'name': 'Sambar rice', 'calories': 350, 'protein': 12, 'carbs': 50, 'fats': 8, 'fiber': 7},
                {'name': 'Curd rice', 'calories': 300, 'protein': 10, 'carbs': 45, 'fats': 6, 'fiber': 6},
                {'name': 'Vegetable pulao', 'calories': 340, 'protein': 11, 'carbs': 52, 'fats': 7, 'fiber': 7},
                {'name': 'Dal tadka with roti', 'calories': 330, 'protein': 12, 'carbs': 48, 'fats': 8, 'fiber': 7},
                {'name': 'Vegetable biryani', 'calories': 360, 'protein': 13, 'carbs': 55, 'fats': 9, 'fiber': 8},
                {'name': 'Paneer curry with roti', 'calories': 380, 'protein': 14, 'carbs': 50, 'fats': 10, 'fiber': 7},
                {'name': 'Vegetable stew with appam', 'calories': 340, 'protein': 11, 'carbs': 52, 'fats': 7, 'fiber': 7},
                {'name': 'Dal makhani with roti', 'calories': 370, 'protein': 13, 'carbs': 54, 'fats': 9, 'fiber': 8}
            ],
            # Snacks
            'snacks': [
                {'name': 'Sprouts salad', 'calories': 200, 'protein': 8, 'carbs': 30, 'fats': 5, 'fiber': 8},
                {'name': 'Fruit smoothie', 'calories': 250, 'protein': 6, 'carbs': 40, 'fats': 6, 'fiber': 5},
                {'name': 'Vegetable sandwich', 'calories': 300, 'protein': 10, 'carbs': 45, 'fats': 8, 'fiber': 6},
                {'name': 'Roasted makhana', 'calories': 150, 'protein': 5, 'carbs': 25, 'fats': 4, 'fiber': 4},
                {'name': 'Fruit chaat', 'calories': 200, 'protein': 4, 'carbs': 35, 'fats': 5, 'fiber': 5},
                {'name': 'Bhel puri', 'calories': 250, 'protein': 6, 'carbs': 40, 'fats': 6, 'fiber': 6},
                {'name': 'Roasted chana', 'calories': 180, 'protein': 7, 'carbs': 28, 'fats': 5, 'fiber': 7},
                {'name': 'Vegetable soup', 'calories': 150, 'protein': 5, 'carbs': 25, 'fats': 4, 'fiber': 5},
                {'name': 'Fruit salad', 'calories': 180, 'protein': 4, 'carbs': 30, 'fats': 5, 'fiber': 5},
                {'name': 'Roasted peanuts', 'calories': 200, 'protein': 8, 'carbs': 20, 'fats': 6, 'fiber': 6},
                {'name': 'Vegetable cutlet', 'calories': 220, 'protein': 7, 'carbs': 35, 'fats': 7, 'fiber': 6},
                {'name': 'Fruit yogurt', 'calories': 180, 'protein': 6, 'carbs': 30, 'fats': 5, 'fiber': 5},
                {'name': 'Roasted corn', 'calories': 160, 'protein': 5, 'carbs': 32, 'fats': 4, 'fiber': 5},
                {'name': 'Vegetable roll', 'calories': 240, 'protein': 8, 'carbs': 38, 'fats': 7, 'fiber': 6},
                {'name': 'Fruit juice', 'calories': 150, 'protein': 3, 'carbs': 35, 'fats': 4, 'fiber': 4}
            ]
        }
        
        # Generate 2000 entries
        data = {
            'food_item': [],
            'calories': [],
            'protein': [],
            'carbs': [],
            'fats': [],
            'fiber': [],
            'blood_sugar_level': [],
            'cholesterol_level': [],
            'bmi_category': [],
            'meal_type': []
        }
        
        # Generate entries for each meal type
        for meal_type in meal_types:
            num_entries = 500  # 500 entries per meal type
            for _ in range(num_entries):
                # Randomly select a food item
                food = random.choice(base_foods[meal_type])
                
                # Add food details
                data['food_item'].append(food['name'])
                data['calories'].append(food['calories'])
                data['protein'].append(food['protein'])
                data['carbs'].append(food['carbs'])
                data['fats'].append(food['fats'])
                data['fiber'].append(food['fiber'])
                
                # Add health conditions
                data['blood_sugar_level'].append(random.choice(blood_sugar_levels))
                data['cholesterol_level'].append(random.choice(cholesterol_levels))
                data['bmi_category'].append(random.choice(bmi_categories))
                data['meal_type'].append(meal_type)
        
        return pd.DataFrame(data)

    def preprocess_data(self, df):
        """Preprocess the data for training"""
        # Define all possible categories
        all_categories = {
            'blood_sugar_level': ['high', 'normal', 'low'],
            'cholesterol_level': ['high', 'normal', 'low'],
            'bmi_category': ['underweight', 'normal', 'overweight', 'obese'],
            'meal_type': ['breakfast', 'lunch', 'dinner', 'snacks']
        }
        
        # Fit label encoders with all possible categories
        for col, categories in all_categories.items():
            self.label_encoder.fit(categories)
            df[col] = self.label_encoder.transform(df[col])
        
        # Scale numerical features
        numerical_features = ['calories', 'protein', 'carbs', 'fats', 'fiber']
        df[numerical_features] = self.scaler.fit_transform(df[numerical_features])
        
        return df

    def create_and_train_models(self):
        """Create and train multiple models, then select the best one"""
        # Create sample dataset
        df = self.create_sample_dataset()
        
        # Preprocess data
        df_processed = self.preprocess_data(df)
        
        # Prepare features and target
        X = df_processed.drop(['food_item'], axis=1)
        y = df_processed['food_item']
        
        # Split data with stratification
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train and evaluate each model
        model_scores = {}
        best_score = 0
        
        for name, model in self.models.items():
            print(f"\nTraining {name}...")
            
            # Train model
            model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
            recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
            f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
            
            # Cross-validation score
            cv_scores = cross_val_score(model, X, y, cv=5)
            cv_mean = cv_scores.mean()
            
            # Store scores
            model_scores[name] = {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'cv_mean': cv_mean
            }
            
            # Print metrics
            print(f"\n{name} Performance Metrics:")
            print(f"Accuracy: {accuracy:.4f}")
            print(f"Precision: {precision:.4f}")
            print(f"Recall: {recall:.4f}")
            print(f"F1 Score: {f1:.4f}")
            print(f"Cross-validation Mean Score: {cv_mean:.4f}")
            print("\nClassification Report:")
            print(classification_report(y_test, y_pred, zero_division=0))
            
            # Update best model
            if f1 > best_score:
                best_score = f1
                self.best_model = model
                self.best_model_name = name
        
        # Print comparison
        print("\nModel Comparison:")
        print("=" * 80)
        print(f"{'Model':<20} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1':<10} {'CV Mean':<10}")
        print("-" * 80)
        for name, scores in model_scores.items():
            print(f"{name:<20} {scores['accuracy']:.4f}    {scores['precision']:.4f}    {scores['recall']:.4f}    {scores['f1']:.4f}    {scores['cv_mean']:.4f}")
        print("=" * 80)
        print(f"\nBest Model: {self.best_model_name} (F1 Score: {best_score:.4f})")
        
        # Save best model and preprocessing objects
        self.save_model()

    def save_model(self):
        """Save the trained model and preprocessing objects"""
        joblib.dump(self.best_model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        joblib.dump(self.label_encoder, self.encoder_path)

    def load_model(self):
        """Load the trained model and preprocessing objects"""
        self.best_model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)
        self.label_encoder = joblib.load(self.encoder_path)

    def recommend_foods(self, health_conditions, meal_type, num_recommendations=3):
        """Recommend foods based on health conditions using the best model"""
        try:
            # Create input features
            input_features = pd.DataFrame({
                'calories': [health_conditions.get('calories', 0)],
                'protein': [health_conditions.get('protein', 0)],
                'carbs': [health_conditions.get('carbs', 0)],
                'fats': [health_conditions.get('fats', 0)],
                'fiber': [health_conditions.get('fiber', 0)],
                'blood_sugar_level': [health_conditions.get('blood_sugar_level', 'normal')],
                'cholesterol_level': [health_conditions.get('cholesterol_level', 'normal')],
                'bmi_category': [health_conditions.get('bmi_category', 'normal')],
                'meal_type': [meal_type]
            })
            
            # Preprocess input
            for col in ['blood_sugar_level', 'cholesterol_level', 'bmi_category', 'meal_type']:
                input_features[col] = self.label_encoder.transform(input_features[col])
            
            numerical_features = ['calories', 'protein', 'carbs', 'fats', 'fiber']
            input_features[numerical_features] = self.scaler.transform(input_features[numerical_features])
            
            # Get predictions from best model
            probabilities = self.best_model.predict_proba(input_features)[0]
            top_indices = np.argsort(probabilities)[-num_recommendations:][::-1]
            recommended_foods = [self.best_model.classes_[i] for i in top_indices]
            
            return recommended_foods
        except Exception as e:
            print(f"Error in recommend_foods: {str(e)}")
            # Return default recommendations if ML fails
            return ['Oats with almond milk', 'Whole wheat toast', 'Idli with sambar']

# Example usage
if __name__ == "__main__":
    recommender = DietRecommender()
    
    # Example health conditions
    health_conditions = {
        'calories': 300,
        'protein': 15,
        'carbs': 45,
        'fats': 10,
        'fiber': 8,
        'blood_sugar_level': 'high',
        'cholesterol_level': 'normal',
        'bmi_category': 'overweight'
    }
    
    # Get recommendations for breakfast
    recommendations = recommender.recommend_foods(health_conditions, 'breakfast')
    print("\nRecommended foods for breakfast:")
    for food in recommendations:
        print(f"- {food}") 