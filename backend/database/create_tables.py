from database.database import Base, engine
from database.models import User  # إضافة استيراد النموذج

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Tables created successfully!") 