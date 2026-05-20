# 💼 AI Salary Predictor

An end-to-end, high-precision Machine Learning web application designed to forecast annual salaries for artificial intelligence professionals. The project combines a high-performance **XGBoost** regression model, an asynchronous **FastAPI** backend, and a premium, minimalist **React** frontend styled with a cozy Scandinavian beige and deep navy theme.

---

## 🎨 Preview & Aesthetics

The application features a modern, clean, and warm light-mode design inspired by organic Scandinavian colors:
- **Cream & Soft Sand** (`#F5EFEB`, `#EEE8DF`) for a relaxing, warm visual environment.
- **Deep Ocean Navy** (`#23375B`) for elegant, high-contrast serif typography and inputs.
- **Cozy Stone Beige** (`#C4BCB0`) for elegant dividers, borders, and details.
- High-end font pairing: **Playfair Display** (italic serif headings) and **Outfit** (clean sans-serif elements).

---

## ⚡ Key Upgrades & UX Innovations

We replaced traditional, frustrating form fields with intelligent, user-centric controls:
1. **🏢 Smart Remote Selector**: Instead of typing arbitrary percentages, a beautiful segmented control lets users click `On-site (0%)`, `Hybrid (50%)`, or `Full Remote (100%)`.
2. **🏥 Benefits checklist**: Users simply check boxes for key benefits (Health Insurance, Flexible Hours, Gym, etc.). The frontend automatically computes a standardized benefits score (`5.0` to `10.0`) compatible with the model's training range.
3. **📝 Job Description Textarea**: Users copy and paste a job description. The code counts its length in real-time and clips it safely between `500` and `2500` characters to stay within the model's bounds.

---

## 📂 Project Architecture

```
projet-1_salary_predictor_model/
├── backend/
│   ├── api.py                    # FastAPI server & prediction routes
│   ├── requirements.txt           # Python dependencies (fastapi, uvicorn, xgboost, etc.)
│   └── salary_predictor_model.pkl # Trained XGBoost regressor pipeline
├── frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── App.js                 # Main React interface & state handling
│   │   ├── App.css                # Premium styling (Scandinavian custom theme)
│   │   ├── api.js                 # API call handler using Axios
│   │   └── index.js               # React entry point
│   ├── package.json               # Node.js dependencies & scripts
│   └── package-lock.json          # Node dependency lockfile
├── data/
│   └── ai_job_dataset.csv         # Global AI Job Market and Salary Trends 2025 dataset
├── notebooks/
│   └── salary-predictor-deployed.ipynb # Exploratory Data Analysis & initial training
└── .gitignore                     # Git ignore rules for public repository
```

---

## 🧠 Machine Learning Model Specs

The prediction engine runs on a robust `XGBRegressor` pipeline:
- **Preprocessing**: 
  - Numerical features scaled using `StandardScaler`.
  - Categorical features encoded using `OneHotEncoder(handle_unknown='ignore')`.
  - Required skills extracted using a `TfidfVectorizer(max_features=100)`.
- **Model Quality**:
  - **Mean Absolute Error (MAE)**: ~14,963 USD
  - **Coefficient of Determination ($R^2$ Score)**: ~0.88

---

## 🚀 How to Run the Project Locally

### 1. Prerequisiets
Ensure you have **Python 3.10+** and **Node.js (v18+)** installed.

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows (CMD / PowerShell):
   .venv\Scripts\activate
   # On macOS / Linux:
   source .venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API server:
   ```bash
   python api.py
   ```
   *The FastAPI server will start at **`http://localhost:8000`**.*

---

### 3. Frontend Setup (React)

1. Open a **new** terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm start
   ```
   *The application will automatically open in your browser at **`http://localhost:3000`**.*

---

## 📄 License
This project is open-source and available under the MIT License.
