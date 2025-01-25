import os
from flask import Flask, request, render_template, jsonify
import PyPDF2

app = Flask(__name__)

# Ensure the folder for uploaded files exists
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to extract data from report text
def extract_data_from_report(text):
    # Logic to extract blood sugar, thyroxine, and cholesterol values from the text
    extracted_data = {
        "Fasting Blood Sugar": None,
        "Post Prandial Blood Sugar": None,
        "Thyroxine": None,
        "Cholesterol": None
    }

    # Blood sugar extraction
    fasting_key = "Blood Sugar Fasting"
    post_prandial_key = "Glucose - Post Prandial"
    thyroxine_key = "Thyroxine"
    cholesterol_key = "Cholesterol"
    
    if fasting_key in text:
        extracted_data["Fasting Blood Sugar"] = text.split(fasting_key)[1].split()[0]
    
    if post_prandial_key in text:
        extracted_data["Post Prandial Blood Sugar"] = text.split(post_prandial_key)[1].split()[0]
    
    if thyroxine_key in text:
        extracted_data["Thyroxine"] = text.split(thyroxine_key)[1].split()[0]
    
    if cholesterol_key in text:
        extracted_data["Cholesterol"] = text.split(cholesterol_key)[1].split()[0]

    return extracted_data

def extract_data_from_file(file_path):
    with open(file_path, 'rb') as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    
    return extract_data_from_report(text)

# Route to upload multiple files
@app.route('/', methods=['GET', 'POST'])
def upload_files():
    if request.method == 'POST':
        files = request.files.getlist('file')  # Accept multiple files
        results = {}
        
        for file in files:
            # Save the uploaded files
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
            
            # Extract data from the uploaded file
            extracted_data = extract_data_from_file(file_path)
            results[file.filename] = extracted_data
        
        # Return results as JSON
        return jsonify({"Extracted Results": results})
    
    return '''
    <!doctype html>
    <title>Upload PDF Reports</title>
    <h1>Upload Multiple PDF Reports for Extraction</h1>
    <form method="post" enctype="multipart/form-data">
      <label for="file">Choose PDF files (3 files max):</label><br><br>
      <input type="file" name="file" accept="application/pdf" multiple required><br><br>
      <input type="submit" value="Upload and Extract">
    </form>
    '''

if __name__ == '__main__':
    app.run(debug=True)
