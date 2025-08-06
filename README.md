# 🏀 NBA Match Outcome Predictor

This project uses machine learning to predict the outcome of NBA games using historical data. Built with Python, scikit-learn, and pandas, it trains a Ridge Classifier using time-series cross-validation and feature selection to model match outcomes.

## 🚀 Features

- Loads and processes historical NBA data (`nba_games.csv`)
- Uses `RidgeClassifier` with 30 selected features via `SequentialFeatureSelector`
- Evaluates using `TimeSeriesSplit` for realistic model validation
- Compares performance with `DummyClassifier` baseline
- Well-commented and beginner-friendly code

## 📊 Results

- Accuracy: ~55%
- Baseline (home team always wins): ~57%
- Indicates potential for further optimization and tuning

## 🧠 ML Techniques Used

- Ridge Classification (for binary outcome prediction)
- Sequential Feature Selection (Forward)
- Time-series aware cross-validation

## 🧰 Tech Stack

- Python
- scikit-learn
- pandas
- Jupyter Notebook (or VS Code with Jupyter support)

## 📁 Project Structure

```
nba-match-predictor/
├── predictor.ipynb         # Main notebook
├── nba_games.csv           # Historical match data
├── requirements.txt        # Dependencies
└── README.md               # This file
```

## 🛠 How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/nba-match-predictor.git
   cd nba-match-predictor
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch notebook:
   - Open `predictor.ipynb` in Jupyter or VSCode
   - Run all cells to preprocess, train, and evaluate

## 🌱 Future Work

- Add support for live data via API (e.g., NBA stats API)
- Build a React.js frontend for users to input matchups
- Host as a web app for public predictions
- Test alternative models (Random Forest, XGBoost, etc.)
- Improve accuracy with hyperparameter tuning

## 📜 License

This project is licensed under the MIT License.
