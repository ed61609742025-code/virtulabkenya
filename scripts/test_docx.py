import sys
try:
    import docx
    print("python-docx is available")
except ImportError:
    print("python-docx is NOT available")
