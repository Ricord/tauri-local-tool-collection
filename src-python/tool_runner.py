#!/usr/bin/env python3
"""Windows sidecar entry point for Python-based tools.

The executable protocol is intentionally small and stable:
    tool-python.exe <tool_name> [tool arguments...]

Successful output is written to stdout as UTF-8. Validation and execution
errors are written to stderr and return a non-zero exit code.
"""

from __future__ import annotations

import base64
import json
import sys
import uuid
from collections.abc import Callable, Sequence


class ToolInputError(ValueError):
    """Raised when a tool receives invalid user input."""


def json_formatter(args: Sequence[str]) -> str:
    if not args:
        raise ToolInputError("JSON 格式化需要一个 JSON 字符串参数")

    minify = "--minify" in args[1:]
    try:
        value = json.loads(args[0])
    except json.JSONDecodeError as error:
        raise ToolInputError(
            f"无效 JSON：第 {error.lineno} 行，第 {error.colno} 列，{error.msg}"
        ) from error

    if minify:
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return json.dumps(value, ensure_ascii=False, indent=2)


def base64_encoder(args: Sequence[str]) -> str:
    if len(args) < 2:
        raise ToolInputError("Base64 工具用法：base64_encoder <encode|decode> <文本>")

    operation, data = args[0], args[1]
    if operation == "encode":
        return base64.b64encode(data.encode("utf-8")).decode("ascii")
    if operation == "decode":
        try:
            decoded = base64.b64decode(data, validate=True)
            return decoded.decode("utf-8")
        except (ValueError, UnicodeDecodeError) as error:
            raise ToolInputError("Base64 内容无效或解码结果不是 UTF-8 文本") from error

    raise ToolInputError(f"未知 Base64 操作：{operation}")


def uuid_generator(args: Sequence[str]) -> str:
    version = args[0] if args else "4"
    if version == "1":
        return str(uuid.uuid1())
    if version == "4":
        return str(uuid.uuid4())
    if version == "5":
        namespace = uuid.NAMESPACE_DNS
        name = args[1] if len(args) > 1 else "example.com"
        return str(uuid.uuid5(namespace, name))

    raise ToolInputError(f"不支持的 UUID 版本：{version}，仅支持 1、4、5")


TOOLS: dict[str, Callable[[Sequence[str]], str]] = {
    "json_formatter": json_formatter,
    "base64_encoder": base64_encoder,
    "uuid_generator": uuid_generator,
}


def main(argv: Sequence[str]) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")

    if len(argv) < 2:
        print(
            "用法：tool-python <工具名称> [参数...]\n"
            f"可用工具：{', '.join(sorted(TOOLS))}",
            file=sys.stderr,
        )
        return 2

    tool_name = argv[1]
    handler = TOOLS.get(tool_name)
    if handler is None:
        print(f"不允许执行未知 Python 工具：{tool_name}", file=sys.stderr)
        return 2

    try:
        result = handler(argv[2:])
    except ToolInputError as error:
        print(str(error), file=sys.stderr)
        return 2
    except Exception as error:  # pragma: no cover - final sidecar safety boundary
        print(f"Python 工具执行失败：{error}", file=sys.stderr)
        return 1

    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
