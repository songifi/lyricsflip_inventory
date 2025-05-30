import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from statsmodels.tsa.seasonal import seasonal_decompose
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import json
import os

class DemandForecaster:
    def __init__(self, data_file='data/sales_data.json'):
        self.data = None
        self.model = None
        self.feature_names = None
        self.load_data(data_file)
        
    def load_data(self, data_file):
        """Load and preprocess historical sales data from JSON"""
        try:
            with open(data_file, 'r') as f:
                json_data = json.load(f)
            self.data = pd.DataFrame(json_data['sales'])
            self.data['date'] = pd.to_datetime(self.data['date'])
            self.data.set_index('date', inplace=True)
            self.data = self.data.rename(columns={'quantity': 'sales'})
        except FileNotFoundError:
            dates = pd.date_range(start='2023-01-01', end='2025-05-29', freq='D')
            self.data = pd.DataFrame({
                'sales': np.random.normal(100, 20, len(dates)) + 
                        50 * np.sin(np.linspace(0, 4*np.pi, len(dates)))
            }, index=dates)

    def analyze_historical_data(self, period=7):
        """Analyze historical sales patterns and seasonality"""
        decomposition = seasonal_decompose(self.data['sales'], model='additive', period=period)
        
        plt.figure(figsize=(12, 8))
        plt.subplot(411)
        plt.plot(decomposition.observed, label='Observed')
        plt.legend(loc='best')
        plt.subplot(412)
        plt.plot(decomposition.trend, label='Trend')
        plt.legend(loc='best')
        plt.subplot(413)
        plt.plot(decomposition.seasonal, label='Seasonal')
        plt.legend(loc='best')
        plt.subplot(414)
        plt.plot(decomposition.resid, label='Residual')
        plt.legend(loc='best')
        plt.tight_layout()
        plt.savefig('output/seasonal_decomposition.png')
        plt.close()
        
        return decomposition

    def prepare_features(self, window=7):
        """Prepare features for ML model"""
        df = self.data.copy()
        
        for i in range(1, window + 1):
            df[f'lag_{i}'] = df['sales'].shift(i)
        
        df['rolling_mean'] = df['sales'].rolling(window=window).mean()
        df['rolling_std'] = df['sales'].rolling(window=window).std()
        
        df['day_of_week'] = df.index.dayofweek
        df['month'] = df.index.month
        df['is_weekend'] = df.index.dayofweek.isin([5, 6]).astype(int)
        
        return df.dropna()

    def train_forecast_model(self, test_size=0.2):
        """Train Random Forest model for demand forecasting"""
        df_features = self.prepare_features()
        
        train_size = int(len(df_features) * (1 - test_size))
        train = df_features.iloc[:train_size]
        test = df_features.iloc[train_size:]
        
        X_train = train.drop('sales', axis=1)
        y_train = train['sales']
        X_test = test.drop('sales', axis=1)
        y_test = test['sales']
        
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.feature_names = X_train.columns.tolist()
        self.model.fit(X_train, y_train)
        
        predictions = self.model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        print(f"Model MSE: {mse:.2f}")
        
        return X_test.index, predictions

    def forecast_future(self, days=30):
        """Forecast future demand"""
        last_date = self.data.index[-1]
        future_dates = pd.date_range(start=last_date + timedelta(days=1), periods=days, freq='D')
        
        # Get the prepared features to understand the structure
        prepared_data = self.prepare_features()
        last_window_data = self.data.tail(14)  # Get more data for rolling calculations
        
        future_predictions = []
        current_data = self.data.copy()
        
        for date in future_dates:
            # Prepare features for this specific date using current_data
            temp_data = current_data.copy()
            
            # Create a temporary row for the new date with NaN sales (will be predicted)
            temp_row = pd.DataFrame({'sales': [np.nan]}, index=[date])
            temp_data = pd.concat([temp_data, temp_row])
            
            # Calculate features for the last row (our prediction date)
            features = {}
            
            # Lag features
            for i in range(1, 8):
                if len(temp_data) >= i:
                    features[f'lag_{i}'] = temp_data['sales'].iloc[-(i+1)]
                else:
                    features[f'lag_{i}'] = temp_data['sales'].iloc[-1]
            
            # Rolling features (use last 7 days)
            recent_sales = temp_data['sales'].iloc[-8:-1]  # Exclude the NaN row
            features['rolling_mean'] = recent_sales.mean()
            features['rolling_std'] = recent_sales.std()
            
            # Date features
            features['day_of_week'] = date.dayofweek
            features['month'] = date.month
            features['is_weekend'] = 1 if date.dayofweek in [5, 6] else 0
            
            # Create DataFrame with proper column names and order
            feature_df = pd.DataFrame([features], columns=self.feature_names)
            
            # Make prediction
            prediction = self.model.predict(feature_df)[0]
            future_predictions.append(prediction)
            
            # Add the prediction to current_data for next iteration
            pred_row = pd.DataFrame({'sales': [prediction]}, index=[date])
            current_data = pd.concat([current_data, pred_row])
        
        return future_dates, np.array(future_predictions)

    def optimize_inventory(self, lead_time=7, service_level=0.95):
        """Optimize inventory reorder points"""
        _, future_predictions = self.forecast_future(lead_time)
        
        forecast_std = np.std(future_predictions)
        z_score = 1.96  # For 95% service level
        safety_stock = z_score * forecast_std * np.sqrt(lead_time)
        
        avg_daily_demand = np.mean(future_predictions)
        reorder_point = (avg_daily_demand * lead_time) + safety_stock
        
        return {
            'reorder_point': round(reorder_point, 2),
            'safety_stock': round(safety_stock, 2),
            'avg_daily_demand': round(avg_daily_demand, 2)
        }

def main():
    os.makedirs('output', exist_ok=True)
    
    forecaster = DemandForecaster()
    
    print("Analyzing historical patterns...")
    forecaster.analyze_historical_data()
    
    print("\nTraining forecasting model...")
    dates, predictions = forecaster.train_forecast_model()
    
    plt.figure(figsize=(12, 6))
    plt.plot(dates, forecaster.data.loc[dates, 'sales'], label='Actual')
    plt.plot(dates, predictions, label='Predicted')
    plt.title('Demand Forecast')
    plt.xlabel('Date')
    plt.ylabel('Sales')
    plt.legend()
    plt.savefig('output/forecast_results.png')
    plt.close()
    
    print("\nForecasting future demand...")
    future_dates, future_predictions = forecaster.forecast_future()
    
    # Plot future predictions
    plt.figure(figsize=(12, 6))
    # Plot last 30 days of actual data
    recent_data = forecaster.data.tail(30)
    plt.plot(recent_data.index, recent_data['sales'], label='Historical', color='blue')
    # Plot future predictions
    plt.plot(future_dates, future_predictions, label='Forecast', color='red', linestyle='--')
    plt.title('Future Demand Forecast')
    plt.xlabel('Date')
    plt.ylabel('Sales')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('output/future_forecast.png')
    plt.close()
    
    print("\nOptimizing inventory...")
    inventory_params = forecaster.optimize_inventory()
    print(f"Inventory Optimization Results:")
    print(f"Reorder Point: {inventory_params['reorder_point']}")
    print(f"Safety Stock: {inventory_params['safety_stock']}")
    print(f"Average Daily Demand: {inventory_params['avg_daily_demand']}")

if __name__ == "__main__":
    main()