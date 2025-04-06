from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "flower" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(20) NOT NULL UNIQUE,
    "price" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "type" VARCHAR(20) NOT NULL DEFAULT 'white',
    "img_link" VARCHAR(500) NOT NULL DEFAULT ''
);
COMMENT ON COLUMN "flower"."type" IS 'red: red\nyellow: yellow\npink: pink\nwhite: white\nazure: azure\nblue: blue\norange: orange\npurple: purple';
CREATE TABLE IF NOT EXISTS "user" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "username" VARCHAR(20) NOT NULL UNIQUE,
    "email" VARCHAR(50) NOT NULL UNIQUE,
    "password_hash" VARCHAR(128),
    "token" VARCHAR(128) NOT NULL DEFAULT '',
    "is_superuser" BOOL NOT NULL DEFAULT False,
    "is_active" BOOL NOT NULL DEFAULT False,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "order" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "quantity" INT NOT NULL DEFAULT 1,
    "flower_id" INT NOT NULL REFERENCES "flower" ("id") ON DELETE CASCADE,
    "user_id" INT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);
COMMENT ON COLUMN "order"."status" IS 'pending: pending\ncompleted: completed\nfailed: failed';
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
