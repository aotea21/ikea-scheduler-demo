import os
import re

app_dir = 'src/app'
dashboard_dir = os.path.join(app_dir, '(dashboard)')

if not os.path.exists(dashboard_dir):
    os.makedirs(dashboard_dir)

# move target dirs
targets = ['page.tsx', 'orders', 'map', 'status', 'assemblers', 'settings', 'schedule', 'fsm-demo']
for target in targets:
    src = os.path.join(app_dir, target)
    dst = os.path.join(dashboard_dir, target)
    if os.path.exists(src):
        os.rename(src, dst)

# Layout code
layout_code = """import { DashboardLayout } from "@/components/features/DashboardLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
"""
with open(os.path.join(dashboard_dir, 'layout.tsx'), 'w') as f:
    f.write(layout_code)

# unwrap DashboardLayout from pages
for root, dirs, files in os.walk(dashboard_dir):
    for file in files:
        if file == 'page.tsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Remove import
            content = re.sub(r'import\s+.*DashboardLayout.*\n', '', content)
            
            # Remove <DashboardLayout> and </DashboardLayout> tags
            content = re.sub(r'<DashboardLayout>\s*', '', content)
            content = re.sub(r'</DashboardLayout>\s*', '', content)
            
            with open(filepath, 'w') as f:
                f.write(content)

print("Layouts refactored.")
