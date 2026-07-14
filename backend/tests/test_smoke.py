from app.services.ai import build_prompt, quality_score

def test_prompt(): assert 'قهوه' in build_prompt('caption','فروش قهوه',None,1)
def test_score(): assert 0 <= quality_score('هوک عالی و CTA برای دایرکت') <= 100
