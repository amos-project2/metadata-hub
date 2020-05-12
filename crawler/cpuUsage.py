import matplotlib.pyplot as plt
import matplotlib.animation as animation
from itertools import count
import psutil

timePassed = []
cpuUsage = []

index = count()


def measureCpuUsage(i):
    timePassed.append(next(index))
    cpuUsage.append(psutil.cpu_percent(interval=None))
    plt.cla()
    plt.xlabel("time passed [s]")
    plt.ylabel("CPU usage [%]")
    plt.plot(timePassed, cpuUsage)

ani = animation.FuncAnimation(plt.gcf(), measureCpuUsage, 1000)

plt.tight_layout()
plt.show()
