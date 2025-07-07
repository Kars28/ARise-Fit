from flask import Flask, request, jsonify, send_file
from pdf2image import convert_from_path
from PIL import Image
import os
import PyPDF2
import pytesseract
import tempfile
from flask_cors import CORS
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from io import BytesIO
from xhtml2pdf import pisa
import re
import google.generativeai as genai
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import time
from sklearn.metrics import silhouette_score, r2_score, mean_squared_error, mean_absolute_error
from sklearn.model_selection import train_test_split
from diet_recommender import DietRecommender

def calculate_bmi(weight, height):
    """Calculate BMI from weight (kg) and height (cm)"""
    height_m = height / 100  # Convert height from cm to m
    return weight / (height_m * height_m)

def generate_pdf_report(user_info, analysis, recommendations, bmi, daily_calories):
    """Generate a PDF report with user information and recommendations"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        spaceAfter=30
    )
    story.append(Paragraph("Health Analysis Report", title_style))

    # User Information
    story.append(Paragraph("Personal Information", styles['Heading2']))
    user_data = [
        ["Name:", user_info['name']],
        ["Age:", str(user_info['age'])],
        ["Weight:", f"{user_info['weight']} kg"],
        ["Height:", f"{user_info['height']} cm"],
        ["BMI:", f"{bmi:.2f}"],
        ["Daily Calorie Needs:", f"{daily_calories:.0f} kcal"]
    ]
    user_table = Table(user_data, colWidths=[100, 200])
    user_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
    ]))
    story.append(user_table)
    story.append(Spacer(1, 20))

    # Analysis (without heading)
    for report_type, data in analysis.items():
        if data:
            story.append(Paragraph(f"{report_type.capitalize()} Report", styles['Heading3']))
            for key, value in data.items():
                story.append(Paragraph(f"{key}: {value}", styles['Normal']))
            story.append(Spacer(1, 10))

    # Diet Recommendations
    story.append(Paragraph("Diet Recommendations", styles['Heading2']))
    story.append(Paragraph(f"Daily Calorie Target: {recommendations['daily_calories']} kcal", styles['Heading3']))
    
    # Create separate tables for each meal type
    for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
        if recommendations[meal_type]:
            story.append(Paragraph(meal_type.capitalize(), styles['Heading3']))
            meal_data = [["Food Item", "Calories"]]
            for item in recommendations[meal_type]:
                meal_data.append([item['item'], f"{item['calories']} kcal"])
            
            meal_table = Table(meal_data, colWidths=[300, 100])
            meal_table.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('LEADING', (0, 0), (-1, -1), 14),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(meal_table)
            story.append(Spacer(1, 10))

    # Additional Notes
    story.append(Paragraph("Additional Notes", styles['Heading2']))
    notes = [
        "• Maintain regular meal timings",
        "• Stay hydrated throughout the day",
        "• Include a variety of fruits and vegetables",
        "• Limit processed foods and sugary drinks",
        "• Exercise regularly as per your fitness level"
    ]
    for note in notes:
        story.append(Paragraph(note, styles['Normal']))

    doc.build(story)
    buffer.seek(0)
    return buffer

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def calculate_daily_calories(weight, height, age, gender):
    # Using Mifflin-St Jeor Equation
    if gender.lower() == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    # Assuming moderate activity level (1.55 multiplier)
    return int(bmr * 1.55)

# Load datasets with error handling
def load_dataset(filepath):
    try:
        return pd.read_csv(filepath)
    except FileNotFoundError:
        print(f"Error: File not found at {filepath}")
        return None

nutrition_df = load_dataset('nutrition_distribution_large.csv')
food_df = load_dataset('food_large.csv')
workout_df = load_dataset('expanded_workout_plan.csv')

if nutrition_df is None or food_df is None or workout_df is None:
    raise FileNotFoundError("One or more datasets could not be loaded.")

# Enum for user goals
class Goal:
    LOSE_WEIGHT = 1
    GAIN_WEIGHT = 2
    STAY_HEALTHY = 3

# Define features and labels
USER_FEATURES = ['Age', 'Gender', 'Weight', 'Height', 'Diseases', 'ActivityLevel', 'Goal']

# Preprocess data
def preprocess_data(df):
    df['Gender'] = LabelEncoder().fit_transform(df['Gender'])
    df['Diseases'] = LabelEncoder().fit_transform(df['Diseases'])
    df['Goal'] = LabelEncoder().fit_transform(df['Goal'])
    df['BMI'] = df['Weight'] / (df['Height'] / 100) ** 2
    return df

nutrition_df = preprocess_data(nutrition_df)

# Create clustering pipeline
def create_clustering_pipeline():
    imputer = SimpleImputer(strategy='mean')
    scaler = StandardScaler()
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', Pipeline(steps=[('imputer', imputer), ('scaler', scaler)]), USER_FEATURES)
        ]
    )
    clustering_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('clustering', KMeans(n_clusters=5, random_state=42))
    ])
    return clustering_pipeline

clustering_pipeline = create_clustering_pipeline()
clustering_pipeline.fit(nutrition_df[USER_FEATURES])

# Create a Random Forest Regressor
rf_reg = RandomForestRegressor(n_estimators=100, random_state=42)
rf_reg.fit(nutrition_df[USER_FEATURES], nutrition_df['BMI'])

# Configure Gemini AI
genai.configure(api_key="AIzaSyB7aHEwumP-zI8f1TYCxjK_o3deLRxK0Ik")

# Initialize the diet recommender
diet_recommender = DietRecommender()

# Recommend meal and workout based on user input
def recommend_meal_and_workout(user_input):
    user_df = pd.DataFrame([user_input])
    user_df = preprocess_data(user_df)
    user_cluster = clustering_pipeline.predict(user_df[USER_FEATURES])[0]
    bmi_pred = rf_reg.predict(user_df[USER_FEATURES])[0]

    # Filter food items based on user's goal
    if user_input['Goal'] == Goal.LOSE_WEIGHT:
        food_items = food_df[food_df['Calories'] <= 400]
        workout_items = workout_df[workout_df['Type'] == 'Lose Weight']
    elif user_input['Goal'] == Goal.GAIN_WEIGHT:
        food_items = food_df[food_df['Calories'] >= 500]
        workout_items = workout_df[workout_df['Type'] == 'Gain Weight']
    else:  # Stay Healthy
        food_items = food_df[(food_df['Calories'] > 400) & (food_df['Calories'] < 500)]
        workout_items = workout_df[workout_df['Type'] == 'Stay Healthy']

    def safe_sample(df, meal_type, n=2):
        filtered = df[df['MealType'] == meal_type]
        if len(filtered) >= n:
            return filtered.sample(n)
        elif not filtered.empty:
            return filtered
        else:
            return pd.DataFrame({'FoodItem': ['No recommendation'], 'Calories': ['N/A'], 'Nutrients': ['N/A']})

    # Get 2 recommendations for each meal
    breakfast = safe_sample(food_items, 'Breakfast', 2)
    lunch = safe_sample(food_items, 'Lunch', 2)
    dinner = safe_sample(food_items, 'Dinner', 2)

    # Get 2 workout recommendations
    if len(workout_items) >= 2:
        workout_plan = workout_items.sample(2)
    elif not workout_items.empty:
        workout_plan = workout_items
    else:
        workout_plan = pd.DataFrame({'Exercise': ['No recommendation'], 'Timing': ['N/A']})

    # Build the recommendation dictionary
    return {
        'BMI': bmi_pred,
        'Breakfast': breakfast.to_dict(orient='records'),
        'Lunch': lunch.to_dict(orient='records'),
        'Dinner': dinner.to_dict(orient='records'),
        'Workout': workout_plan.to_dict(orient='records')
    }

# Generate diet suggestions using Gemini AI
def generate_diet_suggestions(user_input):
    prompt = f"Suggest an Indian diet plan for a {user_input['Age']} year old {user_input['Gender']} with a goal to {user_input['Goal']}. Include options for breakfast, lunch, and dinner in three lines."
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text

# Extract text from reports
def extract_blood_sugar(text):
    patterns = [
        r'(?i)blood\s*sugar\s*[:\-]?\s*(\d+)',  # Match "Blood Sugar: 110"
        r'(?i)sugar\s*level\s*[:\-]?\s*(\d+)'   # Match "Sugar Level: 110"
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return int(match.group(1))  # Extract the value as an integer
    return None

def extract_text_from_reports(files):
    report_details = []
    blood_sugar_values = []

    for file in files:
        try:
            # (Image and PDF processing logic as before)
            # After extracting text from each page:
            text = pytesseract.image_to_string(image)
            report_details.append(text)

            # Try to extract blood sugar values
            blood_sugar = extract_blood_sugar(text)
            if blood_sugar is not None:
                blood_sugar_values.append(blood_sugar)
        except Exception as e:
            report_details.append(f"Error processing file: {e}")

    # Compile blood sugar values
    if blood_sugar_values:
        avg_blood_sugar = sum(blood_sugar_values) / len(blood_sugar_values)
        report_details.append(f"Average Blood Sugar: {avg_blood_sugar} mg/dL")
    else:
        report_details.append("No blood sugar values were identified.")

    return "\n".join(report_details)

# Generate PDF report
def generate_pdf(plan, report_details, diet_suggestions):
    def format_meal(meals):
        rows = ""
        for meal in meals:
            rows += f"""
            <tr>
                <td>{meal['FoodItem']}</td>
                <td>{meal['Calories']}</td>
                <td>{meal['Nutrients']}</td>
            </tr>
            """
        return rows

    def format_workout(workouts):
        rows = ""
        for workout in workouts:
            rows += f"""
            <p><b>Exercise:</b> {workout['Exercise']}<br>
            <b>Timing:</b> {workout['Timing']}</p>
            """
        return rows

    def format_diet_suggestions():
        return f"""
        <table style="font-size: 1.5em;">
            <thead>
                <tr>
                    <th>Goal</th>
                    <th>Meal</th>
                    <th>Suggestions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Weight Loss</td>
                    <td>Breakfast</td>
                    <td>Oats with milk and fruits, or idli/dosa with sambar and chutney.</td>
                </tr>
                <tr>
                    <td>Weight Loss</td>
                    <td>Lunch</td>
                    <td>Brown rice/roti with dal, vegetables (like spinach, bhindi), and a small portion of curd.</td>
                </tr>
                <tr>
                    <td>Weight Loss</td>
                    <td>Dinner</td>
                    <td>Vegetable khichdi, or moong dal cheela with salad.</td>
                </tr>
                <tr>
                    <td>Muscle Gain</td>
                    <td>Breakfast</td>
                    <td>2-3 whole eggs, 2 whole wheat toast with peanut butter, banana.</td>
                </tr>
                <tr>
                    <td>Muscle Gain</td>
                    <td>Lunch</td>
                    <td>Brown rice/roti with chicken/paneer curry, dal, and mixed vegetables.</td>
                </tr>
                <tr>
                    <td>Muscle Gain</td>
                    <td>Dinner</td>
                    <td>Chicken breast with brown rice and stir-fried vegetables, or lentils with paneer.</td>
                </tr>
            </tbody>
        </table>
        """

    template = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            h1 {{ text-align: center; color: #4CAF50; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #4CAF50; color: white; }}
            .diet-suggestions {{ font-size: 1.5em; color: #FF5722; }}
        </style>
    </head>
    <body>
        <h1>Health Report</h1>
        <h2>Recommended Meal Plan</h2>
        <h3>Breakfast</h3>
        <table>
            <tr><th>Food Item</th><th>Calories</th><th>Nutrients</th></tr>
            {format_meal(plan['Breakfast'])}
        </table>
        <h3>Lunch</h3>
        <table>
            <tr><th>Food Item</th><th>Calories</th><th>Nutrients</th></tr>
            {format_meal(plan['Lunch'])}
        </table>
        <h3>Dinner</h3>
        <table>
            <tr><th>Food Item</th><th>Calories</th><th>Nutrients</th></tr>
            {format_meal(plan['Dinner'])}
        </table>
        <h2>Workout Plan</h2>
        {format_workout(plan['Workout'])}
        <h2>Health Report Details</h2>
        <p>{report_details}</p>
        <h2>Predicted BMI</h2>
        <p>Your predicted BMI is: <b>{plan['BMI']:.2f}</b></p>
        <h2>Diet Suggestions</h2>
        <div class="diet-suggestions">{format_diet_suggestions()}</div>
    </body>
    </html>
    """

    pdf_file = BytesIO()
    pisa.CreatePDF(BytesIO(template.encode("utf-8")), dest=pdf_file)
    pdf_file.seek(0)
    return pdf_file

