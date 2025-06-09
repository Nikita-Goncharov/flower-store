import re
from enum import Enum

import bcrypt
from tortoise import Tortoise, fields, models
from tortoise.validators import RegexValidator

from config import config as project_config

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"


class User(models.Model):
    id = fields.IntField(primary_key=True)
    username = fields.CharField(max_length=20, unique=True)
    email = fields.CharField(max_length=50, unique=True, validators=[RegexValidator(EMAIL_REGEX, re.I)])
    password_hash = fields.CharField(max_length=128, null=True)
    token = fields.CharField(max_length=128, default="")

    is_superuser = fields.BooleanField(default=False)
    is_active = fields.BooleanField(default=False)

    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)

    class PydanticMeta:
        exclude = ["password_hash"]

    def __str__(self):
        return f"{self.username} - {self.email}"


class Flower(models.Model):
    class FlowerType(str, Enum):
        red = "Red"
        yellow = "Yellow"
        pink = "Pink"
        white = "White"
        azure = "Azure"
        blue = "Blue"
        orange = "Orange"
        purple = "Purple"

    class FlowerCategory(str, Enum):
        birthday = "Birthday"
        wedding = "Wedding"
        love = "For a Loved One"
        sympathy = "Sympathy / Funeral"
        mom = "For Mom / Grandma"
        colleague = "For Colleague / Boss"
        man = "For Man / Boyfriend"
        kids = "For Children"
        universal = "Universal (Any Occasion)"

    id = fields.IntField(primary_key=True)
    name = fields.CharField(max_length=20, unique=True)
    price = fields.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    type = fields.CharEnumField(enum_type=FlowerType, max_length=20, default=FlowerType.white)
    category = fields.CharEnumField(enum_type=FlowerCategory, max_length=50, default=FlowerCategory.universal)
    img_link = fields.CharField(default="", max_length=500)

    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}({self.type}) - {self.price}"


class Order(models.Model):
    class STATUSES(Enum):
        pending = "Pending"
        completed = "Completed"
        failed = "Failed"

    id = fields.IntField(primary_key=True)
    status = fields.CharEnumField(STATUSES, max_length=20, default=STATUSES.pending)
    user = fields.ForeignKeyField("models.User", related_name="orders")
    flower = fields.ForeignKeyField("models.Flower", related_name="orders")
    quantity = fields.IntField(default=1)
    amount = fields.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - order_id: {self.id}"


class Comment(models.Model):
    id = fields.IntField(primary_key=True)
    text = fields.TextField(default="")
    user = fields.ForeignKeyField("models.User", related_name="comments")

    created_at = fields.DatetimeField(auto_now_add=True)
    modified_at = fields.DatetimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - comment text: {self.text}"


config = {
    'connections': {
        'default': {
            'engine': 'tortoise.backends.asyncpg',
            'credentials': {
                'host': 'db',
                'port': 5432,
                'user': 'postgres',
                'password': 'password',
                'database': 'flower_store',
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
    },
    'use_tz': False,
    'timezone': 'Asia/Shanghai',
}


async def init():
    await Tortoise.init(config=config)
    await User.get_or_create(
        username=project_config.ADMIN_NAME,
        defaults={
            "email": project_config.ADMIN_EMAIL,
            "password_hash": bcrypt.hashpw(project_config.ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode(),
            "is_superuser": True,
            "is_active": True,
        },
    )
