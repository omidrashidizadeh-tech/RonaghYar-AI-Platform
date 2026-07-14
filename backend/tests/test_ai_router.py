from app.ai.types import AIRequest
from app.services.ai import build_prompt, quality_score, task_type

def test_prompt_contains_brand():
    prompt=build_prompt('caption','معرفی محصول',{'brand_name':'رونق‌یار','tone':'حرفه‌ای'},1)
    assert 'رونق‌یار' in prompt and 'حرفه‌ای' in prompt

def test_quality_range():
    assert 0 <= quality_score('هوک قوی؛ برای تماس اقدام کن') <= 100

def test_task_classification():
    assert task_type('director') == 'deep_strategy'
    assert task_type('caption') == 'fast_content'

def test_request_contract():
    req=AIRequest(prompt='x',system_prompt='y')
    assert req.mode == 'auto'