# API routes
@app.route('/diet', methods=['POST'])
def diet():
    data = request.form
    files = request.files.getlist('reports')

    # Check if any reports are uploaded, else set an empty report
    if files:
        report_details = extract_text_from_reports(files)
    else:
        report_details = "No reports uploaded."

    user_input = {
        'Age': int(data['age']),
        'Gender': data['gender'],
        'Weight': float(data['weight']),
        'Height': float(data['height']),
        'Diseases': data['diseases'],
        'ActivityLevel': int(data['activity_level']),
        'Goal': int(data['goal'])
    }

    recommended_plan = recommend_meal_and_workout(user_input)
    diet_suggestions = generate_diet_suggestions(user_input)
    pdf = generate_pdf(recommended_plan, report_details, diet_suggestions)
    return send_file(pdf, download_name='Health_Report.pdf', as_attachment=True)

@app.route('/')
def home():
    return "Welcome to the Health Recommendation System!"

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Default average values for missing parameters
AVERAGE_VALUES = {
    "Fasting Blood Sugar": 90,  # mg/dL
    "Post Prandial Blood Sugar": 120,  # mg/dL
    "Thyroxine": 1.5,  # ng/dL
    "Cholesterol": 180,  # mg/dL (Total)
    "LDL Cholesterol": 90,  # mg/dL
    "HDL Cholesterol": 50  # mg/dL
}

