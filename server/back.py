from flask import Flask, request, jsonify, send_file
from pdf2image import convert_from_path
from PIL import Image
import os
from flask import Flask, request, render_template, jsonify
import PyPDF2
import pytesseract
import tempfile
import PyPDF2
import os
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

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

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

# Extract text from reports
def extract_blood_sugar(text):
    import re
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
def generate_pdf(plan, report_details):
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

    template = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            h1 {{ text-align: center; color: #4CAF50; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #4CAF50; color: white; }}
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
    pdf = generate_pdf(recommended_plan, report_details)
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

    # Blood Sugar
    if data["Fasting Blood Sugar"]:
        fasting_blood_sugar = float(data["Fasting Blood Sugar"])  # Convert to float
        if fasting_blood_sugar > 100:
            recommendations["Fasting Blood Sugar"] = "Consider consulting a doctor for potential diabetes management."
        else:
            recommendations["Fasting Blood Sugar"] = "Your fasting blood sugar is in the normal range. Keep up with healthy eating habits and regular exercise."
    else:
        recommendations["Fasting Blood Sugar"] = "Fasting blood sugar is missing. A typical fasting blood sugar should be around 90 mg/dL."

    if data["Post Prandial Blood Sugar"]:
        post_prandial_blood_sugar = float(data["Post Prandial Blood Sugar"])  # Convert to float
        if post_prandial_blood_sugar > 140:
            recommendations["Post Prandial Blood Sugar"] = "Post-prandial blood sugar is elevated. Consult with a healthcare provider for further tests."
        else:
            recommendations["Post Prandial Blood Sugar"] = "Your post-prandial blood sugar is normal."
    else:
        recommendations["Post Prandial Blood Sugar"] = "Post-prandial blood sugar is missing. It should ideally be under 140 mg/dL."

    # Thyroxine
    if data["Thyroxine"]:
        thyroxine = float(data["Thyroxine"])  # Convert to float
        if thyroxine < 0.9 or thyroxine > 2.3:
            recommendations["Thyroxine"] = "Thyroxine level is outside normal range. Consider consulting an endocrinologist."
        else:
            recommendations["Thyroxine"] = "Your thyroxine levels are normal."
    else:
        recommendations["Thyroxine"] = "Thyroxine value is missing. A normal thyroxine level is around 1.5 ng/dL."

    # Cholesterol
    if data["Cholesterol"]:
        cholesterol = int(data["Cholesterol"])  # Convert to int
        if cholesterol > 200:
            recommendations["Cholesterol"] = "Your cholesterol is high. It's advisable to consult a healthcare provider."
        else:
            recommendations["Cholesterol"] = "Your cholesterol is in a healthy range."
    else:
        recommendations["Cholesterol"] = "Cholesterol value is missing. Normal total cholesterol is below 200 mg/dL."

    return recommendations


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
    recommendations = health_recommendation(data)
    return data, recommendations

# Route to upload multiple files
@app.route('/analyzereport', methods=['POST'])
def upload_files():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist('file')  # Accept multiple files
    results = {}
    
    for file in files:
        # Save the uploaded files
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        
        # Extract data from the uploaded file
        extracted_data, recommendations = extract_data_from_file(file_path)
        results[file.filename] = {
            "extracted_data": extracted_data,
            "recommendations": recommendations
        }
    
    # Return results as JSON
    return jsonify({"Extracted Results": results})

if __name__ == '__main__':
    app.run(debug=True)
