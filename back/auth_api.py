from typing import Annotated

import bcrypt
from fastapi import APIRouter, Header, Response, status
from tortoise.exceptions import DoesNotExist, IntegrityError, ValidationError

from api_pydantic_schemas import UserLogin, UserLoginResponse, UserLogoutResponse, UserRegister, UserRegisterResponse
from models import User

router = APIRouter()


@router.post("/register", response_model=UserRegisterResponse, status_code=status.HTTP_200_OK)
async def register(user: UserRegister, response: Response):
    try:
        # Hash the password before saving
        hashed_password = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

        try:
            await User.create(
                username=user.username,
                email=user.email,
                password_hash=hashed_password,  # Save hashed password
                is_active=True,
            )
            return {"success": True, "message": ""}
        except ValidationError:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "data": {}, "message": "Error. Invalid user data."}
    except IntegrityError:
        response.status_code = status.HTTP_409_CONFLICT
        return {"success": False, "data": {}, "message": "Error. User already exists with that creds."}


@router.post("/login", response_model=UserLoginResponse, status_code=status.HTTP_200_OK)
async def login(user_creds: UserLogin, response: Response):
    try:
        user = await User.get(email=user_creds.email, is_active=True)
        if bcrypt.checkpw(user_creds.password.encode("utf-8"), user.password_hash.encode()):
            user.token = bcrypt.gensalt().decode("utf-8")
            await user.save()
            return {"success": True, "token": user.token, "message": ""}
        else:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {"success": False, "token": "", "message": "Error. User not found with that creds."}
    except DoesNotExist:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"success": False, "token": "", "message": "Error. User not found with that creds."}


@router.post("/logout", response_model=UserLogoutResponse, status_code=status.HTTP_200_OK)
async def logout(token: Annotated[str | None, Header()], response: Response):
    try:
        user = await User.get(token=token)
        user.token = ""
        await user.save()
        return {"success": True, "message": ""}
    except DoesNotExist:
        response.status_code = status.HTTP_403_FORBIDDEN
        return {"success": False, "message": "Error. Incorrect token."}
