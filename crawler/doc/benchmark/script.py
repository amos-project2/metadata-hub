import json
import numpy as np
import matplotlib.pyplot as plt


with open('data.json', 'r') as fp:
    data = json.load(fp)

for title in data:
    fname = title.replace(';', '').replace(':', '').replace(' ', '')
    x_values = np.array(data.get(title).get('X'))
    y_values_v10 = np.array(data.get(title).get('Y').get('v10'))
    y_values_v12 = np.array(data.get(title).get('Y').get('v12'))
    plt.plot(x_values, y_values_v10, label='v10', marker='o')
    plt.plot(x_values, y_values_v12, label='v12', marker='o')
    plt.xlabel('Run [ID]')
    plt.ylabel('Time [s]')
    plt.xticks(np.arange(min(x_values), max(x_values)+1, 1))
    plt.title(title)
    plt.legend()
    plt.savefig(fname, dpi=300)
    plt.close()
