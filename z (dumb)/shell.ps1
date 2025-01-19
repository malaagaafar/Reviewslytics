# إنشاء المجلدات الرئيسية
New-Item -ItemType Directory -Force -Path "Reviewslytics"
New-Item -ItemType Directory -Force -Path "Reviewslytics/backend", "Reviewslytics/frontend", "Reviewslytics/docker"

# إنشاء هيكل Backend
New-Item -ItemType Directory -Force -Path @(
    "Reviewslytics/backend/app/api/routes",
    "Reviewslytics/backend/app/core",
    "Reviewslytics/backend/app/db/models",
    "Reviewslytics/backend/app/services/analyzer/reviews_analyzer/config",
    "Reviewslytics/backend/app/services/analyzer/reviews_analyzer/core",
    "Reviewslytics/backend/app/services/analyzer/reviews_analyzer/models",
    "Reviewslytics/backend/app/services/analyzer/reviews_analyzer/services",
    "Reviewslytics/backend/app/services/analyzer/reviews_analyzer/utils",
    "Reviewslytics/backend/app/services/analyzer/reviews_analyzer/tests/test_data",
    "Reviewslytics/backend/app/services/analyzer/reviews_analyzer/alembic/versions"
)

# إنشاء الملفات في Backend
$null = New-Item -ItemType File -Force -Path @(
    "Reviewslytics/backend/app/api/__init__.py",
    "Reviewslytics/backend/app/api/dependencies.py",
    "Reviewslytics/backend/app/api/routes/__init__.py",
    "Reviewslytics/backend/app/api/routes/auth.py",
    "Reviewslytics/backend/app/api/routes/reviews.py",
    "Reviewslytics/backend/app/api/routes/analysis.py"
)

# إنشاء هيكل Frontend
New-Item -ItemType Directory -Force -Path @(
    "Reviewslytics/frontend/public/assets",
    "Reviewslytics/frontend/src/components/common",
    "Reviewslytics/frontend/src/components/dashboard",
    "Reviewslytics/frontend/src/components/analysis",
    "Reviewslytics/frontend/src/components/reports",
    "Reviewslytics/frontend/src/hooks",
    "Reviewslytics/frontend/src/services",
    "Reviewslytics/frontend/src/store/slices",
    "Reviewslytics/frontend/src/types",
    "Reviewslytics/frontend/src/utils",
    "Reviewslytics/frontend/src/pages"
)

# إنشاء ملفات Frontend
$null = New-Item -ItemType File -Force -Path @(
    "Reviewslytics/frontend/public/index.html",
    "Reviewslytics/frontend/src/components/common/Button.tsx",
    "Reviewslytics/frontend/src/components/common/Card.tsx",
    "Reviewslytics/frontend/src/components/common/Loading.tsx"
)