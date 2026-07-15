from app.services.humanizer import humanize_text


def test_humanizer_removes_common_cliches_and_softens_claims():
    source = (
        "این بهترین انتخاب و گزینه ایده‌آل برای شماست. "
        "همین حالا خریداری کنید و تفاوت را خودتان احساس کنید."
    )

    result, report = humanize_text(source)

    assert "گزینه ایده‌آل برای شماست" not in result
    assert "همین حالا خریداری کنید" not in result
    assert "تفاوت را خودتان احساس کنید" not in result
    assert "بهترین" not in result
    assert report.changed is True


def test_humanizer_removes_duplicate_sentences():
    source = "کیفیت برای ما مهم است. کیفیت برای ما مهم است. انتخاب با شماست."
    result, report = humanize_text(source)

    assert result.count("کیفیت برای ما مهم است") == 1
    assert report.duplicate_sentences_removed == 1