# Health recommendations based on extracted values
def health_recommendation(data):
    recommendations = {}
    diet_recommendations = {
        "breakfast": [],
        "lunch": [],
        "dinner": [],
        "snacks": []
    }

    # Determine health conditions
    health_conditions = {
        'blood_sugar_level': 'normal',
        'cholesterol_level': 'normal',
        'bmi_category': 'normal'
    }

    # Analyze blood sugar
    if data["Fasting Blood Sugar"]:
        fasting_blood_sugar = float(data["Fasting Blood Sugar"])
        if fasting_blood_sugar > 100:
            health_conditions['blood_sugar_level'] = 'high'
            recommendations["Fasting Blood Sugar"] = "Consider consulting a doctor for potential diabetes management."
        else:
            recommendations["Fasting Blood Sugar"] = "Your fasting blood sugar is in the normal range."

    # Analyze cholesterol
    if data["Cholesterol"]:
        cholesterol = int(data["Cholesterol"])
        if cholesterol > 200:
            health_conditions['cholesterol_level'] = 'high'
            recommendations["Cholesterol"] = "Your cholesterol is high. It's advisable to consult a healthcare provider."
        else:
            recommendations["Cholesterol"] = "Your cholesterol is in the normal range."

    # Get ML-based recommendations for each meal
    for meal_type in ['breakfast', 'lunch', 'dinner']:
        recommended_foods = diet_recommender.recommend_foods(health_conditions, meal_type)
        for food in recommended_foods:
            # Add calorie information (this would ideally come from a food database)
            calories = 300 if meal_type == 'breakfast' else 400 if meal_type == 'lunch' else 350
            diet_recommendations[meal_type].append({
                "item": food,
                "calories": calories
            })

    # Add snacks recommendations
    diet_recommendations["snacks"].extend([
        {"item": "Handful of nuts", "calories": 150},
        {"item": "Fruit salad", "calories": 120},
        {"item": "Coconut yogurt with berries", "calories": 180}
    ])

    return recommendations, diet_recommendations

