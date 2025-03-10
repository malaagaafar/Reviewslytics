from sqlalchemy import create_engine, text
import uuid
from datetime import datetime

# اتصال بقاعدة البيانات
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

def update_batch_ids():
    with engine.begin() as connection:
        try:
            # تجميع المراجعات حسب المستخدم والمصدر وتاريخ الإنشاء
            result = connection.execute(text("""
                SELECT DISTINCT user_id, source, created_at 
                FROM reviews 
                WHERE upload_batch_id IS NULL 
                OR upload_batch_id = ''
                ORDER BY created_at
            """))
            
            updated_groups = 0
            for row in result.fetchall():
                batch_id = str(uuid.uuid4())
                
                # تحديث جميع المراجعات في نفس المجموعة
                update_result = connection.execute(text("""
                    UPDATE reviews 
                    SET upload_batch_id = :batch_id 
                    WHERE user_id = :user_id 
                    AND source = :source 
                    AND created_at = :created_at
                    AND (upload_batch_id IS NULL OR upload_batch_id = '')
                """), {
                    "batch_id": batch_id,
                    "user_id": row.user_id,
                    "source": row.source,
                    "created_at": row.created_at
                })
                
                updated_groups += 1
                print(f"Updated group {updated_groups}: {row.source} from {row.created_at}")
            
            print(f"Successfully updated {updated_groups} groups of reviews!")
            
        except Exception as e:
            print(f"Error during update: {e}")
            raise

if __name__ == "__main__":
    print("Starting batch ID update...")
    update_batch_ids()
    print("Update completed!") 