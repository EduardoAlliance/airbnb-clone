<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; background: #f5f5f5;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
        <h1 style="font-size: 24px; margin: 0 0 8px;">{{ __('Verify your login') }}</h1>
        <p style="color: #6b7280; margin: 0 0 24px;">{{ __('Enter this code on the login page to continue.') }}</p>
        <div style="text-align: center; padding: 24px; background: #f9fafb; border-radius: 8px; letter-spacing: 8px; font-size: 32px; font-weight: bold;">
            {{ $code }}
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">{{ __('This code expires in 10 minutes.') }}</p>
    </div>
</body>
</html>
