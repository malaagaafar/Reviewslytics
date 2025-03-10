from sqlalchemy import create_engine, text
import uuid

# اتصال بقاعدة البيانات
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

def migrate():
    with engine.begin() as connection:  # استخدام begin() بدلاً من connect()
        try:
            # إضافة العمود الجديد
            connection.execute(text("""
                ALTER TABLE reviews 
                ADD COLUMN upload_batch_id VARCHAR;
            """))
            
            # تحديث السجلات الموجودة
            # نجمع المراجعات حسب المستخدم والمصدر وتاريخ الإنشاء
            result = connection.execute(text("""
                SELECT DISTINCT user_id, source, created_at 
                FROM reviews 
                WHERE source LIKE 'manual_%'
            """))
            
            for row in result.fetchall():  # استخدام fetchall()
                batch_id = str(uuid.uuid4())
                # تحديث المراجعات التي تنتمي لنفس المجموعة
                connection.execute(text("""
                    UPDATE reviews 
                    SET upload_batch_id = :batch_id 
                    WHERE user_id = :user_id 
                    AND source = :source 
                    AND created_at = :created_at
                """), {
                    "batch_id": batch_id,
                    "user_id": row.user_id,
                    "source": row.source,
                    "created_at": row.created_at
                })
            
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Error during migration: {e}")
            raise

if __name__ == "__main__":
    migrate() 