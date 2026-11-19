from pathlib import Path
import re

sql = (Path(__file__).parents[1] / 'seeds/001_reference_data.sql').read_text()
category_block = sql.split('INSERT INTO loan_categories', 1)[1].split('ON DUPLICATE KEY UPDATE', 1)[0]
type_block = sql.split('INSERT INTO loan_product_types', 1)[1]
categories = re.findall(r"\('([a-z0-9-]+)','([^']+)',(\d+)\)", category_block)
types = re.findall(r"SELECT '([a-z0-9-]+)'(?: category_code)?,'([a-z0-9-]+)'(?: code)?,'([^']+)'(?: name)?", type_block)
assert len(categories) == 19, f'expected 19 categories, got {len(categories)}'
assert len(types) == 66, f'expected 66 product types, got {len(types)}'
assert len({row[1] for row in types}) == 66, 'product type codes must be unique'
category_codes = {row[0] for row in categories}
assert {row[0] for row in types} <= category_codes, 'all product types must map to a known category'
assert ('personal-consumer', 'payday-loan', 'Payday loan') in types
assert ('special-condition', 'special-condition-loan', 'Special condition loan') in types
print('PASS: 19 categories, 66 unique product types, all category references valid.')
