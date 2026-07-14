#!/usr/bin/env python3
"""
JSON Formatter Tool
Formats and validates JSON data
"""

import json
import sys


def format_json(data, minify=False):
    """Format JSON data"""
    try:
        parsed = json.loads(data)
        if minify:
            return json.dumps(parsed, separators=(",", ":"))
        else:
            return json.dumps(parsed, indent=2)
    except json.JSONDecodeError as e:
        return f"Error: Invalid JSON - {str(e)}"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: json_formatter.py <json_string> [--minify]")
        sys.exit(1)

    json_data = sys.argv[1]
    minify = "--minify" in sys.argv

    result = format_json(json_data, minify)
    print(result)
