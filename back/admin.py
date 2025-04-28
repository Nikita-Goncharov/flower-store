import bcrypt
from uuid import UUID

from fastadmin import TortoiseModelAdmin, register, action, WidgetType

from models import User, Flower, Order, Comment


@register(User)
class UserAdmin(TortoiseModelAdmin):
    exclude = ("password_hash",)
    list_display = ("id", "username", "is_superuser", "is_active")
    list_display_links = ("id", "username")
    list_filter = ("id", "username", "is_superuser", "is_active")
    search_fields = ("username",)
    
    formfield_overrides = {
        "email": (WidgetType.EmailInput, {"required": True}),
        "token": (WidgetType.Input, {"readOnly": True}),
    }
    
    actions = (
        *TortoiseModelAdmin.actions,
        "activate",
        "deactivate",
    )
    
    async def authenticate(self, username: str, password: str) -> UUID | int | None:
        user = await User.filter(username=username, is_superuser=True).first()
        if not user:
            return None
        if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
            return None
        return user.id
    
    # async def change_password(self, id: int, password: str) -> None:
    #     user = await User.filter(id=id).first()
    #     if not user:
    #         return None
        
    #     hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    #     user.password_hash = hashed_password
    #     user.save()
        
    @action(description="Set as active")
    async def activate(self, ids: list[int]) -> None:
        await self.model_cls.filter(id__in=ids).update(is_active=True)

    @action(description="Deactivate")
    async def deactivate(self, ids: list[int]) -> None:
        await self.model_cls.filter(id__in=ids).update(is_active=False)


@register(Flower)
class FlowerAdmin(TortoiseModelAdmin):
    list_display = ("id", "name", "type", "price")
    list_display_links = ("id", "name")
    list_filter = ("id", "name", "type")
    search_fields = ("name",)


@register(Order)
class OrderAdmin(TortoiseModelAdmin):
    list_display = ("id", "status", "user", "flower", "quantity")
    list_display_links = ("id", "status")
    list_filter = ("id", "user", "flower")
    search_fields = ("user", "flower")
    
    
@register(Comment)
class CommentAdmin(TortoiseModelAdmin):
    list_display = ("id", "text", "user")
    list_display_links = ("id", "text")
    list_filter = ("id", "user", "text")
    search_fields = ("user", "text")