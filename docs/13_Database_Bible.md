> Version: 1.0
> Status: Active Living Document
> Owner: Omid Rashidizadeh
> Product: RonaghYar AI Platform
> Codename: Phoenix

# Database Bible

## موجودیت‌های اصلی
users، workspaces، memberships، brands، brand_memories، generations، ai_requests، provider_runs، campaigns، calendar_items، subscriptions، payments، audit_logs.

## الزامات
Foreign Key، Index روی owner/status/created_at، soft delete برای دارایی‌های کاربر، migration اجباری، backup روزانه در Production.