def analyze_health_status(bmi, data):
    health_status = {
        "weight_status": "",
        "recommendations": []
    }
    
    # Analyze weight status
    if bmi < 18.5:
        health_status["weight_status"] = "Underweight"
        health_status["recommendations"].append("Consider increasing calorie intake with healthy foods")
    elif 18.5 <= bmi < 25:
        health_status["weight_status"] = "Normal weight"
        health_status["recommendations"].append("Maintain current healthy eating habits")
    elif 25 <= bmi < 30:
        health_status["weight_status"] = "Overweight"
        health_status["recommendations"].append("Consider reducing calorie intake and increasing physical activity")
    else:
        health_status["weight_status"] = "Obese"
        health_status["recommendations"].append("Consult a healthcare provider for weight management guidance")
    
    # Analyze blood sugar
    if data.get("Fasting Blood Sugar"):
        blood_sugar = float(data["Fasting Blood Sugar"])
        if blood_sugar > 100:
            health_status["recommendations"].append("Monitor blood sugar levels and consider dietary modifications")
    
    # Analyze cholesterol
    if data.get("Cholesterol"):
        cholesterol = int(data["Cholesterol"])
        if cholesterol > 200:
            health_status["recommendations"].append("Focus on heart-healthy diet and regular exercise")
    
    return health_status

