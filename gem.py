import os
from flask import Flask, request, jsonify
import PyPDF2
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow the frontend to access the backend

# Ensure the folder for uploaded files exists
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
