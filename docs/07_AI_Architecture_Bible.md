> Version: 1.0
> Status: Active Living Document
> Owner: Omid Rashidizadeh
> Product: RonaghYar AI Platform
> Codename: Phoenix

# AI Architecture Bible

## Pipeline
Intent Analyzer → Task Classifier → Brand Context → Prompt Composer → Router → Provider → Quality Evaluator → Optimizer → Response.

## Modes
- Auto: انتخاب بر اساس Task، هزینه، کیفیت و سلامت.
- Manual: انتخاب Provider توسط کاربر مجاز.
- Compare: اجرای موازی چند Provider و مقایسه.
- Fallback: جابه‌جایی خودکار هنگام خطا.

## Provider Contract
هر Adapter باید generate، health_check و metadata ارائه کند.