# Function to extract data from report text
def extract_data_from_report(text):
    extracted_data = {
        "Fasting Blood Sugar": None,
        "Post Prandial Blood Sugar": None,
        "Thyroxine": None,
        "Cholesterol": None,
        "LDL Cholesterol": None,
        "HDL Cholesterol": None
    }

    fasting_key = "Blood Sugar Fasting"
    post_prandial_key = "Glucose - Post Prandial"
    thyroxine_key = "Thyroxine"
    cholesterol_key = "Cholesterol"
    ldl_key = "LDL Cholesterol"
    hdl_key = "HDL Cholesterol"

    if fasting_key in text:
        extracted_data["Fasting Blood Sugar"] = text.split(fasting_key)[1].split()[0]
    
    if post_prandial_key in text:
        extracted_data["Post Prandial Blood Sugar"] = text.split(post_prandial_key)[1].split()[0]
    
    if thyroxine_key in text:
        extracted_data["Thyroxine"] = text.split(thyroxine_key)[1].split()[0]
    
    if cholesterol_key in text:
        extracted_data["Cholesterol"] = text.split(cholesterol_key)[1].split()[0]
    
    if ldl_key in text:
        extracted_data["LDL Cholesterol"] = text.split(ldl_key)[1].split()[0]
    
    if hdl_key in text:
        extracted_data["HDL Cholesterol"] = text.split(hdl_key)[1].split()[0]

    # Replace missing data with average values
    for key, value in extracted_data.items():
        if value is None:
            extracted_data[key] = AVERAGE_VALUES.get(key)

    return extracted_data

def extract_data_from_file(file_path):
    with open(file_path, 'rb') as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()

    data = extract_data_from_report(text)
    recommendations, diet_recommendations = health_recommendation(data)
    return data, recommendations, diet_recommendations

