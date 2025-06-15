import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    @property
    def DB_NAME(self):
        return os.getenv("DB_NAME")

    @property
    def DB_HOST(self):
        return os.getenv("DB_HOST")

    @property
    def DB_PORT(self):
        return os.getenv("DB_PORT")

    @property
    def DB_USER(self):
        return os.getenv("DB_USER")

    @property
    def DB_PASSWORD(self):
        return os.getenv("DB_PASSWORD")

    @property
    def ADMIN_NAME(self):
        return os.getenv("ADMIN_NAME")

    @property
    def ADMIN_EMAIL(self):
        return os.getenv("ADMIN_EMAIL")

    @property
    def ADMIN_PASSWORD(self):
        return os.getenv("ADMIN_PASSWORD")
    
    @property
    def db_config(self):
        return {
            'connections': {
                'default': {
                    'engine': 'tortoise.backends.asyncpg',
                    'credentials': {
                        'host': self.DB_HOST,
                        'port': self.DB_PORT,
                        'user': self.DB_USER,
                        'password': self.DB_PASSWORD,
                        'database': self.DB_NAME,
                        'minsize': 1,
                        'maxsize': 1000,
                    },
                }
            },
            'apps': {
                'models': {
                    'models': ['models', 'aerich.models'],
                    'default_connection': 'default',
                }
            }
        }


config = Config()
