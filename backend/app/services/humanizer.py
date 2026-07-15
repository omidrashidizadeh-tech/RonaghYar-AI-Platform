from __future__ import annotations

import re
from dataclasses import asdict, dataclass

UNSUPPORTED_SUPERLATIVES = (
    "بهترین",
    "شماره یک",
    "بی‌رقیب",
    "تضمینی",
    "قطعی",
)


@dataclass(frozen=True)
class HumanizerReport:
    changed: bool
    removed_cliches: list[str]
    softened_claims: list[str]
    duplicate_sentences_removed: int


def _normalize_spaces(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _remove_duplicate_sentences(text: str) -> tuple[str, int]:
    parts = re.split(r"(?<=[.!؟])\s+", text)
    seen: set[str] = set()
    output: list[str] = []
    removed = 0

    for sentence in parts:
        normalized = re.sub(r"\W+", "", sentence).lower()
        if len(normalized) >= 8 and normalized in seen:
            removed += 1
            continue
        if normalized:
            seen.add(normalized)
        output.append(sentence)

    return " ".join(output), removed


def humanize_text(text: str) -> tuple[str, HumanizerReport]:
    result = text
    removed_cliches: list[str] = []
    softened_claims: list[str] = []

    replacements = {
        "گزینه ایده‌آل برای شماست": "می‌تواند انتخاب مناسبی برای شما باشد",
        "تفاوت را خودتان احساس کنید": "کیفیت آن را در استفاده واقعی بسنجید",
        "همین حالا خریداری کنید": "برای سفارش یا دریافت اطلاعات بیشتر اقدام کنید",
        "به دنیایی از": "به تجربه‌ای از",
    }

    for source, target in replacements.items():
        if source in result:
            result = result.replace(source, target)
            removed_cliches.append(source)

    for claim in UNSUPPORTED_SUPERLATIVES:
        if claim in result:
            result = result.replace(claim, "با‌کیفیت")
            softened_claims.append(claim)

    result, duplicate_count = _remove_duplicate_sentences(result)
    result = _normalize_spaces(result)

    report = HumanizerReport(
        changed=result != text,
        removed_cliches=removed_cliches,
        softened_claims=softened_claims,
        duplicate_sentences_removed=duplicate_count,
    )
    return result, report


def report_to_dict(report: HumanizerReport) -> dict:
    return asdict(report)
