# -*- coding: utf-8 -*-
import os, sys, re, json

with open('scratch/patches_extracted.json', 'r', encoding='utf-8') as f:
    patches = json.load(f)

print('Loaded patches successfully')
