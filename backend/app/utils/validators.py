import re
from datetime import date

def validate_cpf(cpf):
    """Validate CPF format and checksum"""
    # Remove non-digit characters
    cpf = re.sub(r'\D', '', cpf)
    
    # Check if has 11 digits
    if len(cpf) != 11:
        return False
    
    # Check if all digits are the same
    if cpf == cpf[0] * 11:
        return False
    
    # Calculate first check digit
    sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digit1 = ((sum1 * 10) % 11) % 10
    
    # Calculate second check digit
    sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digit2 = ((sum2 * 10) % 11) % 10
    
    # Check if calculated digits match
    return cpf[9] == str(digit1) and cpf[10] == str(digit2)

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_date(date_string):
    """Validate date format (YYYY-MM-DD)"""
    try:
        date.fromisoformat(date_string)
        return True
    except ValueError:
        return False

def calculate_age(birth_date):
    """Calculate age from birth date"""
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))