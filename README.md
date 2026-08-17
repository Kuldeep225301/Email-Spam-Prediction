#  Email Spam Prediction Engine


An end-to-end Machine Learning web application designed to classify emails as **Spam** or **Not Spam (Ham)**. Built using an ensemble **Stacking Classifier**, integrated with a asynchronous **FastAPI** backend, and deployed on **Render**.

🔗 **Live Web Application:** [https://email-spam-predictions.onrender.com/](https://email-spam-predictions.onrender.com/)

---

##  Overview

Spam and phishing emails pose significant cybersecurity risks. This project delivers a machine learning solution capable of processing raw, multiline email inputs, applying text cleaning and URL tokenization, and delivering real-time predictions with high precision to minimize false positives.

---

## 📊 Model Performance & Evaluation

To achieve maximum reliability, **11 different algorithms** were evaluated. The top-performing estimators were combined into a **Stacking Classifier** to maximize **Precision** (ensuring legitimate emails are not wrongly marked as spam).

### 🏆 Final Model Metrics
* **Winning Model:** `StackingClassifier`
* **Overall Accuracy:** **98.55%**
* **Precision Score:** **99.24%**

### Classification Report

| Class | Precision | Recall | F1-Score | Support |
| :--- | :---: | :---: | :---: | :---: |
| **0 (Not Spam)** | 0.98 | 1.00 | 0.99 | 889 |
| **1 (Spam)** | 0.99 | 0.90 | 0.95 | 145 |
| **Accuracy** | | | **0.99** | **1034** |
| **Macro Avg** | 0.99 | 0.95 | 0.97 | 1034 |
| **Weighted Avg** | 0.99 | 0.99 | 0.99 | 1034 |

### Algorithm Benchmarking Comparison

| Algorithm | Accuracy | Precision |
| :--- | :---: | :---: |
| **KNN** | 0.9052 | 1.0000 |
| **Random Forest (RF)** | 0.9749 | 0.9917 |
| **Extra Trees (EXT)** | 0.9787 | 0.9695 |
| **Gradient Boosting (GBC)** | 0.9487 | 0.9600 |
| **Multinomial Naive Bayes (MNB)** | 0.9778 | 0.9552 |
| **Logistic Regression (LR)** | 0.9623 | 0.9274 |
| **Support Vector Classifier (SVC)** | 0.9681 | 0.9179 |
| **Bagging Classifier (BC)** | 0.9633 | 0.8849 |
| **Decision Tree** | 0.9304 | 0.8174 |
| **AdaBoost (ADC)** | 0.9149 | 0.7938 |
| **XGBoost (XBC)** | 0.9265 | 0.7379 |

---

## ✨ Key Technical Features

* **Sparse-to-Dense Handling:** Custom transformation pipeline to handle sparse matrix conversion issues with `SVC` in ensemble learning.
* **Robust Text Preprocessing:** Regex-based cleaning for multiline formatting, escape characters, and explicit URL token generation.
* **Probability Safeguards:** Integrates dynamic thresholding to catch edge-case phishing attempts.
* **Pydantic Data Validation:** Automatically sanitizes messy JSON payloads and multiline strings sent via API requests.

---

## 🛠️ Tech Stack

* **Language:** Python
* **Machine Learning:** Scikit-Learn, Pandas, NumPy, Joblib
* **Backend Framework:** FastAPI, Uvicorn, Pydantic
* **Frontend:** HTML5, CSS3, JavaScript (Fetch API)
* **Deployment & Version Control:** Render, Git, GitHub

---

## ⚙️ Local Setup and Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/Kuldeep225301/Email-Spam-Prediction.git](https://github.com/Kuldeep225301/Email-Spam-Prediction.git)
   cd Email-Spam-Prediction