# Route to upload multiple files
@app.route('/analyzereport', methods=['POST'])
def upload_files():
    print("Received request at /analyzereport")
    
    if 'file' not in request.files:
        print("No file part in request")
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('file')
    print(f"Received {len(files)} files")
    
    # Get user information
    user_info = {
        'name': request.form.get('name'),
        'age': int(request.form.get('age')),
        'weight': float(request.form.get('weight')),
        'height': float(request.form.get('height')),
        'dairy_allergy': request.form.get('dairy_allergy') == 'true',
        'peanut_allergy': request.form.get('peanut_allergy') == 'true'
    }
    print(f"User info: {user_info}")
    
    # Calculate BMI and daily calories
    try:
        bmi = calculate_bmi(user_info['weight'], user_info['height'])
        daily_calories = calculate_daily_calories(user_info['weight'], user_info['height'], user_info['age'], 'female')
        print(f"Calculated BMI: {bmi}, Daily Calories: {daily_calories}")
    except Exception as e:
        print(f"Error calculating BMI/calories: {str(e)}")
        return jsonify({"error": f"Error calculating health metrics: {str(e)}"}), 500
    
    results = {}
    analysis = {
        'blood': {},
        'cholesterol': {},
        'thyroxine': {}
    }
    
    for file in files:
        if file.filename == '':
            print("Empty filename found")
            return jsonify({"error": "One or more files have no filename"}), 400
            
        print(f"Processing file: {file.filename}")
        # Save the uploaded files
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        
        # Extract data from the uploaded file
        extracted_data, recommendations, diet_recommendations = extract_data_from_file(file_path)
        
        # Store results
        results[file.filename] = {
            "extracted_data": extracted_data,
            "recommendations": recommendations,
            "diet_recommendations": diet_recommendations
        }
        
        # Add to analysis
        if 'blood' in file.filename.lower():
            analysis['blood'] = recommendations
        elif 'cholesterol' in file.filename.lower():
            analysis['cholesterol'] = recommendations
        elif 'thyroxine' in file.filename.lower():
            analysis['thyroxine'] = recommendations
    
    # Combine diet recommendations
    combined_recommendations = {
        'breakfast': [],
        'lunch': [],
        'dinner': [],
        'snacks': [],
        'daily_calories': daily_calories
    }
    
    for result in results.values():
        if result.get('diet_recommendations'):
            for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
                if result['diet_recommendations'].get(meal_type):
                    combined_recommendations[meal_type].extend(result['diet_recommendations'][meal_type])
    
    # Remove duplicates and limit to 3 items per meal
    for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
        # Remove duplicates based on item name
        seen = set()
        unique_items = []
        for item in combined_recommendations[meal_type]:
            if isinstance(item, dict) and item['item'] not in seen:
                seen.add(item['item'])
                unique_items.append(item)
        # Limit to 3 items
        combined_recommendations[meal_type] = unique_items[:3]
    
    # Filter out allergens
    if user_info['dairy_allergy']:
        for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
            combined_recommendations[meal_type] = [
                item for item in combined_recommendations[meal_type]
                if 'milk' not in item['item'].lower() 
                and 'dairy' not in item['item'].lower()
                and 'yogurt' not in item['item'].lower()
                and 'cheese' not in item['item'].lower()
            ]
    
    if user_info['peanut_allergy']:
        for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
            combined_recommendations[meal_type] = [
                item for item in combined_recommendations[meal_type]
                if 'peanut' not in item['item'].lower()
                and 'groundnut' not in item['item'].lower()
            ]
    
    # Analyze health status
    health_status = analyze_health_status(bmi, results.get(list(results.keys())[0], {}).get('extracted_data', {}))
    
    try:
        # Generate PDF
        pdf_buffer = generate_pdf_report(user_info, analysis, combined_recommendations, bmi, daily_calories)
        print("PDF generated successfully")
        
        # Save PDF temporarily with a unique name
        pdf_filename = f"diet_recommendations_{user_info['name']}_{int(time.time())}.pdf"
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)
        with open(pdf_path, 'wb') as f:
            f.write(pdf_buffer.getvalue())
        
        print(f"PDF saved successfully at: {pdf_path}")
        
        # Return results with the full URL for download
        return jsonify({
            "analysis": analysis,
            "diet_recommendations": combined_recommendations,
            "health_status": health_status,
            "pdf_url": f"http://localhost:5000/download/{pdf_filename}"
        })
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return jsonify({"error": f"Error generating PDF: {str(e)}"}), 500

@app.route('/download/<filename>')
def download_file(filename):
    try:
        print(f"Attempting to download file: {filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return jsonify({"error": "File not found"}), 404
        print(f"Serving file from: {file_path}")
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    except Exception as e:
        print(f"Error serving file: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/metrics', methods=['GET'])
def get_metrics():
    """Endpoint to get model performance metrics"""
    return jsonify(model_metrics)

if __name__ == '__main__':
    app.run(debug=True)