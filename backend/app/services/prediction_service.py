import pandas as pd
import numpy as np
import random
import os
import datetime

# Mock historical data path
CSV_PATH = 'historical_queue.csv'

def ensure_historical_data():
    if not os.path.exists(CSV_PATH):
        data = []
        for _ in range(1000):
            hour = random.randint(8, 17)
            people_in_queue = random.randint(1, 15)
            base_time = 5
            if hour in [10, 11, 13]:
                base_time += random.uniform(2, 5)
            actual_wait = people_in_queue * base_time + np.random.normal(0, 3)
            data.append([hour, people_in_queue, max(1, round(actual_wait))])
        df = pd.DataFrame(data, columns=['Hour', 'PeopleInQueue', 'TotalWaitTimeMins'])
        df.to_csv(CSV_PATH, index=False)

def predict_wait_time(people_ahead: int) -> int:
    ensure_historical_data()
    try:
        df = pd.read_csv(CSV_PATH)
        current_hour = datetime.datetime.now().hour
        historical_hour = df[df['Hour'] == current_hour].copy()
        
        if len(historical_hour) == 0:
            avg_time_per_person = 5 # fallback
        else:
            historical_hour['TimePerPerson'] = historical_hour['TotalWaitTimeMins'] / historical_hour['PeopleInQueue']
            avg_time_per_person = historical_hour['TimePerPerson'].mean()
        
        predicted_wait = round(avg_time_per_person * people_ahead)
        return int(predicted_wait)
    except Exception as e:
        print(f"Prediction error: {e}")
        return people_ahead * 5 # fallback of 5 mins per person

def get_historical_pace() -> str:
    current_hour = datetime.datetime.now().hour
    if current_hour in [10, 11, 13]:
        return "Slower than usual (Peak Hours)"
    return "Normal Pace"
