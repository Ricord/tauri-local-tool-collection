#!/usr/bin/env python3
"""
Base64 Encoder/Decoder Tool
Encode and decode Base64 strings
"""

import base64
import sys


def encode_base64(data):
    """Encode string to Base64"""
    try:
        return base64.b64encode(data.encode()).decode()
    except Exception as e:
        return f"Error: {str(e)}"


def decode_base64(data):
    """Decode Base64 string"""
    try:
        return base64.b64decode(data).decode()
    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: base64_encoder.py <encode|decode> <data>")
        sys.exit(1)

    operation = sys.argv[1]
    data = sys.argv[2]

    if operation == "encode":
        result = encode_base64(data)
    elif operation == "decode":
        result = decode_base64(data)
    else:
        result = f"Error: Unknown operation {operation}"

    print(result)
