#!/usr/bin/env python3

import matplotlib
import matplotlib.pyplot as plt
import json

file = open('heap.json', 'r')
heapList = json.load(file)


plt.plot(heapList)
plt.ylabel('Heap Size')
plt.savefig("graph.png")
