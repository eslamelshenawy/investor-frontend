#!/bin/bash
# Script لتحديث بيانات الـ Datasets
# شغله لما تحب تجيب أحدث البيانات من البوابة الوطنية
#
# التشغيل:
#   cd investor-frontend
#   npm run update-datasets
#
# أو:
#   node scripts/fetch-all-datasets.cjs

echo "🚀 بدء تحديث البيانات..."
cd "$(dirname "$0")/.."

# Run the fetch script
node scripts/fetch-all-datasets.cjs

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ تم تحديث البيانات!"
    echo "📌 لرفع التحديثات:"
    echo "   git add public/data"
    echo "   git commit -m 'Update datasets'"
    echo "   git push"
else
    echo "❌ فشل في تحديث البيانات"
fi
