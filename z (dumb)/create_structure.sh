# إنشاء المجلدات الرئيسية
mkdir -p Reviewslytics/{backend,frontend,docker}

# إنشاء هيكل Backend
mkdir -p Reviewslytics/backend/{app/{api/{routes},core,db/models,services/analyzer/reviews_analyzer/{config,core,models,services,utils,tests/test_data,alembic/versions}},alembic,tests}

# إنشاء الملفات في Backend
touch Reviewslytics/backend/app/api/{__init__.py,dependencies.py}
touch Reviewslytics/backend/app/api/routes/{__init__.py,auth.py,reviews.py,analysis.py}
touch Reviewslytics/backend/app/core/{__init__.py,config.py,security.py}
touch Reviewslytics/backend/app/db/{__init__.py,session.py}
touch Reviewslytics/backend/app/db/models/{__init__.py,user.py,analysis.py}
touch Reviewslytics/backend/app/services/{__init__.py,report_generator.py}

# إنشاء ملفات Reviews Analyzer
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/config/{__init__.py,settings.py,logging_config.py}
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/core/{__init__.py,analyzer.py,validator.py,translator.py}
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/models/{__init__.py,data_models.py,database.py}
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/services/{__init__.py,openai_service.py,storage_service.py,cache_service.py}
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/utils/{__init__.py,data_cleaner.py,text_processor.py,error_handlers.py}
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/{.env,requirements.txt,README.md,main.py}
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/tests/{__init__.py,test_analyzer.py,test_validator.py}
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/tests/test_data/sample_reviews.json
touch Reviewslytics/backend/app/services/analyzer/reviews_analyzer/alembic/alembic.ini

# إنشاء ملفات Backend الرئيسية
touch Reviewslytics/backend/{.env,requirements.txt,main.py}

# إنشاء هيكل Frontend
mkdir -p Reviewslytics/frontend/{public/assets,src/{components/{common,dashboard,analysis,reports},hooks,services,store/slices,types,utils,pages}}

# إنشاء ملفات Frontend
touch Reviewslytics/frontend/public/index.html
touch Reviewslytics/frontend/src/components/common/{Button.tsx,Card.tsx,Loading.tsx}
touch Reviewslytics/frontend/src/components/dashboard/{TrendChart.tsx,SummaryCards.tsx,ActionItems.tsx}
touch Reviewslytics/frontend/src/components/analysis/{ReviewsUploader.tsx,AnalysisResults.tsx}
touch Reviewslytics/frontend/src/components/reports/{ReportGenerator.tsx,PDFViewer.tsx}
touch Reviewslytics/frontend/src/hooks/{useAnalysis.ts,useAuth.ts}
touch Reviewslytics/frontend/src/services/{api.ts,auth.ts}
touch Reviewslytics/frontend/src/store/slices/{analysisSlice.ts,authSlice.ts}
touch Reviewslytics/frontend/src/store/store.ts
touch Reviewslytics/frontend/src/types/{analysis.ts,user.ts}
touch Reviewslytics/frontend/src/utils/{formatters.ts,validators.ts}
touch Reviewslytics/frontend/src/pages/{Dashboard.tsx,Analysis.tsx,Reports.tsx}
touch Reviewslytics/frontend/src/{App.tsx,main.tsx}
touch Reviewslytics/frontend/{.env,package.json,tsconfig.json,vite.config.ts}

# إنشاء ملفات Docker
touch Reviewslytics/docker/backend/Dockerfile
touch Reviewslytics/docker/frontend/Dockerfile
touch Reviewslytics/docker/docker-compose.yml

# إنشاء README الرئيسي
touch Reviewslytics/README.md