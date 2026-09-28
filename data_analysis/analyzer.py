import pandas as pd
import numpy as np
import random
import json
import os

print("--- Starting QueueSense Data Analysis ---")

# 1. GENERATE MOCK HISTORICAL DATA
# Pretend we are a hospital that has tracked queues for months
data = []
for _ in range(1000):
    hour = random.randint(8, 17) # 8 AM to 5 PM
    people_in_queue = random.randint(1, 15)
    
    # Peak hours (10 AM and 1 PM) usually take longer
    base_time = 5 # 5 mins per person roughly
    if hour in [10, 11, 13]:
        base_time += random.uniform(2, 5)
    
    # Add some random real-world variance using numpy
    actual_wait = people_in_queue * base_time + np.random.normal(0, 3)
    data.append([hour, people_in_queue, max(1, round(actual_wait))])

# Create a Pandas DataFrame
df = pd.DataFrame(data, columns=['Hour', 'PeopleInQueue', 'TotalWaitTimeMins'])
csv_path = 'historical_queue.csv'
df.to_csv(csv_path, index=False)
print(f"Generated historical dataset at {csv_path}")

# 2. PERFORM DATA ANALYSIS FOR CURRENT QUEUE
# Let's say right now it is 10 AM, and there are 4 people ahead of the user
current_hour = 10
people_ahead = 4

# Use Pandas to filter past data for this specific hour
historical_hour = df[df['Hour'] == current_hour].copy()

# Calculate the average time ONE person takes during this hour
historical_hour['TimePerPerson'] = historical_hour['TotalWaitTimeMins'] / historical_hour['PeopleInQueue']
avg_time_per_person = historical_hour['TimePerPerson'].mean()

# Predict the wait time for the user
predicted_wait = round(avg_time_per_person * people_ahead)

print(f"Analysis complete. AI Predicted Wait Time: {predicted_wait} minutes")

# 3. EXPORT TO JSON FOR SPRING BOOT BACKEND
output = {
    "currentlyServing": 42,
    "yourTicket": 47,
    "peopleAhead": people_ahead,
    "estimatedWaitMins": int(predicted_wait),
    "historicalPace": "Slower than usual (Peak Hours)" if current_hour in [10, 11, 13] else "Normal Pace",
    "safeToLeave": bool(predicted_wait > 12)
}

# Save output to a file that our Java Backend will read
json_path = '../backend/queue_prediction.json'
with open(json_path, 'w') as f:
    json.dump(output, f)

print(f"Saved prediction to {json_path} for the Java Backend to read.")
