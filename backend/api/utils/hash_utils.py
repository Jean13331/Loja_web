import hashlib
import re


def md5_hash(value: str) -> str:
    return hashlib.md5(value.encode("utf-8")).hexdigest()


def md5_hash_numeric_only(value: str) -> str:
    only_digits = re.sub(r"\D", "", value)
    return md5_hash(only_digits)


