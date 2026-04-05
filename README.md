# Currency Crisis Early Warning System (EWS)

A full-stack application that monitors macroeconomic indicators across 15 vulnerable countries and computes a weekly "stress score" out of 100 to flag currencies at high risk of a sovereign or foreign-exchange crisis.

## Architecture

```text
┌─────────────────────────────────┐
│        React Frontend           │
│  (Vite + Tailwind + Recharts)   │
└───────────────┬─────────────────┘
                │ HTTP / JSON
┌───────────────▼─────────────────┐
│          Flask API              │
│       (app.py + routes/)        │
└───────────────┬─────────────────┘
                │ PyMongo
┌───────────────▼─────────────────┐
│       MongoDB Atlas (M0)        │
│          (currency_ews)         │
└───────────────▲─────────────────┘
                │ Upserts
┌───────────────┴─────────────────┐
│      Python Data Pipeline       │
│  (APScheduler + requests + pd)  │
└─────────────────────────────────┘
```

## Data Sources
- **World Bank API** (Inflation, Foreign Reserves, Debt-to-GDP, Current Account). Free, no API key required.
- **Frankfurter API** (Exchange Rates and FX Volatility vs USD). Free, no API key required.

## Stress Score Formula
The core logic relies on a statistical Z-score model (not ML). For each country:
1. Fetch the absolute values for 5 macroeconomic indicators.
2. Calculate the historical mean ($\mu$) and standard deviation ($\sigma$) over the last 10 years.
3. Compute the Z-score for the current value: $z = \frac{(value - \mu)}{\sigma}$
4. Apply domain-specific weighting:
   - Inflation (30%)
   - Change in FX Reserves (25%)
   - Debt to GDP (20%)
   - Current Account (15%)
   - FX Volatility (10%)
5. Normalize the raw composite into a 0–100 scale: `MIN(MAX((raw + 3) / 6 * 100, 0), 100)`

## Setup & Running

### 1. MongoDB Atlas Setup
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist IP `0.0.0.0/0`.
3. Get the connection string (SRV URI).

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
```

### 3. Seed & Pipeline
Seed the initial structural records:
```bash
cd pipeline
python seed_data.py
```
Run the data pipeline to fetch historical data and compute current stress levels:
```bash
python scheduler.py
```

### 4. Run API Server
In a new terminal:
```bash
cd backend
python app.py
```
*(Runs on port 5000)*

### 5. Run Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on port 5173)*
