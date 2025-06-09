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


config = Config()
