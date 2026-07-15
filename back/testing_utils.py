from faker import Faker

def user_data_generator():
    """
    An infinite generator yielding a tuple of (username, email, password)
    using the Faker library.
    """
    fake = Faker()
    while True:
        username = fake.user_name()
        email = fake.email()
        password = fake.password(length=12, special_chars=True, digits=True, upper_case=True, lower_case=True)
        yield username, email, password