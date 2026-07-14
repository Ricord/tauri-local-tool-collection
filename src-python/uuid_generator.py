#!/usr/bin/env python3
"""
UUID Generator Tool
Generates UUIDs (v1, v4, v5)
"""

import uuid
import sys


def generate_uuid(version="4"):
    """Generate UUID based on version"""
    if version == "1":
        return str(uuid.uuid1())
    elif version == "4":
        return str(uuid.uuid4())
    elif version == "5":
        # For v5, we need a namespace and name
        namespace = uuid.NAMESPACE_DNS
        name = "example.com"
        return str(uuid.uuid5(namespace, name))
    else:
        return f"Error: Unknown UUID version {version}"


if __name__ == "__main__":
    version = sys.argv[1] if len(sys.argv) > 1 else "4"
    result = generate_uuid(version)
    print(result)
